# Relatório — Pipeline CheckAI Autoral (Verdadeiros) v3

**Data:** 2026-05-30 20:16:22
**Timestamp:** 2026-05-30_20-09-20
**Raw:** `checkai_autoral_verdadeiros_raw_2026-05-30_20-09-20.csv`
**Curated:** `checkai_autoral_verdadeiros_curated_2026-05-30_20-09-20.csv`
**Parâmetros:** max_por_fonte=200 | max_total=1000 | delay=1.5s

---

## Resumo

| Métrica | Valor |
|---|---|
| Total bruto coletado | 183 |
| └ RSS (feedparser) | 120 |
| └ BCB API (json) | 0 |
| └ Histórico (sitemap + HTML) | 63 |
| Total após deduplicação | 183 → 149 |
| **APROVADO_AUTO (FATO_INSTITUCIONAL)** | **114** |
| PENDENTE_REVISAO (total) | 30 |
| └ DECLARACAO_PUBLICA | 22 |
| └ CHAMADA_EXPLICATIVA | 5 |
| └ OUTRO_PENDENTE | 4 |
| DESCARTADO (total) | 5 |
| └ PAGINA_ESTATICA | 4 |
| **Total no curated** | **149** |

---

## Por método de coleta

```
metodo_coleta
rss_feedparser    120
html_listagem      63
```

## Por portal_origem (bruto)

```
portal_origem
AGENCIA_BRASIL     70
TSE                27
CAMARA_NOTICIAS    23
SENADO_NOTICIAS    19
STF                10
```

## Top portais — APROVADO_AUTO

```
portal_origem
AGENCIA_BRASIL     56
TSE                21
CAMARA_NOTICIAS    18
SENADO_NOTICIAS    14
STF                 5
```

## Por tema

```
tema
legislativo         42
eleitoral           27
judiciário          20
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
camara_historico      23
senado_federal        15
eleicoes_2026         15
eleicoes_historico    12
governo_federal       10
economia_nacional     10
saude_publica         10
educacao              10
direitos_e_justica    10
justica               10
geral                 10
decisoes_stf          10
senado_historico       4
```

## Por status_curadoria

```
status_curadoria
APROVADO_AUTO       114
PENDENTE_REVISAO     30
DESCARTADO            5
```

## Por label_detalhe

```
label_detalhe
VERDADEIRO_CURADO     122
DECLARACAO_PUBLICA     22
DESCARTADO              5
```

## Por tipo_claim

```
tipo_claim
FATO_INSTITUCIONAL     114
DECLARACAO_PUBLICA      22
CHAMADA_EXPLICATIVA      5
PAGINA_ESTATICA          4
OUTRO_PENDENTE           4
```

## Por motivo_status

```
motivo_status
claim_factual_gerado                     114
declaracao_publica_requer_verificacao     22
padrao_nao_factual_detectado               5
pagina_ou_servico_institucional            4
claim_muito_curto                          2
claim_vazio                                1
titulo_muito_curto_sem_verbo               1
```

---

## Comparação com execução anterior

| Métrica | Execução anterior | Esta execução | Δ |
|---|---|---|---|
| Total curated | 149 | 149 | +0 |
| APROVADO_AUTO | 114 | 114 | +0 |
| PENDENTE_REVISAO | 30 | 30 | +0 |
| DECLARACAO_PUBLICA | 22 | 22 | — |
| DESCARTADO | 5 | 5 | +0 |

*Referência: `checkai_autoral_verdadeiros_curated_2026-05-30_18-59-18.csv`*

---

## Estatísticas de tamanho (APROVADO_AUTO)

| Métrica | Valor |
|---|---|
| Média (chars) | 71 |
| Mediana (chars) | 69 |
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

**CAMARA_NOTICIAS**
- Câmara pode votar na próxima semana projetos ligados à saúde.
- Câmara aprovou em dois turnos fim da escala 6x1 com jornada máxima de 40 horas semanais.
- Motta quer votar regulamentação da inteligência artificial até o final de junho.

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

- [CAMARA_NOTICIAS] Siga notícias por tema  *(claim_muito_curto)*
- [CAMARA_NOTICIAS] RSS  *(claim_vazio)*
- [CAMARA_NOTICIAS] Notícias institucionais  *(titulo_muito_curto_sem_verbo)*
- [CAMARA_NOTICIAS] Projeto que reformula o seguro rural  *(claim_muito_curto)*

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
- **STF**: `https://noticias.stf.jus.br/sitemap.xml`  
  Erro: 403 Client Error: Forbidden for url: https://noticias.stf.jus.br/wp-sitemap.xml
- **CNJ**: `https://www.cnj.jus.br/post-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap2.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap3.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap4.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap5.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap6.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap7.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap8.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap9.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap10.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap11.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap12.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap13.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap14.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap15.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap16.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap17.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap18.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap19.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap20.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap21.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap22.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap23.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap24.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap25.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap26.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap27.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap28.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap29.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap30.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap31.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap32.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap33.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap34.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap35.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap36.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap37.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap38.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap39.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap40.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap41.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap42.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap43.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap44.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post-sitemap45.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/page-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/page-sitemap2.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/page-sitemap3.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/page-sitemap4.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/page-sitemap5.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/page-sitemap6.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/page-sitemap7.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/campanha-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/event-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/event-sitemap2.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/event-sitemap3.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/observatorio-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/glossary-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/category-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/post_tag-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/taxonomy-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/event-category-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/categoria_observatorio-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/wpfd-category-sitemap.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0
- **CNJ**: `https://www.cnj.jus.br/wpfd-category-sitemap2.xml`  
  Erro: ParseError: unbound prefix: line 2, column 0

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

- APROVADO_AUTO nesta execução: **114**
- Meta recomendada para a próxima execução: **200**
- Executar novamente em 2–4 semanas para cobertura temporal.
- Revisar manualmente os **22** registros DECLARACAO_PUBLICA antes de incluir na V4.
- Investigar fontes com falha: 76 fonte(s) precisam de verificação de URL.

---

## Conclusão metodológica

A expansão mantém os critérios rígidos da versão v3 e busca aumentar o volume da base própria
sem comprometer a qualidade do label positivo. A coleta ampliada prioriza fatos institucionais
objetivos de fontes oficiais e jornalísticas confiáveis, mantendo rastreabilidade por URL e
separando declarações públicas, chamadas explicativas e páginas estáticas do conjunto
automaticamente utilizável na futura V4.

---
*Gerado por `src/coleta_checkai_autoral_verdadeiros.ipynb` v3 (expansão)*
