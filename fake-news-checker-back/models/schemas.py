# ==============================================================================
# CheckAI API — Schemas Pydantic (Modelos de Dados)
# ==============================================================================
# Define os modelos de validação de entrada e saída para todos os endpoints
# da API. O Pydantic garante que os dados trafegados pela API estejam sempre
# no formato correto, gerando erros claros quando não estiverem.
#
# Convenções:
#   - Sufixo "Request"  → Modelo de entrada (corpo da requisição)
#   - Sufixo "Response" → Modelo de saída (resposta da API)
#   - Sufixo "Info"     → Modelo auxiliar para composição
# ==============================================================================

import json

from pydantic import BaseModel, Field, model_validator
from datetime import datetime


# ==============================================================================
# Health Check
# ==============================================================================

class HealthResponse(BaseModel):
    """Resposta do endpoint de verificação de saúde da API."""

    status: str = Field(
        description="Status atual da API",
        examples=["online"],
    )
    versao: str = Field(
        description="Versão atual da API",
        examples=["1.0.0"],
    )
    timestamp: str = Field(
        description="Data e hora da consulta",
        examples=["10/05/2026 14:30:00"],
    )


# ==============================================================================
# Coleta de Dados
# ==============================================================================

class ColetaGoogleRequest(BaseModel):
    """Parâmetros opcionais para a coleta do Google Fact Check."""

    termos: list[str] | None = Field(
        default=None,
        description=(
            "Lista de termos de busca. Se não informado, utiliza os termos "
            "padrão definidos no serviço."
        ),
        examples=[["Lula", "Bolsonaro", "eleições 2026"]],
    )
    max_paginas_por_termo: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Número máximo de páginas por termo de busca",
    )


class ColetaFontesOficiaisRequest(BaseModel):
    """Parâmetros opcionais para a coleta de fontes oficiais."""

    ano: int = Field(
        default=2026,
        ge=2020,
        le=2030,
        description="Ano de referência para busca de proposições/matérias",
    )
    itens_camara: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Quantidade de proposições a coletar da Câmara dos Deputados",
    )


class ColetaResponse(BaseModel):
    """Resposta padrão retornada após a execução de qualquer pipeline de coleta."""

    sucesso: bool = Field(
        description="Indica se a coleta foi realizada com sucesso",
    )
    pipeline: str = Field(
        description="Nome do pipeline executado",
        examples=["pipeline_falso_google_factcheck"],
    )
    total_registros: int = Field(
        description="Quantidade de registros coletados nesta execução",
        examples=[1021],
    )
    arquivo_salvo: str = Field(
        description="Caminho do arquivo CSV gerado",
        examples=["dados/pipeline_falso_google_factcheck/raw/google_factcheck_raw_2026-05-10_02-42-39.csv"],
    )
    timestamp: str = Field(
        description="Data e hora da conclusão da coleta",
        examples=["10/05/2026 02:42:39"],
    )
    mensagem: str = Field(
        description="Mensagem descritiva do resultado",
        examples=["Coleta finalizada com sucesso"],
    )


class ColetaTodasResponse(BaseModel):
    """Resposta da execução de todos os pipelines simultaneamente."""

    sucesso: bool = Field(
        description="Indica se todas as coletas foram realizadas com sucesso",
    )
    resultados: list[ColetaResponse] = Field(
        description="Lista com o resultado de cada pipeline executado",
    )
    total_geral: int = Field(
        description="Soma total de registros coletados em todos os pipelines",
    )
    timestamp: str = Field(
        description="Data e hora da conclusão geral",
    )


# ==============================================================================
# Consulta de Dados
# ==============================================================================

class ArquivoInfo(BaseModel):
    """Metadados de um arquivo CSV armazenado."""

    nome: str = Field(
        description="Nome do arquivo",
        examples=["google_factcheck_raw_2026-05-10_02-42-39.csv"],
    )
    caminho: str = Field(
        description="Caminho completo do arquivo no sistema",
    )
    tamanho_bytes: int = Field(
        description="Tamanho do arquivo em bytes",
        examples=[524288],
    )
    data_modificacao: str = Field(
        description="Data da última modificação do arquivo",
        examples=["10/05/2026 02:42:39"],
    )


class PipelineInfo(BaseModel):
    """Informações resumidas de um pipeline de dados."""

    nome: str = Field(
        description="Identificador do pipeline",
        examples=["pipeline_falso_google_factcheck"],
    )
    descricao: str = Field(
        description="Descrição breve do pipeline",
        examples=["Coleta de afirmações checadas via Google Fact Check Tools API"],
    )
    total_arquivos: int = Field(
        description="Quantidade de arquivos CSV na camada raw",
    )
    total_registros: int = Field(
        description="Quantidade de registros no último arquivo coletado",
    )
    ultimo_arquivo: str | None = Field(
        description="Nome do arquivo mais recente (None se vazio)",
    )


class EstatisticasResponse(BaseModel):
    """Estatísticas gerais de todos os pipelines."""

    pipelines: list[PipelineInfo] = Field(
        description="Lista de informações de cada pipeline",
    )
    total_pipelines: int = Field(
        description="Quantidade de pipelines configurados",
    )
    total_arquivos_geral: int = Field(
        description="Total de arquivos CSV em todos os pipelines",
    )
    total_registros_geral: int = Field(
        description="Total de registros somando o último arquivo de cada pipeline",
    )
    timestamp: str = Field(
        description="Data e hora da consulta",
    )


class DadosResponse(BaseModel):
    """Resposta com registros de dados de um pipeline."""

    pipeline: str = Field(
        description="Nome do pipeline consultado",
    )
    arquivo: str = Field(
        description="Nome do arquivo de onde os dados foram carregados",
    )
    total_registros: int = Field(
        description="Quantidade total de registros no arquivo",
    )
    registros: list[dict] = Field(
        description="Lista de registros (cada registro é um dicionário)",
    )


# ==============================================================================
# Classificação de Textos
# ==============================================================================

class ClassificacaoRequest(BaseModel):
    """Entrada para o endpoint de classificação de textos."""

    texto: str = Field(
        min_length=5,
        max_length=5000,
        description="Texto da afirmação, manchete ou notícia a ser classificada",
        examples=["Lula assinou novo decreto sobre educação"],
    )


class ClassificacaoResponse(BaseModel):
    """Resultado da classificação de um texto."""

    texto_original: str = Field(
        description="Texto enviado para classificação",
    )
    classificacao: str = Field(
        description="Rótulo atribuído pelo modelo",
        examples=["VERDADEIRO"],
    )
    confianca: float = Field(
        ge=0.0,
        le=1.0,
        description="Nível de confiança da predição (0.0 a 1.0)",
        examples=[0.85],
    )
    modelo_ativo: bool = Field(
        description="Indica se o modelo real está ativo (False = mock)",
    )
    mensagem: str = Field(
        description="Informação adicional sobre o resultado",
        examples=["Classificação realizada com modelo treinado"],
    )


class StatusModeloResponse(BaseModel):
    """Status do modelo de classificação."""

    modelo_carregado: bool = Field(
        description="Indica se o modelo .pkl foi carregado com sucesso",
    )
    caminho_modelo: str = Field(
        description="Caminho esperado do arquivo do modelo",
    )
    mensagem: str = Field(
        description="Descrição do status atual do modelo",
    )


# ==============================================================================
# Autenticação / Usuários
# ==============================================================================

from pydantic import EmailStr


class CadastroRequest(BaseModel):
    """Dados de entrada para cadastro de um novo usuário."""

    nome: str = Field(
        min_length=2,
        max_length=120,
        description="Nome completo do usuário",
        examples=["Gabriel Andriola"],
    )
    email: EmailStr = Field(
        description="E-mail do usuário (usado para login)",
        examples=["gabriel@exemplo.com"],
    )
    senha: str = Field(
        min_length=8,
        max_length=72,  # bcrypt trunca em 72 bytes; validamos aqui pra evitar surpresa
        description="Senha do usuário (mínimo 8 caracteres)",
        examples=["senhaSegura123"],
    )


class UsuarioResponse(BaseModel):
    """Dados públicos de um usuário (NUNCA inclui a senha/hash)."""

    id: int = Field(description="Identificador único do usuário")
    nome: str = Field(description="Nome do usuário")
    email: EmailStr = Field(description="E-mail do usuário")

    # Permite que o Pydantic leia direto de um objeto SQLAlchemy
    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    """Dados de entrada para login."""

    email: EmailStr = Field(
        description="E-mail cadastrado",
        examples=["gabriel@exemplo.com"],
    )
    senha: str = Field(
        description="Senha do usuário",
        examples=["senhaSegura123"],
    )


class TokenResponse(BaseModel):
    """Token de acesso retornado após login bem-sucedido."""

    access_token: str = Field(description="Token JWT de acesso")
    token_type: str = Field(default="bearer", description="Tipo do token")


# ==============================================================================
# Verificações / Histórico
# ==============================================================================


class FonteInfo(BaseModel):
    """Fonte web recuperada para embasar o veredito de verificação."""

    titulo: str = Field(description="Título da página/artigo")
    url: str = Field(description="URL completa da fonte")
    snippet: str = Field(description="Trecho relevante do conteúdo")
    fonte: str = Field(description="Domínio da fonte (ex: g1.globo.com)")
    texto_extraido: str | None = Field(
        default=None,
        description="Resumo do conteúdo extraído do artigo (até 500 chars)",
    )
    nli_label: str | None = Field(
        default=None,
        description="Classificação NLI desta fonte: SUPPORTS, REFUTES ou NEUTRAL",
    )
    nli_score: float | None = Field(
        default=None,
        description="Score de confiança da classificação NLI (0.0 a 1.0)",
    )


class VerificacaoCreateRequest(BaseModel):
    """Entrada para criar uma verificação."""

    texto: str = Field(
        min_length=5,
        max_length=10000,
        description="Texto a ser verificado",
        examples=["Governo anuncia nova isenção de impostos"],
    )
    tipo: str = Field(
        default="texto",
        description="Tipo de conteúdo verificado (texto, imagem ou link)",
        examples=["texto"],
    )


class VerificarPublicoResponse(BaseModel):
    """Resultado de verificação sem autenticação (landing page)."""

    texto_verificado: str
    tipo: str = Field(default="texto")
    resultado: str = Field(description="REAL, FALSO ou INCONCLUSIVO")
    confianca: float = Field(ge=0.0, le=1.0)
    modelo_ativo: bool = Field(
        description="True se o modelo ML real foi usado na classificação",
    )
    fontes: list[FonteInfo] = Field(default_factory=list)
    nli_resultado_agregado: str | None = Field(
        default=None,
        description="Veredito NLI agregado das fontes: SUPPORTS, REFUTES ou NEUTRAL",
    )
    nli_score_agregado: float | None = Field(
        default=None,
        description="Score médio do veredito NLI agregado (0.0 a 1.0)",
    )
    nli_votos: dict | None = Field(
        default=None,
        description="Contagem de votos NLI por categoria: {SUPPORTS, REFUTES, NEUTRAL}",
    )


class VerificacaoResponse(BaseModel):
    """Representa uma verificação no histórico."""

    id: int
    texto_verificado: str
    tipo: str
    resultado: str = Field(description="REAL, FALSO ou INCONCLUSIVO")
    confianca: float
    fontes: list[FonteInfo] = Field(default_factory=list, description="Fontes web recuperadas")
    criado_em: datetime
    nli_resultado_agregado: str | None = Field(
        default=None,
        description="Veredito NLI agregado das fontes: SUPPORTS, REFUTES ou NEUTRAL",
    )
    nli_score_agregado: float | None = Field(
        default=None,
        description="Score médio do veredito NLI agregado (0.0 a 1.0)",
    )
    nli_votos: dict | None = Field(
        default=None,
        description="Contagem de votos NLI por categoria: {SUPPORTS, REFUTES, NEUTRAL}",
    )

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def deserializar_fontes(cls, values):
        """Converte fontes_json (Text do ORM) para list[FonteInfo]."""
        if hasattr(values, "__dict__"):
            # Lendo de objeto ORM SQLAlchemy
            fontes_json = getattr(values, "fontes_json", None)
            if fontes_json:
                try:
                    values.__dict__["fontes"] = json.loads(fontes_json)
                except (json.JSONDecodeError, TypeError):
                    values.__dict__["fontes"] = []
            else:
                values.__dict__["fontes"] = []
        elif isinstance(values, dict) and "fontes_json" in values and "fontes" not in values:
            fontes_json = values.get("fontes_json")
            if fontes_json:
                try:
                    values["fontes"] = json.loads(fontes_json)
                except (json.JSONDecodeError, TypeError):
                    values["fontes"] = []
            else:
                values["fontes"] = []
        return values


class ResumoResponse(BaseModel):
    """Estatísticas agregadas do usuário (bloco 'Seu resumo' do dashboard)."""

    total_verificacoes: int = Field(description="Total de verificações feitas")
    total_reais: int = Field(description="Quantas foram classificadas como REAL")
    total_falsas: int = Field(description="Quantas foram classificadas como FALSO")
    total_inconclusivas: int = Field(description="Quantas foram INCONCLUSIVO")
    percentual_reais: float = Field(description="Percentual de verificações reais")


class ListagemVerificacoesResponse(BaseModel):
    """Resposta paginada do histórico de verificações."""

    total: int = Field(description="Total de verificações que atendem aos filtros")
    pagina: int = Field(description="Página atual (começa em 1)")
    por_pagina: int = Field(description="Quantidade de itens por página")
    total_paginas: int = Field(description="Total de páginas disponíveis")
    itens: list[VerificacaoResponse] = Field(description="Verificações da página atual")


class AtualizarPerfilRequest(BaseModel):
    """Atualização parcial do perfil. Campos opcionais — só atualiza o que for enviado."""

    nome: str | None = Field(
        default=None,
        min_length=2,
        max_length=120,
        description="Novo nome completo (opcional)",
    )
    email: EmailStr | None = Field(
        default=None,
        description="Novo e-mail (opcional)",
    )


class TrocarSenhaRequest(BaseModel):
    """Troca de senha com confirmação da senha atual."""

    senha_atual: str = Field(
        min_length=1,
        description="Senha atual (para validação)",
    )
    nova_senha: str = Field(
        min_length=8,
        max_length=72,
        description="Nova senha (mínimo 8 caracteres)",
    )


class MensagemResponse(BaseModel):
    """Resposta genérica de sucesso para operações sem retorno de dados."""

    mensagem: str = Field(description="Descrição do resultado da operação")


class RecuperarSenhaRequest(BaseModel):
    """Solicitação de recuperação de senha."""

    email: EmailStr = Field(
        description="E-mail da conta para recuperação",
        examples=["usuario@exemplo.com"],
    )


class RecuperarSenhaResponse(BaseModel):
    """
    Resposta da solicitação de recuperação.

    NOTA ACADÊMICA: em produção, o token seria enviado por e-mail e NÃO
    retornado aqui. Para fins de demonstração do TCC, ele é devolvido na
    resposta para permitir testar o fluxo sem servidor de e-mail.
    """

    mensagem: str = Field(description="Confirmação da solicitação")
    token_recuperacao: str | None = Field(
        default=None,
        description="[MOCK/TCC] Token de redefinição (iria por e-mail em produção)",
    )


class RedefinirSenhaRequest(BaseModel):
    """Redefinição de senha usando o token de recuperação."""

    token: str = Field(description="Token de recuperação recebido")
    nova_senha: str = Field(
        min_length=8,
        max_length=72,
        description="Nova senha (mínimo 8 caracteres)",
    )