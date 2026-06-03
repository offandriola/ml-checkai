---
sidebar_position: 1
---

# Visão Geral da Arquitetura

O CheckAI segue uma arquitetura de **três camadas** (frontend, backend, banco de dados) orquestradas por Docker Compose.

## Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │     Backend      │    │    MySQL      │  │
│  │  React/Vite  │───▶│    FastAPI       │───▶│   8.0        │  │
│  │  :3000       │    │    :8000         │    │   :3306      │  │
│  └──────────────┘    └────────┬─────────┘    └──────────────┘  │
│                               │                                 │
│                    ┌──────────┼──────────┐                      │
│                    │          │          │                       │
│                    ▼          ▼          ▼                       │
│              ┌──────────┐ ┌──────┐ ┌────────┐                  │
│              │ Modelo   │ │ NLI  │ │Serper  │                  │
│              │ TF-IDF   │ │mDe-  │ │.dev   │                  │
│              │ + SVM    │ │BERTa │ │(web)  │                  │
│              └──────────┘ └──────┘ └────────┘                  │
│                                                                 │
│  ┌──────────────┐                                               │
│  │  Jupyter Lab │                                               │
│  │  :8888       │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de uma verificação

Quando um usuário envia um texto para ser verificado, este é o caminho que os dados percorrem:

```
Usuário digita texto
        │
        ▼
   ┌─────────┐
   │Frontend │  POST /api/v1/verificar
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │Backend  │
   └────┬────┘
        │
        ├──────────────────────────────────┐
        │ (em paralelo)                    │
        ▼                                  ▼
  ┌───────────┐                    ┌──────────────┐
  │ Modelo ML │                    │ Busca Web    │
  │ TF-IDF+SVM│                    │ (Serper.dev) │
  └─────┬─────┘                    └──────┬───────┘
        │                                  │
        │    classificação                 │    lista de fontes
        │    + confiança                   │
        ▼                                  ▼
  ┌─────────────────────────────────────────────┐
  │         Ranking de Fontes                    │
  │  (filtra sociais, classifica por tipo,       │
  │   atribui peso de confiabilidade)            │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │      Concordância ML + Fontes               │
  │  (ajusta veredito baseado em evidências)     │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │          Análise NLI                         │
  │  (cada fonte: SUPPORTS / REFUTES / NEUTRAL)  │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
  ┌─────────────────────────────────────────────┐
  │        Decisor de Veredito Final            │
  │  (combina ML + fontes + NLI)                │
  │  → REAL / FALSO / INCONCLUSIVO              │
  └──────────────────┬──────────────────────────┘
                     │
                     ▼
              Resposta ao usuário
              com fontes e justificativa
```

## Serviços Docker

O `docker-compose.yml` define quatro serviços:

| Serviço | Container | Porta | Descrição |
|---------|-----------|-------|-----------|
| `db` | `checkai_db` | 3306 | Banco de dados MySQL 8.0 |
| `backend` | `checkai_backend` | 8000 | API FastAPI com hot-reload |
| `frontend` | `checkai_frontend` | 3000 | Interface React com Vite |
| `notebooks` | `checkai_notebooks` | 8888 | Jupyter Lab para os notebooks de ML |

### Dependências entre serviços

- O **backend** espera o **banco de dados** estar saudável (healthcheck via `mysqladmin ping`) antes de iniciar
- O **frontend** espera o **backend** estar saudável (healthcheck via `curl /api/v1/health`) antes de iniciar
- O **notebooks** é independente dos demais

### Volumes

- `checkai_db_data` — persiste os dados do MySQL entre reinicializações
- O código-fonte é montado via bind mount para permitir hot-reload durante o desenvolvimento

## Tecnologias utilizadas

### Frontend
- **React 18** — biblioteca de interface
- **Vite** — bundler e dev server
- **Radix UI** — componentes acessíveis
- **Tailwind CSS** — estilização utilitária
- **Recharts** — gráficos no dashboard
- **React Hook Form** — formulários

### Backend
- **Python 3.12** — linguagem principal
- **FastAPI** — framework web assíncrono
- **SQLAlchemy** — ORM para banco de dados
- **Pydantic** — validação de dados
- **joblib** — serialização do modelo ML
- **Hugging Face Transformers** — modelo NLI (mDeBERTa)
- **requests** — chamadas HTTP (Serper.dev)
- **bcrypt** — hash de senhas
- **PyJWT** — autenticação por tokens

### Modelo de ML
- **scikit-learn** — TF-IDF + SVM/LogReg
- **pandas** — manipulação de dados
- **Jupyter** — notebooks interativos

### Infraestrutura
- **Docker** + **Docker Compose** — containerização
- **MySQL 8.0** — banco de dados relacional
