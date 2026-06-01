# ==============================================================================
# CheckAI API — Ponto de Entrada da Aplicação
# ==============================================================================
# Este é o módulo principal do backend FastAPI do projeto CheckAI.
#
# Responsabilidades:
#   - Instanciar a aplicação FastAPI com metadados
#   - Configurar middleware CORS para integração com o front-end
#   - Aplicar Security Headers (OWASP recomendação)
#   - Aplicar Rate Limiting contra abuso (DoS)
#   - Registrar todos os routers (endpoints)
#   - Inicializar o serviço de classificação no startup
#   - Configurar logging centralizado
#   - Handler global de erros que não vaza detalhes internos
#
# Para iniciar o servidor:
#   python -m uvicorn api.main:app --reload
#
# Documentação automática disponível em (apenas em modo debug):
#   http://localhost:8000/docs     (Swagger UI)
#   http://localhost:8000/redoc    (ReDoc)
#
# Referências de segurança:
#   - OWASP Top 10: https://owasp.org/www-project-top-ten/
#   - OWASP API Security: https://owasp.org/www-project-api-security/
# ==============================================================================

import time
import logging
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from config import API_TITULO, API_DESCRICAO, API_VERSAO, API_DEBUG
from routes import health, coleta, dados, classificador, auth, verificacao, dashboard
from services.classificador import carregar_modelo

# ==============================================================================
# Configuração de Logging
# ==============================================================================
# Define o formato e nível de log para toda a aplicação.
# Em produção, considere trocar para logging em arquivo (RotatingFileHandler).
# ==============================================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)

# ==============================================================================
# Ciclo de Vida (Lifespan) — substitui @app.on_event (deprecated)
# ==============================================================================
# OWASP: Inicialização segura — carrega recursos no startup, libera no shutdown.
# ==============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação (startup/shutdown)."""
    # --- STARTUP ---
    logger.info("=" * 60)
    logger.info("  %s v%s", API_TITULO, API_VERSAO)
    if API_DEBUG:
        logger.info("  Documentação: http://localhost:8000/docs")
    logger.info("  Modo: %s", "DEBUG" if API_DEBUG else "PRODUÇÃO")
    logger.info("=" * 60)

    # Tenta carregar o modelo de classificação
    modelo_ok = carregar_modelo()
    if modelo_ok:
        logger.info("Modelo de classificação carregado com sucesso")
    else:
        logger.info(
            "Modelo de classificação não encontrado — modo mock ativado"
        )

    logger.info("API pronta para receber requisições")
    yield
    # --- SHUTDOWN ---
    logger.info("Encerrando API...")

# ==============================================================================
# Instância da Aplicação FastAPI
# ==============================================================================
# SEGURANÇA (OWASP A05 - Security Misconfiguration):
#   - docs_url e redoc_url são desabilitados em produção para não expor
#     a superfície de ataque da API desnecessariamente.
#   - openapi_url é desabilitado junto para não vazar o schema.
# ==============================================================================

app = FastAPI(
    title=API_TITULO,
    description=API_DESCRICAO,
    version=API_VERSAO,
    lifespan=lifespan,
    # Desabilita documentação em produção (OWASP A05)
    docs_url="/docs" if API_DEBUG else None,
    redoc_url="/redoc" if API_DEBUG else None,
    openapi_url="/openapi.json" if API_DEBUG else None,
)

# ==============================================================================
# Middleware: CORS
# ==============================================================================
# SEGURANÇA (OWASP A05 - Security Misconfiguration):
#   - allow_credentials=True com allow_origins=["*"] é inseguro, mas
#     aceitável para TCC em ambiente local. Em produção, especifique
#     apenas o domínio do front-end.
#   - Métodos restritos aos necessários (GET e POST).
# ==============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # TCC: aberto. Produção: ["https://meusite.com"]
    allow_credentials=False,   # SEGURANÇA: False com origins=* (RFC 6454)
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],  # SEGURANÇA: headers explícitos
)

# ==============================================================================
# Middleware: Trusted Host (proteção contra Host Header Injection)
# ==============================================================================
# SEGURANÇA (OWASP A05):
#   Previne ataques de Host Header Injection validando o header Host.
#   Em TCC localhost é permitido; em produção, liste apenas o domínio real.
# ==============================================================================

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],  # TCC: aberto. Em produção, liste apenas o domínio real.
)

# ==============================================================================
# Middleware: Security Headers
# ==============================================================================
# SEGURANÇA (OWASP A05 - Security Misconfiguration):
#   Adiciona headers de segurança em todas as respostas:
#   - X-Content-Type-Options: impede MIME sniffing
#   - X-Frame-Options: previne clickjacking
#   - X-XSS-Protection: camada extra contra XSS (navegadores antigos)
#   - Strict-Transport-Security: força HTTPS (quando em produção)
#   - Cache-Control: impede cache de dados sensíveis
#   - Content-Security-Policy: restringe fontes de conteúdo
#   - Referrer-Policy: controla informações do referer
#   - Permissions-Policy: desabilita APIs de navegador desnecessárias
# ==============================================================================

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Injeta headers de segurança em todas as respostas HTTP."""
    response = await call_next(request)

    # Previne MIME type sniffing (XSS via upload)
    response.headers["X-Content-Type-Options"] = "nosniff"

    # Previne clickjacking (embedding em iframes)
    response.headers["X-Frame-Options"] = "DENY"

    # Camada extra anti-XSS para navegadores legados
    response.headers["X-XSS-Protection"] = "1; mode=block"

    # Força HTTPS em produção (HSTS)
    if not API_DEBUG:
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

    # Impede cache de respostas com dados potencialmente sensíveis
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    response.headers["Pragma"] = "no-cache"

    # Política de segurança de conteúdo (CSP)
    # As rotas de documentação (Swagger/ReDoc) carregam assets de um CDN,
    # então recebem uma CSP mais permissiva. As demais rotas permanecem restritas.
    docs_paths = ("/docs", "/redoc", "/openapi.json")
    if request.url.path in docs_paths:
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "img-src 'self' data: https://fastapi.tiangolo.com; "
            "worker-src 'self' blob:"
        )
    else:
        response.headers["Content-Security-Policy"] = "default-src 'self'"

    # Controla informações enviadas no header Referer
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    # Desabilita APIs de navegador desnecessárias
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=()"
    )

    return response

# ==============================================================================
# Middleware: Rate Limiting (proteção contra DoS/Brute Force)
# ==============================================================================
# SEGURANÇA (OWASP A04 - Insecure Design / API4 - Unrestricted Resource
# Consumption):
#   Limita requisições por IP para prevenir:
#   - Ataques de negação de serviço (DoS)
#   - Brute force em endpoints
#   - Abuso de APIs de coleta (que fazem requests externos)
#
#   Limite: 30 requisições por minuto por IP (ajustável).
#   Para TCC é generoso; em produção, considere valores menores.
# ==============================================================================

# Armazena contagem de requisições por IP: {ip: [(timestamp, ...)]}
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 30   # Máximo de requisições
RATE_LIMIT_WINDOW_SECONDS = 60  # Janela de tempo em segundos

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """
    Aplica rate limiting por IP do cliente.

    Retorna HTTP 429 (Too Many Requests) quando o limite é excedido.
    """
    # Obtém o IP do cliente (considera proxy reverso)
    client_ip = request.client.host if request.client else "unknown"

    agora = time.time()

    # Remove timestamps fora da janela atual
    _rate_limit_store[client_ip] = [
        ts for ts in _rate_limit_store[client_ip]
        if agora - ts < RATE_LIMIT_WINDOW_SECONDS
    ]

    # Verifica se excedeu o limite
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        logger.warning(
            "Rate limit excedido para IP %s (%d req/%ds)",
            client_ip, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS,
        )
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "detail": "Limite de requisições excedido. Tente novamente em breve."
            },
            headers={"Retry-After": str(RATE_LIMIT_WINDOW_SECONDS)},
        )

    # Registra a requisição
    _rate_limit_store[client_ip].append(agora)

    return await call_next(request)

# ==============================================================================
# Handler Global de Erros
# ==============================================================================
# SEGURANÇA (OWASP A09 - Security Logging and Monitoring Failures):
#   - Captura exceções não tratadas para evitar vazamento de stack traces
#   - Loga o erro completo internamente para debugging
#   - Retorna mensagem genérica ao cliente (não vaza detalhes internos)
# ==============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Handler global para exceções não capturadas.

    SEGURANÇA: Nunca retorna detalhes internos (stack trace, paths, etc)
    ao cliente. Apenas loga internamente para auditoria.
    """
    logger.error(
        "Erro não tratado em %s %s: %s",
        request.method,
        request.url.path,
        str(exc),
        exc_info=True,  # Inclui stack trace completo no log
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Erro interno do servidor. Contate o administrador."
        },
    )

# ==============================================================================
# Registro dos Routers
# ==============================================================================
# Cada router agrupa endpoints por domínio funcional.
# Os prefixos e tags são definidos dentro de cada arquivo de rota.
# ==============================================================================

app.include_router(health.router)
app.include_router(coleta.router)
app.include_router(dados.router)
app.include_router(classificador.router)
app.include_router(auth.router)
app.include_router(verificacao.router)
app.include_router(dashboard.router)

# ==============================================================================
# Rota Raiz (Informativa)
# ==============================================================================

@app.get(
    "/",
    tags=["Root"],
    summary="Página inicial da API",
    description="Retorna informações básicas e link para a documentação.",
)
async def root():
    """
    Rota raiz da API. Retorna informações de boas-vindas e links úteis.
    """
    return {
        "projeto": API_TITULO,
        "versao": API_VERSAO,
        "descricao": API_DESCRICAO,
        "documentacao": "/docs" if API_DEBUG else "Desabilitada em produção",
        "endpoints": {
            "health": "/api/v1/health",
            "coleta": "/api/v1/coleta",
            "dados": "/api/v1/dados",
            "classificar": "/api/v1/classificar",
        },
    }