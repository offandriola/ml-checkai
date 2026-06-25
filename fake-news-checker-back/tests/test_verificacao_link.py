"""
Testes unitários — fluxo de verificação de links.

Cobre os cenários de validação de URL e extração de conteúdo
sem depender de rede real (usa mocks).
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Stub de dependências pesadas que não estão disponíveis no ambiente de testes
from unittest.mock import MagicMock, patch
for _mod in ("pytesseract", "cv2", "PIL", "PIL.Image"):
    if _mod not in sys.modules:
        sys.modules[_mod] = MagicMock()

import pytest

from services.verificacao import _validar_url, _extrair_conteudo_link, LinkError


# ── _validar_url ──────────────────────────────────────────────────────────────

def test_validar_url_http_valida():
    _validar_url("http://example.com/artigo")  # não deve levantar


def test_validar_url_https_valida():
    _validar_url("https://g1.globo.com/noticia")  # não deve levantar


def test_validar_url_sem_scheme():
    with pytest.raises(LinkError) as exc:
        _validar_url("example.com/artigo")
    assert exc.value.tipo == LinkError.TIPO_URL_INVALIDA


def test_validar_url_scheme_invalido():
    with pytest.raises(LinkError) as exc:
        _validar_url("ftp://example.com/arquivo")
    assert exc.value.tipo == LinkError.TIPO_URL_INVALIDA


def test_validar_url_sem_dominio():
    with pytest.raises(LinkError) as exc:
        _validar_url("https://")
    assert exc.value.tipo == LinkError.TIPO_URL_INVALIDA


def test_validar_url_dominio_sem_ponto():
    with pytest.raises(LinkError) as exc:
        _validar_url("https://localhost")
    assert exc.value.tipo == LinkError.TIPO_URL_INVALIDA


# ── _extrair_conteudo_link ────────────────────────────────────────────────────
# trafilatura é importado localmente dentro da função, então o patch correto
# é via sys.modules para interceptar o `import trafilatura` em tempo de execução.

def _mock_traf(fetch_result=None, meta_title="", extract_result=None, side_effect=None):
    """Cria um mock de trafilatura e injeta em sys.modules."""
    mock = MagicMock()
    if side_effect:
        mock.fetch_url.side_effect = side_effect
    else:
        mock.fetch_url.return_value = fetch_result
    mock.extract_metadata.return_value = MagicMock(title=meta_title)
    mock.extract.return_value = extract_result
    return mock


def test_extrair_conteudo_link_sucesso():
    mock = _mock_traf(fetch_result="<html>...</html>", meta_title="Artigo de Teste", extract_result="A" * 200)
    with patch.dict(sys.modules, {"trafilatura": mock}):
        resultado = _extrair_conteudo_link("https://example.com/artigo")

    assert resultado["titulo"] == "Artigo de Teste"
    assert len(resultado["texto"]) >= 80
    assert "example.com" in resultado["dominio"]


def test_extrair_conteudo_link_pagina_inacessivel():
    mock = _mock_traf(fetch_result=None)
    with patch.dict(sys.modules, {"trafilatura": mock}):
        with pytest.raises(LinkError) as exc:
            _extrair_conteudo_link("https://example.com/artigo")
    assert exc.value.tipo == LinkError.TIPO_PAGINA_INACESSIVEL


def test_extrair_conteudo_link_conteudo_nao_encontrado():
    mock = _mock_traf(fetch_result="<html>...</html>", meta_title="", extract_result=None)
    with patch.dict(sys.modules, {"trafilatura": mock}):
        with pytest.raises(LinkError) as exc:
            _extrair_conteudo_link("https://example.com/artigo")
    assert exc.value.tipo == LinkError.TIPO_CONTEUDO_NAO_ENCONTRADO


def test_extrair_conteudo_link_conteudo_insuficiente():
    mock = _mock_traf(fetch_result="<html>...</html>", meta_title="Curto", extract_result="Texto curto.")
    with patch.dict(sys.modules, {"trafilatura": mock}):
        with pytest.raises(LinkError) as exc:
            _extrair_conteudo_link("https://example.com/artigo")
    assert exc.value.tipo == LinkError.TIPO_CONTEUDO_INSUFICIENTE


def test_extrair_conteudo_link_timeout():
    mock = _mock_traf(side_effect=Exception("Connection timed out"))
    with patch.dict(sys.modules, {"trafilatura": mock}):
        with pytest.raises(LinkError) as exc:
            _extrair_conteudo_link("https://example.com/artigo")
    assert exc.value.tipo == LinkError.TIPO_TIMEOUT


def test_extrair_conteudo_link_titulo_fallback_dominio():
    mock = _mock_traf(fetch_result="<html>...</html>", meta_title="", extract_result="B" * 200)
    with patch.dict(sys.modules, {"trafilatura": mock}):
        resultado = _extrair_conteudo_link("https://g1.globo.com/artigo")

    # Deve usar o domínio como fallback
    assert "g1.globo.com" in resultado["titulo"]


def test_url_invalida_mensagem_usuario():
    try:
        _validar_url("nao-e-uma-url")
    except LinkError as exc:
        assert len(exc.mensagem_usuario) > 10
        assert "URL" in exc.mensagem_usuario or "url" in exc.mensagem_usuario.lower()
