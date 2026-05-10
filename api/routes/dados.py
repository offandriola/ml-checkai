# ==============================================================================
# CheckAI API — Rota: Consulta de Dados
# ==============================================================================
# Endpoints para consultar os dados coletados pelos pipelines.
# O front-end utilizará estes endpoints para listar, visualizar e
# gerar estatísticas dos dados armazenados.
# ==============================================================================

import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException

from api.config import (
    PIPELINE_GOOGLE_FACTCHECK,
    PIPELINE_FONTES_OFICIAIS,
    PIPELINE_NOTICIAS_REAIS,
    PIPELINES_RAW,
)
from api.models.schemas import (
    ArquivoInfo,
    PipelineInfo,
    EstatisticasResponse,
    DadosResponse,
)
from api.utils.csv_handler import (
    listar_arquivos_pipeline,
    carregar_csv_mais_recente,
    contar_registros_pipeline,
)


logger = logging.getLogger(__name__)

# Cria o router com prefixo e tag para organização no Swagger
router = APIRouter(
    prefix="/api/v1/dados",
    tags=["Consulta de Dados"],
)

# Descrições amigáveis para cada pipeline (exibidas na resposta)
DESCRICOES_PIPELINES: dict[str, str] = {
    PIPELINE_GOOGLE_FACTCHECK: (
        "Coleta de afirmações checadas via Google Fact Check Tools API"
    ),
    PIPELINE_FONTES_OFICIAIS: (
        "Coleta de proposições da Câmara e matérias do Senado Federal"
    ),
    PIPELINE_NOTICIAS_REAIS: (
        "Coleta de notícias de portais jornalísticos via feeds RSS"
    ),
}


def _validar_pipeline(pipeline: str) -> None:
    """
    Valida se o nome do pipeline informado é reconhecido e seguro.

    SEGURANÇA (OWASP A01 - Broken Access Control):
        - Impede path traversal (ex: '../../etc/passwd')
        - Aceita apenas nomes de pipeline do mapeamento oficial

    Raises:
        HTTPException: 400 se o nome contiver caracteres perigosos.
        HTTPException: 404 se o pipeline não existir.
    """
    # Proteção contra path traversal e injeção de path
    caracteres_proibidos = ["..", "/", "\\", "~", "$", "%", "\x00"]
    if any(c in pipeline for c in caracteres_proibidos):
        logger.warning(
            "Tentativa de path traversal detectada: '%s'", pipeline
        )
        raise HTTPException(
            status_code=400,
            detail="Nome de pipeline inválido: caracteres não permitidos.",
        )

    if pipeline not in PIPELINES_RAW:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Pipeline '{pipeline}' não encontrado. "
                f"Pipelines válidos: {list(PIPELINES_RAW.keys())}"
            ),
        )


@router.get(
    "/pipelines",
    response_model=list[PipelineInfo],
    summary="Listar todos os pipelines",
    description="Retorna informações resumidas de todos os pipelines configurados.",
)
async def listar_pipelines() -> list[PipelineInfo]:
    """
    Lista todos os pipelines de dados com estatísticas básicas.

    Para cada pipeline, retorna: nome, descrição, total de arquivos,
    total de registros no último arquivo e nome do último arquivo.
    """
    resultado = []

    for nome_pipeline in PIPELINES_RAW:
        stats = contar_registros_pipeline(nome_pipeline)
        resultado.append(
            PipelineInfo(
                nome=nome_pipeline,
                descricao=DESCRICOES_PIPELINES.get(nome_pipeline, ""),
                total_arquivos=stats["total_arquivos"],
                total_registros=stats["total_registros"],
                ultimo_arquivo=stats["ultimo_arquivo"],
            )
        )

    return resultado


@router.get(
    "/{pipeline}/arquivos",
    response_model=list[ArquivoInfo],
    summary="Listar arquivos de um pipeline",
    description=(
        "Retorna a lista de arquivos CSV na camada raw de um pipeline, "
        "ordenados do mais recente para o mais antigo."
    ),
)
async def listar_arquivos(pipeline: str) -> list[ArquivoInfo]:
    """
    Lista todos os arquivos CSV da camada raw de um pipeline específico.

    Parâmetros:
        pipeline: Identificador do pipeline (ex: pipeline_falso_google_factcheck).
    """
    _validar_pipeline(pipeline)

    try:
        arquivos = listar_arquivos_pipeline(pipeline)
    except Exception as erro:
        logger.error("Erro ao listar arquivos de %s: %s", pipeline, str(erro), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Erro ao listar arquivos. Consulte os logs do servidor.",
        )

    # SEGURANÇA (OWASP A01): Remove caminhos absolutos da resposta
    # para não expor a estrutura de diretórios do servidor.
    for arq in arquivos:
        arq["caminho"] = arq["nome"]  # Substitui path absoluto pelo nome

    return [ArquivoInfo(**arq) for arq in arquivos]


@router.get(
    "/{pipeline}/ultimo",
    response_model=DadosResponse,
    summary="Consultar dados do último arquivo",
    description=(
        "Retorna os registros do CSV mais recente de um pipeline. "
        "Útil para visualizar os dados da última coleta realizada."
    ),
)
async def consultar_ultimo_arquivo(
    pipeline: str,
    limite: int = 100,
) -> DadosResponse:
    """
    Carrega e retorna os dados do arquivo CSV mais recente de um pipeline.

    Parâmetros:
        pipeline: Identificador do pipeline.
        limite: Número máximo de registros a retornar (padrão: 100, máx: 500).
                 SEGURANÇA (OWASP API4): Evita respostas gigantes que
                 poderiam causar DoS por consumo excessivo de memória.

    Retorna:
        DadosResponse com os registros convertidos em lista de dicionários.
    """
    _validar_pipeline(pipeline)

    # SEGURANÇA: Limita o número máximo de registros
    limite = max(1, min(limite, 500))

    try:
        df = carregar_csv_mais_recente(pipeline)
    except Exception as erro:
        logger.error(
            "Erro ao carregar CSV de %s: %s", pipeline, str(erro), exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Erro ao carregar dados. Consulte os logs do servidor.",
        )

    if df is None:
        raise HTTPException(
            status_code=404,
            detail=f"Nenhum arquivo CSV encontrado no pipeline '{pipeline}'",
        )

    # Obtém o nome do arquivo mais recente
    arquivos = listar_arquivos_pipeline(pipeline)
    nome_arquivo = arquivos[0]["nome"] if arquivos else "desconhecido"

    # Converte NaN para None para serialização JSON correta
    df = df.where(df.notna(), None)

    # SEGURANÇA (OWASP API4): Aplica paginação para evitar respostas enormes
    df_limitado = df.head(limite)

    return DadosResponse(
        pipeline=pipeline,
        arquivo=nome_arquivo,
        total_registros=len(df),
        registros=df_limitado.to_dict(orient="records"),
    )


@router.get(
    "/estatisticas",
    response_model=EstatisticasResponse,
    summary="Estatísticas gerais dos dados",
    description=(
        "Retorna estatísticas consolidadas de todos os pipelines: "
        "total de arquivos, registros e informações do último arquivo."
    ),
)
async def obter_estatisticas() -> EstatisticasResponse:
    """
    Gera estatísticas consolidadas de todos os pipelines.

    Percorre cada pipeline configurado, conta arquivos e registros,
    e retorna um resumo geral com totais.
    """
    pipelines_info = []
    total_arquivos = 0
    total_registros = 0

    for nome_pipeline in PIPELINES_RAW:
        stats = contar_registros_pipeline(nome_pipeline)
        pipelines_info.append(
            PipelineInfo(
                nome=nome_pipeline,
                descricao=DESCRICOES_PIPELINES.get(nome_pipeline, ""),
                total_arquivos=stats["total_arquivos"],
                total_registros=stats["total_registros"],
                ultimo_arquivo=stats["ultimo_arquivo"],
            )
        )
        total_arquivos += stats["total_arquivos"]
        total_registros += stats["total_registros"]

    return EstatisticasResponse(
        pipelines=pipelines_info,
        total_pipelines=len(PIPELINES_RAW),
        total_arquivos_geral=total_arquivos,
        total_registros_geral=total_registros,
        timestamp=datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
    )
