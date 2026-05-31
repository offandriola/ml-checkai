from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from api.config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependência que entrega uma sessão de banco para as rotas e fecha no final
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()