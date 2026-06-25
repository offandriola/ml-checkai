import { useEffect, useState } from "react";
import { X, ExternalLink, CheckCircle2, XCircle, HelpCircle, Shield, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiObterVerificacaoDetalhe, type VerificacaoApiItem, type FonteInfo } from "../services/verificacoes";

interface Props {
  verificacaoId: number;
  onClose: () => void;
}

const RESULTADO_LABEL: Record<string, string> = {
  REAL: "Verdadeira",
  FALSO: "Falsa",
  INCONCLUSIVO: "Inconclusivo",
};

const TIPO_LABEL: Record<string, string> = {
  texto: "Texto",
  link: "Link",
  imagem: "Imagem",
};

const NLI_LABEL: Record<string, string> = {
  SUPPORTS: "Apoia",
  REFUTES: "Refuta",
  NEUTRAL: "Neutro",
};

function ResultadoBadge({ resultado }: { resultado: string }) {
  const cores: Record<string, { bg: string; text: string; border: string }> = {
    REAL: { bg: "rgba(34,197,94,0.12)", text: "#22c55e", border: "rgba(34,197,94,0.3)" },
    FALSO: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
    INCONCLUSIVO: { bg: "rgba(234,179,8,0.12)", text: "#eab308", border: "rgba(234,179,8,0.3)" },
  };
  const Icon = resultado === "REAL" ? CheckCircle2 : resultado === "FALSO" ? XCircle : HelpCircle;
  const c = cores[resultado] ?? cores.INCONCLUSIVO;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 20,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <Icon size={14} />
      {RESULTADO_LABEL[resultado] ?? resultado}
    </span>
  );
}

function NliBadge({ label }: { label: string }) {
  const cores: Record<string, string> = {
    SUPPORTS: "#22c55e",
    REFUTES: "#ef4444",
    NEUTRAL: "#94a3b8",
  };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 10,
        background: `${cores[label] ?? "#94a3b8"}22`,
        color: cores[label] ?? "#94a3b8",
        border: `1px solid ${cores[label] ?? "#94a3b8"}44`,
      }}
    >
      {NLI_LABEL[label] ?? label}
    </span>
  );
}

function ConfiancaBar({ valor }: { valor: number }) {
  const cor = valor >= 75 ? "#22c55e" : valor >= 50 ? "#eab308" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(valor, 100)}%`,
            height: "100%",
            background: cor,
            borderRadius: 4,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: cor, minWidth: 42 }}>
        {valor}%
      </span>
    </div>
  );
}

function FonteCard({ fonte }: { fonte: FonteInfo }) {
  const CONF_LABEL: Record<string, string> = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
    muito_baixa: "Muito baixa",
  };
  const TIPO_FONTE: Record<string, string> = {
    oficial: "Oficial",
    fact_checking: "Fact-checking",
    jornalistica: "Jornalística",
    enciclopedia: "Enciclopédia",
    desconhecida: "Desconhecida",
  };

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--m3-on-surface)", lineHeight: 1.4, flex: 1 }}>
          {fonte.titulo || fonte.fonte}
        </span>
        <a
          href={fonte.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#60a5fa", flexShrink: 0 }}
          title="Abrir fonte"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 11, color: "#60a5fa" }}>{fonte.fonte}</span>
        {fonte.tipo_fonte && (
          <span style={{ fontSize: 11, color: "var(--m3-on-surface-variant)" }}>
            · {TIPO_FONTE[fonte.tipo_fonte] ?? fonte.tipo_fonte}
          </span>
        )}
        {fonte.confiabilidade_fonte && (
          <span style={{ fontSize: 11, color: "var(--m3-on-surface-variant)" }}>
            · Conf. {CONF_LABEL[fonte.confiabilidade_fonte] ?? fonte.confiabilidade_fonte}
          </span>
        )}
        {fonte.nli_label && <NliBadge label={fonte.nli_label} />}
        {fonte.nli_score != null && (
          <span style={{ fontSize: 11, color: "var(--m3-on-surface-variant)" }}>
            {Math.round(fonte.nli_score * 100)}%
          </span>
        )}
      </div>

      {fonte.snippet && (
        <p style={{ fontSize: 12, color: "var(--m3-on-surface-variant)", margin: 0, lineHeight: 1.5 }}>
          {fonte.snippet}
        </p>
      )}
    </div>
  );
}

export function VerificacaoDetalheModal({ verificacaoId, onClose }: Props) {
  const { token } = useAuth();
  const [item, setItem] = useState<VerificacaoApiItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setErro(null);
    apiObterVerificacaoDetalhe(token, verificacaoId)
      .then(setItem)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [token, verificacaoId]);

  // Fechar com Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const confiancaPct = item ? Math.round(item.confianca * 100) : 0;

  const formatData = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 640,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--m3-surface-container)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={18} style={{ color: "#60a5fa" }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "var(--m3-on-surface)" }}>
              Detalhe da verificação
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--m3-on-surface-variant)",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 160, gap: 10, color: "var(--m3-on-surface-variant)" }}>
              <Loader2 size={20} className="animate-spin" />
              <span>Carregando...</span>
            </div>
          )}

          {erro && (
            <div style={{ textAlign: "center", color: "#ef4444", padding: 40 }}>
              {erro}
            </div>
          )}

          {item && !loading && (
            <>
              {/* Alegação */}
              <section>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--m3-on-surface-variant)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  Alegação verificada
                </p>
                <p style={{ fontSize: 14, color: "var(--m3-on-surface)", lineHeight: 1.6, margin: 0 }}>
                  {item.texto_verificado}
                </p>
              </section>

              {/* Metadados */}
              <section
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 24px",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <p style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", margin: "0 0 4px" }}>Data</p>
                  <p style={{ fontSize: 13, color: "var(--m3-on-surface)", margin: 0 }}>{formatData(item.criado_em)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", margin: "0 0 4px" }}>Tipo</p>
                  <p style={{ fontSize: 13, color: "var(--m3-on-surface)", margin: 0 }}>{TIPO_LABEL[item.tipo] ?? item.tipo}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", margin: "0 0 4px" }}>Veredito</p>
                  <ResultadoBadge resultado={item.resultado} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", margin: "0 0 6px" }}>Confiança</p>
                  <ConfiancaBar valor={confiancaPct} />
                </div>
              </section>

              {/* Decisão */}
              {(item.decisao_origem || item.justificativa_decisao) && (
                <section>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--m3-on-surface-variant)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                    Origem da decisão
                  </p>
                  {item.decisao_origem && (
                    <p style={{ fontSize: 12, color: "#60a5fa", margin: "0 0 4px" }}>
                      {item.decisao_origem}
                    </p>
                  )}
                  {item.justificativa_decisao && (
                    <p style={{ fontSize: 13, color: "var(--m3-on-surface-variant)", lineHeight: 1.6, margin: 0 }}>
                      {item.justificativa_decisao}
                    </p>
                  )}
                </section>
              )}

              {/* NLI */}
              {item.nli_resultado_agregado && (
                <section>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--m3-on-surface-variant)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                    Análise NLI (inferência textual)
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <NliBadge label={item.nli_resultado_agregado} />
                    {item.nli_score_agregado != null && (
                      <span style={{ fontSize: 13, color: "var(--m3-on-surface-variant)" }}>
                        Score: {Math.round(item.nli_score_agregado * 100)}%
                      </span>
                    )}
                    {item.nli_votos && (
                      <div style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--m3-on-surface-variant)" }}>
                        <span>Apoia: {item.nli_votos.SUPPORTS}</span>
                        <span>·</span>
                        <span>Refuta: {item.nli_votos.REFUTES}</span>
                        <span>·</span>
                        <span>Neutro: {item.nli_votos.NEUTRAL}</span>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Fontes */}
              {item.fontes && item.fontes.length > 0 && (
                <section>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--m3-on-surface-variant)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                    Fontes consultadas ({item.fontes.length})
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {item.fontes.map((f, i) => (
                      <FonteCard key={i} fonte={f} />
                    ))}
                  </div>
                </section>
              )}

              {item.fontes && item.fontes.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--m3-on-surface-variant)", textAlign: "center" }}>
                  Nenhuma fonte registrada para esta verificação.
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "var(--m3-on-surface)",
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
