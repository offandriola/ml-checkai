# ==============================================================================
# CheckAI API — Rota: Autenticação
# ==============================================================================
# Endpoints de cadastro e (futuramente) login de usuários.
# ==============================================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.schemas import (
    CadastroRequest,
    UsuarioResponse,
    LoginRequest,
    TokenResponse,
    AtualizarPerfilRequest,
    TrocarSenhaRequest,
    MensagemResponse,
    RecuperarSenhaRequest,
    RecuperarSenhaResponse,
    RedefinirSenhaRequest,
)
from services.auth import (
    buscar_usuario_por_email,
    criar_usuario,
    autenticar_usuario,
    atualizar_perfil,
    trocar_senha,
    excluir_conta,
    gerar_recuperacao_senha,
    redefinir_senha,
)
from utils.security import criar_token_acesso
from utils.dependencies import get_usuario_atual
from db_models.user import User
from services.verificacao import limpar_historico


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


@router.get(
    "/me",
    response_model=UsuarioResponse,
    summary="Dados do usuário autenticado",
    description="Retorna os dados do usuário dono do token JWT enviado.",
)
async def usuario_logado(
    usuario_atual: User = Depends(get_usuario_atual),
) -> UsuarioResponse:
    """
    Retorna o perfil do usuário autenticado.

    Esta rota é protegida: requer um token JWT válido no header
    Authorization. Serve de base para o front identificar quem está logado
    (ex.: exibir o nome no dashboard).
    """
    return usuario_atual


@router.patch(
    "/me",
    response_model=UsuarioResponse,
    summary="Atualizar perfil do usuário",
    description="Atualiza nome e/ou e-mail do usuário autenticado.",
)
async def atualizar_meu_perfil(
    dados: AtualizarPerfilRequest,
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> UsuarioResponse:
    """Atualiza o perfil do usuário autenticado."""
    try:
        return atualizar_perfil(
            db, usuario_atual, nome=dados.nome, email=dados.email
        )
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(erro),
        )


@router.post(
    "/me/senha",
    response_model=MensagemResponse,
    summary="Trocar senha",
    description="Altera a senha do usuário autenticado após validar a senha atual.",
)
async def trocar_minha_senha(
    dados: TrocarSenhaRequest,
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> MensagemResponse:
    """Troca a senha do usuário autenticado."""
    try:
        trocar_senha(db, usuario_atual, dados.senha_atual, dados.nova_senha)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro),
        )
    return MensagemResponse(mensagem="Senha alterada com sucesso.")


@router.delete(
    "/me/historico",
    response_model=MensagemResponse,
    summary="Limpar histórico de verificações",
    description=(
        "Apaga TODAS as verificações do usuário. Esta ação é IRREVERSÍVEL. "
        "Não remove a conta, apenas o histórico."
    ),
)
async def limpar_meu_historico(
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> MensagemResponse:
    """Apaga todo o histórico do usuário autenticado."""
    total = limpar_historico(db, usuario_atual.id)
    return MensagemResponse(
        mensagem=f"Histórico limpo. {total} verificação(ões) removida(s)."
    )


@router.delete(
    "/me",
    response_model=MensagemResponse,
    summary="Excluir conta",
    description=(
        "Exclui permanentemente o usuário e TODO o histórico associado. "
        "Esta ação é IRREVERSÍVEL."
    ),
)
async def excluir_minha_conta(
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> MensagemResponse:
    """Exclui a conta do usuário autenticado e tudo associado a ela."""
    excluir_conta(db, usuario_atual)
    return MensagemResponse(mensagem="Conta excluída com sucesso.")


@router.post(
    "/recuperar-senha",
    response_model=RecuperarSenhaResponse,
    summary="Solicitar recuperação de senha",
    description=(
        "Gera um token de redefinição de senha. Por segurança, responde a "
        "mesma mensagem mesmo que o e-mail não exista. "
        "NOTA: para fins acadêmicos, o token é retornado na resposta; em "
        "produção, ele seria enviado por e-mail."
    ),
)
async def recuperar_senha(
    dados: RecuperarSenhaRequest,
    db: Session = Depends(get_db),
) -> RecuperarSenhaResponse:
    """Solicita a recuperação de senha (token retornado para fins de TCC)."""
    token = gerar_recuperacao_senha(db, dados.email)
    return RecuperarSenhaResponse(
        mensagem=(
            "Se houver uma conta com este e-mail, um link de recuperação "
            "foi gerado."
        ),
        token_recuperacao=token,  # em produção seria None e iria por e-mail
    )


@router.post(
    "/redefinir-senha",
    response_model=MensagemResponse,
    summary="Redefinir senha com token",
    description="Redefine a senha usando o token de recuperação recebido.",
)
async def redefinir(
    dados: RedefinirSenhaRequest,
    db: Session = Depends(get_db),
) -> MensagemResponse:
    """Redefine a senha do usuário a partir de um token de recuperação."""
    try:
        redefinir_senha(db, dados.token, dados.nova_senha)
    except ValueError as erro:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(erro),
        )
    return MensagemResponse(mensagem="Senha redefinida com sucesso.")