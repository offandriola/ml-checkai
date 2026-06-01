import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  BarChart2,
  Zap,
} from "lucide-react";
import { apiRegister } from "../services/auth";
import { apiLogin, apiMe } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";

interface RegisterPageProps {
  onGoToLogin: () => void;
  onRegisterSuccess: () => void;
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

export function RegisterPage({ onGoToLogin, onRegisterSuccess }: RegisterPageProps) {
  const { login } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    if (senha.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await apiRegister(nome, email, senha);
      const { access_token } = await apiLogin(email, senha);
      const user = await apiMe(access_token);
      login(access_token, user);
      onRegisterSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
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

  const benefits = [
    {
      icon: CheckCircle2,
      title: "Verificações ilimitadas",
      desc: "Analise quantas notícias quiser sem restrições.",
    },
    {
      icon: BarChart2,
      title: "Dashboard completo",
      desc: "Acompanhe estatísticas e histórico detalhado.",
    },
    {
      icon: Zap,
      title: "Resultados em segundos",
      desc: "Tecnologia de IA para análise rápida e precisa.",
    },
  ];

  return (
    <div
      className="dark min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--m3-surface)" }}
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

            <h1 className="text-2xl font-medium text-center mb-2" style={{ color: "var(--m3-on-surface)" }}>
              <span style={{ color: "var(--m3-primary)" }}>Criar</span> sua conta
            </h1>
            <p className="text-sm text-center mb-8" style={{ color: "var(--m3-on-surface-variant)" }}>
              Junte-se ao CheckAI e comece a verificar informações agora.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Nome completo</label>
                <div style={inputBase}>
                  <User size={16} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    style={inputStyle}
                    required
                    minLength={2}
                    autoComplete="name"
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 8 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={inputStyle}
                    required
                    autoComplete="new-password"
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

              <div>
                <label style={labelStyle}>Confirmar senha</label>
                <div style={inputBase}>
                  <Lock size={16} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repita sua senha"
                    value={confirmSenha}
                    onChange={(e) => setConfirmSenha(e.target.value)}
                    style={inputStyle}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                  >
                    {showConfirm
                      ? <EyeOff size={16} style={{ color: "var(--m3-on-surface-variant)" }} />
                      : <Eye size={16} style={{ color: "var(--m3-on-surface-variant)" }} />
                    }
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ fontSize: "13px", color: "#ef4444", textAlign: "center", margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || !nome.trim() || !email.trim() || !senha.trim() || !confirmSenha.trim()}
                className="w-full py-4 rounded-xl text-base font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: "var(--m3-primary)", color: "var(--m3-on-primary)", marginTop: "4px" }}
              >
                {isLoading ? "Criando conta..." : "Criar conta"}
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
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border text-sm font-medium transition-all duration-150 hover:bg-white/4"
              style={{ borderColor: "var(--m3-outline)", color: "var(--m3-on-surface)", backgroundColor: "transparent" }}
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <p className="text-center text-sm mt-6" style={{ color: "var(--m3-on-surface-variant)" }}>
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={onGoToLogin}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--m3-primary)", fontWeight: 500, padding: 0 }}
              >
                Entrar
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
                Comece a verificar informações com{" "}
                <span style={{ color: "var(--m3-primary)" }}>inteligência.</span>
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--m3-on-surface-variant)" }}>
                Crie sua conta gratuitamente e tenha acesso a todas as ferramentas de verificação do CheckAI.
              </p>
            </div>

            {/* Benefits */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "var(--m3-primary-container)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} style={{ color: "var(--m3-primary)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--m3-on-surface)", marginBottom: "4px" }}>
                      {title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--m3-on-surface-variant)", lineHeight: "1.5" }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid var(--m3-outline)",
                backgroundColor: "var(--m3-surface-container)",
              }}
            >
              <ShieldCheck size={18} style={{ color: "var(--m3-primary)", flexShrink: 0 }} />
              <p className="text-xs" style={{ color: "var(--m3-on-surface-variant)", lineHeight: "1.5" }}>
                Seus dados estão protegidos com criptografia de ponta. Nunca compartilhamos suas informações.
              </p>
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
