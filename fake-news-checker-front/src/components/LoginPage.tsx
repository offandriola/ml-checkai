import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Home,
  Clock,
  FileText,
  Settings,
  BarChart2,
  Shield,
  History,
} from "lucide-react";
import { apiLogin, apiMe } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

interface LoginPageProps {
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppPreview() {
  const items = [
    { icon: CheckCircle2, color: "#22c55e", label: "Real", bgColor: "rgba(34,197,94,0.15)", textColor: "#22c55e" },
    { icon: XCircle, color: "#ef4444", label: "Falso", bgColor: "rgba(239,68,68,0.15)", textColor: "#ef4444" },
    { icon: HelpCircle, color: "#f59e0b", label: "Inconclusivo", bgColor: "rgba(245,158,11,0.15)", textColor: "#f59e0b" },
  ];

  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid var(--m3-outline)",
        backgroundColor: "var(--m3-surface)",
      }}
    >
      {/* Mini header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: "1px solid var(--m3-outline)",
        }}
      >
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--m3-primary-container)",
          }}
        >
          <ShieldCheck size={13} style={{ color: "var(--m3-primary)" }} />
        </div>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--m3-on-surface)" }}>
          check<span style={{ color: "var(--m3-primary)" }}>ai</span>
        </span>
      </div>

      <div style={{ display: "flex" }}>
        {/* Mini sidebar */}
        <div
          style={{
            width: "44px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "12px 0",
            borderRight: "1px solid var(--m3-outline)",
          }}
        >
          {[
            { Icon: Home, active: true },
            { Icon: Clock, active: false },
            { Icon: FileText, active: false },
            { Icon: Settings, active: false },
          ].map(({ Icon, active }, i) => (
            <div
              key={i}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: active ? "var(--m3-primary-container)" : "transparent",
              }}
            >
              <Icon size={15} style={{ color: active ? "var(--m3-primary)" : "var(--m3-on-surface-variant)" }} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "12px 14px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "10px" }}>
            Últimas verificações
          </p>
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: i < items.length - 1 ? "8px" : 0,
                }}
              >
                <Icon size={16} style={{ color: item.color, flexShrink: 0 }} />
                <div
                  style={{
                    flex: 1,
                    height: "8px",
                    borderRadius: "4px",
                    backgroundColor: "var(--m3-outline)",
                  }}
                />
                <div
                  style={{
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "10px",
                    fontWeight: 600,
                    backgroundColor: item.bgColor,
                    color: item.textColor,
                    flexShrink: 0,
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LoginPage({ onGoToRegister, onGoToForgotPassword, onLoginSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const { access_token } = await apiLogin(email, senha);
      const user = await apiMe(access_token);
      login(access_token, user);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
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

  const labelStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--m3-on-surface)",
    marginBottom: "8px",
    display: "block",
  };

  const features = [
    { icon: Shield, title: "Seus dados protegidos", desc: "Segurança e privacidade levadas a sério." },
    { icon: History, title: "Histórico completo", desc: "Acompanhe todas as suas verificações." },
    { icon: BarChart2, title: "Resultados detalhados", desc: "Entenda o porquê de cada veredito." },
  ];

  return (
    <div
      className="dark min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--m3-surface)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{ backgroundColor: "var(--m3-surface)", borderColor: "var(--m3-outline)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
          <nav className="items-center hidden md:flex" style={{ gap: "2rem" }}>
            {["Início", "Planos", "Sobre o CheckAI"].map((label) => (
              <button key={label} className="py-1 text-sm font-medium" style={{ color: "var(--m3-on-surface-variant)" }}>
                {label}
              </button>
            ))}
          </nav>
          <button
            onClick={onGoToRegister}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 hover:bg-white/8"
            style={{ color: "var(--m3-primary)", borderColor: "var(--m3-primary)" }}
          >
            Criar conta
          </button>
        </div>
      </header>

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

            <h1 className="text-2xl font-medium text-center mb-2" style={{ color: "var(--m3-on-surface)" }}>
              <span style={{ color: "var(--m3-primary)" }}>Entrar</span> na sua conta
            </h1>
            <p className="text-sm text-center mb-8" style={{ color: "var(--m3-on-surface-variant)" }}>
              Acesse para verificar informações e acompanhar seu histórico.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>E-mail</label>
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

              <div>
                <label style={labelStyle}>Senha</label>
                <div style={inputBase}>
                  <Lock size={16} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
                  <input
                    type={showSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={inputStyle}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                  >
                    {showSenha
                      ? <EyeOff size={16} style={{ color: "var(--m3-on-surface-variant)" }} />
                      : <Eye size={16} style={{ color: "var(--m3-on-surface-variant)" }} />
                    }
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: "-8px" }}>
                <button
                  type="button"
                  onClick={onGoToForgotPassword}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "var(--m3-primary)", padding: 0 }}
                >
                  Esqueci minha senha
                </button>
              </div>

              {error && (
                <p style={{ fontSize: "13px", color: "#ef4444", textAlign: "center", margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || !email.trim() || !senha.trim()}
                className="w-full py-4 rounded-xl text-base font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: "var(--m3-primary)", color: "var(--m3-on-primary)" }}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "20px 0",
              }}
            >
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--m3-outline)" }} />
              <span style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>ou</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--m3-outline)" }} />
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-medium transition-all duration-150 hover:bg-white/4"
              style={{
                borderColor: "var(--m3-outline)",
                color: "var(--m3-on-surface)",
                backgroundColor: "transparent",
              }}
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <p className="text-center text-sm mt-6" style={{ color: "var(--m3-on-surface-variant)" }}>
              Ainda não tem uma conta?{" "}
              <button
                type="button"
                onClick={onGoToRegister}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--m3-primary)", fontWeight: 500, padding: 0 }}
              >
                Criar conta
              </button>
            </p>
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
                Informação confiável começa com o{" "}
                <span style={{ color: "var(--m3-primary)" }}>CheckAI.</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--m3-on-surface-variant)" }}>
                Faça verificações, acompanhe seu histórico e gerencie seu plano em um só lugar.
              </p>
            </div>

            <AppPreview />

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
                    <p className="text-xs" style={{ color: "var(--m3-on-surface-variant)" }}>
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
      <footer className="border-t py-5" style={{ borderColor: "var(--m3-outline)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center gap-2">
          <ShieldCheck size={14} style={{ color: "var(--m3-on-surface-variant)" }} />
          <p className="text-sm" style={{ color: "var(--m3-on-surface-variant)" }}>
            Cobrança mensal • Cancelamento simples • Seus dados protegidos
          </p>
        </div>
      </footer>
    </div>
  );
}
