# ==============================================================================
# CheckAI API — Service: Autenticação
# ==============================================================================
# Lógica de negócio para cadastro e autenticação de usuários.
# As rotas (routes/auth.py) chamam estas funções, mantendo a camada HTTP
# separada da lógica de acesso ao banco.
# ==============================================================================

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from config import RESET_TOKEN_EXPIRACAO_MINUTOS
from db_models.user import User
from services.email_service import enviar_email_recuperacao
from utils.security import (
    gerar_hash_senha,
    gerar_token_recuperacao,
    hash_token_recuperacao,
    verificar_senha,
)


def buscar_usuario_por_email(db: Session, email: str) -> User | None:
    """Retorna o usuário com o e-mail informado, ou None se não existir."""
    return db.query(User).filter(User.email == email).first()


def criar_usuario(db: Session, nome: str, email: str, senha: str) -> User:
    """
    Cria um novo usuário no banco com a senha já transformada em hash.

    Pressupõe que o e-mail já foi verificado como inexistente pela rota.
    """
    novo_usuario = User(
        nome=nome,
        email=email,
        senha_hash=gerar_hash_senha(senha),
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)  # recarrega o objeto com o id gerado pelo banco
    return novo_usuario


def autenticar_usuario(db: Session, email: str, senha: str) -> User | None:
    """
    Verifica as credenciais. Retorna o usuário se email existir e a senha
    bater com o hash; caso contrário, retorna None.
    """
    usuario = buscar_usuario_por_email(db, email)
    if not usuario:
        return None
    if not verificar_senha(senha, usuario.senha_hash):
        return None
    return usuario


def atualizar_perfil(
    db: Session,
    usuario: User,
    nome: str | None = None,
    email: str | None = None,
) -> User:
    """
    Atualiza os campos do perfil que foram informados.

    Verifica unicidade do novo e-mail antes de aplicar.
    Levanta ValueError caso o e-mail já esteja em uso por outro usuário.
    """
    if nome is not None:
        usuario.nome = nome

    if email is not None and email != usuario.email:
        em_uso = buscar_usuario_por_email(db, email)
        if em_uso and em_uso.id != usuario.id:
            raise ValueError("E-mail já cadastrado por outro usuário.")
        usuario.email = email

    db.commit()
    db.refresh(usuario)
    return usuario


def trocar_senha(
    db: Session, usuario: User, senha_atual: str, nova_senha: str
) -> None:
    """
    Troca a senha do usuário após validar a senha atual.

    SEGURANÇA: pedir a senha atual evita que um token roubado consiga
    trocar a senha sem o conhecimento do dono (defesa em profundidade).

    Levanta ValueError se a senha atual estiver incorreta.
    """
    if not verificar_senha(senha_atual, usuario.senha_hash):
        raise ValueError("Senha atual incorreta.")

    usuario.senha_hash = gerar_hash_senha(nova_senha)
    db.commit()


def excluir_conta(db: Session, usuario: User) -> None:
    """
    Remove o usuário do banco. O cascade='all, delete-orphan' no model
    apaga automaticamente todas as verificações associadas.
    """
    db.delete(usuario)
    db.commit()


def gerar_recuperacao_senha(db: Session, email: str) -> None:
    """
    Gera um token de recuperação e envia o link por e-mail.

    Não revela se o e-mail está ou não cadastrado (anti-enumeração).
    O token é gerado com `secrets`, o hash SHA-256 é salvo no banco;
    o valor em texto puro é enviado APENAS no link do e-mail.
    """
    usuario = buscar_usuario_por_email(db, email)
    if not usuario:
        # Responde normalmente (sem revelar ausência do e-mail)
        return

    token = gerar_token_recuperacao()
    usuario.reset_token_hash = hash_token_recuperacao(token)
    usuario.reset_token_expira = datetime.now(timezone.utc) + timedelta(
        minutes=RESET_TOKEN_EXPIRACAO_MINUTOS
    )
    db.commit()

    # Email enviado de forma síncrona; falha é logada mas não exposta ao usuário
    enviar_email_recuperacao(email, token)


def redefinir_senha(db: Session, token: str, nova_senha: str) -> None:
    """
    Redefine a senha a partir de um token de recuperação válido.

    Levanta ValueError se o token for inválido, expirado ou já utilizado.
    Após o uso, o token é removido (uso único).
    """
    token_hash = hash_token_recuperacao(token)
    usuario = (
        db.query(User)
        .filter(User.reset_token_hash == token_hash)
        .first()
    )

    if usuario is None:
        raise ValueError("Token de recuperação inválido ou já utilizado.")

    expira = usuario.reset_token_expira
    if expira is None:
        raise ValueError("Token de recuperação inválido ou já utilizado.")

    expira_utc = expira.replace(tzinfo=timezone.utc) if expira.tzinfo is None else expira
    if datetime.now(timezone.utc) > expira_utc:
        raise ValueError("Token de recuperação expirado. Solicite um novo link.")

    usuario.senha_hash = gerar_hash_senha(nova_senha)
    # Invalida o token imediatamente (uso único)
    usuario.reset_token_hash = None
    usuario.reset_token_expira = None
    db.commit()