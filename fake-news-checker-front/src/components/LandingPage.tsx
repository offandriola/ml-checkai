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
  User,
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
      style={{ backgroundColor: "var(--m3-surface)" }}
    >
      {/* ── Main Content ── */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <p
                className="text-xs font-medium tracking-widest mb-4"
                style={{ color: "var(--m3-primary)" }}
              >
                CHECKAI
              </p>
              <h1
                className="text-4xl md:text-5xl font-medium leading-tight mb-6"
                style={{ color: "var(--m3-on-surface)" }}
              >
                Valide informações políticas com{" "}
                <span style={{ color: "var(--m3-primary)" }}>
                  análise automatizada
                </span>
              </h1>
              <p
                className="text-base leading-relaxed mb-8"
                style={{ color: "var(--m3-on-surface-variant)" }}
              >
                Identificamos informações falsas, distorcidas ou enganosas e
                mostramos as evidências.
              </p>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} style={{ color: "var(--m3-primary)" }} />
                <p style={{ color: "var(--m3-on-surface-variant)" }}>
                  Tecnologia a serviço da{" "}
                  <span
                    className="font-medium"
                    style={{ color: "var(--m3-primary)" }}
                  >
                    verdade.
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Verification Widget */}
            <div
              className="rounded-2xl p-6"
              style={{
                backgroundColor: "var(--m3-surface-container)",
                border: "1.5px solid var(--m3-primary)",
                boxShadow: "0 0 40px rgba(255,55,132,0.12)",
              }}
            >
              {/* Widget Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--m3-primary-container)" }}
                >
                  <Search size={22} style={{ color: "var(--m3-primary)" }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-medium"
                    style={{ color: "var(--m3-on-surface)" }}
                  >
                    Verifique uma informação
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: "var(--m3-on-surface-variant)" }}
                  >
                    Selecione o tipo de análise
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div
                className="rounded-xl overflow-hidden mb-4"
                style={{
                  display: "flex",
                  border: "1px solid var(--m3-outline)",
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
                    className="text-sm font-medium transition-all duration-150"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "12px 8px",
                      backgroundColor:
                        activeTab === type
                          ? "var(--m3-primary)"
                          : "transparent",
                      color:
                        activeTab === type
                          ? "var(--m3-on-primary)"
                          : "var(--m3-on-surface-variant)",
                      borderLeft:
                        i > 0 ? "1px solid var(--m3-outline)" : "none",
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div
                style={{
                  position: "relative",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  backgroundColor: "var(--m3-surface)",
                  border: "1px solid var(--m3-outline)",
                }}
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  maxLength={maxLength}
                  rows={4}
                  className="w-full bg-transparent resize-none outline-none text-sm"
                  style={{
                    color: "var(--m3-on-surface)",
                    padding: "16px 16px 36px 16px",
                    display: "block",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "12px",
                    fontSize: "11px",
                    color: "var(--m3-on-surface-variant)",
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
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={{
                  backgroundColor: "var(--m3-primary)",
                  color: "var(--m3-on-primary)",
                }}
              >
                Checkar informação
                <ArrowRight size={18} />
              </button>

              {/* Privacy Note */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <ShieldCheck
                  size={14}
                  style={{ color: "var(--m3-on-surface-variant)" }}
                />
                <p
                  className="text-xs"
                  style={{ color: "var(--m3-on-surface-variant)" }}
                >
                  Seus dados estão protegidos e não são compartilhados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4-Step Process ── */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
          <div
            className="rounded-2xl"
            style={{
              backgroundColor: "var(--m3-surface-container)",
              border: "1px solid var(--m3-outline)",
              padding: "32px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "32px",
                alignItems: "center",
              }}
            >
              {/* Label */}
              <div style={{ flexShrink: 0, minWidth: "140px" }}>
                <p
                  className="text-base font-medium"
                  style={{ color: "var(--m3-on-surface)", marginBottom: "4px" }}
                >
                  Como analisamos
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--m3-on-surface-variant)" }}
                >
                  Nosso processo em 4 etapas.
                </p>
              </div>

              {/* Steps */}
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  gap: "8px",
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
                        flex: "1 1 100px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: "6px",
                      }}
                    >
                      {/* Dotted connector */}
                      {i < STEPS.length - 1 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "24px",
                            left: "calc(50% + 28px)",
                            width: "calc(100% - 28px)",
                            height: "1px",
                            borderTop: "2px dashed var(--m3-outline)",
                          }}
                        />
                      )}

                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "var(--m3-primary-container)",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} style={{ color: "var(--m3-primary)" }} />
                      </div>

                      <p
                        className="text-xs font-medium"
                        style={{ color: "var(--m3-primary)" }}
                      >
                        {step.number}
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--m3-on-surface)" }}
                      >
                        {step.label}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--m3-on-surface-variant)", lineHeight: "1.5" }}
                      >
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Grid ── */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  style={{
                    flex: "1 1 220px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    borderRadius: "16px",
                    padding: "20px",
                    backgroundColor: "var(--m3-surface-container)",
                    border: "1px solid var(--m3-outline)",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      backgroundColor: "var(--m3-primary-container)",
                    }}
                  >
                    <Icon size={20} style={{ color: "var(--m3-primary)" }} />
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--m3-on-surface)", marginBottom: "4px" }}
                    >
                      {feature.title}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--m3-on-surface-variant)", lineHeight: "1.5" }}
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
      <footer
        className="border-t py-6"
        style={{ borderColor: "var(--m3-outline)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center gap-2">
          <ShieldCheck size={16} style={{ color: "var(--m3-on-surface-variant)" }} />
          <p
            className="text-sm"
            style={{ color: "var(--m3-on-surface-variant)" }}
          >
            © 2026 CheckAI. Todos os diretos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
