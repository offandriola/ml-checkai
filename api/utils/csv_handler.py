# ==============================================================================
# CheckAI API — Utilitário de Manipulação de CSVs
# ==============================================================================
# Funções compartilhadas para leitura, escrita e listagem de arquivos CSV
# na estrutura de camadas do projeto (raw, curated, final).
#
# Todas as funções utilizam os caminhos definidos em api.config para
# garantir consistência com a organização de pastas do projeto.
# ==============================================================================

from datetime import datetime
from pathlib import Path

import pandas as pd

from api.config import PIPELINES_RAW


def salvar_csv_raw(
    df: pd.DataFrame,
    nome_pipeline: str,
    nome_base: str,
) -> Path:
    """
    Salva um DataFrame como CSV na camada raw de um pipeline.

    O arquivo é nomeado com timestamp para evitar sobrescrever coletas
    anteriores e manter a rastreabilidade do dataset.

    Parâmetros:
        df: DataFrame com os dados a serem salvos.
        nome_pipeline: Identificador do pipeline (ex: 'pipeline_falso_google_factcheck').
        nome_base: Prefixo do nome do arquivo (ex: 'google_factcheck').

    Retorna:
        Path do arquivo CSV criado.

    Raises:
        ValueError: Se o nome do pipeline não for reconhecido.
    """
    pasta_raw = PIPELINES_RAW.get(nome_pipeline)

    if pasta_raw is None:
        raise ValueError(
            f"Pipeline '{nome_pipeline}' não reconhecido. "
            f"Pipelines válidos: {list(PIPELINES_RAW.keys())}"
        )

    # Garante que o diretório existe
    pasta_raw.mkdir(parents=True, exist_ok=True)

    # Gera nome do arquivo com timestamp (padrão do projeto)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    nome_arquivo = f"{nome_base}_raw_{timestamp}.csv"
    caminho_saida = pasta_raw / nome_arquivo

    # Salva com encoding UTF-8 BOM para compatibilidade com Excel
    df.to_csv(caminho_saida, index=False, encoding="utf-8-sig")

    return caminho_saida


def listar_arquivos_pipeline(nome_pipeline: str) -> list[dict]:
    """
    Lista todos os arquivos CSV na camada raw de um pipeline.

    Retorna uma lista de dicionários com metadados de cada arquivo,
    ordenados do mais recente para o mais antigo.

    Parâmetros:
        nome_pipeline: Identificador do pipeline.

    Retorna:
        Lista de dicts com 'nome', 'caminho', 'tamanho_bytes' e 'data_modificacao'.

    Raises:
        ValueError: Se o nome do pipeline não for reconhecido.
    """
    pasta_raw = PIPELINES_RAW.get(nome_pipeline)

    if pasta_raw is None:
        raise ValueError(
            f"Pipeline '{nome_pipeline}' não reconhecido. "
            f"Pipelines válidos: {list(PIPELINES_RAW.keys())}"
        )

    # Busca apenas arquivos .csv (ignora .gitkeep e outros)
    arquivos_csv = sorted(
        pasta_raw.glob("*.csv"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )

    resultado = []
    for arquivo in arquivos_csv:
        stat = arquivo.stat()
        resultado.append({
            "nome": arquivo.name,
            "caminho": str(arquivo),
            "tamanho_bytes": stat.st_size,
            "data_modificacao": datetime.fromtimestamp(stat.st_mtime).strftime(
                "%d/%m/%Y %H:%M:%S"
            ),
        })

    return resultado


def carregar_csv_mais_recente(nome_pipeline: str) -> pd.DataFrame | None:
    """
    Carrega o CSV mais recente da camada raw de um pipeline.

    Parâmetros:
        nome_pipeline: Identificador do pipeline.

    Retorna:
        DataFrame com os dados do CSV mais recente, ou None se não houver
        nenhum arquivo CSV disponível.

    Raises:
        ValueError: Se o nome do pipeline não for reconhecido.
    """
    arquivos = listar_arquivos_pipeline(nome_pipeline)

    if not arquivos:
        return None

    # O primeiro arquivo da lista é o mais recente (ordenado em listar_arquivos_pipeline)
    caminho_mais_recente = arquivos[0]["caminho"]

    return pd.read_csv(caminho_mais_recente, encoding="utf-8-sig")


def contar_registros_pipeline(nome_pipeline: str) -> dict:
    """
    Conta o total de registros e arquivos na camada raw de um pipeline.

    Parâmetros:
        nome_pipeline: Identificador do pipeline.

    Retorna:
        Dict com 'total_arquivos', 'total_registros' e 'ultimo_arquivo'.
    """
    arquivos = listar_arquivos_pipeline(nome_pipeline)

    if not arquivos:
        return {
            "total_arquivos": 0,
            "total_registros": 0,
            "ultimo_arquivo": None,
        }

    # Conta registros apenas do último arquivo (evita processar todos)
    df = carregar_csv_mais_recente(nome_pipeline)
    total_registros = len(df) if df is not None else 0

    return {
        "total_arquivos": len(arquivos),
        "total_registros": total_registros,
        "ultimo_arquivo": arquivos[0]["nome"],
    }
