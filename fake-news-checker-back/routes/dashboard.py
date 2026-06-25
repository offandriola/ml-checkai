# ==============================================================================
# CheckAI API — Rota: Dashboard (resumo público + dados do usuário)
# ==============================================================================

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from db_models.user import User
from db_models.verificacao import Verificacao
from models.schemas import FonteTopItem
from services.verificacao import (
    calcular_resumo_periodo,
    listar_fontes_top,
    periodo_para_datas,
)
from utils.dependencies import get_usuario_atual


router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/resumo")
def obter_resumo(
    periodo: str | None = Query(
        default=None,
        description="Período: 7d, 30d, 90d ou all (padrão: all)",
        pattern="^(7d|30d|90d|all)$",
    ),
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    """Retorna os totais de verificações do usuário autenticado para os cards do dashboard."""
    dt_inicio, dt_fim = periodo_para_datas(periodo or "all")
    dados = calcular_resumo_periodo(db, usuario_atual.id, dt_inicio, dt_fim)
    return {
        "total": dados["total_verificacoes"],
        "verdadeiras": dados["total_reais"],
        "falsas": dados["total_falsas"],
        "inconclusivas": dados["total_inconclusivas"],
    }


@router.get("/ultimas")
def obter_ultimas_verificacoes(
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    """Retorna as 5 verificações mais recentes do usuário autenticado."""
    ultimas = (
        db.query(Verificacao)
        .filter(Verificacao.usuario_id == usuario_atual.id)
        .order_by(Verificacao.criado_em.desc())
        .limit(5)
        .all()
    )
    return [
        {
            "id": v.id,
            "texto": v.texto_verificado[:60] + "..." if len(v.texto_verificado) > 60 else v.texto_verificado,
            "resultado": v.resultado,
            "confianca": v.confianca,
            "data": v.criado_em.isoformat(),
        }
        for v in ultimas
    ]


@router.get("/fontes-top", response_model=list[FonteTopItem])
def obter_fontes_top(
    periodo: str | None = Query(
        default=None,
        description="Período: 7d, 30d, 90d ou all (padrão: all)",
        pattern="^(7d|30d|90d|all)$",
    ),
    limite: int = Query(default=5, ge=1, le=20),
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    """Retorna os domínios mais consultados nas verificações do usuário (dados reais)."""
    dt_inicio, dt_fim = periodo_para_datas(periodo or "all")
    top = listar_fontes_top(
        db, usuario_atual.id, data_inicio=dt_inicio, data_fim=dt_fim, limite=limite
    )
    return [FonteTopItem(**item) for item in top]
