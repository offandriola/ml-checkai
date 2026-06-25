import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Link2,
  Zap,
} from "lucide-react";
import { apiForgotPassword } from "../services/auth";

interface ForgotPasswordPageProps {
  onGoToLogin: () => void;
}

function RecoveryEmailPreview() {
  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid var(--m3-outline)",
        backgroundColor: "var(--m3-surface)",
      }}
    >
      {/* Email header mock */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid var(--m3-outline)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--m3-primary-container)",
            }}
          >
            <Mail size={16} style={{ color: "var(--m3-primary)" }} />
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--m3-on-surface)", margin: 0 }}>
              CheckAI
            </p>
            <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)", margin: 0 }}>
              Recuperação de senha
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 10px",
            borderRadius: "20px",
            backgroundColor: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
            }}
          />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#22c55e" }}>Seguro</span>
        </div>
      </div>

      {/* Email body */}
      <div
        style={{
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--m3-primary-container)",
            border: "2px solid var(--m3-primary)",
          }}
        >
          <CheckCircle2 size={28} style={{ color: "var(--m3-primary)" }} />
        </div>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--m3-on-surface)", margin: 0, textAlign: "center" }}>
          Solicitação recebida com sucesso!
        </p>
        <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", margin: 0, textAlign: "center", lineHeight: "1.5" }}>
          Clique no botão abaixo para redefinir sua senha.
        </p>
        <button
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            backgroundColor: "var(--m3-primary)",
            color: "#F2EEED",
            fontSize: "13px",
            fontWeight: 600,
            border: "none",
            cursor: "default",
            width: "100%",
          }}
        >
          Redefinir minha senha
        </button>
        <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)", margin: 0, textAlign: "center" }}>
          Este link expira em 1 hora por segurança.
        </p>
      </div>
    </div>
  );
}

export function ForgotPasswordPage({ onGoToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      await apiForgotPassword(email);
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao solicitar recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "12px",
    padding: "14px 16px",
    backgroundColor: "var(--m3-surface)",
    border: "1px solid var(--m3-outline)",
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "var(--m3-on-surface)",
    minWidth: 0,
  };

  const features = [
    {
      icon: Link2,
      title: "Link seguro",
      desc: "Links de recuperação com validade limitada e criptografia avançada.",
    },
    {
      icon: ShieldCheck,
      title: "Privacidade protegida",
      desc: "Seus dados estão sempre protegidos e nunca são compartilhados.",
    },
    {
      icon: Zap,
      title: "Acesso rápido",
      desc: "Receba seu link em minutos e volte ao seu plano rapidamente.",
    },
  ];

  return (
    <div
      className="dark min-h-screen flex flex-col"
      style={{ backgroundColor: "#070707" }}
    >
      {/* Main */}
      <main
        className="flex-1 flex items-center justify-center"
        style={{ padding: "32px 16px" }}
      >
        <div
          className="w-full"
          style={{
            maxWidth: "1024px",
            borderRadius: "20px",
            border: "1.5px solid var(--m3-primary)",
            boxShadow: "0 0 60px rgba(255,55,132,0.10)",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {/* Left — Form */}
          <div
            style={{
              padding: "48px 40px",
              backgroundColor: "var(--m3-surface-container)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2 justify-center mb-8">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--m3-primary-container)" }}
              >
                <ShieldCheck size={20} style={{ color: "var(--m3-primary)" }} />
              </div>
              <span className="text-xl font-medium" style={{ color: "var(--m3-on-surface)" }}>
                check<span style={{ color: "var(--m3-primary)" }}>ai</span>
              </span>
            </div>

            {!enviado ? (
              <>
                <h1 className="text-2xl font-medium text-center mb-2" style={{ color: "var(--m3-on-surface)" }}>
                  <span style={{ color: "var(--m3-primary)" }}>Esqueceu</span> sua senha?
                </h1>
                <p className="text-sm text-center mb-8" style={{ color: "var(--m3-on-surface-variant)" }}>
                  Informe seu e-mail para receber um link de redefinição de senha.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label
                      style={{ fontSize: "14px", fontWeight: 500, color: "var(--m3-on-surface)", marginBottom: "8px", display: "block" }}
                    >
                      E-mail
                    </label>
                    <div style={inputBase}>
                      <Mail size={16} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={inputStyle}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {error && (
                    <p style={{ fontSize: "13px", color: "#ef4444", textAlign: "center", margin: 0 }}>
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="w-full py-4 rounded-xl text-base font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                    style={{ backgroundColor: "var(--m3-primary)", color: "#F2EEED" }}
                  >
                    {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "var(--m3-outline)" }} />
                  <span style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>ou</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "var(--m3-outline)" }} />
                </div>

                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-150 hover:bg-white/4"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--m3-primary)",
                  }}
                >
                  <ArrowLeft size={16} />
                  Voltar para login
                </button>

                {/* Security note */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginTop: "20px",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid var(--m3-outline)",
                  }}
                >
                  <ShieldCheck size={16} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", lineHeight: "1.5", margin: 0 }}>
                    Enviaremos instruções para redefinir sua senha com segurança.
                  </p>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--m3-primary-container)" }}>
                  <CheckCircle2 size={32} style={{ color: "var(--m3-primary)" }} />
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--m3-on-surface)", margin: 0 }}>
                  Verifique seu e-mail
                </h2>
                <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)", lineHeight: "1.6", margin: 0 }}>
                  Se houver uma conta associada a <strong style={{ color: "var(--m3-on-surface)" }}>{email}</strong>,
                  você receberá um link para redefinir sua senha em breve.
                </p>
                <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)", margin: 0 }}>
                  O link expira em 1 hora. Verifique também a pasta de spam.
                </p>
                <button
                  type="button"
                  onClick={onGoToLogin}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "var(--m3-primary)", color: "#F2EEED", border: "none", cursor: "pointer" }}
                >
                  <ArrowLeft size={16} />
                  Voltar para login
                </button>
              </div>
            )}
          </div>

          {/* Right — Marketing */}
          <div
            style={{
              padding: "48px 40px",
              backgroundColor: "var(--m3-surface)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "28px",
            }}
          >
            <div>
              <h2 className="text-2xl font-medium leading-tight mb-3" style={{ color: "var(--m3-on-surface)" }}>
                Recupere o acesso com{" "}
                <span style={{ color: "var(--m3-primary)" }}>segurança</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--m3-on-surface-variant)" }}>
                Protegemos sua conta com tecnologia avançada para garantir que somente você possa acessá-la.
              </p>
            </div>

            <RecoveryEmailPreview />

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "var(--m3-primary-container)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={17} style={{ color: "var(--m3-primary)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--m3-on-surface)", marginBottom: "2px" }}>
                      {title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--m3-on-surface-variant)", lineHeight: "1.5" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #252525", padding: "20px 0" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <ShieldCheck size={15} style={{ color: "#555" }} />
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
            Link seguro • Privacidade protegida • Acesso rápido
          </p>
        </div>
      </footer>
    </div>
  );
}
