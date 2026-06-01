from database import engine, Base
import db_models.user
import db_models.verificacao

print("Criando tabelas...")
Base.metadata.create_all(bind=engine)
print("Tabelas criadas com sucesso.")
