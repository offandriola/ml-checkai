# ==============================================================================
# CheckAI API — Rota: Classificação de Textos
# ==============================================================================
# Endpoints para classificar textos como VERDADEIRO ou FALSO usando o
# modelo de Machine Learning treinado. Enquanto o modelo não estiver
# disponível, retorna classificações mock para facilitar o desenvolvimento
# do front-end.
# ==============================================================================

import logging

from fastapi import APIRouter

from api.models.schemas import (
    ClassificacaoRequest,
    ClassificacaoResponse,
    StatusModeloResponse,
)
from api.services.classificador import (
    classificar_texto,
    verificar_status_modelo,
)


logger = logging.getLogger(__name__)

# Cria o router com prefixo e tag para organização no Swagger
router = APIRouter(
    prefix="/api/v1/classificar",
    tags=["Classificação"],
)


@router.post(
    "",
    response_model=ClassificacaoResponse,
    summary="Classificar um texto",
    description=(
        "Recebe um texto (afirmação, manchete ou notícia) e retorna a "
        "classificação de veracidade (VERDADEIRO ou FALSO). "
        "Se o modelo não estiver carregado, retorna classificação mock."
    ),
)
async def classificar(request: ClassificacaoRequest) -> ClassificacaoResponse:
    """
    Classifica um texto como VERDADEIRO ou FALSO.

    O campo 'modelo_ativo' na resposta indica se o resultado veio do
    modelo real (True) ou do modo mock (False).
    """
    logger.info(
        "Requisição de classificação recebida — texto: %.50s...",
        request.texto,
    )

    resultado = classificar_texto(request.texto)

    return ClassificacaoResponse(**resultado)


@router.get(
    "/status",
    response_model=StatusModeloResponse,
    summary="Status do modelo de classificação",
    description=(
        "Verifica se o modelo de ML está carregado e pronto para uso. "
        "Informa o caminho esperado do arquivo .pkl."
    ),
)
async def status_modelo() -> StatusModeloResponse:
    """
    Retorna o status atual do modelo de classificação.

    Útil para o front-end verificar se deve exibir aviso de modo mock.
    """
    status = verificar_status_modelo()

    return StatusModeloResponse(**status)
