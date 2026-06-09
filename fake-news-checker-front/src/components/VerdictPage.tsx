import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  FileText,
  Image,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Globe,
  Brain,
} from "lucide-react";
import type { FonteInfo, NliVotos } from "../services/verificacoes";

type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

interface VerdictPageProps {
  result: ResultType;
  confidence: number;
  content: string;
  details: string;
  type: "text" | "link" | "image";
  timestamp: Date;
  fontes: FonteInfo[];
  onNewVerification: () => void;
  isAuthenticated: boolean;
  nomeArquivo?: string;
  // campos NLI opcionais — não quebram quando ausentes
  nliAgregado?: string | null;
  nliScore?: number | null;
  nliVotos?: NliVotos | null;
  decisaoOrigem?: string | null;
  justificativa?: string | null;
}

const VERDICT_CONFIG: Record<
  ResultType,
  {
    label: string;
    heading: string;
    subtext: string;
    color: string;
    bgColor: string;
    borderColor: string;
    Icon: typeof CheckCircle2;
    badgeLabel: string;
  }
> = {
  verdadeira: {
    label: "Informação verdadeira",
    heading: "Informação possivelmente verdadeira",
    subtext:
      "Encontramos evidências confiáveis que confirmam essa informação nas fontes consultadas.",
    color: "#22c55e",
    bgColor: "rgba(34,197,94,0.08)",
    borderColor: "rgba(34,197,94,0.3)",
    Icon: CheckCircle2,
    badgeLabel: "Informação verdadeira",
  },
  falsa: {
    label: "Informação falsa",
    heading: "Informação possivelmente falsa",
    subtext:
      "Não encontramos evidências confiáveis que confirmem essa informação nas fontes consultadas.",
    color: "#ef4444",
    bgColor: "rgba(239,68,68,0.08)",
    borderColor: "rgba(239,68,68,0.3)",
    Icon: XCircle,
    badgeLabel: "Informação falsa",
  },
  nao_verificavel: {
    label: "Não foi possível concluir",
    heading: "Não foi possível concluir",
    subtext:
      "Não encontramos evidências suficientes para confirmar ou desmentir essa informação.",
    color: "#f59e0b",
    bgColor: "rgba(245,158,11,0.08)",
    borderColor: "rgba(245,158,11,0.3)",
    Icon: HelpCircle,
    badgeLabel: "Inconclusivo",
  },
};

// ── Helpers NLI ──────────────────────────────────────────────────────────────

const NLI_LABEL_MAP: Record<string, { text: string; color: string }> = {
  SUPPORTS: { text: "Confirma", color: "#22c55e" },
  REFUTES:  { text: "Refuta",   color: "#ef4444" },
  NEUTRAL:  { text: "Neutra",   color: "#f59e0b" },
};

const TIPO_FONTE_MAP: Record<string, string> = {
  oficial:       "Fonte oficial",
  fact_checking: "Checagem",
  jornalistica:  "Fonte jornalística",
  enciclopedia:  "Enciclopédia",
  desconhecida:  "Desconhecida",
};

const CONFIABILIDADE_MAP: Record<string, { text: string; color: string }> = {
  alta:       { text: "Alta",       color: "#22c55e" },
  media:      { text: "Média",      color: "#f59e0b" },
  baixa:      { text: "Baixa",      color: "#f97316" },
  muito_baixa:{ text: "Muito baixa",color: "#ef4444" },
};

const DECISAO_ORIGEM_MAP: Record<string, string> = {
  fluxo_atual:              "Fluxo atual (ML + heurísticas)",
  nli_reforcou:             "NLI reforçou o resultado",
  nli_decidiu_inconclusivo: "NLI detectou conflito → inconclusivo",
};

function NLIBadge({ label }: { label: string | null | undefined }) {
  if (!label) return null;
  const cfg = NLI_LABEL_MAP[label] ?? { text: label, color: "#94a3b8" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: 600,
        backgroundColor: `${cfg.color}18`,
        border: `1px solid ${cfg.color}44`,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.text}
    </span>
  );
}

function TipoBadge({ tipo }: { tipo: string | null | undefined }) {
  if (!tipo) return null;
  const label = TIPO_FONTE_MAP[tipo] ?? tipo;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "1px 7px",
        borderRadius: "10px",
        fontSize: "10px",
        fontWeight: 500,
        backgroundColor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "var(--m3-on-surface-variant)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ConfidenceGauge({ value, color }: { value: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "6px" }}>
        <span style={{ fontSize: "36px", fontWeight: 700, color, lineHeight: 1 }}>{value}%</span>
      </div>
      <div
        style={{
          height: "6px",
          borderRadius: "3px",
          backgroundColor: "rgba(255,255,255,0.1)",
          overflow: "hidden",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            borderRadius: "3px",
            backgroundColor: color,
            transition: "width 0.35s ease",
          }}
        />
      </div>
      <span
        style={{
          display: "inline-block",
          padding: "3px 10px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 500,
          backgroundColor: `${color}18`,
          border: `1px solid ${color}44`,
          color,
        }}
      >
        {value >= 70 ? "Alta confiança" : value >= 40 ? "Confiança moderada" : "Baixa confiança"}
      </span>
    </div>
  );
}

export function VerdictPage({
  result,
  confidence,
  content,
  details,
  type,
  timestamp,
  fontes,
  onNewVerification,
  isAuthenticated,
  nomeArquivo,
  nliAgregado,
  nliScore,
  nliVotos,
  decisaoOrigem,
  justificativa,
}: VerdictPageProps) {
  const cfg = VERDICT_CONFIG[result];
  const { Icon } = cfg;

  // OCR falhou quando: tipo imagem + resultado inconclusivo + sem fontes
  const ocrFalhou = type === "image" && result === "nao_verificavel" && fontes.length === 0;

  const typeLabel = type === "text" ? "Texto" : type === "link" ? "Link" : "Imagem";
  const dateStr = timestamp.toLocaleDateString("pt-BR") + " - " + timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--m3-surface)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Page body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {/* Breadcrumb — visível apenas para usuários logados */}
          {isAuthenticated && (
            <button
              onClick={onNewVerification}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                color: "var(--m3-primary)",
                fontSize: "13px",
                cursor: "pointer",
                marginBottom: "16px",
                padding: 0,
              }}
            >
              <ArrowLeft size={14} />
              Nova verificação
            </button>
          )}

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "var(--m3-on-surface)",
              marginBottom: "4px",
            }}
          >
            Resultado da análise
          </h1>
          <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)", marginBottom: "24px" }}>
            Veja o veredito e as principais evidências encontradas.
          </p>

          {/* Main verdict card */}
          <div
            style={{
              borderRadius: "16px",
              backgroundColor: "var(--m3-surface-container)",
              border: `1.5px solid ${cfg.borderColor}`,
              padding: "24px",
              marginBottom: "16px",
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            {/* Left: icon + verdict text */}
            <div style={{ flex: "1 1 300px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: cfg.bgColor,
                  border: `2px solid ${cfg.borderColor}`,
                }}
              >
                <Icon size={32} style={{ color: cfg.color }} />
              </div>
              <div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    backgroundColor: cfg.bgColor,
                    border: `1px solid ${cfg.borderColor}`,
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: cfg.color,
                    }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: cfg.color }}>
                    {cfg.badgeLabel}
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--m3-on-surface)",
                    marginBottom: "8px",
                    lineHeight: 1.3,
                  }}
                >
                  {cfg.heading}
                </h2>
                <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)", lineHeight: 1.6 }}>
                  {cfg.subtext}
                </p>
              </div>
            </div>

            {/* Right: confidence + meta */}
            <div
              style={{
                flex: "0 0 200px",
                borderLeft: "1px solid var(--m3-outline)",
                paddingLeft: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--m3-on-surface-variant)",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Confiança do resultado
                </p>
                <ConfidenceGauge value={confidence} color={cfg.color} />
              </div>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--m3-outline)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--m3-outline)",
                    fontSize: "12px",
                    color: "var(--m3-on-surface-variant)",
                  }}
                >
                  <FileText size={12} />
                  Tipo: {typeLabel}
                </div>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
                  Data da análise: {dateStr}
                </p>
              </div>
            </div>
          </div>

          {/* Content analyzed */}
          <div
            style={{
              borderRadius: "12px",
              backgroundColor: "var(--m3-surface-container)",
              border: "1px solid var(--m3-outline)",
              borderLeft: `3px solid ${ocrFalhou ? "#f59e0b" : type === "image" ? "var(--m3-primary)" : "#f59e0b"}`,
              padding: "16px 20px",
              marginBottom: "12px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--m3-on-surface-variant)",
                letterSpacing: "0.05em",
                marginBottom: "10px",
              }}
            >
              CONTEÚDO ANALISADO
            </p>

            {type === "image" ? (
              <div>
                {/* Linha: tipo + arquivo */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Image size={13} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", fontWeight: 500 }}>
                      Tipo: Imagem
                    </span>
                  </div>
                  {nomeArquivo && (
                    <span style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", fontStyle: "italic" }}>
                      · Arquivo: {nomeArquivo}
                    </span>
                  )}
                </div>

                {/* Label do OCR */}
                <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--m3-on-surface-variant)", letterSpacing: "0.04em", marginBottom: "6px" }}>
                  {ocrFalhou ? "RESULTADO DO OCR:" : "TEXTO EXTRAÍDO VIA OCR:"}
                </p>

                {/* Conteúdo OCR */}
                <p
                  style={{
                    fontSize: "14px",
                    color: ocrFalhou ? "#f59e0b" : "var(--m3-on-surface)",
                    lineHeight: 1.6,
                    fontStyle: ocrFalhou ? "italic" : "normal",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {content}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <FileText size={16} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "14px", color: "var(--m3-on-surface)", lineHeight: 1.5 }}>
                  {content}
                </p>
              </div>
            )}
          </div>

          {/* Analysis summary */}
          <div
            style={{
              borderRadius: "12px",
              backgroundColor: "var(--m3-surface-container)",
              border: "1px solid var(--m3-outline)",
              padding: "16px 20px",
              marginBottom: "12px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--m3-on-surface-variant)",
                letterSpacing: "0.05em",
                marginBottom: "10px",
              }}
            >
              RESUMO DA ANÁLISE
            </p>
            <p style={{ fontSize: "14px", color: "var(--m3-on-surface)", lineHeight: 1.6 }}>
              {details || cfg.subtext}
            </p>
          </div>

          {/* NLI aggregate panel — só exibe quando o backend retorna dados NLI */}
          {nliAgregado && nliAgregado !== "NEUTRAL" && (
            <div
              style={{
                borderRadius: "12px",
                backgroundColor: "var(--m3-surface-container)",
                border: "1px solid var(--m3-outline)",
                borderLeft: `3px solid ${NLI_LABEL_MAP[nliAgregado]?.color ?? "#94a3b8"}`,
                padding: "16px 20px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Brain size={14} style={{ color: "var(--m3-on-surface-variant)" }} />
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--m3-on-surface-variant)", letterSpacing: "0.05em" }}>
                  ANÁLISE POR INFERÊNCIA (NLI)
                </p>
              </div>

              {/* Label + score */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
                <NLIBadge label={nliAgregado} />
                {nliScore != null && (
                  <span style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>
                    Score: <strong style={{ color: "var(--m3-on-surface)" }}>{Math.round(nliScore * 100)}%</strong>
                  </span>
                )}
              </div>

              {/* Votos */}
              {nliVotos && (
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "10px" }}>
                  {(["SUPPORTS", "REFUTES", "NEUTRAL"] as const).map((k) => {
                    const n = nliVotos[k];
                    const cfg = NLI_LABEL_MAP[k];
                    return (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: cfg.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
                          {n} {n === 1 ? "fonte" : "fontes"} {cfg.text.toLowerCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Origem + justificativa */}
              {decisaoOrigem && (
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "4px" }}>
                  <strong>Origem da decisão:</strong>{" "}
                  {DECISAO_ORIGEM_MAP[decisaoOrigem] ?? decisaoOrigem}
                </p>
              )}
              {justificativa && (
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", lineHeight: 1.5 }}>
                  {justificativa}
                </p>
              )}
            </div>
          )}

          {/* Insufficient evidence banner (only for nao_verificavel) */}
          {result === "nao_verificavel" && (
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(245,158,11,0.3)",
                backgroundColor: "rgba(245,158,11,0.06)",
                padding: "16px 20px",
                marginBottom: "12px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <AlertTriangle size={18} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#f59e0b", marginBottom: "4px" }}>
                  Evidências insuficientes
                </p>
                <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)", lineHeight: 1.5 }}>
                  Não foram encontradas fontes suficientes para sustentar uma conclusão definitiva sobre a afirmação analisada.
                </p>
              </div>
            </div>
          )}

          {/* Evidence */}
          <div
            style={{
              borderRadius: "12px",
              backgroundColor: "var(--m3-surface-container)",
              border: "1px solid var(--m3-outline)",
              overflow: "hidden",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid var(--m3-outline)",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--m3-on-surface-variant)",
                  letterSpacing: "0.05em",
                }}
              >
                FONTES CONSULTADAS
              </p>
              {fontes.length > 0 && (
                <span style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
                  {fontes.length} fonte{fontes.length !== 1 ? "s" : ""} encontrada{fontes.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {fontes.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <Globe size={24} style={{ color: "var(--m3-on-surface-variant)", marginBottom: "8px" }} />
                <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>
                  Nenhuma fonte foi encontrada para esta verificação.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0", flexWrap: "wrap" }}>
                {fontes.map((fonte, i) => (
                  <div
                    key={`${fonte.url}-${i}`}
                    style={{
                      flex: "1 1 260px",
                      padding: "16px 20px",
                      borderRight:
                        i < fontes.length - 1 ? "1px solid var(--m3-outline)" : "none",
                      borderBottom: fontes.length > 2 && i < fontes.length - 2 ? "1px solid var(--m3-outline)" : "none",
                    }}
                  >
                    {/* Cabeçalho da fonte */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(255,55,132,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "var(--m3-primary)",
                          flexShrink: 0,
                        }}
                      >
                        {fonte.fonte.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {fonte.titulo}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)" }}>{fonte.fonte}</p>
                      </div>
                    </div>

                    {/* Badges NLI e tipo de fonte */}
                    {(fonte.nli_label || fonte.tipo_fonte) && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px", alignItems: "center" }}>
                        {fonte.nli_label && <NLIBadge label={fonte.nli_label} />}
                        {fonte.tipo_fonte && <TipoBadge tipo={fonte.tipo_fonte} />}
                        {fonte.nli_score != null && (
                          <span style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)" }}>
                            {Math.round(fonte.nli_score * 100)}% NLI
                          </span>
                        )}
                        {fonte.confiabilidade_fonte && CONFIABILIDADE_MAP[fonte.confiabilidade_fonte] && (
                          <span style={{
                            fontSize: "10px",
                            color: CONFIABILIDADE_MAP[fonte.confiabilidade_fonte].color,
                            fontWeight: 500,
                          }}>
                            Confiabilidade: {CONFIABILIDADE_MAP[fonte.confiabilidade_fonte].text}
                          </span>
                        )}
                      </div>
                    )}

                    <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)", lineHeight: 1.5, marginBottom: "10px" }}>
                      {fonte.snippet}
                    </p>
                    <a
                      href={fonte.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "none",
                        border: "none",
                        color: "var(--m3-primary)",
                        fontSize: "12px",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "none",
                      }}
                    >
                      Acessar fonte
                      <ExternalLink size={11} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {/* Botão "Fazer nova verificação" — para todos os usuários */}
            <button
              onClick={onNewVerification}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "12px",
                border: "1px solid var(--m3-outline)",
                backgroundColor: "transparent",
                color: "var(--m3-on-surface)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} />
              Fazer nova verificação
            </button>
            {/* "Tentar com mais contexto" só para logados; "Ver evidências" para todos */}
            {(result !== "nao_verificavel" || isAuthenticated) && (
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "var(--m3-primary)",
                  color: "var(--m3-on-primary)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {result === "nao_verificavel" ? "Tentar com mais contexto" : "Ver evidências completas"}
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "16px" }}>
            Esses dados são baseados em princípios e não constituem verificação editorial definitiva.
          </p>
        </div>
      </div>
    </div>
  );
}
