# ==============================================================================
# CheckAI API — Rota: Health Check
# ==============================================================================
# Endpoint de verificação de saúde da API.
# Utilizado pelo front-end e por ferramentas de monitoramento para
# confirmar que o servidor está online e respondendo corretamente.
# ==============================================================================

from datetime import datetime

from fastapi import APIRouter

from config import API_VERSAO
from models.schemas import HealthResponse


# Cria o router com prefixo e tag para organização no Swagger
router = APIRouter(
    prefix="/api/v1",
    tags=["Health"],
)


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Verificar saúde da API",
    description="Retorna o status atual da API, versão e timestamp.",
)
async def health_check() -> HealthResponse:
    """
    Endpoint de saúde da API.

    Retorna status 200 com informações básicas se o servidor estiver
    funcionando corretamente. Não requer autenticação.
    """
    return HealthResponse(
        status="online",
        versao=API_VERSAO,
        timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
    )
