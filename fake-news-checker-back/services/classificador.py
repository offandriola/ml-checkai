# ==============================================================================
# CheckAI API — Serviço de Classificação de Textos
# ==============================================================================
# Responsável por:
#   - Carregar o modelo treinado de ML (quando disponível)
#   - Classificar textos como VERDADEIRO ou FALSO
#   - Fornecer um modo mock para testes antes do modelo estar pronto
#
# Quando o modelo .pkl estiver treinado, basta colocá-lo no caminho
# definido em api.config.CAMINHO_MODELO e reiniciar o servidor.
# O serviço detecta e carrega automaticamente.
# ==============================================================================

import random
import logging
from pathlib import Path

import joblib

from config import CAMINHO_MODELO


# Configuração do logger para este módulo
logger = logging.getLogger(__name__)


# ------------------------------------------------------------------------------
# Estado Global do Modelo
# ------------------------------------------------------------------------------
# O modelo é carregado uma única vez na memória ao inicializar o serviço.
# As variáveis abaixo mantêm o estado entre chamadas.
# ------------------------------------------------------------------------------

_modelo = None          # Instância do modelo carregado (ou None)
_modelo_carregado = False  # Flag indicando se o modelo está ativo


def carregar_modelo() -> bool:
    """
    Tenta carregar o modelo de ML do disco.

    Busca o arquivo .pkl no caminho definido em config.CAMINHO_MODELO.
    Se o arquivo existir e for válido, carrega na memória e atualiza
    o estado global.

    Retorna:
        True se o modelo foi carregado com sucesso, False caso contrário.
    """
    global _modelo, _modelo_carregado

    if not Path(CAMINHO_MODELO).exists():
        logger.info(
            "Modelo não encontrado em %s — modo mock ativado", CAMINHO_MODELO
        )
        _modelo = None
        _modelo_carregado = False
        return False

    try:
        # SEGURANÇA (OWASP A08 - Insecure Deserialization):
        # joblib.load utiliza pickle, que permite execução arbitrária de código.
        # Garanta que o arquivo .pkl em CAMINHO_MODELO seja gerado por você e
        # protegido contra modificações não autorizadas.
        _modelo = joblib.load(CAMINHO_MODELO)
        _modelo_carregado = True
        logger.info("Modelo carregado com sucesso de %s", CAMINHO_MODELO)
        return True
    except Exception as erro:
        logger.error("Erro ao carregar modelo: %s", str(erro))
        _modelo = None
        _modelo_carregado = False
        return False


def verificar_status_modelo() -> dict:
    """
    Retorna o status atual do modelo de classificação.

    Retorna:
        Dicionário com:
            - 'modelo_carregado': bool
            - 'caminho_modelo': str
            - 'mensagem': str
    """
    if _modelo_carregado:
        mensagem = "Modelo de classificação carregado e pronto para uso"
    else:
        mensagem = (
            "Modelo não carregado — classificações usarão modo mock. "
            f"Para ativar, coloque o arquivo .pkl em: {CAMINHO_MODELO}"
        )

    return {
        "modelo_carregado": _modelo_carregado,
        "caminho_modelo": str(CAMINHO_MODELO),
        "mensagem": mensagem,
    }


def classificar_texto(texto: str) -> dict:
    """
    Classifica um texto como VERDADEIRO ou FALSO.

    Se o modelo real estiver carregado, utiliza-o para a predição.
    Caso contrário, gera uma classificação mock aleatória para permitir
    que o front-end possa ser desenvolvido e testado antes do modelo
    estar pronto.

    Parâmetros:
        texto: Texto da afirmação/manchete/notícia a ser classificada.

    Retorna:
        Dicionário com:
            - 'texto_original': str
            - 'classificacao': str ('VERDADEIRO' ou 'FALSO')
            - 'confianca': float (0.0 a 1.0)
            - 'modelo_ativo': bool
            - 'mensagem': str
    """

    if _modelo_carregado and _modelo is not None:
        # ------------------------------------------------------------------
        # Classificação REAL com o modelo treinado
        # ------------------------------------------------------------------
        # Mapeamento dos labels numéricos do modelo → nomes legíveis
        _LABEL_MAP = {0: "FALSO", 1: "VERDADEIRO", "0": "FALSO", "1": "VERDADEIRO"}

        try:
            # O modelo espera receber uma lista de textos
            predicao = _modelo.predict([texto])
            # Se o modelo suportar predict_proba, extraímos a confiança
            try:
                probabilidades = _modelo.predict_proba([texto])
                confianca = float(max(probabilidades[0]))
            except AttributeError:
                # Modelos como LinearSVC não têm predict_proba
                confianca = 0.0

            # Converte label numérico (0/1) para texto (FALSO/VERDADEIRO)
            label_raw = predicao[0]
            classificacao = _LABEL_MAP.get(label_raw, str(label_raw))

            return {
                "texto_original": texto,
                "classificacao": classificacao,
                "confianca": confianca,
                "modelo_ativo": True,
                "mensagem": "Classificação realizada com modelo treinado",
            }

        except Exception as erro:
            logger.error("Erro na predição do modelo: %s", str(erro))
            return {
                "texto_original": texto,
                "classificacao": "ERRO",
                "confianca": 0.0,
                "modelo_ativo": True,
                "mensagem": f"Erro na predição: {str(erro)}",
            }

    else:
        # ------------------------------------------------------------------
        # Classificação MOCK (modelo não disponível)
        # ------------------------------------------------------------------
        classificacao = random.choice(["VERDADEIRO", "FALSO"])  # nosec B311
        confianca = round(random.uniform(0.5, 0.95), 2)         # nosec B311

        logger.debug(
            "Classificação mock gerada: %s (%.2f)", classificacao, confianca
        )

        return {
            "texto_original": texto,
            "classificacao": classificacao,
            "confianca": confianca,
            "modelo_ativo": False,
            "mensagem": (
                "⚠️ Classificação MOCK (aleatória) — modelo real não carregado. "
                "Este resultado NÃO é confiável."
            ),
        }
