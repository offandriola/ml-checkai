# Relatório — Pipeline CheckAI Autoral (Verdadeiros) v3

**Data:** 2026-05-30 18:20:03
**Timestamp:** 2026-05-30_18-19-36
**Raw:** `checkai_autoral_verdadeiros_raw_2026-05-30_18-19-36.csv`
**Curated:** `checkai_autoral_verdadeiros_curated_2026-05-30_18-19-36.csv`

---

## Resumo

| Métrica | Valor |
|---|---|
| Total bruto coletado | 100 |
| APROVADO_AUTO (FATO_INSTITUCIONAL) | 80 |
| PENDENTE_REVISAO (total) | 16 |
| └ DECLARACAO_PUBLICA | 11 |
| └ CHAMADA_EXPLICATIVA | 5 |
| └ OUTRO_PENDENTE | 0 |
| DESCARTADO (total) | 4 |
| └ PAGINA_ESTATICA | 4 |
| **Total no curated** | **100** |

---

## Por portal_origem

```
portal_origem
AGENCIA_BRASIL     60
SENADO_NOTICIAS    15
TSE                15
STF                10
```

## Por tema

```
tema
legislativo          15
eleitoral            15
política             10
economia             10
saúde_pública        10
educação             10
segurança_pública    10
geral                10
judiciário           10
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
geral                 10
decisoes_stf          10
```

## Por status_curadoria

```
status_curadoria
APROVADO_AUTO       80
PENDENTE_REVISAO    16
DESCARTADO           4
```

## Por label_detalhe

```
label_detalhe
VERDADEIRO_CURADO     85
DECLARACAO_PUBLICA    11
DESCARTADO             4
```

## Por tipo_claim

```
tipo_claim
FATO_INSTITUCIONAL     80
DECLARACAO_PUBLICA     11
CHAMADA_EXPLICATIVA     5
PAGINA_ESTATICA         4
```

## Por motivo_status

```
motivo_status
claim_factual_gerado                     80
declaracao_publica_requer_verificacao    11
padrao_nao_factual_detectado              5
pagina_ou_servico_institucional           4
```

---

## Impacto da Correção de Curadoria (v2 → v3)

| Métrica | v2 (checkai_autoral_verdadeiros_curated_2026-05-30_17-41-02.csv) | v3 (atual) | Δ |
|---|---|---|---|
| Total curated | 100 | 100 | +0 |
| APROVADO_AUTO | 86 | 80 | -6 |
| PENDENTE_REVISAO | 14 | 16 | +2 |
| DECLARACAO_PUBLICA | 5 | 11 | — |
| DESCARTADO | 0 | 4 | +4 |

**Principais mudanças:**
- Verbos como `avalia`, `garante`, `afirma` não são mais aprovados automaticamente.
- Tínhamos declarações em APROVADO_AUTO que foram movidas para DECLARACAO_PUBLICA.
- Padrões `PADROES_PAGINA` descartam páginas estáticas e hotsites.

---

## Estatísticas de tamanho (APROVADO_AUTO)

| Métrica | Valor |
|---|---|
| Média (chars) | 69 |
| Mediana (chars) | 67 |
| Mínimo | 41 |
| Máximo | 111 |

---

## Exemplos APROVADO_AUTO (FATO_INSTITUCIONAL)

- [AGENCIA_BRASIL] Lula visita primeiro hospital oncológico interestadual do país.
- [AGENCIA_BRASIL] Castro desiste de candidatura ao Senado após ser alvo de ações da PF.
- [AGENCIA_BRASIL] Lula sanciona lei que criou Universidade Federal Indígena.
- [AGENCIA_BRASIL] Governo prorrogou descontos no querosene de aviação e no biodiesel.
- [AGENCIA_BRASIL] Desenrola Brasil: saiba como usar FGTS para pagar dívidas em atraso.
- [AGENCIA_BRASIL] Embrapa produz em laboratório salmão, caviar e anéis de lula veganos.
- [AGENCIA_BRASIL] Prazo para envio da declaração anual do MEI termina neste domingo.
- [AGENCIA_BRASIL] Defesa e Cidades lideram bloqueios no Orçamento de 2026.

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

## Limitações metodológicas

1. **Baseado em título de RSS:** não faz scraping do artigo completo.
2. **Claim generation por regras determinísticas:** sem IA. Verbos não mapeados → PENDENTE.
3. **DECLARACAO_PUBLICA não verificadas:** a fala é real, mas o conteúdo pode ser impreciso.
4. **Buffer RSS:** cada feed retorna últimas 10–100 entradas. Sem cobertura histórica automática.
5. **BCB API:** endpoint pode mudar sem aviso. Falha é silenciosa.
6. **ROTULO_ASSUMIDO_ALTO:** baseado na confiabilidade da fonte, não verificação por claim.

---

## Critérios para futura montagem da V4

- Usar automaticamente apenas `status_curadoria = APROVADO_AUTO` (FATO_INSTITUCIONAL).
- `DECLARACAO_PUBLICA` só entram após revisão manual e promoção para `APROVADO_MANUAL`.
- `PENDENTE_REVISAO` não entram no treino principal sem revisão.
- `DESCARTADO` nunca entram.
- Manter `CHECKAI_AUTORAL` como `dataset_origem` separado.
- Manter `origem_qualidade = ROTULO_ASSUMIDO_ALTO` para APROVADO_AUTO.
- Usar `ROTULO_FORTE_MANUAL` apenas se houver revisão humana explícita documentada.

---
*Gerado por `src/coleta_checkai_autoral_verdadeiros.ipynb` v3*
