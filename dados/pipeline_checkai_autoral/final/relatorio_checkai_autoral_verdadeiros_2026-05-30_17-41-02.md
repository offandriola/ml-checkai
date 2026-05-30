# Relatório — Pipeline CheckAI Autoral (Verdadeiros) v2

**Data:** 2026-05-30 17:41:29  
**Timestamp:** 2026-05-30_17-41-02  
**Raw:** `checkai_autoral_verdadeiros_raw_2026-05-30_17-41-02.csv`  
**Curated:** `checkai_autoral_verdadeiros_curated_2026-05-30_17-41-02.csv`

---

## Resumo

| Métrica | Valor |
|---|---|
| Total bruto coletado | 100 |
| APROVADO_AUTO | 86 |
| PENDENTE_REVISAO (total) | 14 |
| └ DECLARACAO_PUBLICA | 5 |
| DESCARTADO | 0 |
| **Total no curated** | **100** |

---

## Por fonte

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
APROVADO_AUTO       86
PENDENTE_REVISAO    14
```

## Por label_detalhe

```
label_detalhe
VERDADEIRO_CURADO     95
DECLARACAO_PUBLICA     5
```

## Por motivo_status

```
motivo_status
claim_factual_gerado                     86
declaracao_publica_requer_verificacao     5
padrao_nao_factual_detectado              5
claim_muito_curto                         4
```

---

## Estatísticas de tamanho (APROVADO_AUTO)

| Métrica | Valor |
|---|---|
| Média (chars) | 69 |
| Mediana (chars) | 67 |
| Mínimo | 41 |
| Máximo | 111 |

---

## Exemplos APROVADO_AUTO

- [AGENCIA_BRASIL] Lula visita primeiro hospital oncológico interestadual do país.
- [AGENCIA_BRASIL] Lula diz sonhar em reverter privatizações de empresas estratégicas.
- [AGENCIA_BRASIL] Castro desiste de candidatura ao Senado após ser alvo de ações da PF.
- [AGENCIA_BRASIL] Lula sanciona lei que criou Universidade Federal Indígena.
- [AGENCIA_BRASIL] Governo avalia aumento de contratação pelo MEI com o fim da 6x1.
- [AGENCIA_BRASIL] Governo prorrogou descontos no querosene de aviação e no biodiesel.
- [AGENCIA_BRASIL] Desenrola Brasil: saiba como usar FGTS para pagar dívidas em atraso.
- [AGENCIA_BRASIL] Embrapa produz em laboratório salmão, caviar e anéis de lula veganos.

## Exemplos DECLARACAO_PUBLICA

- [AGENCIA_BRASIL] É factoide do clã Bolsonaro para desviar do caso Master, diz Alckmin  *(declaracao_publica_requer_verificacao)*
- [AGENCIA_BRASIL] Lula diz que vai indicar novamente Messias ao STF  *(declaracao_publica_requer_verificacao)*
- [AGENCIA_BRASIL] Pretexto para intervenção é inaceitável, diz Celso Amorim  *(declaracao_publica_requer_verificacao)*
- [AGENCIA_BRASIL] Restringir crianças em eventos LGBTQIA+ é questão de ódio, diz jurista  *(declaracao_publica_requer_verificacao)*
- [SENADO_NOTICIAS] Escola deve estimular descanso e abrir espaço para neurodivergentes, prevê projeto  *(declaracao_publica_requer_verificacao)*

## Exemplos PENDENTE_REVISAO (outros)

- [AGENCIA_BRASIL] Saiba como votaram os deputados na PEC que acaba com a escala 6x1  *(padrao_nao_factual_detectado)*
- [AGENCIA_BRASIL] Entenda PEC que acaba com escala 6x1: mais tempo livre e mesmo salário  *(padrao_nao_factual_detectado)*
- [STF] Uso do Berçário – Advogadas.  *(claim_muito_curto)*
- [STF] Relatório – 8 de janeiro.  *(claim_muito_curto)*
- [STF] Hotsite 135 anos do STF.  *(claim_muito_curto)*

## Exemplos DESCARTADO

*Nenhum.*

---

## Limitações metodológicas

1. **Baseado em título de RSS:** não faz scraping do artigo completo (preserva ética e velocidade).
2. **Claim generation por regras determinísticas:** sem IA. Verbos não mapeados → PENDENTE.
3. **DECLARACAO_PUBLICA não verificadas:** o que alguém disse pode ou não ser factualmente correto.
4. **Buffer RSS:** cada feed retorna últimas 10–100 entradas. Sem cobertura histórica automática.
5. **BCB API:** endpoint pode mudar sem aviso. Falha é silenciosa e não interrompe a coleta.
6. **ROTULO_ASSUMIDO_ALTO:** baseado na confiabilidade da fonte, não verificação por claim.

---

## Integração futura na V4

- `label = 1`, `dataset_origem = CHECKAI_AUTORAL`, `origem_qualidade = ROTULO_ASSUMIDO_ALTO`
- Usar somente: `status_curadoria IN ('APROVADO_AUTO', 'APROVADO_MANUAL')`
- DECLARACAO_PUBLICA: revisar manualmente antes de incluir
- Não substituir pipelines existentes (RSS, GFC)
- Não alterar V1, V2 ou V3

---
*Gerado por `src/coleta_checkai_autoral_verdadeiros.ipynb` v2*
