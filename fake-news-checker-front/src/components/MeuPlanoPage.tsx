import {
  Crown,
  CheckCircle2,
  CreditCard,
  Calendar,
  ChevronRight,
  Star,
  Code2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const PLAN_FEATURES = [
  "Mais verificações por mês",
  "Histórico completo",
  "Resultados detalhados",
  "Suporte prioritário",
];

const PLANS_COMPARISON = [
  {
    name: "Gratuito",
    price: "R$ 0",
    description: "Uso ocasional",
    current: false,
  },
  {
    name: "Pro",
    price: "R$ 29/mês",
    description: "Para profissionais",
    current: true,
  },
  {
    name: "API",
    price: "Sob consulta",
    description: "Integrações",
    current: false,
  },
];

export function MeuPlanoPage() {
  const { user } = useAuth();

  const handleCancelSubscription = () => {
    if (confirm("Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos Pro ao final do período atual.")) {
      alert("Funcionalidade em desenvolvimento. Entre em contato com o suporte.");
    }
  };

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "4px" }}>
          Meu Plano
        </h1>
        <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>
          Gerencie sua assinatura e método de pagamento.
        </p>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Left column */}
        <div style={{ flex: "2 1 400px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Current plan card */}
          <div
            style={{
              borderRadius: "16px",
              border: "1.5px solid var(--m3-primary)",
              backgroundColor: "var(--m3-surface-container)",
              overflow: "hidden",
              boxShadow: "0 0 32px rgba(255,55,132,0.08)",
            }}
          >
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,55,132,0.15)",
                      border: "1px solid rgba(255,55,132,0.3)",
                    }}
                  >
                    <Crown size={26} style={{ color: "var(--m3-primary)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "22px", fontWeight: 700, color: "var(--m3-primary)", marginBottom: "2px" }}>
                      Pro
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>
                      Plano profissional
                    </p>
                  </div>
                </div>

                {/* Active badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    backgroundColor: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#22c55e" }}>Ativo</span>
                </div>
              </div>

              <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)", lineHeight: 1.6, marginBottom: "20px" }}>
                Acesse todos os recursos avançados do CheckAI com verificações ilimitadas e suporte prioritário.
              </p>

              {/* Price + renewal */}
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--m3-outline)",
                }}
              >
                <div>
                  <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "4px" }}>Valor mensal</p>
                  <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--m3-on-surface)", lineHeight: 1 }}>
                    R$ 29<span style={{ fontSize: "14px", fontWeight: 400, color: "var(--m3-on-surface-variant)" }}>/mês</span>
                  </p>
                </div>
                <div style={{ height: "auto", width: "1px", backgroundColor: "var(--m3-outline)" }} />
                <div>
                  <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "4px" }}>Próxima cobrança</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={14} style={{ color: "var(--m3-on-surface-variant)" }} />
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--m3-on-surface)" }}>02/07/2026</p>
                  </div>
                </div>
                <div style={{ height: "auto", width: "1px", backgroundColor: "var(--m3-outline)" }} />
                <div>
                  <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "4px" }}>Assinante desde</p>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--m3-on-surface)" }}>01/01/2026</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div style={{ padding: "20px 24px", borderTop: "1px solid var(--m3-outline)" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--m3-on-surface-variant)", letterSpacing: "0.05em", marginBottom: "14px" }}>
                RECURSOS INCLUÍDOS
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {PLAN_FEATURES.map((feature) => (
                  <div key={feature} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle2 size={16} style={{ color: "var(--m3-primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "var(--m3-on-surface)" }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid var(--m3-outline)",
              backgroundColor: "var(--m3-surface-container)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--m3-outline)" }}>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--m3-on-surface)" }}>Método de pagamento</p>
              <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>Cartão vinculado à sua assinatura.</p>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "32px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: "1px solid var(--m3-outline)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CreditCard size={18} style={{ color: "var(--m3-on-surface-variant)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--m3-on-surface)" }}>
                      Visa •••• 4242
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>Expira em 12/2028</p>
                  </div>
                </div>
                <button
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--m3-outline)",
                    backgroundColor: "transparent",
                    color: "var(--m3-on-surface-variant)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Alterar
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Cancel subscription */}
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid rgba(239,68,68,0.3)",
              backgroundColor: "rgba(239,68,68,0.04)",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <AlertTriangle size={18} style={{ color: "#ef4444", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--m3-on-surface)" }}>Cancelar assinatura</p>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>
                  Você manterá o acesso até o final do período pago.
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelSubscription}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #ef4444",
                backgroundColor: "transparent",
                color: "#ef4444",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Cancelar plano
            </button>
          </div>
        </div>

        {/* Right column — Plans comparison */}
        <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Plan comparison */}
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid var(--m3-outline)",
              backgroundColor: "var(--m3-surface-container)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--m3-outline)" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)" }}>Comparar planos</p>
            </div>
            <div style={{ padding: "4px 0" }}>
              {PLANS_COMPARISON.map((plan, i) => {
                const Icon = plan.name === "Pro" ? Star : plan.name === "API" ? Code2 : Crown;
                return (
                  <div
                    key={plan.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 20px",
                      borderBottom: i < PLANS_COMPARISON.length - 1 ? "1px solid var(--m3-outline)" : "none",
                      backgroundColor: plan.current ? "rgba(255,55,132,0.06)" : "transparent",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: plan.current ? "rgba(255,55,132,0.15)" : "rgba(255,255,255,0.05)",
                        border: plan.current ? "1px solid rgba(255,55,132,0.3)" : "1px solid var(--m3-outline)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} style={{ color: plan.current ? "var(--m3-primary)" : "var(--m3-on-surface-variant)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: plan.current ? "var(--m3-primary)" : "var(--m3-on-surface)" }}>
                          {plan.name}
                        </p>
                        {plan.current && (
                          <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "10px", backgroundColor: "rgba(255,55,132,0.15)", color: "var(--m3-primary)" }}>
                            Atual
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>{plan.description}</p>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: plan.current ? "var(--m3-primary)" : "var(--m3-on-surface-variant)", whiteSpace: "nowrap" }}>
                      {plan.price}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Account info */}
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid var(--m3-outline)",
              backgroundColor: "var(--m3-surface-container)",
              padding: "20px",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "14px" }}>
              Informações da conta
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "2px" }}>Nome</p>
                <p style={{ fontSize: "14px", color: "var(--m3-on-surface)", fontWeight: 500 }}>{user?.nome ?? "Usuário"}</p>
              </div>
              <div style={{ height: "1px", backgroundColor: "var(--m3-outline)" }} />
              <div>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "2px" }}>E-mail</p>
                <p style={{ fontSize: "14px", color: "var(--m3-on-surface)", fontWeight: 500 }}>{user?.email ?? "—"}</p>
              </div>
              <div style={{ height: "1px", backgroundColor: "var(--m3-outline)" }} />
              <div>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "2px" }}>Status</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                  <p style={{ fontSize: "14px", color: "#22c55e", fontWeight: 500 }}>Assinatura ativa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
