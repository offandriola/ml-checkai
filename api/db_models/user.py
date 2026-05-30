from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from api.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    # Um usuário possui várias verificações
    verificacoes = relationship(
        "Verificacao",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )