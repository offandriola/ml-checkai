import { ShieldCheck, Star, Code2, CheckCircle2, QrCode, CreditCard, FileText } from "lucide-react";
import logoSvg from "../../assets/icon.svg";

interface PlanosPageProps {
  onAssinar: () => void;
}

export function PlanosPage({ onAssinar }: PlanosPageProps) {
  return (
    <div
      className="dark min-h-screen flex flex-col"
      style={{ backgroundColor: "#070707" }}
    >
      <main style={{ flex: 1 }}>

        {/* ── Heading ── */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingTop: "52px", paddingBottom: "40px", textAlign: "center" }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: "#FF3784",
              marginBottom: "12px",
            }}
          >
            P L A N O S
          </p>
          <h1
            style={{
              fontSize: "clamp(28px, 3.5vw, 44px)",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#F2EEED",
              marginBottom: "12px",
            }}
          >
            Planos e{" "}
            <span style={{ color: "#FF3784" }}>Integração</span>
          </h1>
          <p style={{ fontSize: "16px", color: "#9E9E9E", margin: 0 }}>
            Soluções escaláveis para usuários, equipes e plataformas.
          </p>
        </section>

        {/* ── Cards de plano ── */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingBottom: "32px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              alignItems: "stretch",
              paddingTop: "20px",
            }}
          >
            {/* Gratuito */}
            <div
              style={{
                borderRadius: "16px",
                border: "1px solid #252525",
                backgroundColor: "#111111",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,55,132,0.12)",
                    border: "1px solid rgba(255,55,132,0.2)",
                  }}
                >
                  <img src={logoSvg} alt="CheckAI" style={{ width: "28px", height: "28px" }} />
                </div>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#F2EEED", marginBottom: "2px" }}>Gratuito</p>
                  <p style={{ fontSize: "13px", color: "#9E9E9E", margin: 0 }}>Ideal para testes e uso ocasional.</p>
                </div>
              </div>

              <div style={{ height: "1px", backgroundColor: "#252525", marginBottom: "20px" }} />

              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "14px", color: "#9E9E9E" }}>R$ </span>
                <span style={{ fontSize: "42px", fontWeight: 700, color: "#F2EEED", lineHeight: 1 }}>0</span>
                <span style={{ fontSize: "14px", color: "#9E9E9E" }}> / mês</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", flex: 1 }}>
                {["Verificações básicas", "Envio de texto, imagem e link", "Histórico limitado", "Acesso inicial"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle2 size={16} style={{ color: "#FF3784", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "#9E9E9E" }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "1px solid #252525",
                  backgroundColor: "transparent",
                  color: "#555",
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "default",
                }}
              >
                Seu plano atual
              </button>
            </div>

            {/* Profissional — destaque */}
            <div
              style={{
                borderRadius: "16px",
                border: "1.5px solid #FF3784",
                backgroundColor: "#111111",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: "0 0 40px rgba(255,55,132,0.13)",
              }}
            >
              {/* Badge "Mais escolhido" */}
              <div
                style={{
                  position: "absolute",
                  top: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "5px 18px",
                  borderRadius: "20px",
                  backgroundColor: "#FF3784",
                  color: "#F2EEED",
                  fontSize: "12px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Mais escolhido
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,55,132,0.15)",
                    border: "1px solid rgba(255,55,132,0.35)",
                  }}
                >
                  <Star size={26} style={{ color: "#FF3784" }} />
                </div>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#F2EEED", marginBottom: "2px" }}>Profissional</p>
                  <p style={{ fontSize: "13px", color: "#9E9E9E", margin: 0 }}>Para profissionais e equipes que precisam ir além.</p>
                </div>
              </div>

              <div style={{ height: "1px", backgroundColor: "rgba(255,55,132,0.2)", marginBottom: "20px" }} />

              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "14px", color: "#9E9E9E" }}>R$ </span>
                <span style={{ fontSize: "42px", fontWeight: 700, color: "#F2EEED", lineHeight: 1 }}>29</span>
                <span style={{ fontSize: "14px", color: "#9E9E9E" }}> / mês</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", flex: 1 }}>
                {["Mais verificações por mês", "Histórico completo", "Resultados detalhados", "Suporte prioritário"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle2 size={16} style={{ color: "#FF3784", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "#F2EEED" }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onAssinar}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#FF3784",
                  color: "#F2EEED",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e61e6c"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FF3784"; }}
              >
                Assinar plano
              </button>
            </div>

            {/* API */}
            <div
              style={{
                borderRadius: "16px",
                border: "1px solid #252525",
                backgroundColor: "#111111",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,55,132,0.12)",
                    border: "1px solid rgba(255,55,132,0.2)",
                  }}
                >
                  <Code2 size={24} style={{ color: "#FF3784" }} />
                </div>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#F2EEED", marginBottom: "2px" }}>API</p>
                  <p style={{ fontSize: "13px", color: "#9E9E9E", margin: 0 }}>Para integrações e plataformas.</p>
                </div>
              </div>

              <div style={{ height: "1px", backgroundColor: "#252525", marginBottom: "20px" }} />

              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "#F2EEED", marginBottom: "4px", lineHeight: 1.2 }}>
                  Sob Consulta
                </p>
                <p style={{ fontSize: "13px", color: "#9E9E9E", margin: 0 }}>Personalizado</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", flex: 1 }}>
                {["Integração com sistemas externos", "Requisições automatizadas", "Retorno estruturado", "Escalabilidade para plataformas"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle2 size={16} style={{ color: "#FF3784", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "#9E9E9E" }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "1px solid #FF3784",
                  backgroundColor: "transparent",
                  color: "#FF3784",
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,55,132,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                Solicitar Acesso
              </button>
            </div>
          </div>
        </section>

        {/* ── Formas de pagamento ── */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingBottom: "48px" }}
        >
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid #252525",
              backgroundColor: "#111111",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              overflow: "hidden",
            }}
          >
            {[
              { Icon: QrCode, title: "Pagamento via Pix", desc: "Aprovação imediata e segura." },
              { Icon: CreditCard, title: "Cartão", desc: "Crédito e débito com processamento seguro." },
              { Icon: FileText, title: "Boleto", desc: "Compensação em até 2 dias úteis." },
            ].map(({ Icon, title, desc }, i, arr) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "24px",
                  borderRight: i < arr.length - 1 ? "1px solid #252525" : "none",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,55,132,0.12)",
                    border: "1px solid rgba(255,55,132,0.2)",
                  }}
                >
                  <Icon size={24} style={{ color: "#FF3784" }} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#F2EEED", marginBottom: "4px" }}>{title}</p>
                  <p style={{ fontSize: "13px", color: "#9E9E9E", margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
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
            Cobrança mensal • Cancelamento simples
          </p>
        </div>
      </footer>
    </div>
  );
}
