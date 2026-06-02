import { useState, useEffect, useRef, type CSSProperties } from "react";
import {
  FileText,
  Image,
  Link2,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Lightbulb,
  Zap,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Newspaper,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  apiObterResumo,
  apiListarVerificacoes,
  mapResultado,
  type ResumoApiResponse,
} from "../services/verificacoes";

type TabType = "text" | "image" | "link";
type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

interface VerificationStep {
  id: number;
  label: string;
  completed: boolean;
}

interface Verification {
  id: string;
  content: string;
  type: TabType;
  steps: VerificationStep[];
  currentStepIndex: number;
  result?: ResultType;
  timestamp: Date;
}

interface HomePageProps {
  verifications: Verification[];
  onSubmit: (value: string, type: TabType, file?: File) => void;
}

const RESULT_CONFIG = {
  verdadeira: { label: "Real", color: "#4caf50", bg: "rgba(76,175,80,0.15)" },
  falsa: { label: "Falso", color: "#f44336", bg: "rgba(244,67,54,0.15)" },
  nao_verificavel: { label: "Inconclusivo", color: "#ff9800", bg: "rgba(255,152,0,0.15)" },
};

const QUICK_MODELS = [
  { label: "Notícia", icon: Newspaper },
  { label: "Feed de rede social", icon: MessageSquare },
  { label: "Link de matéria", icon: Link2 },
];

const TIPS = [
  "Seja específico com nomes e datas.",
  "Adicione o contexto digital relevante.",
  "Indique a fonte digital sempre que possível.",
];

function ResultBadge({ result }: { result: ResultType }) {
  const cfg = RESULT_CONFIG[result];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: "20px",
        backgroundColor: cfg.bg,
        color: cfg.color,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

function DonutGauge({ percentage }: { percentage: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percentage / 100);
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="var(--m3-primary)" strokeWidth="10"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="50" y="46" textAnchor="middle" fill="var(--m3-on-surface)" fontSize="16" fontWeight="700">
        {percentage}%
      </text>
      <text x="50" y="62" textAnchor="middle" fill="var(--m3-on-surface-variant)" fontSize="9">
        Alta confiança
      </text>
    </svg>
  );
}

export function HomePage({ verifications, onSubmit }: HomePageProps) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [inputValue, setInputValue] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [resumo, setResumo] = useState<ResumoApiResponse | null>(null);
  const [recentFromApi, setRecentFromApi] = useState<{ id: string; title: string; result: ResultType }[]>([]);
  const [loadingResumo, setLoadingResumo] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 5000;

  useEffect(() => {
    if (!token) {
      setLoadingResumo(false);
      return;
    }

    apiObterResumo(token)
      .then(setResumo)
      .catch(() => {})
      .finally(() => setLoadingResumo(false));

    apiListarVerificacoes(token, { por_pagina: 5 })
      .then((data) => {
        setRecentFromApi(
          data.itens.map((v) => ({
            id: String(v.id),
            title: v.texto_verificado,
            result: mapResultado(v.resultado),
          }))
        );
      })
      .catch(() => {});
  }, [token]);

  const placeholder =
    activeTab === "link" ? "Cole um link para verificar..."
    : activeTab === "image" ? "Ou cole a URL de uma imagem pública..."
    : "Este é a notícia, afirmação ou conteúdo que deseja verificar...";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setInputValue("");
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSubmit = activeTab === "image"
    ? !!(imageFile || inputValue.trim())
    : !!inputValue.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (activeTab === "image" && imageFile) {
      onSubmit("", "image", imageFile);
      setImageFile(null);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      onSubmit(inputValue, activeTab);
      setInputValue("");
    }
  };

  const handleClear = () => {
    setInputValue("");
    setImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const recentItems = recentFromApi.length > 0
    ? recentFromApi
    : verifications.slice(-5).reverse().map(v => ({ id: v.id, title: v.content, result: v.result ?? "nao_verificavel" as ResultType }));

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

      {/* ── Main Form Area ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "var(--m3-on-surface)",
            marginBottom: "4px",
          }}
        >
          Nova verificação
        </h1>
        <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)", marginBottom: "20px" }}>
          Cole um texto, escreva uma pergunta ou informe um link para análise.
        </p>

        {/* Form Card */}
        <div
          style={{
            borderRadius: "14px",
            border: "1px solid var(--m3-outline)",
            backgroundColor: "var(--m3-surface-container)",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--m3-outline)" }}>
            {(
              [
                { type: "text" as TabType, label: "Todo", icon: FileText },
                { type: "image" as TabType, label: "Imagem", icon: Image },
                { type: "link" as TabType, label: "Link", icon: Link2 },
              ]
            ).map(({ type, label, icon: Icon }, i) => (
              <button
                key={type}
                onClick={() => handleTabChange(type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "12px 20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "none",
                  borderRight: i < 2 ? "1px solid var(--m3-outline)" : "none",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  color: activeTab === type ? "var(--m3-primary)" : "var(--m3-on-surface-variant)",
                  borderBottom: activeTab === type ? "2px solid var(--m3-primary)" : "2px solid transparent",
                  transition: "color 0.15s",
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Image upload area */}
          {activeTab === "image" && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {imageFile ? (
                <div style={{ margin: "12px 16px", display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--m3-outline)", backgroundColor: "rgba(255,255,255,0.04)" }}>
                  {imagePreviewUrl && <img src={imagePreviewUrl} alt="preview" style={{ width: "52px", height: "52px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", color: "var(--m3-on-surface)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{imageFile.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)" }}>Imagem pronta para análise</p>
                  </div>
                  <button onClick={handleClear} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--m3-on-surface-variant)", padding: "4px", display: "flex" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    margin: "12px 16px",
                    padding: "20px 12px",
                    borderRadius: "10px",
                    border: "1px dashed var(--m3-outline)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    color: "var(--m3-on-surface-variant)",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--m3-primary)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(var(--m3-primary-rgb, 103,80,164),0.05)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--m3-outline)"; (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <Image size={22} style={{ marginBottom: "2px" }} />
                  <span style={{ fontWeight: 500 }}>Clique para selecionar imagem</span>
                  <span style={{ fontSize: "11px" }}>PNG, JPG ou WEBP até 5 MB</span>
                </div>
              )}
            </>
          )}

          {/* Textarea — hidden when image file selected */}
          {!(activeTab === "image" && imageFile) && (
            <div style={{ position: "relative" }}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={activeTab === "image" ? 3 : 7}
                style={{
                  width: "100%",
                  padding: "16px",
                  paddingBottom: "32px",
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: "14px",
                  color: "var(--m3-on-surface)",
                  lineHeight: "1.6",
                  display: "block",
                  boxSizing: "border-box",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "14px",
                  fontSize: "11px",
                  color: "var(--m3-on-surface-variant)",
                }}
              >
                {inputValue.length}/{maxLength.toLocaleString("pt-BR")} caracteres
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "13px 20px",
              borderRadius: "10px",
              border: "none",
              cursor: inputValue.trim() ? "pointer" : "not-allowed",
              backgroundColor: "var(--m3-primary)",
              color: "var(--m3-on-primary)",
              fontSize: "14px",
              fontWeight: 600,
              opacity: canSubmit ? 1 : 0.5,
              transition: "opacity 0.15s",
            }}
          >
            Verificar Informação
            <ArrowRight size={16} />
          </button>
          <button
            onClick={handleClear}
            style={{
              padding: "13px 18px",
              borderRadius: "10px",
              border: "1px solid var(--m3-outline)",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "var(--m3-on-surface-variant)",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Trash2 size={15} />
            Limpar
          </button>
        </div>

        {/* Privacy Note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginBottom: "28px",
          }}
        >
          <ShieldCheck size={13} style={{ color: "var(--m3-on-surface-variant)" }} />
          <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
            Seus dados são protegidos e não compartilhados com terceiros.
          </p>
        </div>

        {/* Tips + Quick Models Row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" }}>
          {/* Tips */}
          <div
            style={{
              flex: "1 1 220px",
              borderRadius: "12px",
              padding: "16px",
              backgroundColor: "var(--m3-surface-container)",
              border: "1px solid var(--m3-outline)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
              <Lightbulb size={15} style={{ color: "var(--m3-primary)" }} />
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--m3-on-surface)" }}>
                Dicas para verificar
              </p>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {TIPS.map((tip, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: "8px",
                    fontSize: "12px",
                    color: "var(--m3-on-surface-variant)",
                    lineHeight: "1.5",
                    marginBottom: i < TIPS.length - 1 ? "6px" : 0,
                  }}
                >
                  <span style={{ color: "var(--m3-primary)", flexShrink: 0 }}>•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Models */}
          <div
            style={{
              flex: "1 1 220px",
              borderRadius: "12px",
              padding: "16px",
              backgroundColor: "var(--m3-surface-container)",
              border: "1px solid var(--m3-outline)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
              <Zap size={15} style={{ color: "var(--m3-primary)" }} />
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--m3-on-surface)" }}>
                Modelos rápidos
              </p>
            </div>
            <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)", marginBottom: "10px" }}>
              Use um template para cada tipo de consulta:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {QUICK_MODELS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setInputValue(`[${label}] `)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "1px solid var(--m3-outline)",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    color: "var(--m3-on-surface-variant)",
                    fontSize: "12px",
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Footer */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "verificações realizadas", value: resumo ? String(resumo.total_verificacoes) : "—", icon: BarChartIcon },
            { label: "reais", value: resumo ? String(resumo.total_reais) : "—", icon: CheckCircle2 },
            { label: "falsas", value: resumo ? String(resumo.total_falsas) : "—", icon: XCircle },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon size={15} style={{ color: "var(--m3-on-surface-variant)" }} />
              <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--m3-on-surface)" }}>{value}</span>
              <span style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ width: "300px", flexShrink: 0 }}>

        {/* Recent Verifications */}
        <div
          style={{
            borderRadius: "14px",
            border: "1px solid var(--m3-outline)",
            backgroundColor: "var(--m3-surface-container)",
            marginBottom: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid var(--m3-outline)",
            }}
          >
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--m3-on-surface)" }}>
              Verificações recentes
            </p>
            <button
              style={{
                fontSize: "12px",
                color: "var(--m3-primary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Ver todos
            </button>
          </div>

          {recentItems.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>
                Nenhuma verificação ainda.
              </p>
            </div>
          ) : (
            <>
              {recentItems.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    borderBottom: i < recentItems.length - 1 ? "1px solid var(--m3-outline)" : "none",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--m3-on-surface)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: "3px",
                      }}
                    >
                      {item.title}
                    </p>
                    <ResultBadge result={item.result} />
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
                </div>
              ))}

              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid var(--m3-outline)",
                }}
              >
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "var(--m3-primary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Abrir todas as consultas
                  <ArrowRight size={13} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <div
          style={{
            borderRadius: "14px",
            border: "1px solid var(--m3-outline)",
            backgroundColor: "var(--m3-surface-container)",
            padding: "16px",
          }}
        >
          <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "16px" }}>
            Seu resumo
          </p>

          {loadingResumo ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0", gap: "8px", color: "var(--m3-on-surface-variant)" }}>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "13px" }}>Carregando...</span>
            </div>
          ) : resumo ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <DonutGauge percentage={Math.round(resumo.percentual_reais)} />
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)" }}>Verificações realizadas</p>
                    <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--m3-on-surface)" }}>{resumo.total_verificacoes}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)" }}>Falsas</p>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: "#f44336" }}>
                      {resumo.total_falsas}
                      {resumo.total_verificacoes > 0 && (
                        <span style={{ fontSize: "12px", fontWeight: 400, color: "var(--m3-on-surface-variant)" }}>
                          {" "}({Math.round(resumo.total_falsas / resumo.total_verificacoes * 100)}%)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--m3-outline)",
                }}
              >
                <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)", marginBottom: "2px" }}>
                  Inconclusivas
                </p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#f59e0b" }}>
                  {resumo.total_inconclusivas}
                </p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)", textAlign: "center", padding: "16px 0" }}>
              Faça sua primeira verificação para ver seu resumo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline icon for stats (BarChart2 renamed to avoid shadowing)
function BarChartIcon({ size, style }: { size: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
