import { useState } from "react";
import { ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { apiRedefinirSenha } from "../services/auth";

interface ResetPasswordPageProps {
  token: string;
  onGoToLogin: () => void;
}

export function ResetPasswordPage({ token, onGoToLogin }: ResetPasswordPageProps) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const senhaValida = novaSenha.length >= 8;
  const senhasIguais = novaSenha === confirmar;
  const podeEnviar = senhaValida && senhasIguais && confirmar.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podeEnviar) return;
    setIsLoading(true);
    setError("");
    try {
      await apiRedefinirSenha(token, novaSenha);
      setSucesso(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao redefinir senha";
      if (msg.toLowerCase().includes("inválido") || msg.toLowerCase().includes("expirado") || msg.toLowerCase().includes("utilizado")) {
        setError("Este link de recuperação é inválido, expirado ou já foi utilizado. Solicite um novo link.");
      } else {
        setError(msg);
      }
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

  return (
    <div className="dark min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#070707", padding: "32px 16px" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "20px",
          border: "1.5px solid var(--m3-primary)",
          boxShadow: "0 0 60px rgba(255,55,132,0.10)",
          padding: "48px 40px",
          backgroundColor: "var(--m3-surface-container)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center">
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

        {sucesso ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--m3-primary-container)" }}>
              <CheckCircle2 size={32} style={{ color: "var(--m3-primary)" }} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--m3-on-surface)", margin: 0 }}>
              Senha redefinida com sucesso!
            </h2>
            <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)", lineHeight: "1.6", margin: 0 }}>
              Sua senha foi alterada. Faça login para continuar.
            </p>
            <button
              type="button"
              onClick={onGoToLogin}
              className="flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "var(--m3-primary)", color: "#F2EEED", border: "none", cursor: "pointer" }}
            >
              <ArrowLeft size={16} />
              Ir para login
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: "center" }}>
              <h1 className="text-2xl font-medium mb-2" style={{ color: "var(--m3-on-surface)" }}>
                Redefinir <span style={{ color: "var(--m3-primary)" }}>senha</span>
              </h1>
              <p className="text-sm" style={{ color: "var(--m3-on-surface-variant)" }}>
                Escolha uma nova senha segura para sua conta.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--m3-on-surface)", marginBottom: "8px", display: "block" }}>
                  Nova senha
                </label>
                <div style={inputBase}>
                  <KeyRound size={16} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    style={inputStyle}
                    minLength={8}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--m3-on-surface-variant)", display: "flex", padding: 0 }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {novaSenha.length > 0 && !senhaValida && (
                  <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>A senha deve ter pelo menos 8 caracteres.</p>
                )}
              </div>

              <div>
                <label style={{ fontSize: "14px", fontWeight: 500, color: "var(--m3-on-surface)", marginBottom: "8px", display: "block" }}>
                  Confirmar nova senha
                </label>
                <div style={inputBase}>
                  <KeyRound size={16} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    style={inputStyle}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--m3-on-surface-variant)", display: "flex", padding: 0 }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmar.length > 0 && !senhasIguais && (
                  <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>As senhas não coincidem.</p>
                )}
              </div>

              {error && (
                <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <p style={{ fontSize: "13px", color: "#ef4444", margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !podeEnviar}
                className="w-full py-4 rounded-xl text-base font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: "var(--m3-primary)", color: "#F2EEED" }}
              >
                {isLoading ? "Redefinindo..." : "Redefinir senha"}
              </button>
            </form>

            <button
              type="button"
              onClick={onGoToLogin}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm"
              style={{ background: "none", border: "none", color: "var(--m3-primary)", cursor: "pointer" }}
            >
              <ArrowLeft size={14} />
              Voltar para login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
