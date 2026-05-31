# ==============================================================================
# CheckAI API — Serviço de Coleta: Fontes Oficiais (Câmara e Senado)
# ==============================================================================
# Módulo convertido do notebook: src/coleta_fontes_oficiais.ipynb
#
# Responsável por:
#   - Coletar proposições legislativas da Câmara dos Deputados
#   - Coletar matérias legislativas do Senado Federal
#   - Estruturar os dados em DataFrames padronizados
#   - Salvar CSVs separados na camada raw do pipeline
#
# APIs públicas utilizadas:
#   - Câmara: https://dadosabertos.camara.leg.br/api/v2
#   - Senado: https://legis.senado.leg.br/dadosabertos
# ==============================================================================

import logging
from datetime import datetime

import requests
import pandas as pd

from config import PIPELINE_FONTES_OFICIAIS
from utils.csv_handler import salvar_csv_raw


# Configuração do logger para este módulo
logger = logging.getLogger(__name__)


# ------------------------------------------------------------------------------
# Constantes do Pipeline
# ------------------------------------------------------------------------------

URL_CAMARA = "https://dadosabertos.camara.leg.br/api/v2/proposicoes"
URL_SENADO = "https://legis.senado.leg.br/dadosabertos/materia/pesquisa/lista.json"


def coletar_camara(ano: int = 2026, itens: int = 20) -> dict:
    """
    Coleta proposições legislativas da API da Câmara dos Deputados.

    Busca as proposições mais recentes para o ano informado, ordenadas
    por ID em ordem decrescente.

    Parâmetros:
        ano: Ano de referência para filtrar as proposições.
        itens: Quantidade de proposições a retornar (máx. 100 pela API).

    Retorna:
        Dicionário com:
            - 'sucesso': bool
            - 'total_registros': int
            - 'arquivo_salvo': str
            - 'mensagem': str
    """
    logger.info("Iniciando coleta da Câmara dos Deputados — Ano: %d", ano)

    params = {
        "ano": ano,
        "itens": itens,
        "ordem": "DESC",
        "ordenarPor": "id",
    }

    try:
        resposta = requests.get(URL_CAMARA, params=params, timeout=30)
    except requests.RequestException as erro:
        logger.error("Erro de rede ao acessar API da Câmara: %s", str(erro))
        return {
            "sucesso": False,
            "total_registros": 0,
            "arquivo_salvo": "",
            "mensagem": f"Erro de conexão com a API da Câmara: {str(erro)}",
        }

    if resposta.status_code != 200:
        logger.error(
            "Erro HTTP %d da API da Câmara: %s",
            resposta.status_code, resposta.text[:300],
        )
        return {
            "sucesso": False,
            "total_registros": 0,
            "arquivo_salvo": "",
            "mensagem": f"API da Câmara retornou erro HTTP {resposta.status_code}",
        }

    # Extrai os dados da resposta JSON
    dados = resposta.json()
    proposicoes = dados.get("dados", [])

    if not proposicoes:
        logger.warning("Nenhuma proposição encontrada para o ano %d", ano)
        return {
            "sucesso": True,
            "total_registros": 0,
            "arquivo_salvo": "",
            "mensagem": f"Nenhuma proposição encontrada para o ano {ano}",
        }

    # Monta o DataFrame com metadados de rastreabilidade
    df_camara = pd.DataFrame(proposicoes)
    df_camara["fonte_verificacao"] = "CAMARA_DEPUTADOS"
    df_camara["url_consulta"] = resposta.url
    df_camara["data_coleta"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    # Salva o CSV na camada raw
    caminho = salvar_csv_raw(
        df=df_camara,
        nome_pipeline=PIPELINE_FONTES_OFICIAIS,
        nome_base="camara_proposicoes",
    )

    logger.info(
        "Coleta Câmara concluída: %d proposições salvas em %s",
        len(df_camara), caminho,
    )

    return {
        "sucesso": True,
        "total_registros": len(df_camara),
        "arquivo_salvo": str(caminho),
        "mensagem": f"Coleta Câmara finalizada — {len(df_camara)} proposições",
    }


def coletar_senado(ano: int = 2026) -> dict:
    """
    Coleta matérias legislativas da API do Senado Federal.

    Busca todas as matérias publicadas no ano informado.

    Parâmetros:
        ano: Ano de referência para filtrar as matérias.

    Retorna:
        Dicionário com:
            - 'sucesso': bool
            - 'total_registros': int
            - 'arquivo_salvo': str
            - 'mensagem': str
    """
    logger.info("Iniciando coleta do Senado Federal — Ano: %d", ano)

    params = {"ano": ano}

    try:
        resposta = requests.get(URL_SENADO, params=params, timeout=60)
    except requests.RequestException as erro:
        logger.error("Erro de rede ao acessar API do Senado: %s", str(erro))
        return {
            "sucesso": False,
            "total_registros": 0,
            "arquivo_salvo": "",
            "mensagem": f"Erro de conexão com a API do Senado: {str(erro)}",
        }

    if resposta.status_code != 200:
        logger.error(
            "Erro HTTP %d da API do Senado: %s",
            resposta.status_code, resposta.text[:300],
        )
        return {
            "sucesso": False,
            "total_registros": 0,
            "arquivo_salvo": "",
            "mensagem": f"API do Senado retornou erro HTTP {resposta.status_code}",
        }

    # Navega a estrutura JSON aninhada do Senado
    dados = resposta.json()
    materias = (
        dados
        .get("PesquisaBasicaMateria", {})
        .get("Materias", {})
        .get("Materia", [])
    )

    if not materias:
        logger.warning("Nenhuma matéria encontrada para o ano %d", ano)
        return {
            "sucesso": True,
            "total_registros": 0,
            "arquivo_salvo": "",
            "mensagem": f"Nenhuma matéria encontrada para o ano {ano}",
        }

    # Monta o DataFrame com metadados de rastreabilidade
    df_senado = pd.DataFrame(materias)
    df_senado["fonte_verificacao"] = "SENADO_FEDERAL"
    df_senado["url_consulta"] = resposta.url
    df_senado["data_coleta"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    # Salva o CSV na camada raw
    caminho = salvar_csv_raw(
        df=df_senado,
        nome_pipeline=PIPELINE_FONTES_OFICIAIS,
        nome_base="senado_materias",
    )

    logger.info(
        "Coleta Senado concluída: %d matérias salvas em %s",
        len(df_senado), caminho,
    )

    return {
        "sucesso": True,
        "total_registros": len(df_senado),
        "arquivo_salvo": str(caminho),
        "mensagem": f"Coleta Senado finalizada — {len(df_senado)} matérias",
    }


def coletar_todas_fontes_oficiais(ano: int = 2026, itens_camara: int = 20) -> dict:
    """
    Executa a coleta de todas as fontes oficiais (Câmara + Senado).

    Cada fonte gera um CSV separado, pois possuem estruturas diferentes.
    A unificação será feita na etapa de curadoria.

    Parâmetros:
        ano: Ano de referência para ambas as fontes.
        itens_camara: Quantidade de proposições da Câmara.

    Retorna:
        Dicionário com resultados combinados das duas fontes.
    """
    logger.info("Iniciando coleta de todas as fontes oficiais — Ano: %d", ano)

    resultado_camara = coletar_camara(ano=ano, itens=itens_camara)
    resultado_senado = coletar_senado(ano=ano)

    total = resultado_camara["total_registros"] + resultado_senado["total_registros"]
    sucesso = resultado_camara["sucesso"] and resultado_senado["sucesso"]

    return {
        "sucesso": sucesso,
        "total_registros": total,
        "detalhes": {
            "camara": resultado_camara,
            "senado": resultado_senado,
        },
        "mensagem": (
            f"Fontes oficiais: {total} registros no total "
            f"(Câmara: {resultado_camara['total_registros']}, "
            f"Senado: {resultado_senado['total_registros']})"
        ),
    }
