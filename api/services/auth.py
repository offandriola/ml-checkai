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