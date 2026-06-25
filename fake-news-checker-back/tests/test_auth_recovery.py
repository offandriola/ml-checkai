"""
Testes unitários — recuperação de senha.

Cobre funções de hash/token e a lógica de serviço com DB mockado.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest

from utils.security import gerar_token_recuperacao, hash_token_recuperacao


# ── utils.security ────────────────────────────────────────────────────────────

def test_gerar_token_recuperacao_tamanho():
    token = gerar_token_recuperacao()
    # secrets.token_urlsafe(32) produz 43 caracteres em base64url
    assert len(token) == 43


def test_gerar_token_recuperacao_unicidade():
    tokens = {gerar_token_recuperacao() for _ in range(50)}
    assert len(tokens) == 50, "tokens não devem se repetir"


def test_hash_token_recuperacao_determinismo():
    token = "meu_token_fixo"
    h1 = hash_token_recuperacao(token)
    h2 = hash_token_recuperacao(token)
    assert h1 == h2


def test_hash_token_recuperacao_diferencia_tokens():
    h1 = hash_token_recuperacao("token_a")
    h2 = hash_token_recuperacao("token_b")
    assert h1 != h2


def test_hash_token_recuperacao_formato_hex():
    h = hash_token_recuperacao("qualquer_token")
    assert len(h) == 64  # SHA-256 → 64 hex chars
    assert all(c in "0123456789abcdef" for c in h)


# ── services.auth ─────────────────────────────────────────────────────────────

def _mock_usuario(id=1, email="test@example.com", reset_token_hash=None, reset_token_expira=None):
    u = MagicMock()
    u.id = id
    u.email = email
    u.reset_token_hash = reset_token_hash
    u.reset_token_expira = reset_token_expira
    return u


@patch("services.auth.buscar_usuario_por_email")
@patch("services.auth.enviar_email_recuperacao")
def test_gerar_recuperacao_email_nao_encontrado(mock_email, mock_buscar):
    """Não deve enviar e-mail nem levantar exceção se e-mail não existir."""
    mock_buscar.return_value = None
    db = MagicMock()

    from services.auth import gerar_recuperacao_senha
    gerar_recuperacao_senha(db, "inexistente@example.com")

    mock_email.assert_not_called()
    db.commit.assert_not_called()


@patch("services.auth.buscar_usuario_por_email")
@patch("services.auth.enviar_email_recuperacao")
def test_gerar_recuperacao_salva_hash_e_expiracao(mock_email, mock_buscar):
    """Deve salvar reset_token_hash e reset_token_expira no usuário."""
    usuario = _mock_usuario()
    mock_buscar.return_value = usuario
    db = MagicMock()

    from services.auth import gerar_recuperacao_senha
    gerar_recuperacao_senha(db, "test@example.com")

    assert usuario.reset_token_hash is not None
    assert len(usuario.reset_token_hash) == 64  # SHA-256 hex
    assert usuario.reset_token_expira is not None
    db.commit.assert_called_once()
    mock_email.assert_called_once()


@patch("services.auth.buscar_usuario_por_email")
@patch("services.auth.enviar_email_recuperacao")
def test_gerar_recuperacao_nao_retorna_token(mock_email, mock_buscar):
    """gerar_recuperacao_senha não deve retornar o token."""
    usuario = _mock_usuario()
    mock_buscar.return_value = usuario
    db = MagicMock()

    from services.auth import gerar_recuperacao_senha
    resultado = gerar_recuperacao_senha(db, "test@example.com")

    assert resultado is None


def test_redefinir_senha_token_invalido():
    """Token sem hash correspondente no DB → ValueError."""
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None

    from services.auth import redefinir_senha
    with pytest.raises(ValueError, match="inválido"):
        redefinir_senha(db, "token_inexistente", "novaSenha123")


def test_redefinir_senha_token_expirado():
    """Token expirado → ValueError."""
    usuario = _mock_usuario(
        reset_token_hash=hash_token_recuperacao("token_valido"),
        reset_token_expira=datetime.now(timezone.utc) - timedelta(hours=2),
    )
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = usuario

    from services.auth import redefinir_senha
    with pytest.raises(ValueError, match="expirado"):
        redefinir_senha(db, "token_valido", "novaSenha123")


def test_redefinir_senha_sucesso_limpa_token():
    """Após redefinir a senha, token deve ser removido do usuário."""
    token_raw = "token_valido_para_reset"
    usuario = _mock_usuario(
        reset_token_hash=hash_token_recuperacao(token_raw),
        reset_token_expira=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = usuario

    from services.auth import redefinir_senha
    redefinir_senha(db, token_raw, "novaSenha123")

    assert usuario.reset_token_hash is None
    assert usuario.reset_token_expira is None
    db.commit.assert_called_once()
