# ==============================================================================
# CheckAI API — Rota: Verificação pública (sem login)
# ==============================================================================
# Usada pela landing page para classificar texto, buscar fontes (Serper) e
# retornar o veredito sem exigir autenticação nem salvar histórico.
# ==============================================================================

import logging

from fastapi import APIRouter

from models.schemas import VerificacaoCreateRequest, VerificarPublicoResponse
from services.verificacao import executar_verificacao


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/verificar",
    tags=["Verificação pública"],
)


@router.post(
    "",
    response_model=VerificarPublicoResponse,
    summary="Verificar texto (público)",
    description=(
        "Classifica um texto, busca fontes na web e retorna o veredito. "
        "Não exige login e não persiste no histórico."
    ),
)
async def verificar_publico(
    dados: VerificacaoCreateRequest,
) -> VerificarPublicoResponse:
    """Executa verificação completa para visitantes da landing page."""
    logger.info(
        "Verificação pública — texto: %.50s...",
        dados.texto,
    )
    resultado = executar_verificacao(dados.texto, dados.tipo)
    return VerificarPublicoResponse(
        texto_verificado=resultado["texto_verificado"],
        tipo=resultado["tipo"],
        resultado=resultado["resultado"],
        confianca=resultado["confianca"],
        modelo_ativo=resultado["modelo_ativo"] == "sim",
        fontes=resultado["fontes"],
        nli_resultado_agregado=resultado.get("nli_resultado_agregado"),
        nli_score_agregado=resultado.get("nli_score_agregado"),
        nli_votos=resultado.get("nli_votos"),
        decisao_origem=resultado.get("decisao_origem"),
        justificativa_decisao=resultado.get("justificativa_decisao"),
    )
