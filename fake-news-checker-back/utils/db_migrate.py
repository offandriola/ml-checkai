# ==============================================================================
# CheckAI API — Migrações leves do schema (sem Alembic)
# ==============================================================================
# create_all() não altera tabelas existentes. Este módulo aplica ALTER TABLE
# idempotentes para colunas adicionadas após o primeiro deploy.
# ==============================================================================

import logging

from sqlalchemy import inspect, text

from database import engine


logger = logging.getLogger(__name__)


def _add_column_if_missing(conn, insp, table: str, column: str, definition: str) -> None:
    """Adiciona coluna apenas se ela ainda não existir (idempotente)."""
    cols = {c["name"] for c in insp.get_columns(table)}
    if column not in cols:
        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))
        logger.info("Migração aplicada: %s.%s", table, column)


def aplicar_migracoes() -> None:
    """Aplica migrações pendentes no banco MySQL."""
    insp = inspect(engine)

    # v3 — colunas de reset de senha na tabela users
    if insp.has_table("users"):
        with engine.begin() as conn:
            _add_column_if_missing(
                conn, insp, "users",
                "reset_token_hash",
                "VARCHAR(128) NULL",
            )
            _add_column_if_missing(
                conn, insp, "users",
                "reset_token_expira",
                "DATETIME NULL",
            )

    if not insp.has_table("verificacoes"):
        return

    with engine.begin() as conn:
        # v1 — fontes_json
        _add_column_if_missing(
            conn, insp, "verificacoes",
            "fontes_json",
            "TEXT NULL AFTER modelo_ativo",
        )

        # v2 — campos NLI e decisor
        _add_column_if_missing(
            conn, insp, "verificacoes",
            "nli_resultado_agregado",
            "VARCHAR(20) NULL AFTER fontes_json",
        )
        _add_column_if_missing(
            conn, insp, "verificacoes",
            "nli_score_agregado",
            "FLOAT NULL AFTER nli_resultado_agregado",
        )
        _add_column_if_missing(
            conn, insp, "verificacoes",
            "nli_votos_json",
            "TEXT NULL AFTER nli_score_agregado",
        )
        _add_column_if_missing(
            conn, insp, "verificacoes",
            "decisao_origem",
            "VARCHAR(100) NULL AFTER nli_votos_json",
        )
        _add_column_if_missing(
            conn, insp, "verificacoes",
            "justificativa_decisao",
            "TEXT NULL AFTER decisao_origem",
        )
