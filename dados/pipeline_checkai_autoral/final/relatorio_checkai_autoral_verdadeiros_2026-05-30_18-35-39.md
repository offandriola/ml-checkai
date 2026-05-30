# Relatório — Pipeline CheckAI Autoral (Verdadeiros) v3

**Data:** 2026-05-30 18:36:25
**Timestamp:** 2026-05-30_18-35-39
**Raw:** `checkai_autoral_verdadeiros_raw_2026-05-30_18-35-39.csv`
**Curated:** `checkai_autoral_verdadeiros_curated_2026-05-30_18-35-39.csv`
**Parâmetros:** max_por_fonte=200 | max_total=1000 | delay=1.5s

---

## Resumo

| Métrica | Valor |
|---|---|
| Total bruto coletado | 120 |
| Total após deduplicação | 120 → 110 |
| **APROVADO_AUTO (FATO_INSTITUCIONAL)** | **85** |
| PENDENTE_REVISAO (total) | 21 |
| └ DECLARACAO_PUBLICA | 16 |
| └ CHAMADA_EXPLICATIVA | 5 |
| └ OUTRO_PENDENTE | 0 |
| DESCARTADO (total) | 4 |
| └ PAGINA_ESTATICA | 4 |
| **Total no curated** | **110** |

---

## Por portal_origem (bruto)

```
portal_origem
AGENCIA_BRASIL     70
SENADO_NOTICIAS    15
TSE                15
STF                10
```

## Top portais — APROVADO_AUTO

```
portal_origem
AGENCIA_BRASIL     56
SENADO_NOTICIAS    12
TSE                12
STF                 5
```

## Por tema

```
tema
judiciário          20
legislativo         15
eleitoral           15
política            10
economia            10
saúde_pública       10
educação            10
direitos_humanos    10
geral               10
```

## Por subtema

```
subtema
senado_federal        15
eleicoes_2026         15
governo_federal       10
economia_nacional     10
saude_publica         10
educacao              10
direitos_e_justica    10
justica               10
geral                 10
decisoes_stf          10
```

## Por status_curadoria

```
status_curadoria
APROVADO_AUTO       85
PENDENTE_REVISAO    21
DESCARTADO           4
```

## Por label_detalhe

```
label_detalhe
VERDADEIRO_CURADO     90
DECLARACAO_PUBLICA    16
DESCARTADO             4
```

## Por tipo_claim

```
tipo_claim
FATO_INSTITUCIONAL     85
DECLARACAO_PUBLICA     16
CHAMADA_EXPLICATIVA     5
PAGINA_ESTATICA         4
```

## Por motivo_status

```
motivo_status
claim_factual_gerado                     85
declaracao_publica_requer_verificacao    16
padrao_nao_factual_detectado              5
pagina_ou_servico_institucional           4
```

---

## Comparação com execução anterior

| Métrica | Execução anterior | Esta execução | Δ |
|---|---|---|---|
| Total curated | 100 | 110 | +10 |
| APROVADO_AUTO | 80 | 85 | +5 |
| PENDENTE_REVISAO | 16 | 21 | +5 |
| DECLARACAO_PUBLICA | 11 | 16 | — |
| DESCARTADO | 4 | 4 | +0 |

*Referência: `checkai_autoral_verdadeiros_curated_2026-05-30_18-19-36.csv`*

---

## Estatísticas de tamanho (APROVADO_AUTO)

| Métrica | Valor |
|---|---|
| Média (chars) | 69 |
| Mediana (chars) | 67 |
| Mínimo | 41 |
| Máximo | 111 |

---

## Exemplos APROVADO_AUTO por portal


**AGENCIA_BRASIL**
- Lula visita primeiro hospital oncológico interestadual do país.
- Castro desiste de candidatura ao Senado após ser alvo de ações da PF.
- Lula sanciona lei que criou Universidade Federal Indígena.

**STF**
- STF restabelece adicional de periculosidade a guardas municipais de Santo André (SP).
- Centro de Estudos Constitucionais do STF (CESTF).
- Convênio fortalece laços entre STF e Tribunal Constitucional do Chile.

**SENADO_NOTICIAS**
- Dívidas em recorde assombram as famílias brasileiras.
- Papel dos líderes comunitários é destacado em sessão do Senado.
- Projeto de benefícios fiscais para indústria de fertilizantes volta ao Senado.

**TSE**
- Nunes Marques conhece iniciativas do TRE-PR voltadas à inclusão indígena e à modernização da Justiça Eleitoral.
- Justiça Eleitoral pelo Brasil: TRE-DF aprovou mudanças em locais de votação.
- Por Dentro das Eleições: pré-candidatos podem realizar propaganda intrapartidária a partir de 5 de julho.

## Exemplos DECLARACAO_PUBLICA

- [AGENCIA_BRASIL] Lula disse sonhar em reverter privatizações de empresas estratégicas.  *(declaracao_publica_requer_verificacao)*
- [AGENCIA_BRASIL] É factoide do clã Bolsonaro para desviar do caso Master, disse Alckmin.  *(declaracao_publica_requer_verificacao)*
- [AGENCIA_BRASIL] Lula disse que vai indicar novamente Messias ao STF.  *(declaracao_publica_requer_verificacao)*
- [AGENCIA_BRASIL] Pretexto para intervenção é inaceitável, disse Celso Amorim.  *(declaracao_publica_requer_verificacao)*
- [AGENCIA_BRASIL] Governo avaliou aumento de contratação pelo MEI com o fim da 6x1.  *(declaracao_publica_requer_verificacao)*
- [AGENCIA_BRASIL] INCA alertou para os riscos de cigarros com sabor e aroma entre jovens.  *(declaracao_publica_requer_verificacao)*

## Exemplos CHAMADA_EXPLICATIVA

- [AGENCIA_BRASIL] Saiba como votaram os deputados na PEC que acaba com a escala 6x1  *(padrao_nao_factual_detectado)*
- [AGENCIA_BRASIL] Entenda PEC que acaba com escala 6x1: mais tempo livre e mesmo salário  *(padrao_nao_factual_detectado)*
- [STF] Confira as matérias especiais em celebração aos 37 anos da Constituição Federal  *(padrao_nao_factual_detectado)*
- [TSE] Confira a pauta de julgamentos do TSE desta quinta-feira (28)  *(padrao_nao_factual_detectado)*
- [TSE] Confira a pauta de julgamentos do TSE desta terça-feira (26)  *(padrao_nao_factual_detectado)*

## Exemplos PAGINA_ESTATICA (DESCARTADO)

- [STF] Uso do Berçário – Advogadas  *(pagina_ou_servico_institucional)*
- [STF] Relatório – 8 de janeiro  *(pagina_ou_servico_institucional)*
- [STF] Hotsite 135 anos do STF  *(pagina_ou_servico_institucional)*
- [STF] Página do Museu do STF  *(pagina_ou_servico_institucional)*

## Exemplos OUTRO_PENDENTE

*Nenhum.*

---

## Alertas de Fontes com Falha

- **AGENCIA_BRASIL**: `https://agenciabrasil.ebc.com.br/rss/ciencia-e-tecnologia/feed.xml`  
  Erro: feed vazio (0 entradas)
- **CAMARA_NOTICIAS**: `https://www.camara.leg.br/noticias/rss/`  
  Erro: feed vazio (0 entradas)
- **CAMARA_NOTICIAS**: `https://www.camara.leg.br/noticias/rss`  
  Erro: feed vazio (0 entradas)
- **AGENCIA_CAMARA**: `https://agencia.camara.leg.br/feed/`  
  Erro: feed vazio (0 entradas)
- **IBGE**: `https://agencia.ibge.gov.br/rssFeed.xml`  
  Erro: feed vazio (0 entradas)
- **GOV_FAZENDA**: `https://www.gov.br/fazenda/pt-br/assuntos/noticias/feed.xml`  
  Erro: feed vazio (0 entradas)
- **GOV_SAUDE**: `https://www.gov.br/saude/pt-br/assuntos/noticias/feed.xml`  
  Erro: feed vazio (0 entradas)
- **GOV_EDUCACAO**: `https://www.gov.br/mec/pt-br/assuntos/noticias/feed.xml`  
  Erro: feed vazio (0 entradas)
- **GOV_PREVIDENCIA**: `https://www.gov.br/previdencia/pt-br/assuntos/noticias/feed.xml`  
  Erro: feed vazio (0 entradas)
- **CNJ**: `https://www.cnj.jus.br/feed/`  
  Erro: feed vazio (0 entradas)

---

## Limitações metodológicas

1. **Baseado em título de RSS:** não faz scraping do artigo completo.
2. **Claim generation por regras determinísticas:** sem IA. Verbos não mapeados → PENDENTE.
3. **DECLARACAO_PUBLICA não verificadas:** a fala é real, mas o conteúdo pode ser impreciso.
4. **Buffer RSS:** cada feed retorna últimas 10–200 entradas. Sem cobertura histórica automática.
5. **BCB API:** endpoint pode mudar sem aviso. Falha é silenciosa.
6. **Gov.br feeds:** alguns ministérios podem não expor RSS — falha tratada graciosamente.
7. **ROTULO_ASSUMIDO_ALTO:** baseado na confiabilidade da fonte, não verificação por claim.

---

## Critérios para futura montagem da V4

- Usar automaticamente apenas `status_curadoria = APROVADO_AUTO` (`tipo_claim = FATO_INSTITUCIONAL`).
- `DECLARACAO_PUBLICA` só entram após revisão manual e promoção para `APROVADO_MANUAL`.
- `PENDENTE_REVISAO` não entram no treino principal sem revisão.
- `DESCARTADO` nunca entram.
- Manter `CHECKAI_AUTORAL` como `dataset_origem` separado.
- Manter `origem_qualidade = ROTULO_ASSUMIDO_ALTO` para APROVADO_AUTO.
- Usar `ROTULO_FORTE_MANUAL` apenas se houver revisão humana explícita documentada.

---

## Recomendação para próxima execução

- APROVADO_AUTO nesta execução: **85**
- Meta recomendada para a próxima execução: **200**
- Executar novamente em 2–4 semanas para cobertura temporal.
- Revisar manualmente os **16** registros DECLARACAO_PUBLICA antes de incluir na V4.
- Investigar fontes com falha: 10 fonte(s) precisam de verificação de URL.

---

## Conclusão metodológica

A expansão mantém os critérios rígidos da versão v3 e busca aumentar o volume da base própria
sem comprometer a qualidade do label positivo. A coleta ampliada prioriza fatos institucionais
objetivos de fontes oficiais e jornalísticas confiáveis, mantendo rastreabilidade por URL e
separando declarações públicas, chamadas explicativas e páginas estáticas do conjunto
automaticamente utilizável na futura V4.

---
*Gerado por `src/coleta_checkai_autoral_verdadeiros.ipynb` v3 (expansão)*
