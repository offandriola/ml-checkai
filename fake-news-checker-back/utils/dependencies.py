# ==============================================================================
# CheckAI API — Dependências de Autenticação
# ==============================================================================
# Dependência reutilizável que protege rotas exigindo um token JWT válido.
#
# Fluxo:
#   1. Extrai o token do header Authorization: Bearer <token>
#   2. Valida assinatura e expiração (decodificar_token)
#   3. Recupera o usuário correspondente no banco
#   4. Disponibiliza o objeto User para a rota protegida
#
# SEGURANÇA (OWASP A01 - Broken Access Control / A07 - Auth Failures):
#   - Rotas que dependem desta função só executam para usuários autenticados.
#   - Token inválido, ausente ou expirado resulta em 401 automaticamente.
# ==============================================================================

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from db_models.user import User
from utils.security import decodificar_token


# Esquema de segurança que o Swagger reconhece (gera o botão "Authorize")
_bearer_scheme = HTTPBearer()


def get_usuario_atual(
    credenciais: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependência que retorna o usuário autenticado a partir do token JWT.

    Levanta 401 se o token for inválido, expirado ou se o usuário não existir.
    """
    # Exceção padrão de credenciais inválidas (reutilizada nos casos abaixo)
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Decodifica e valida o token (assinatura + expiração)
    payload = decodificar_token(credenciais.credentials)
    if payload is None:
        raise credenciais_invalidas

    # 2. Extrai o id do usuário do claim "sub"
    usuario_id = payload.get("sub")
    if usuario_id is None:
        raise credenciais_invalidas

    # 3. Busca o usuário no banco
    usuario = db.query(User).filter(User.id == int(usuario_id)).first()
    if usuario is None:
        raise credenciais_invalidas

    return usuario