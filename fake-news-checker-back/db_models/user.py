from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    # Token de recuperação de senha: armazenamos apenas o hash SHA-256 do
    # token aleatório enviado ao usuário (nunca o token em si).
    reset_token_hash = Column(String(128), nullable=True)
    reset_token_expira = Column(DateTime, nullable=True)

    # Um usuário possui várias verificações
    verificacoes = relationship(
        "Verificacao",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )