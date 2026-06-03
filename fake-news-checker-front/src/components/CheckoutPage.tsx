import { useState } from "react";
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Copy,
  CreditCard,
  Lock,
  MessageCircle,
} from "lucide-react";

type Tab = "pix" | "cartao" | "boleto";

interface CheckoutPageProps {
  onAlterar: () => void;
}

const PIX_CODE =
  "00020126580014BR.GOV.BCB.PIX0136checkai@pagamentos.com.br5204000053039865802BR5925CheckAI Tecnologia Ltda6009SAO PAULO62070503***6304ABCD";

const BOLETO_LINHA =
  "237-2 35790.00008 00000.000008 00000.000000 1 10100000002900";

export function CheckoutPage({ onAlterar }: CheckoutPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("pix");
  const [copied, setCopied] = useState(false);
  const [cardForm, setCardForm] = useState({ nome: "", numero: "", validade: "", cvv: "", cpf: "" });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="dark min-h-screen flex flex-col"
      style={{ backgroundColor: "#070707" }}
    >
      <main style={{ flex: 1 }}>
        <section
          className="max-w-7xl mx-auto px-4 md:px-8"
          style={{ paddingTop: "48px", paddingBottom: "48px" }}
        >
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                color: "#FF3784",
                marginBottom: "10px",
              }}
            >
              C H E C K O U T
            </p>
            <h1
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 700,
                color: "#F2EEED",
                marginBottom: "8px",
              }}
            >
              Pagamento do{" "}
              <span style={{ color: "#FF3784" }}>plano</span>
            </h1>
            <p style={{ fontSize: "15px", color: "#9E9E9E", margin: 0 }}>
              Conclua sua assinatura com segurança.
            </p>
          </div>

          {/* 2 colunas */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.6fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Esquerda: resumo do plano */}
            <div
              style={{
                borderRadius: "16px",
                border: "1.5px solid #FF3784",
                backgroundColor: "#111111",
                padding: "24px",
                boxShadow: "0 0 32px rgba(255,55,132,0.10)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,55,132,0.15)",
                    border: "1px solid rgba(255,55,132,0.3)",
                  }}
                >
                  <Star size={22} style={{ color: "#FF3784" }} />
                </div>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#F2EEED", marginBottom: "2px" }}>
                    Profissional
                  </p>
                  <p style={{ fontSize: "12px", color: "#9E9E9E", margin: 0 }}>
                    Para profissionais e equipes que precisam ir além.
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: "#9E9E9E",
                  marginBottom: "12px",
                }}
              >
                INCLUI NO SEU PLANO:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                {["Mais verificações por mês", "Histórico completo", "Resultados detalhados", "Suporte prioritário"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <CheckCircle2 size={15} style={{ color: "#FF3784", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "#9E9E9E" }}>{f}</span>
                  </div>
                ))}
              </div>

              <div style={{ height: "1px", backgroundColor: "#252525", marginBottom: "16px" }} />

              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "13px", color: "#9E9E9E" }}>R$ </span>
                <span style={{ fontSize: "32px", fontWeight: 700, color: "#F2EEED", lineHeight: 1 }}>29</span>
                <span style={{ fontSize: "13px", color: "#9E9E9E" }}> / mês</span>
              </div>

              <button
                onClick={onAlterar}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: "10px",
                  border: "1px solid #FF3784",
                  backgroundColor: "transparent",
                  color: "#FF3784",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,55,132,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                Alterar Plano
              </button>
            </div>

            {/* Direita: tabs de pagamento */}
            <div
              style={{
                borderRadius: "16px",
                border: "1px solid #252525",
                backgroundColor: "#111111",
                overflow: "hidden",
              }}
            >
              {/* Tabs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  borderBottom: "1px solid #252525",
                }}
              >
                {(["pix", "cartao", "boleto"] as Tab[]).map((tab, i, arr) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "14px",
                      fontSize: "14px",
                      fontWeight: 500,
                      border: "none",
                      borderRight: i < arr.length - 1 ? "1px solid #252525" : "none",
                      cursor: "pointer",
                      backgroundColor: activeTab === tab ? "rgba(255,55,132,0.10)" : "transparent",
                      color: activeTab === tab ? "#FF3784" : "#9E9E9E",
                      borderBottom: activeTab === tab ? "2px solid #FF3784" : "2px solid transparent",
                      transition: "background-color 0.15s, color 0.15s",
                    }}
                  >
                    {tab === "pix" ? "Pix" : tab === "cartao" ? "Cartão" : "Boleto"}
                  </button>
                ))}
              </div>

              {/* Conteúdo — altura fixa para evitar layout shift */}
              <div style={{ padding: "28px", minHeight: "420px" }}>

                {/* ── PIX ── */}
                {activeTab === "pix" && (
                  <div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* QR Code mock */}
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#F2EEED", marginBottom: "14px" }}>
                          Pague com Pix
                        </p>
                        <p style={{ fontSize: "12px", color: "#9E9E9E", marginBottom: "16px", lineHeight: 1.5 }}>
                          Escaneie o QR Code com o app do seu banco.
                        </p>
                        {/* QR Code */}
                        <div
                          style={{
                            width: "160px",
                            height: "160px",
                            borderRadius: "10px",
                            border: "1px solid #252525",
                            backgroundColor: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                            {/* Finder patterns (3 corners) */}
                            {/* Top-left */}
                            <rect x="8" y="8" width="38" height="38" fill="none" stroke="#000" strokeWidth="4" />
                            <rect x="14" y="14" width="26" height="26" fill="none" stroke="#000" strokeWidth="2" />
                            <rect x="20" y="20" width="14" height="14" fill="#000" />
                            {/* Top-right */}
                            <rect x="94" y="8" width="38" height="38" fill="none" stroke="#000" strokeWidth="4" />
                            <rect x="100" y="14" width="26" height="26" fill="none" stroke="#000" strokeWidth="2" />
                            <rect x="106" y="20" width="14" height="14" fill="#000" />
                            {/* Bottom-left */}
                            <rect x="8" y="94" width="38" height="38" fill="none" stroke="#000" strokeWidth="4" />
                            <rect x="14" y="100" width="26" height="26" fill="none" stroke="#000" strokeWidth="2" />
                            <rect x="20" y="106" width="14" height="14" fill="#000" />
                            {/* Data modules (pseudo-random pattern) */}
                            {[
                              [52,8],[56,12],[60,8],[64,16],[68,8],[72,12],[76,16],[80,8],[84,12],
                              [52,20],[60,24],[68,20],[76,24],[84,20],
                              [52,32],[56,36],[64,32],[72,36],[80,32],[84,36],
                              [8,52],[12,56],[16,52],[20,56],[24,52],[28,56],[32,52],[36,56],
                              [52,52],[56,56],[60,52],[64,56],[68,52],[72,56],[76,52],[80,56],[84,52],
                              [94,52],[98,56],[102,52],[106,56],[110,52],[114,56],[118,52],[122,56],
                              [8,64],[16,68],[24,64],[32,68],
                              [52,64],[60,68],[68,64],[76,68],[84,64],
                              [94,64],[102,68],[110,64],[118,68],[126,64],
                              [8,76],[12,80],[20,76],[28,80],[36,76],
                              [52,76],[56,80],[64,76],[72,80],[80,76],[84,80],
                              [94,76],[98,80],[106,76],[114,80],[122,76],
                              [52,88],[56,92],[60,88],[64,92],[68,88],[72,92],[76,88],[80,92],[84,88],
                              [94,94],[98,98],[102,94],[106,98],[110,94],[118,98],[122,94],[126,98],
                              [94,106],[102,110],[110,106],[118,110],[126,106],
                              [94,118],[98,122],[106,118],[114,122],[122,118],[126,122],
                            ].map(([x, y], i) => (
                              <rect key={i} x={x} y={y} width="4" height="4" fill="#000" />
                            ))}
                            {/* Alignment pattern (center-ish) */}
                            <rect x="62" y="62" width="16" height="16" fill="none" stroke="#000" strokeWidth="2" />
                            <rect x="67" y="67" width="6" height="6" fill="#000" />
                          </svg>
                        </div>
                      </div>

                      {/* Código copia e cola */}
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#F2EEED", marginBottom: "14px" }}>
                          Código pix (copia e cola)
                        </p>
                        <p style={{ fontSize: "12px", color: "#9E9E9E", marginBottom: "16px", lineHeight: 1.5 }}>
                          Copie o código abaixo e cole no app do seu banco.
                        </p>
                        <div
                          style={{
                            borderRadius: "10px",
                            border: "1px solid #252525",
                            backgroundColor: "#070707",
                            padding: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "10px",
                              color: "#555",
                              wordBreak: "break-all",
                              lineHeight: 1.6,
                              margin: 0,
                              fontFamily: "monospace",
                            }}
                          >
                            {PIX_CODE}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(PIX_CODE)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid #252525",
                            backgroundColor: copied ? "rgba(255,55,132,0.12)" : "transparent",
                            color: copied ? "#FF3784" : "#9E9E9E",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <Copy size={14} />
                          {copied ? "Copiado!" : "Copiar código"}
                        </button>
                      </div>
                    </div>

                    <div style={{ height: "1px", backgroundColor: "#252525", margin: "24px 0" }} />

                    <button
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
                      Já paguei
                    </button>
                  </div>
                )}

                {/* ── CARTÃO ── */}
                {activeTab === "cartao" && (
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#F2EEED", marginBottom: "20px" }}>
                      Pague com seu cartão
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#9E9E9E", marginBottom: "6px", fontWeight: 500 }}>
                          Nome no cartão
                        </label>
                        <input
                          type="text"
                          placeholder="Nome impresso no cartão"
                          value={cardForm.nome}
                          onChange={(e) => setCardForm((f) => ({ ...f, nome: e.target.value }))}
                          style={{
                            width: "100%",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            border: "1px solid #252525",
                            backgroundColor: "#070707",
                            color: "#F2EEED",
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#9E9E9E", marginBottom: "6px", fontWeight: 500 }}>
                          Número do Cartão
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "11px 14px",
                            borderRadius: "10px",
                            border: "1px solid #252525",
                            backgroundColor: "#070707",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardForm.numero}
                            onChange={(e) => setCardForm((f) => ({ ...f, numero: e.target.value }))}
                            style={{
                              flex: 1,
                              background: "none",
                              border: "none",
                              outline: "none",
                              color: "#F2EEED",
                              fontSize: "14px",
                            }}
                          />
                          <CreditCard size={16} style={{ color: "#555", flexShrink: 0 }} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#9E9E9E", marginBottom: "6px", fontWeight: 500 }}>
                            Validade
                          </label>
                          <input
                            type="text"
                            placeholder="MM/AA"
                            value={cardForm.validade}
                            onChange={(e) => setCardForm((f) => ({ ...f, validade: e.target.value }))}
                            style={{
                              width: "100%",
                              padding: "11px 14px",
                              borderRadius: "10px",
                              border: "1px solid #252525",
                              backgroundColor: "#070707",
                              color: "#F2EEED",
                              fontSize: "14px",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#9E9E9E", marginBottom: "6px", fontWeight: 500 }}>
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm((f) => ({ ...f, cvv: e.target.value }))}
                            style={{
                              width: "100%",
                              padding: "11px 14px",
                              borderRadius: "10px",
                              border: "1px solid #252525",
                              backgroundColor: "#070707",
                              color: "#F2EEED",
                              fontSize: "14px",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", color: "#9E9E9E", marginBottom: "6px", fontWeight: 500 }}>
                            CPF (opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="000.000.000-00"
                            value={cardForm.cpf}
                            onChange={(e) => setCardForm((f) => ({ ...f, cpf: e.target.value }))}
                            style={{
                              width: "100%",
                              padding: "11px 14px",
                              borderRadius: "10px",
                              border: "1px solid #252525",
                              backgroundColor: "#070707",
                              color: "#F2EEED",
                              fontSize: "14px",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      style={{
                        marginTop: "24px",
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
                      Finalizar Pagamento
                    </button>
                  </div>
                )}

                {/* ── BOLETO ── */}
                {activeTab === "boleto" && (
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#F2EEED", marginBottom: "8px" }}>
                      Pague com boleto
                    </p>
                    <p style={{ fontSize: "12px", color: "#9E9E9E", marginBottom: "20px", lineHeight: 1.5 }}>
                      Pagamento sujeito à compensação em até 3 dias úteis.
                    </p>

                    {/* Boleto mock */}
                    <div
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #252525",
                        backgroundColor: "#F2EEED",
                        padding: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <p style={{ fontSize: "10px", color: "#333", fontWeight: 600, marginBottom: "2px" }}>237-2</p>
                          <p style={{ fontSize: "9px", color: "#555", margin: 0 }}>Banco Bradesco S.A.</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "10px", color: "#333", fontWeight: 600, marginBottom: "2px" }}>Vencimento</p>
                          <p style={{ fontSize: "9px", color: "#555", margin: 0 }}>Em 3 dias úteis</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "10px", color: "#333", fontWeight: 600, marginBottom: "2px" }}>Valor</p>
                          <p style={{ fontSize: "12px", color: "#000", fontWeight: 700, margin: 0 }}>R$ 29,00</p>
                        </div>
                      </div>

                      {/* Barras do boleto — padrão ITF realista */}
                      <div
                        style={{
                          height: "52px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          marginBottom: "10px",
                          display: "flex",
                          gap: "0",
                        }}
                      >
                        {(() => {
                          // Gera padrão de barras alternadas largo/fino similar a ITF
                          const pattern = "1101001011010110100101101001011010010110101100101101001011010010110100101101011001011010010110100101101001011010110010110100101";
                          return pattern.split("").map((bit, i) => (
                            <div
                              key={i}
                              style={{
                                flex: "0 0 auto",
                                width: bit === "1" ? "2px" : "1px",
                                backgroundColor: i % 2 === 0 ? "#000" : "transparent",
                                height: "100%",
                              }}
                            />
                          ));
                        })()}
                      </div>

                      <p
                        style={{
                          fontSize: "9px",
                          color: "#333",
                          textAlign: "center",
                          fontFamily: "monospace",
                          margin: 0,
                          letterSpacing: "0.03em",
                        }}
                      >
                        {BOLETO_LINHA}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        style={{
                          flex: 1,
                          padding: "13px",
                          borderRadius: "10px",
                          border: "none",
                          backgroundColor: "#FF3784",
                          color: "#F2EEED",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e61e6c"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FF3784"; }}
                      >
                        Gerar Boleto
                      </button>
                      <button
                        onClick={() => handleCopy(BOLETO_LINHA)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "13px",
                          borderRadius: "10px",
                          border: "1px solid #252525",
                          backgroundColor: "transparent",
                          color: "#9E9E9E",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      >
                        <Copy size={15} />
                        Copiar Código
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Selos de confiança ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            {[
              { Icon: Lock, title: "Pagamento seguro", desc: "Todas as informações são criptografadas e protegidas." },
              { Icon: ShieldCheck, title: "Privacidade garantida", desc: "Não compartilhamos seus dados com terceiros." },
              { Icon: MessageCircle, title: "Precisa de ajuda?", desc: "Fale com nosso suporte via chat ou e-mail." },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #252525",
                  backgroundColor: "#111111",
                }}
              >
                <Icon size={18} style={{ color: "#FF3784", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#F2EEED", marginBottom: "3px" }}>{title}</p>
                  <p style={{ fontSize: "12px", color: "#9E9E9E", margin: 0, lineHeight: 1.5 }}>{desc}</p>
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
