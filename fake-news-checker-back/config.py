# ==============================================================================
# CheckAI API — Configuração Centralizada
# ==============================================================================
# Gerencia todas as configurações do backend, incluindo:
#   - Caminhos para as pastas de dados (raw, curated, final)
#   - Variáveis de ambiente (API keys, host, porta)
#   - Constantes reutilizáveis em toda a aplicação
#
# As configurações são carregadas automaticamente do arquivo .env na raiz
# do projeto. Caso o arquivo não exista, valores padrão são utilizados.
# ==============================================================================

import os
from pathlib import Path

from dotenv import load_dotenv


# ------------------------------------------------------------------------------
# Carregamento do .env
# ------------------------------------------------------------------------------
# Tenta carregar variáveis de ambiente do arquivo .env na raiz do projeto.
# Também busca o arquivo específico da chave do Google Fact Check.
# ------------------------------------------------------------------------------

# Resolve o diretório raiz do projeto (dois níveis acima deste arquivo)
DIRETORIO_RAIZ = Path(__file__).resolve().parent.parent

# Carrega o .env genérico (se existir)
load_dotenv(DIRETORIO_RAIZ / ".env")

# Carrega o arquivo específico da chave do Google Fact Check (se existir)
load_dotenv(DIRETORIO_RAIZ / "google-factcheck-api-key.env")


# ------------------------------------------------------------------------------
# Configurações do Servidor
# ------------------------------------------------------------------------------

API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
API_PORT: int = int(os.getenv("API_PORT", "8000"))
API_DEBUG: bool = os.getenv("API_DEBUG", "true").lower() == "true"

# Quantas URLs enriquecer com Trafilatura (0 = só snippet da Serper, mais rápido)
EXTRAIR_ARTIGOS_MAX: int = int(os.getenv("EXTRAIR_ARTIGOS_MAX", "0"))


# ------------------------------------------------------------------------------
# Configuração do JWT (Autenticação)
# ------------------------------------------------------------------------------

JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY") or "chave_insegura_trocar"
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRACAO_MINUTOS: int = int(os.getenv("JWT_EXPIRACAO_MINUTOS", "60"))


# ------------------------------------------------------------------------------
# Configuração do Banco de Dados (MySQL)
# ------------------------------------------------------------------------------

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:senha@localhost:3306/checkai",
)


# ------------------------------------------------------------------------------
# Metadados da API (exibidos no Swagger UI)
# ------------------------------------------------------------------------------

API_TITULO: str = "CheckAI API"
API_DESCRICAO: str = (
    "API RESTful do projeto CheckAI — Pipeline de dados e classificação "
    "de conteúdos políticos em português. "
    "Projeto acadêmico de TCC para análise de veracidade de afirmações."
)
API_VERSAO: str = "1.0.0"


# ------------------------------------------------------------------------------
# Chave da API Google Fact Check
# ------------------------------------------------------------------------------

GOOGLE_FACTCHECK_API_KEY: str | None = os.getenv("GOOGLE_FACTCHECK_API_KEY")


# ------------------------------------------------------------------------------
# Chave da API Serper.dev (Busca Web em Tempo Real)
# ------------------------------------------------------------------------------

SERPER_API_KEY: str | None = os.getenv("SERPER_API_KEY")


# ------------------------------------------------------------------------------
# Caminhos das Pastas de Dados
# ------------------------------------------------------------------------------
# Todos os pipelines seguem a estrutura: dados/<pipeline>/<camada>/
# Camadas: raw → curated → final
# ------------------------------------------------------------------------------

DIRETORIO_DADOS = DIRETORIO_RAIZ / "dados"

# Pipeline 1: Google Fact Check (conteúdos falsos/checados)
PIPELINE_GOOGLE_FACTCHECK = "pipeline_falso_google_factcheck"
DIR_GOOGLE_FACTCHECK_RAW = DIRETORIO_DADOS / PIPELINE_GOOGLE_FACTCHECK / "raw"
DIR_GOOGLE_FACTCHECK_CURATED = DIRETORIO_DADOS / PIPELINE_GOOGLE_FACTCHECK / "curated"
DIR_GOOGLE_FACTCHECK_FINAL = DIRETORIO_DADOS / PIPELINE_GOOGLE_FACTCHECK / "final"

# Pipeline 2: Fontes Oficiais (conteúdos verdadeiros/oficiais)
PIPELINE_FONTES_OFICIAIS = "pipeline_verdadeiro_fontes_oficiais"
DIR_FONTES_OFICIAIS_RAW = DIRETORIO_DADOS / PIPELINE_FONTES_OFICIAIS / "raw"
DIR_FONTES_OFICIAIS_CURATED = DIRETORIO_DADOS / PIPELINE_FONTES_OFICIAIS / "curated"
DIR_FONTES_OFICIAIS_FINAL = DIRETORIO_DADOS / PIPELINE_FONTES_OFICIAIS / "final"

# Pipeline 3: Notícias Reais (linguagem jornalística política)
PIPELINE_NOTICIAS_REAIS = "pipeline_noticias_reais"
DIR_NOTICIAS_REAIS_RAW = DIRETORIO_DADOS / PIPELINE_NOTICIAS_REAIS / "raw"
DIR_NOTICIAS_REAIS_CURATED = DIRETORIO_DADOS / PIPELINE_NOTICIAS_REAIS / "curated"
DIR_NOTICIAS_REAIS_FINAL = DIRETORIO_DADOS / PIPELINE_NOTICIAS_REAIS / "final"

# Dataset Unificado (junção de todos os pipelines)
PIPELINE_UNIFICADO = "dataset_unificado"
DIR_UNIFICADO_CURATED = DIRETORIO_DADOS / PIPELINE_UNIFICADO / "curated"
DIR_UNIFICADO_FINAL = DIRETORIO_DADOS / PIPELINE_UNIFICADO / "final"

# Mapeamento nome_pipeline → diretório raw (para uso dinâmico)
PIPELINES_RAW: dict[str, Path] = {
    PIPELINE_GOOGLE_FACTCHECK: DIR_GOOGLE_FACTCHECK_RAW,
    PIPELINE_FONTES_OFICIAIS: DIR_FONTES_OFICIAIS_RAW,
    PIPELINE_NOTICIAS_REAIS: DIR_NOTICIAS_REAIS_RAW,
}


# ------------------------------------------------------------------------------
# Ambiente
# ------------------------------------------------------------------------------

ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")


# ------------------------------------------------------------------------------
# Configuração de E-mail (SMTP)
# ------------------------------------------------------------------------------

SMTP_HOST: str = os.getenv("SMTP_HOST", "")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER: str = os.getenv("SMTP_USER", "")
SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@checkai.com.br")
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Validade do token de recuperação de senha (em minutos)
RESET_TOKEN_EXPIRACAO_MINUTOS: int = int(os.getenv("RESET_TOKEN_EXPIRACAO_MINUTOS", "60"))


# ------------------------------------------------------------------------------
# Diretório do Modelo de ML
# ------------------------------------------------------------------------------

_NOME_MODELO = "baseline_tfidf_svm_v4_balanced_2026-05-30_23-44-02.joblib"

DIR_MODELO = Path(os.getenv(
    "DIR_MODELO",
    str(DIRETORIO_RAIZ / "fake-news-checker-model" / "modelos"),
))
CAMINHO_MODELO = DIR_MODELO / _NOME_MODELO
