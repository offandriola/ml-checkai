import {
  ShieldCheck,
  Target,
  Eye,
  AlertCircle,
  Brain,
  ScanText,
  Search,
  Code2,
  Users,
  Clock,
  Globe,
  ChevronRight,
} from "lucide-react";
import logoSvg from "../../assets/icon.svg";

export function SobrePage() {
  return (
    <div
      className="dark min-h-screen flex flex-col"
      style={{ backgroundColor: "#070707" }}
    >
      <main style={{ flex: 1 }}>

        {/* ── Hero ── */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingTop: "48px", paddingBottom: "40px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "5fr 4fr",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Esquerda */}
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  color: "#FF3784",
                  marginBottom: "16px",
                }}
              >
                S O B R E &nbsp; O &nbsp; C H E C K A I
              </p>
              <h1
                style={{
                  fontSize: "clamp(32px, 4vw, 52px)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "#F2EEED",
                  marginBottom: "20px",
                }}
              >
                Tecnologia contra
                <br />a{" "}
                <span style={{ color: "#FF3784" }}>desinformação.</span>
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#9E9E9E",
                  marginBottom: "24px",
                  maxWidth: "480px",
                }}
              >
                O CheckAI usa tecnologias avançadas para ajudar a identificar
                informações enganosas e promover decisões mais conscientes em
                uma sociedade mais bem informada.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={17} style={{ color: "#FF3784", flexShrink: 0 }} />
                <p style={{ fontSize: "14px", color: "#F2EEED", margin: 0, fontWeight: 500 }}>
                  Tecnologia a serviço da verdade.
                </p>
              </div>
            </div>

            {/* Direita: escudo com glow */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <div style={{ position: "relative", width: "280px", height: "280px" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(255,55,132,0.28) 0%, rgba(255,55,132,0.10) 50%, transparent 72%)",
                    filter: "blur(24px)",
                  }}
                />
                <img
                  src={logoSvg}
                  alt="CheckAI Shield"
                  style={{
                    width: "200px",
                    height: "200px",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    filter:
                      "drop-shadow(0 0 28px rgba(255,55,132,0.65)) drop-shadow(0 0 10px rgba(255,55,132,0.45))",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 cards ── */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingBottom: "32px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {[
              {
                Icon: AlertCircle,
                title: "O problema",
                desc: "A desinformação se espalha rapidamente, influencia opiniões e compromete o debate democrático. É cada vez mais difícil separar fatos de manipulações.",
              },
              {
                Icon: Target,
                title: "Nosso objetivo",
                desc: "Oferecer uma ferramenta confiável que use tecnologia de ponta para verificar informações polêmicas e fortalecer o acesso à informação de qualidade.",
              },
              {
                Icon: Eye,
                title: "Nossa visão",
                desc: "Um futuro onde a informação é transparente, verificável e acessível a todos, contribuindo para uma sociedade mais crítica, ética e democrática.",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  borderRadius: "14px",
                  border: "1px solid #252525",
                  backgroundColor: "#111111",
                  padding: "24px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,55,132,0.12)",
                    border: "1px solid rgba(255,55,132,0.2)",
                  }}
                >
                  <Icon size={22} style={{ color: "#FF3784" }} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#F2EEED", marginBottom: "8px" }}>
                    {title}
                  </p>
                  <p style={{ fontSize: "13px", color: "#9E9E9E", lineHeight: 1.6, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tecnologias + Aplicações ── */}
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingBottom: "48px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

            {/* Tecnologias */}
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #252525",
                backgroundColor: "#111111",
                padding: "28px",
              }}
            >
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#F2EEED", marginBottom: "24px" }}>
                Tecnologias utilizadas
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "20px",
                }}
              >
                {[
                  { Icon: Brain, title: "IA", desc: "Inteligência artificial para análise e detecção avançada." },
                  { Icon: ScanText, title: "OCR de imagens", desc: "Extração de texto de imagens para ampliar a verificação." },
                  { Icon: Search, title: "Busca semântica", desc: "Compreensão de contexto para resultados relevantes." },
                  { Icon: Code2, title: "API REST", desc: "Integração simples e segura para empresas e plataformas." },
                ].map(({ Icon, title, desc }) => (
                  <div key={title} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255,55,132,0.12)",
                        border: "1px solid rgba(255,55,132,0.2)",
                      }}
                    >
                      <Icon size={22} style={{ color: "#FF3784" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#F2EEED", marginBottom: "4px" }}>
                        {title}
                      </p>
                      <p style={{ fontSize: "12px", color: "#9E9E9E", lineHeight: 1.5, margin: 0 }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aplicações futuras */}
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #252525",
                backgroundColor: "#111111",
                padding: "28px",
              }}
            >
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#F2EEED", marginBottom: "24px" }}>
                Aplicações futuras
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { Icon: Users, title: "Redes sociais", desc: "Integração com redes e plataformas para ampliar o impacto." },
                  { Icon: Clock, title: "Verificação em tempo real", desc: "Análises instantâneas para conteúdos em circulação." },
                  { Icon: Globe, title: "Expansão temática", desc: "Cobertura de novos temas e contextos com o mesmo rigor." },
                ].map(({ Icon, title, desc }, i, arr) => (
                  <div
                    key={title}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      paddingTop: i === 0 ? 0 : "16px",
                      paddingBottom: i < arr.length - 1 ? "16px" : 0,
                      borderBottom: i < arr.length - 1 ? "1px solid #252525" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255,55,132,0.12)",
                      }}
                    >
                      <Icon size={20} style={{ color: "#FF3784" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#F2EEED", marginBottom: "2px" }}>
                        {title}
                      </p>
                      <p style={{ fontSize: "12px", color: "#9E9E9E", margin: 0 }}>
                        {desc}
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: "#FF3784", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
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
