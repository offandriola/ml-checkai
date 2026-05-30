# Relatório — Pipeline CheckAI Autoral (Verdadeiros)

**Data de execução:** 2026-05-30 16:29:43  
**Timestamp:** 2026-05-30_16-29-26  
**Arquivo raw:** `checkai_autoral_verdadeiros_raw_2026-05-30_16-29-26.csv`  
**Arquivo curated:** `checkai_autoral_verdadeiros_curated_2026-05-30_16-29-26.csv`  

---

## Resumo da coleta

| Métrica | Valor |
|---|---|
| Total bruto coletado | 90 |
| Total aprovado automaticamente | 81 |
| Total pendente de revisão | 9 |
| Total descartado | 0 |
| **Total no curated** | **90** |

---

## Distribuição por fonte

```
portal_origem
AGENCIA_BRASIL     50
SENADO_NOTICIAS    15
TSE                15
STF                10
```

## Distribuição por tema

```
tema
legislativo          15
eleitoral            15
política             10
economia             10
saúde_pública        10
educação             10
segurança_pública    10
judiciário           10
```

## Distribuição por subtema

```
subtema
senado_federal        15
eleicoes_2026         15
governo_federal       10
economia_nacional     10
saude_publica         10
educacao              10
direitos_e_justica    10
decisoes_stf          10
```

## Distribuição por status_curadoria

```
status_curadoria
APROVADO_AUTO       81
PENDENTE_REVISAO     9
```

## Distribuição por motivo_status

```
motivo_status
claim_factual_gerado            81
padrao_nao_factual_detectado     5
claim_muito_curto                4
```

---

## Estatísticas de tamanho (APROVADO_AUTO)

| Métrica | Valor |
|---|---|
| Média (chars) | 69 |
| Mediana (chars) | 68 |
| Mínimo | 41 |
| Máximo | 111 |

---

## Exemplos aprovados automaticamente

- [AGENCIA_BRASIL] Lula visita primeiro hospital oncológico interestadual do país.
- [AGENCIA_BRASIL] Lula diz sonhar em reverter privatizações de empresas estratégicas.
- [AGENCIA_BRASIL] É factoide do clã Bolsonaro para desviar do caso Master, diz Alckmin.
- [AGENCIA_BRASIL] Lula diz que vai indicar novamente Messias ao STF.
- [AGENCIA_BRASIL] Pretexto para intervenção é inaceitável, diz Celso Amorim.
- [AGENCIA_BRASIL] Castro desiste de candidatura ao Senado após ser alvo de ações da PF.
- [AGENCIA_BRASIL] Lula sanciona lei que criou Universidade Federal Indígena.
- [AGENCIA_BRASIL] Governo avalia aumento de contratação pelo MEI com o fim da 6x1.

## Exemplos pendentes de revisão

- [AGENCIA_BRASIL] Saiba como votaram os deputados na PEC que acaba com a escala 6x1  *(motivo: padrao_nao_factual_detectado)*
- [AGENCIA_BRASIL] Entenda PEC que acaba com escala 6x1: mais tempo livre e mesmo salário  *(motivo: padrao_nao_factual_detectado)*
- [STF] Uso do Berçário – Advogadas.  *(motivo: claim_muito_curto)*
- [STF] Relatório – 8 de janeiro.  *(motivo: claim_muito_curto)*
- [STF] Hotsite 135 anos do STF.  *(motivo: claim_muito_curto)*
- [STF] Página do Museu do STF.  *(motivo: claim_muito_curto)*

## Exemplos descartados

*Nenhum registro nesta categoria.*

---

## Principais limitações metodológicas

1. **Texto baseado em título de RSS:** a maioria dos registros usa apenas o título (sem scraping do artigo completo), preservando a abordagem ética do projeto. Isso limita o conteúdo semântico disponível por registro.

2. **Claim generation por regras:** a transformação título→claim usa mapeamento de verbos e padrões regex. Títulos com estruturas sintáticas não cobertas ficam como `PENDENTE_REVISAO` e requerem revisão manual.

3. **Cobertura temporal limitada ao buffer RSS:** cada feed retorna as últimas 10–100 entradas. Para cobertura histórica de 2024–2025, seria necessário scraping de arquivo ou uso da Wayback Machine.

4. **ROTULO_ASSUMIDO_ALTO vs ROTULO_FORTE:** o label=1 é atribuído por confiabilidade da fonte (agências oficiais), não por verificação direta de cada claim. Isso é mais fraco que o `ROTULO_FORTE` das claims GFC, mas mais forte que o `ROTULO_ASSUMIDO` do RSS de portais.

5. **Dependência de feeds RSS disponíveis:** feeds instáveis ou com poucas entradas (ex: TSE, STF) geram menor volume proporcional.

---

## Recomendações para próxima etapa

1. **Revisão manual dos PENDENTE_REVISAO:** promover para `APROVADO_MANUAL` os registros factualmente corretos. Isso pode quase dobrar o volume aprovado.

2. **Execução periódica (a cada 2–4 semanas):** coletas regulares acumulam cobertura temporal e capturam os temas políticos em evolução (eleições 2026, decisões do STF, votações no Congresso).

3. **Enriquecimento com texto completo:** implementar etapa opcional com `trafilatura` ou `newspaper3k` para capturar o corpo do artigo quando o título não for suficientemente informativo.

4. **Novas fontes:** Agência Senado (https://www12.senado.leg.br/noticias/rss.xml), IBGE Notícias, Banco Central notas de imprensa.

5. **Scraping de agências fact-checkers para label=0:** Agência Lupa (lupa.news) e Aos Fatos (aosfatos.org) têm arquivos pesquisáveis com centenas de claims falsas verificadas em contexto político PT-BR — complemento natural para o GFC.

---

## Integração futura na V4

Este dataset deve entrar na V4 como **expansão da base própria do CheckAI**:

- `label = 1` (verdadeiro)
- `dataset_origem = CHECKAI_AUTORAL` (distinto de FAKETRUEBR, FAKEBR, V2_PROPRIA)
- `origem_qualidade = ROTULO_ASSUMIDO_ALTO` (distinto de ROTULO_ACADEMICO e ROTULO_ASSUMIDO)
- **Usar apenas** registros com `status_curadoria IN ('APROVADO_AUTO', 'APROVADO_MANUAL')`
- **Não substituir** os pipelines RSS (`pipeline_noticias_reais`) nem GFC (`pipeline_falso_google_factcheck`)
- **Não alterar** datasets V1, V2 ou V3
- **Complementar** a base própria existente para reduzir o gap V2_PROPRIA (f1=0.7569 identificado na Fase 7)

---

*Gerado automaticamente por `src/coleta_checkai_autoral_verdadeiros.ipynb`*
