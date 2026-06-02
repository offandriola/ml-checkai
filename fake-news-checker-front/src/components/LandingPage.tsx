import { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Image,
  Link2,
  ArrowRight,
  ScanText,
  GitBranch,
  Globe,
  BarChart2,
  Brain,
  Search,
  CheckCircle2,
} from "lucide-react";

interface LandingPageProps {
  onEnter: () => void;
  onSubmit: (value: string, type: "text" | "link" | "image") => void;
}

const STEPS = [
  {
    number: "1",
    label: "Extração",
    description: "Extraímos o conteúdo principal da informação.",
    icon: FileText,
  },
  {
    number: "2",
    label: "Análise",
    description: "IA avalia padrões, contexto e consistência.",
    icon: Brain,
  },
  {
    number: "3",
    label: "Evidências",
    description: "Procuramos dados e fontes confiáveis da web.",
    icon: Search,
  },
  {
    number: "4",
    label: "Classificação",
    description: "Geramos o veredito.",
    icon: CheckCircle2,
  },
];

const FEATURES = [
  {
    icon: ScanText,
    title: "OCR de imagens",
    description: "Extração de texto em imagens e capturas de tela.",
  },
  {
    icon: GitBranch,
    title: "Classificação automática",
    description: "Classificação baseada em dados previamente rotulados",
  },
  {
    icon: Globe,
    title: "Fontes verificadas",
    description: "Validação baseada em fontes públicas.",
  },
  {
    icon: BarChart2,
    title: "Análise explicável",
    description: "Exibição transparente do resultado da análise.",
  },
];

type TabType = "text" | "image" | "link";

export function LandingPage({ onEnter, onSubmit }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [inputValue, setInputValue] = useState("");

  const maxLength = 5000;

  const placeholder =
    activeTab === "link"
      ? "Cole um link para verificar..."
      : activeTab === "image"
        ? "Cole a URL da imagem..."
        : "Digite uma notícia, afirmação ou link que deseja verificar...";

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    onSubmit(inputValue, activeTab);
  };

  return (
    <div
      className="dark min-h-screen flex flex-col"
      style={{ backgroundColor: "#070707" }}
    >
      <main className="flex-1">

        {/* ── Hero ── */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingTop: "44px", paddingBottom: "24px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "5fr 7fr",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Esquerda: Copy */}
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: "#FF3784",
                  marginBottom: "12px",
                }}
              >
                C H E C K A I
              </p>
              <h1
                style={{
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "#F2EEED",
                  marginBottom: "20px",
                }}
              >
                Valide informações políticas com{" "}
                <span style={{ color: "#FF3784" }}>análise automatizada</span>
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "#9E9E9E",
                  marginBottom: "24px",
                }}
              >
                Identificamos informações falsas, distorcidas ou enganosas e
                mostramos as evidências.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={17} style={{ color: "#FF3784", flexShrink: 0 }} />
                <p style={{ fontSize: "14px", color: "#9E9E9E", margin: 0 }}>
                  Tecnologia a serviço da{" "}
                  <span style={{ color: "#FF3784", fontWeight: 500 }}>verdade.</span>
                </p>
              </div>
            </div>

            {/* Direita: Widget */}
            <div
              style={{
                borderRadius: "16px",
                padding: "24px",
                backgroundColor: "#111111",
                border: "1.5px solid #FF3784",
                boxShadow: "0 0 48px rgba(255,55,132,0.12)",
              }}
            >
              {/* Widget Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    backgroundColor: "rgba(255,55,132,0.15)",
                  }}
                >
                  <Search size={20} style={{ color: "#FF3784" }} />
                </div>
                <div>
                  <h2
                    style={{ fontSize: "16px", fontWeight: 600, color: "#F2EEED", margin: 0 }}
                  >
                    Verifique uma informação
                  </h2>
                  <p style={{ fontSize: "13px", color: "#9E9E9E", margin: 0 }}>
                    Selecione o tipo de análise
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid #252525",
                  marginBottom: "12px",
                }}
              >
                {(
                  [
                    { type: "text", label: "Texto", icon: FileText },
                    { type: "image", label: "Imagem", icon: Image },
                    { type: "link", label: "Link", icon: Link2 },
                  ] as { type: TabType; label: string; icon: typeof FileText }[]
                ).map(({ type, label, icon: Icon }, i) => (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      border: "none",
                      borderLeft: i > 0 ? "1px solid #252525" : "none",
                      cursor: "pointer",
                      transition: "background-color 0.15s",
                      backgroundColor: activeTab === type ? "#FF3784" : "transparent",
                      color: activeTab === type ? "#F2EEED" : "#9E9E9E",
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div
                style={{
                  position: "relative",
                  borderRadius: "10px",
                  marginBottom: "12px",
                  backgroundColor: "#070707",
                  border: "1px solid #252525",
                }}
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  rows={3}
                  className="w-full bg-transparent resize-none outline-none"
                  style={{
                    color: "#F2EEED",
                    fontSize: "13px",
                    padding: "14px 14px 32px 14px",
                    display: "block",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "12px",
                    fontSize: "11px",
                    color: "#555",
                    whiteSpace: "nowrap",
                  }}
                >
                  {inputValue.length} / {maxLength.toLocaleString("pt-BR")} caracteres
                </span>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "13px 16px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 600,
                  border: "none",
                  cursor: inputValue.trim() ? "pointer" : "not-allowed",
                  opacity: inputValue.trim() ? 1 : 0.5,
                  backgroundColor: "#FF3784",
                  color: "#F2EEED",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => { if (inputValue.trim()) e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = inputValue.trim() ? "1" : "0.5"; }}
              >
                Checkar informação
                <ArrowRight size={17} />
              </button>

              {/* Privacy Note */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginTop: "12px",
                }}
              >
                <ShieldCheck size={13} style={{ color: "#555" }} />
                <p style={{ fontSize: "12px", color: "#555", margin: 0 }}>
                  Seus dados estão protegidos e não são compartilhados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Como analisamos ── */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingBottom: "20px" }}
        >
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid #252525",
              backgroundColor: "#111111",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                alignItems: "center",
              }}
            >
              {/* Label */}
              <div style={{ flexShrink: 0, minWidth: "130px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#F2EEED",
                    marginBottom: "2px",
                  }}
                >
                  Como analisamos
                </p>
                <p style={{ fontSize: "12px", color: "#9E9E9E", margin: 0 }}>
                  Nosso processo em 4 etapas.
                </p>
              </div>

              {/* Steps */}
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  gap: "4px",
                  flexWrap: "wrap",
                }}
              >
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.number}
                      style={{
                        position: "relative",
                        flex: "1 1 90px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: "4px",
                      }}
                    >
                      {/* Conector pontilhado */}
                      {i < STEPS.length - 1 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "20px",
                            left: "calc(50% + 24px)",
                            width: "calc(100% - 24px)",
                            height: "1px",
                            borderTop: "2px dashed rgba(255,55,132,0.35)",
                          }}
                        />
                      )}

                      {/* Ícone circular */}
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          backgroundColor: "rgba(255,55,132,0.18)",
                        }}
                      >
                        <Icon size={18} style={{ color: "#FF3784" }} />
                      </div>

                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#FF3784", margin: 0 }}>
                        {step.number}
                      </p>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#F2EEED", margin: 0 }}>
                        {step.label}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9E9E9E", lineHeight: 1.4, margin: 0 }}>
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingBottom: "48px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    borderRadius: "14px",
                    padding: "18px",
                    backgroundColor: "#111111",
                    border: "1px solid #252525",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      backgroundColor: "rgba(255,55,132,0.18)",
                    }}
                  >
                    <Icon size={18} style={{ color: "#FF3784" }} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#F2EEED",
                        marginBottom: "4px",
                      }}
                    >
                      {feature.title}
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#9E9E9E",
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid #252525", padding: "20px 0" }}>
        <div
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <ShieldCheck size={15} style={{ color: "#555" }} />
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
            © 2026 CheckAI. Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
