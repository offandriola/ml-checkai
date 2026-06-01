# ==============================================================================
# CheckAI API — Service: Analisador de Imagem (OCR)
# ==============================================================================
# Aceita URL pública ou string base64 (data:image/...;base64,...).
# Extrai o texto usando Tesseract (offline, sem limites de uso).
# ==============================================================================

import base64
import io
import logging

import requests
from PIL import Image
import pytesseract

logger = logging.getLogger(__name__)

_TIMEOUT_DOWNLOAD = 15
_HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; CheckAI/1.0)"}


def _abrir_imagem(fonte: str) -> Image.Image:
    """Abre PIL.Image a partir de base64 data-URL ou URL HTTP."""
    if fonte.startswith("data:image/"):
        # data:image/png;base64,<dados>
        header, dados = fonte.split(",", 1)
        conteudo = base64.b64decode(dados)
        return Image.open(io.BytesIO(conteudo))

    resp = requests.get(fonte, timeout=_TIMEOUT_DOWNLOAD, headers=_HEADERS)
    resp.raise_for_status()
    return Image.open(io.BytesIO(resp.content))


def _ocr(img: Image.Image) -> str | None:
    """Executa OCR e retorna texto limpo ou None."""
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    texto = pytesseract.image_to_string(img, lang="por+eng").strip()
    return texto if texto else None


def extrair_texto_imagem(fonte: str) -> str | None:
    """
    Recebe URL pública ou data-URL base64 e executa OCR (Português + Inglês).

    Retorna o texto extraído ou None se falhar / imagem sem texto legível.
    """
    try:
        img = _abrir_imagem(fonte)
        texto = _ocr(img)
        if not texto:
            logger.warning("OCR: nenhum texto encontrado na imagem")
            return None
        label = "base64" if fonte.startswith("data:") else fonte
        logger.info("OCR: extraídos %d chars de %s", len(texto), label)
        return texto
    except Exception as exc:
        logger.warning("OCR: falha ao processar imagem — %s", exc)
        return None


def extrair_texto_imagem_bytes(conteudo: bytes) -> str | None:
    """
    Recebe bytes de um arquivo de imagem (upload multipart) e executa OCR.

    Retorna o texto extraído ou None se falhar / imagem sem texto legível.
    """
    try:
        img = Image.open(io.BytesIO(conteudo))
        texto = _ocr(img)
        if not texto:
            logger.warning("OCR (bytes): nenhum texto encontrado na imagem")
            return None
        logger.info("OCR (bytes): extraídos %d chars", len(texto))
        return texto
    except Exception as exc:
        logger.warning("OCR (bytes): falha ao processar imagem — %s", exc)
        return None
