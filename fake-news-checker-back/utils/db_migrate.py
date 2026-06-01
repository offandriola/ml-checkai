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


def aplicar_migracoes() -> None:
    """Aplica migrações pendentes no banco MySQL."""
    insp = inspect(engine)
    if not insp.has_table("verificacoes"):
        return

    colunas = {c["name"] for c in insp.get_columns("verificacoes")}
    if "fontes_json" not in colunas:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE verificacoes "
                    "ADD COLUMN fontes_json TEXT NULL "
                    "AFTER modelo_ativo"
                )
            )
        logger.info("Migração aplicada: verificacoes.fontes_json")
