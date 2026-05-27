# ==============================================================================
# CheckAI API — Rota: Verificações (Histórico)
# ==============================================================================
# Endpoints protegidos para criar, listar e resumir as verificações do
# usuário autenticado. Todas exigem token JWT válido.
# ==============================================================================

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.database import get_db
from api.db_models.user import User
from api.models.schemas import (
    VerificacaoCreateRequest,
    VerificacaoResponse,
    ResumoResponse,
)
from api.services.verificacao import (
    criar_verificacao,
    listar_verificacoes,
    calcular_resumo,
)
from api.utils.dependencies import get_usuario_atual


router = APIRouter(
    prefix="/api/v1/verificacoes",
    tags=["Verificações"],
)


@router.post(
    "",
    response_model=VerificacaoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar uma verificação",
    description="Classifica um texto e salva o resultado no histórico do usuário.",
)
async def criar(
    dados: VerificacaoCreateRequest,
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> VerificacaoResponse:
    """Executa a verificação e a registra no histórico do usuário autenticado."""
    return criar_verificacao(db, usuario_atual.id, dados.texto, dados.tipo)


@router.get(
    "",
    response_model=list[VerificacaoResponse],
    summary="Listar histórico de verificações",
    description="Retorna as verificações do usuário, da mais recente à mais antiga.",
)
async def listar(
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> list[VerificacaoResponse]:
    """Lista o histórico de verificações do usuário autenticado."""
    return listar_verificacoes(db, usuario_atual.id)


@router.get(
    "/resumo",
    response_model=ResumoResponse,
    summary="Resumo estatístico do usuário",
    description="Retorna as estatísticas agregadas para o dashboard.",
)
async def resumo(
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> ResumoResponse:
    """Calcula o resumo de verificações do usuário autenticado."""
    return ResumoResponse(**calcular_resumo(db, usuario_atual.id))