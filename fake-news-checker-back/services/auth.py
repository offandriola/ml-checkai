# ==============================================================================
# CheckAI API — Service: Autenticação
# ==============================================================================
# Lógica de negócio para cadastro e autenticação de usuários.
# As rotas (routes/auth.py) chamam estas funções, mantendo a camada HTTP
# separada da lógica de acesso ao banco.
# ==============================================================================

from sqlalchemy.orm import Session
from api.db_models.user import User
from api.utils.security import gerar_hash_senha
from api.utils.security import verificar_senha
from api.utils.security import (
    criar_token_recuperacao,
    decodificar_token_recuperacao,
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


def gerar_recuperacao_senha(db: Session, email: str) -> str | None:
    """
    Gera um token de recuperação para o e-mail informado.

    Retorna o token se o usuário existir, ou None caso contrário.
    A ROTA deve responder a mesma mensagem nos dois casos, para não
    revelar se o e-mail está cadastrado (anti user enumeration).
    """
    usuario = buscar_usuario_por_email(db, email)
    if not usuario:
        return None
    return criar_token_recuperacao(usuario.id)


def redefinir_senha(db: Session, token: str, nova_senha: str) -> None:
    """
    Redefine a senha a partir de um token de recuperação válido.

    Levanta ValueError se o token for inválido/expirado ou se o usuário
    não existir mais.
    """
    usuario_id = decodificar_token_recuperacao(token)
    if usuario_id is None:
        raise ValueError("Token de recuperação inválido ou expirado.")

    usuario = db.query(User).filter(User.id == usuario_id).first()
    if usuario is None:
        raise ValueError("Usuário não encontrado.")

    usuario.senha_hash = gerar_hash_senha(nova_senha)
    db.commit()