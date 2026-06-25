# ==============================================================================
# CheckAI API — Modelo: Verificação
# ==============================================================================
# Cada registro representa uma verificação (checagem) feita por um usuário.
# Liga-se ao usuário dono via chave estrangeira (usuario_id).
# ==============================================================================

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Verificacao(Base):
    __tablename__ = "verificacoes"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    texto_verificado = Column(Text, nullable=False)
    tipo = Column(String(20), default="texto")  # texto | imagem | link
    resultado = Column(String(20), nullable=False)  # REAL | FALSO | INCONCLUSIVO
    confianca = Column(Float, default=0.0)
    modelo_ativo = Column(String(5), default="nao")  # registra se foi modelo real ou mock
    fontes_json = Column(Text, nullable=True)  # JSON serializado de list[dict] com fontes web
    # Campos NLI e decisor — persistidos para exibição no histórico
    nli_resultado_agregado = Column(String(20), nullable=True)
    nli_score_agregado = Column(Float, nullable=True)
    nli_votos_json = Column(Text, nullable=True)  # JSON: {"SUPPORTS":0,"REFUTES":0,"NEUTRAL":0}
    decisao_origem = Column(String(100), nullable=True)
    justificativa_decisao = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    # Relação inversa: acessar o usuário dono da verificação
    usuario = relationship("User", back_populates="verificacoes")