from api.database import Base, engine
from api.db_models.user import User
from api.db_models.verificacao import Verificacao

print("Criando tabelas...")
Base.metadata.create_all(bind=engine)
print("Tabelas criadas com sucesso!")