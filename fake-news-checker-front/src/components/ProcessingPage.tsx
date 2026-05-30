import { ShieldCheck, CheckCircle2, Loader2, Circle, X } from "lucide-react";

interface Step {
  id: number;
  label: string;
  completed: boolean;
}

interface ProcessingPageProps {
  steps: Step[];
  currentStepIndex: number;
  content: string;
  onCancel: () => void;
}

export function ProcessingPage({ steps, currentStepIndex, content, onCancel }: ProcessingPageProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

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
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: "1px solid var(--m3-outline)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--m3-primary-container)",
            }}
          >
            <ShieldCheck size={18} style={{ color: "var(--m3-primary)" }} />
          </div>
          <span style={{ fontSize: "16px", fontWeight: 500, color: "var(--m3-on-surface)" }}>
            check<span style={{ color: "var(--m3-primary)" }}>ai</span>
          </span>
        </div>
      </header>

      {/* Centered content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "560px", textAlign: "center" }}>
          {/* Animated icon */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--m3-primary-container)",
                border: "2px solid var(--m3-primary)",
                animation: "spin 2s linear infinite",
              }}
            >
              <ShieldCheck size={32} style={{ color: "var(--m3-primary)" }} />
            </div>
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "var(--m3-on-surface)",
              marginBottom: "8px",
            }}
          >
            Analisando informação...
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--m3-on-surface-variant)",
              marginBottom: "32px",
              lineHeight: 1.5,
            }}
          >
            O CheckAI está processando a consulta e buscando evidências relevantes.
          </p>

          {/* Processing card */}
          <div
            style={{
              borderRadius: "16px",
              backgroundColor: "var(--m3-surface-container)",
              border: "1.5px solid var(--m3-primary)",
              boxShadow: "0 0 32px rgba(255,55,132,0.1)",
              padding: "24px",
              textAlign: "left",
              marginBottom: "16px",
            }}
          >
            {/* Card header */}
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--m3-on-surface)",
                  marginBottom: "4px",
                }}
              >
                Processamento em andamento
              </p>
              <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
                Estamos trabalhando para entregar o resultado assim que possível
              </p>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
                  Progresso
                </span>
                <span
                  style={{ fontSize: "13px", fontWeight: 600, color: "var(--m3-primary)" }}
                >
                  {progressPercent}%
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  borderRadius: "3px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    borderRadius: "3px",
                    backgroundColor: "var(--m3-primary)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {steps.map((step, i) => {
                const isCompleted = step.completed;
                const isCurrent = i === currentStepIndex && !isCompleted;
                const isPending = !isCompleted && !isCurrent;

                return (
                  <div
                    key={step.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    {/* Icon */}
                    <div style={{ flexShrink: 0, marginTop: "1px" }}>
                      {isCompleted ? (
                        <CheckCircle2 size={20} style={{ color: "#22c55e" }} />
                      ) : isCurrent ? (
                        <Loader2
                          size={20}
                          style={{
                            color: "var(--m3-primary)",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                      ) : (
                        <Circle size={20} style={{ color: "rgba(255,255,255,0.2)" }} />
                      )}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: isCompleted || isCurrent ? 500 : 400,
                          color: isCompleted
                            ? "var(--m3-on-surface)"
                            : isCurrent
                            ? "var(--m3-on-surface)"
                            : "var(--m3-on-surface-variant)",
                        }}
                      >
                        {step.label}
                      </p>
                      {isCompleted && (
                        <p style={{ fontSize: "12px", color: "#22c55e", marginTop: "1px" }}>
                          Concluído com sucesso
                        </p>
                      )}
                      {isCurrent && (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--m3-on-surface-variant)",
                            marginTop: "1px",
                          }}
                        >
                          Em andamento...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cancel button */}
          <button
            onClick={onCancel}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1px solid var(--m3-outline)",
              backgroundColor: "transparent",
              color: "var(--m3-on-surface-variant)",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            <X size={15} />
            Cancelar análise
          </button>

          <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
            Este processo deve levar alguns segundos.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
