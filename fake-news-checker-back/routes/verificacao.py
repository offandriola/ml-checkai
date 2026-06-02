# ==============================================================================
# CheckAI API — Rota: Verificações (Histórico)
# ==============================================================================
# Endpoints protegidos para criar, listar e resumir as verificações do
# usuário autenticado. Todas exigem token JWT válido.
# ==============================================================================

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from database import get_db
from db_models.user import User
from models.schemas import (
    ListagemVerificacoesResponse,
    ResumoResponse,
    VerificacaoCreateRequest,
    VerificacaoResponse,
)
from services.verificacao import (
    buscar_verificacao_por_id,
    calcular_resumo,
    criar_verificacao,
    criar_verificacao_por_imagem,
    listar_verificacoes,
    verificacao_para_response,
)
from utils.dependencies import get_usuario_atual


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
    verificacao = criar_verificacao(db, usuario_atual.id, dados.texto, dados.tipo)
    return verificacao_para_response(verificacao)


@router.post(
    "/imagem",
    response_model=VerificacaoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar verificação por imagem (upload)",
    description="Recebe um arquivo de imagem via multipart, extrai texto com OCR e classifica.",
)
async def criar_por_imagem(
    imagem: UploadFile = File(..., description="Arquivo de imagem (PNG, JPG, WEBP)"),
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> VerificacaoResponse:
    conteudo = await imagem.read()
    verificacao = criar_verificacao_por_imagem(db, usuario_atual.id, conteudo)
    return verificacao_para_response(verificacao)


@router.get(
    "",
    response_model=ListagemVerificacoesResponse,
    summary="Listar histórico de verificações",
    description=(
        "Retorna as verificações do usuário com filtros e paginação. "
        "Use 'resultado' para filtrar por categoria (REAL, FALSO, INCONCLUSIVO) "
        "e 'busca' para procurar no texto. Os itens vêm da mais recente "
        "para a mais antiga."
    ),
)
async def listar(
    resultado: str | None = Query(
        default=None,
        description="Filtrar por resultado: REAL, FALSO ou INCONCLUSIVO",
        pattern="^(REAL|FALSO|INCONCLUSIVO)$",
    ),
    busca: str | None = Query(
        default=None,
        max_length=200,
        description="Buscar substring no conteúdo verificado",
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
    """Lista o histórico do usuário autenticado, com filtros e paginação."""
    resultado_paginado = listar_verificacoes(
        db,
        usuario_atual.id,
        resultado=resultado,
        busca=busca,
        pagina=pagina,
        por_pagina=por_pagina,
    )
    return ListagemVerificacoesResponse(**resultado_paginado)


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


@router.get(
    "/{verificacao_id}",
    response_model=VerificacaoResponse,
    summary="Detalhe de uma verificação",
    description=(
        "Retorna o detalhe de uma verificação específica. "
        "Só o dono da verificação pode acessá-la."
    ),
)
async def detalhe(
    verificacao_id: int,
    usuario_atual: User = Depends(get_usuario_atual),
    db: Session = Depends(get_db),
) -> VerificacaoResponse:
    """
    Retorna uma verificação pelo id, desde que pertença ao usuário logado.

    SEGURANÇA (OWASP A01): retorna 404 (e não 403) caso a verificação
    não pertença ao usuário — assim evita revelar que o id existe para
    outra pessoa.
    """
    verificacao = buscar_verificacao_por_id(db, usuario_atual.id, verificacao_id)
    if verificacao is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Verificação não encontrada.",
        )
    return verificacao_para_response(verificacao)