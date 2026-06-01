import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  FileText,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Globe,
} from "lucide-react";
import type { FonteInfo } from "../services/verificacoes";

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
}: VerdictPageProps) {
  const cfg = VERDICT_CONFIG[result];
  const { Icon } = cfg;

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
          {/* Breadcrumb */}
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
              borderLeft: "3px solid #f59e0b",
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
                marginBottom: "8px",
              }}
            >
              CONTEÚDO ANALISADO
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <FileText size={16} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "14px", color: "var(--m3-on-surface)", lineHeight: 1.5 }}>
                {content}
              </p>
            </div>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
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
          </div>

          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "16px" }}>
            Esses dados são baseados em princípios e não constituem verificação editorial definitiva.
          </p>
        </div>
      </div>
    </div>
  );
}
