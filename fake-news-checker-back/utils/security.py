# ==============================================================================
# CheckAI API — Utilitários de Segurança (Hashing de Senhas)
# ==============================================================================
# Funções para hashing e verificação de senhas usando bcrypt.
#
# SEGURANÇA (OWASP A02 - Cryptographic Failures):
#   - Senhas NUNCA são armazenadas em texto puro.
#   - bcrypt aplica salt aleatório automaticamente em cada hash.
#   - O mesmo texto gera hashes diferentes (proteção contra rainbow tables).
# ==============================================================================

import bcrypt
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from api.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRACAO_MINUTOS


def gerar_hash_senha(senha: str) -> str:
    """
    Gera o hash bcrypt de uma senha em texto puro.

    O salt é gerado automaticamente e embutido no próprio hash.
    Retorna uma string pronta para ser salva no banco.
    """
    senha_bytes = senha.encode("utf-8")
    hash_bytes = bcrypt.hashpw(senha_bytes, bcrypt.gensalt())
    return hash_bytes.decode("utf-8")


def verificar_senha(senha: str, hash_armazenado: str) -> bool:
    """
    Verifica se uma senha em texto puro corresponde ao hash armazenado.

    Retorna True se a senha estiver correta, False caso contrário.
    """
    senha_bytes = senha.encode("utf-8")
    hash_bytes = hash_armazenado.encode("utf-8")
    return bcrypt.checkpw(senha_bytes, hash_bytes)


# ==============================================================================
# JWT (Tokens de Autenticação)
# ==============================================================================
# SEGURANÇA (OWASP A07 - Identification and Authentication Failures):
#   - Tokens assinados com chave secreta (HS256).
#   - Expiração obrigatória (claim "exp") limita janela de uso de um token.
# ==============================================================================

def criar_token_acesso(dados: dict) -> str:
    """
    Gera um token JWT assinado contendo os dados informados (payload)
    e uma data de expiração.
    """
    a_codificar = dados.copy()
    expira_em = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_EXPIRACAO_MINUTOS
    )
    a_codificar.update({"exp": expira_em})
    return jwt.encode(a_codificar, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decodificar_token(token: str) -> dict | None:
    """
    Valida e decodifica um token JWT.

    Retorna o payload se o token for válido e não expirado;
    retorna None se for inválido, adulterado ou expirado.
    """
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None
    

# ==============================================================================
# Token de Recuperação de Senha
# ==============================================================================
# Token JWT de propósito específico (tipo="reset"), com validade curta.
# Distinto do token de acesso para que um não seja usado no lugar do outro.
# ==============================================================================

# Validade do token de recuperação, em minutos (curta por segurança).
RESET_EXPIRACAO_MINUTOS = 15


def criar_token_recuperacao(usuario_id: int) -> str:
    """Gera um token JWT de recuperação de senha, válido por poucos minutos."""
    expira_em = datetime.now(timezone.utc) + timedelta(
        minutes=RESET_EXPIRACAO_MINUTOS
    )
    payload = {
        "sub": str(usuario_id),
        "tipo": "reset",  # marca o propósito do token
        "exp": expira_em,
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decodificar_token_recuperacao(token: str) -> int | None:
    """
    Valida um token de recuperação e retorna o id do usuário.

    Retorna None se o token for inválido, expirado, ou se não for
    do tipo 'reset' (ex.: alguém tentou usar um token de login aqui).
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        return None

    if payload.get("tipo") != "reset":
        return None

    usuario_id = payload.get("sub")
    if usuario_id is None:
        return None

    return int(usuario_id)