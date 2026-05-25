# ==============================================================================
# CheckAI API — Rota: Autenticação
# ==============================================================================
# Endpoints de cadastro e (futuramente) login de usuários.
# ==============================================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.database import get_db
from api.models.schemas import CadastroRequest, UsuarioResponse
from api.services.auth import buscar_usuario_por_email, criar_usuario
from api.models.schemas import (
    CadastroRequest,
    UsuarioResponse,
    LoginRequest,
    TokenResponse,
)
from api.services.auth import (
    buscar_usuario_por_email,
    criar_usuario,
    autenticar_usuario,
)
from api.utils.security import criar_token_acesso


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticação"],
)


@router.post(
    "/cadastro",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastrar novo usuário",
    description="Cria um novo usuário no sistema com senha protegida por hash.",
)
async def cadastrar(
    dados: CadastroRequest,
    db: Session = Depends(get_db),
) -> UsuarioResponse:
    """
    Cadastra um novo usuário.

    - Valida os dados de entrada (schema CadastroRequest).
    - Verifica se o e-mail já está em uso.
    - Salva o usuário com a senha transformada em hash bcrypt.
    """
    # Verifica se o e-mail já existe (o banco também garante via UNIQUE,
    # mas checar aqui devolve uma mensagem mais clara ao cliente)
    if buscar_usuario_por_email(db, dados.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um usuário cadastrado com este e-mail.",
        )

    usuario = criar_usuario(db, dados.nome, dados.email, dados.senha)
    return usuario


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Autenticar usuário e obter token",
    description="Valida credenciais e retorna um token JWT de acesso.",
)
async def login(
    dados: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Autentica o usuário e retorna um token JWT.

    SEGURANÇA: retorna a MESMA mensagem para email inexistente e senha
    errada, evitando que um atacante descubra quais emails estão cadastrados
    (OWASP — User Enumeration).
    """
    usuario = autenticar_usuario(db, dados.email, dados.senha)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = criar_token_acesso({"sub": str(usuario.id), "email": usuario.email})
    return TokenResponse(access_token=token)