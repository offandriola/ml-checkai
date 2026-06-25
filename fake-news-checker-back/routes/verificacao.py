# ==============================================================================
# CheckAI API — Rota: Verificações (Histórico)
# ==============================================================================

import logging
from datetime import date, datetime

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from database import get_db
from db_models.user import User
from models.schemas import (
    FonteTopItem,
    ListagemVerificacoesResponse,
    PontoSerieTemporal,
    ResumoResponse,
    VerificacaoCreateRequest,
    VerificacaoResponse,
)
from services.verificacao import (
    LinkError,
    buscar_verificacao_por_id,
    calcular_resumo_periodo,
    criar_verificacao,
    criar_verificacao_por_imagem,
    gerar_csv,
    gerar_xlsx,
    listar_fontes_top,
    listar_verificacoes,
    obter_serie_temporal,
    periodo_para_datas,
    verificacao_para_response,
)
from utils.dependencies import get_usuario_atual


router = APIRouter(
    prefix="/api/v1/verificacoes",
    tags=["Verificações"],
)


# ---------------------------------------------------------------------------
# POST /verificacoes — criar verificação
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=VerificacaoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar uma verificação",
)
async def criar(
    dados: VerificacaoCreateRequest,
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> VerificacaoResponse:
    try:
        verificacao = criar_verificacao(db, usuario_atual.id, dados.texto, dados.tipo)
    except LinkError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"tipo_erro": exc.tipo, "mensagem": exc.mensagem_usuario},
        )
    return verificacao_para_response(verificacao)


# ---------------------------------------------------------------------------
# POST /verificacoes/imagem — criar verificação por upload
# ---------------------------------------------------------------------------

@router.post(
    "/imagem",
    response_model=VerificacaoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar verificação por imagem (upload)",
)
async def criar_por_imagem(
    imagem: UploadFile = File(..., description="Arquivo de imagem (PNG, JPG, WEBP)"),
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> VerificacaoResponse:
    logger.info(
        "Upload de imagem recebido: '%s' (content-type: %s)",
        imagem.filename, imagem.content_type,
    )
    conteudo = await imagem.read()
    logger.info("Upload de imagem: %d bytes lidos de '%s'", len(conteudo), imagem.filename)
    verificacao = criar_verificacao_por_imagem(
        db, usuario_atual.id, conteudo, imagem.filename
    )
    return verificacao_para_response(verificacao)


# ---------------------------------------------------------------------------
# GET /verificacoes — listar histórico
# IMPORTANTE: rotas literais (/resumo, /exportar, /fontes-top) DEVEM vir
# antes da rota paramétrica (/{verificacao_id}) para evitar conflito.
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=ListagemVerificacoesResponse,
    summary="Listar histórico de verificações",
)
async def listar(
    resultado: str | None = Query(
        default=None,
        description="Filtrar por resultado: REAL, FALSO ou INCONCLUSIVO",
        pattern="^(REAL|FALSO|INCONCLUSIVO)$",
    ),
    tipo: str | None = Query(
        default=None,
        description="Filtrar por tipo: texto, link ou imagem",
        pattern="^(texto|link|imagem)$",
    ),
    busca: str | None = Query(
        default=None,
        max_length=200,
        description="Buscar substring no conteúdo verificado",
    ),
    data_inicio: date | None = Query(
        default=None,
        description="Data início do período (YYYY-MM-DD)",
    ),
    data_fim: date | None = Query(
        default=None,
        description="Data fim do período (YYYY-MM-DD)",
    ),
    ordenacao: str = Query(
        default="desc",
        description="Ordenação por data: desc (mais recente) ou asc (mais antiga)",
        pattern="^(asc|desc)$",
    ),
    pagina: int = Query(default=1, ge=1, description="Número da página"),
    por_pagina: int = Query(
        default=10,
        ge=1,
        le=100,
        description="Itens por página (máx. 100)",
    ),
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> ListagemVerificacoesResponse:
    dt_inicio = datetime.combine(data_inicio, datetime.min.time()) if data_inicio else None
    dt_fim = datetime.combine(data_fim, datetime.min.time()) if data_fim else None

    resultado_paginado = listar_verificacoes(
        db,
        usuario_atual.id,
        resultado=resultado,
        busca=busca,
        tipo=tipo,
        data_inicio=dt_inicio,
        data_fim=dt_fim,
        ordenacao=ordenacao,
        pagina=pagina,
        por_pagina=por_pagina,
    )
    return ListagemVerificacoesResponse(**resultado_paginado)


# ---------------------------------------------------------------------------
# GET /verificacoes/resumo
# ---------------------------------------------------------------------------

@router.get(
    "/resumo",
    response_model=ResumoResponse,
    summary="Resumo estatístico do usuário",
)
async def resumo(
    periodo: str | None = Query(
        default=None,
        description="Período: 7d, 30d, 90d ou all (padrão: all)",
        pattern="^(7d|30d|90d|all)$",
    ),
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> ResumoResponse:
    dt_inicio, dt_fim = periodo_para_datas(periodo or "all")
    return ResumoResponse(**calcular_resumo_periodo(db, usuario_atual.id, dt_inicio, dt_fim))


# ---------------------------------------------------------------------------
# GET /verificacoes/fontes-top
# ---------------------------------------------------------------------------

@router.get(
    "/fontes-top",
    response_model=list[FonteTopItem],
    summary="Fontes mais consultadas pelo usuário",
)
async def fontes_top(
    periodo: str | None = Query(
        default=None,
        description="Período: 7d, 30d, 90d ou all (padrão: all)",
        pattern="^(7d|30d|90d|all)$",
    ),
    limite: int = Query(default=5, ge=1, le=20),
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> list[FonteTopItem]:
    dt_inicio, dt_fim = periodo_para_datas(periodo or "all")
    top = listar_fontes_top(
        db, usuario_atual.id, data_inicio=dt_inicio, data_fim=dt_fim, limite=limite
    )
    return [FonteTopItem(**item) for item in top]


# ---------------------------------------------------------------------------
# GET /verificacoes/exportar
# ---------------------------------------------------------------------------

@router.get(
    "/exportar",
    summary="Exportar histórico (xlsx ou csv)",
    description=(
        "Gera e retorna um arquivo com o histórico do usuário. "
        "Aplica os mesmos filtros do endpoint de listagem. "
        "Nenhum arquivo é armazenado permanentemente no servidor."
    ),
)
async def exportar(
    formato: str = Query(
        default="xlsx",
        description="Formato de exportação: xlsx ou csv",
        pattern="^(xlsx|csv)$",
    ),
    resultado: str | None = Query(
        default=None,
        pattern="^(REAL|FALSO|INCONCLUSIVO)$",
    ),
    tipo: str | None = Query(
        default=None,
        pattern="^(texto|link|imagem)$",
    ),
    busca: str | None = Query(default=None, max_length=200),
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
    ordenacao: str = Query(default="desc", pattern="^(asc|desc)$"),
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
):
    dt_inicio = datetime.combine(data_inicio, datetime.min.time()) if data_inicio else None
    dt_fim = datetime.combine(data_fim, datetime.min.time()) if data_fim else None

    # Busca todos os registros (sem paginação) aplicando os mesmos filtros
    resultado_paginado = listar_verificacoes(
        db,
        usuario_atual.id,
        resultado=resultado,
        busca=busca,
        tipo=tipo,
        data_inicio=dt_inicio,
        data_fim=dt_fim,
        ordenacao=ordenacao,
        pagina=1,
        por_pagina=10_000,
    )
    itens = resultado_paginado["itens"]

    if not itens:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma verificação encontrada com os filtros informados.",
        )

    if formato == "xlsx":
        buf = gerar_xlsx(itens)
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": 'attachment; filename="checkai_historico.xlsx"',
                "Cache-Control": "no-store",
            },
        )

    # CSV — UTF-8 BOM para compatibilidade com Excel
    csv_text = gerar_csv(itens)
    csv_bytes = b"\xef\xbb\xbf" + csv_text.encode("utf-8")

    import io
    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="checkai_historico.csv"',
            "Cache-Control": "no-store",
        },
    )


# ---------------------------------------------------------------------------
# GET /verificacoes/serie-temporal
# ---------------------------------------------------------------------------

@router.get(
    "/serie-temporal",
    response_model=list[PontoSerieTemporal],
    summary="Série temporal de verificações para o gráfico de barras",
)
async def serie_temporal(
    periodo: str = Query(
        default="7d",
        description="Período: 7d, 30d, 90d ou all",
        pattern="^(7d|30d|90d|all)$",
    ),
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> list[PontoSerieTemporal]:
    dt_inicio, dt_fim = periodo_para_datas(periodo)
    pontos = obter_serie_temporal(
        db, usuario_atual.id, dt_inicio, dt_fim, periodo
    )
    return [PontoSerieTemporal(**p) for p in pontos]


# ---------------------------------------------------------------------------
# GET /verificacoes/{verificacao_id} — detalhe
# (DEVE ser a ÚLTIMA rota GET pois captura qualquer segmento)
# ---------------------------------------------------------------------------

@router.get(
    "/{verificacao_id}",
    response_model=VerificacaoResponse,
    summary="Detalhe de uma verificação",
    description="Retorna o detalhe de uma verificação. Só o dono pode acessar.",
)
async def detalhe(
    verificacao_id: int,
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> VerificacaoResponse:
    verificacao = buscar_verificacao_por_id(db, usuario_atual.id, verificacao_id)
    if verificacao is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verificação não encontrada.",
        )
    return verificacao_para_response(verificacao)
