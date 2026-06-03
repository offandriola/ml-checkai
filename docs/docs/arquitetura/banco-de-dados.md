---
sidebar_position: 4
---

# Banco de Dados

O CheckAI utiliza **MySQL 8.0** como banco de dados relacional, gerenciado pelo SQLAlchemy ORM.

## Tabelas

### Tabela `usuarios`

Armazena os dados dos usuários cadastrados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INT (PK, auto) | Identificador único |
| `nome` | VARCHAR(120) | Nome completo |
| `email` | VARCHAR(255), UNIQUE | E-mail (usado para login) |
| `senha_hash` | VARCHAR(255) | Hash bcrypt da senha |
| `criado_em` | DATETIME | Data de criação |
| `atualizado_em` | DATETIME | Última atualização |

:::note[Segurança]

A senha **nunca** é armazenada em texto puro. O backend usa **bcrypt** para gerar um hash irreversível antes de salvar.

:::
### Tabela `verificacoes`

Armazena o histórico de verificações realizadas por usuários autenticados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INT (PK, auto) | Identificador único |
| `usuario_id` | INT (FK → usuarios.id) | Quem fez a verificação |
| `texto_verificado` | TEXT | Texto que foi analisado |
| `tipo` | VARCHAR(20) | Tipo de entrada: `texto`, `link` ou `imagem` |
| `resultado` | VARCHAR(20) | Veredito: `REAL`, `FALSO` ou `INCONCLUSIVO` |
| `confianca` | FLOAT | Nível de confiança (0.0 a 1.0) |
| `modelo_ativo` | VARCHAR(5) | Se o modelo ML real foi usado (`sim`/`nao`) |
| `fontes_json` | TEXT | JSON com as fontes encontradas na web |
| `criado_em` | DATETIME | Data da verificação |

## Diagrama de relacionamento

```
┌─────────────────┐         ┌─────────────────────┐
│    usuarios     │         │    verificacoes      │
├─────────────────┤         ├─────────────────────┤
│ id          (PK)│◄────────│ usuario_id      (FK)│
│ nome            │    1:N  │ id              (PK)│
│ email           │         │ texto_verificado    │
│ senha_hash      │         │ tipo                │
│ criado_em       │         │ resultado           │
│ atualizado_em   │         │ confianca           │
└─────────────────┘         │ modelo_ativo        │
                            │ fontes_json         │
                            │ criado_em           │
                            └─────────────────────┘
```

Um usuário pode ter **muitas** verificações (relação 1:N).

## Acesso ao banco

### Via Docker (recomendado)

```bash
# Abrir terminal MySQL dentro do container
docker-compose exec db mysql -u user -ppassword checkai
```

### Via cliente externo (DBeaver, DataGrip, etc.)

| Parâmetro | Valor |
|-----------|-------|
| Host | `localhost` |
| Porta | `3306` (ou o valor de `MYSQL_PORT` no `.env`) |
| Banco | `checkai` |
| Usuário | `user` (ou o valor de `MYSQL_USER`) |
| Senha | `password` (ou o valor de `MYSQL_PASSWORD`) |

## Migrações

As tabelas são criadas automaticamente na inicialização do backend. O módulo `utils/db_migrate.py` aplica migrações incrementais para adicionar colunas novas sem perder dados existentes.

Para forçar a criação das tabelas manualmente:

```bash
make migrate
```

## Persistência de dados

O volume Docker `checkai_db_data` persiste os dados do banco entre reinicializações. Se você executar `make down`, os dados são mantidos. Para apagar tudo e recomeçar do zero:

```bash
docker-compose down -v
```

:::danger[O comando acima apaga **todos os dados** do banco de dados. Use com cuidado.]

:::