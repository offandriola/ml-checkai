---
sidebar_position: 8
---

# Glossário

Termos técnicos usados nesta documentação, explicados de forma simples.

## A

### API (Application Programming Interface)
Uma "porta de comunicação" entre sistemas. No CheckAI, o frontend (interface visual) se comunica com o backend (servidor) através da API. Pense como um garçom: o frontend faz o pedido, a API leva ao cozinheiro (backend), e traz a resposta de volta.

### Acurácia
Percentual de acertos do modelo. Se a acurácia é 90%, significa que de cada 100 textos, o modelo acerta 90.

## B

### Backend
A parte do sistema que roda no servidor — processa dados, executa o modelo de ML, acessa o banco de dados. O usuário não vê diretamente; é o "cérebro" da aplicação.

### bcrypt
Algoritmo para transformar senhas em códigos irreversíveis (hashes). Mesmo que alguém acesse o banco de dados, não consegue descobrir as senhas originais.

## C

### Container (Docker)
Um pacote isolado que contém um programa e todas as suas dependências. É como uma caixa com tudo que o programa precisa para rodar, independente do computador.

### CORS (Cross-Origin Resource Sharing)
Mecanismo de segurança que controla quais sites podem acessar a API. Impede que sites maliciosos façam requisições em nome do usuário.

## D

### Dataset
Conjunto de dados organizados, geralmente em formato de tabela (CSV). No CheckAI, o dataset contém textos rotulados como verdadeiros ou falsos, usados para treinar o modelo.

### Docker Compose
Ferramenta que gerencia múltiplos containers Docker ao mesmo tempo. O CheckAI usa para subir frontend, backend, banco de dados e Jupyter em um único comando.

## E

### Endpoint
Um "endereço" da API que faz algo específico. Exemplo: `POST /api/v1/verificar` é o endpoint que verifica um texto.

## F

### FastAPI
Framework Python para criar APIs web. É rápido, moderno e gera documentação automaticamente (Swagger UI).

### Feature (ML)
Uma característica numérica extraída dos dados de entrada. No TF-IDF, cada palavra é uma feature.

### Frontend
A parte visual do sistema — o que o usuário vê e interage. No CheckAI, é a interface feita em React.

## H

### Hash
Resultado de uma função que transforma dados em um código fixo e irreversível. Usado para armazenar senhas de forma segura.

### Hot-reload
Funcionalidade de desenvolvimento que atualiza automaticamente a aplicação quando você salva um arquivo, sem precisar reiniciar manualmente.

## J

### JWT (JSON Web Token)
Um "crachá digital" que o servidor emite após o login. Contém informações do usuário (ID, expiração) codificadas e assinadas. O frontend envia esse token em cada requisição para provar que está autenticado.

## M

### Machine Learning (ML)
Área da inteligência artificial onde computadores aprendem padrões a partir de dados, sem serem explicitamente programados para cada caso. O CheckAI usa ML para aprender a diferença entre textos verdadeiros e falsos.

### Middleware
Código que intercepta todas as requisições antes de chegarem aos endpoints. No CheckAI, os middlewares adicionam headers de segurança, limitam requisições por IP e configuram CORS.

### Mock
Uma simulação. No CheckAI, quando o modelo ML não está disponível, um "modo mock" gera classificações artificiais para que o sistema continue funcionando (para fins de desenvolvimento).

## N

### NLI (Natural Language Inference)
Tarefa de IA que determina a relação lógica entre duas frases: uma confirma, contradiz ou é neutra em relação à outra. O CheckAI usa NLI para comparar a afirmação do usuário com fontes da web.

## O

### OCR (Optical Character Recognition)
Reconhecimento óptico de caracteres — tecnologia que extrai texto de imagens. O CheckAI usa OCR para analisar prints e fotos de textos.

### ORM (Object-Relational Mapping)
Técnica que permite acessar o banco de dados usando objetos Python em vez de escrever SQL diretamente. O CheckAI usa SQLAlchemy como ORM.

### OWASP
Organização que publica guias de segurança para aplicações web. O "OWASP Top 10" lista as 10 vulnerabilidades mais críticas.

## P

### Pipeline (ML)
Sequência de etapas que transforma dados brutos em uma predição. No CheckAI: texto → TF-IDF (vetorização) → SVM (classificação) → resultado.

### Pipeline (dados)
Sequência de coleta, limpeza e transformação de dados. No CheckAI: raw (bruto) → curated (limpo) → final (pronto para treino).

### Pydantic
Biblioteca Python que valida dados automaticamente. Se você enviar um email inválido, o Pydantic rejeita antes de chegar à lógica de negócio.

## R

### Rate Limiting
Proteção que limita quantas requisições um IP pode fazer por minuto. Previne ataques de força bruta e sobrecarga do servidor.

### REST (Representational State Transfer)
Padrão de arquitetura para APIs web. Cada endpoint representa um recurso (ex.: `/verificacoes`) e usa métodos HTTP (GET, POST, DELETE) para operações.

### ROC-AUC
Métrica que mede a capacidade do modelo de separar classes (verdadeiro vs. falso). Vai de 0 a 1; quanto mais perto de 1, melhor.

## S

### SVM (Support Vector Machine)
Algoritmo de classificação que encontra a melhor "linha divisória" entre categorias. É como traçar uma fronteira que separa textos verdadeiros de falsos.

### Swagger UI
Interface visual gerada automaticamente pela FastAPI. Permite explorar e testar todos os endpoints da API diretamente no navegador.

## T

### TF-IDF (Term Frequency - Inverse Document Frequency)
Técnica que converte texto em números. Palavras comuns (como "de", "que") recebem peso baixo; palavras raras e significativas recebem peso alto.

### Token (JWT)
String codificada que representa uma sessão de login. Tem data de expiração e é assinada criptograficamente para evitar falsificação.

## V

### Volume (Docker)
Espaço de armazenamento persistente para containers Docker. Os dados do banco de dados ficam em um volume para não serem perdidos quando o container reinicia.
