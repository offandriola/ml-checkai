from api.database import Base, engine
from api.db_models.user import User  # importar pra registrar o model

print("Criando tabelas...")
Base.metadata.create_all(bind=engine)
print("Tabelas criadas com sucesso!")