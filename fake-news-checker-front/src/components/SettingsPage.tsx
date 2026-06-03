import { useState, useEffect } from "react";
import { Crown, ChevronDown, ChevronRight, AlertTriangle, User, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiUpdateProfile, apiChangePassword, apiClearHistory, apiDeleteAccount } from "../services/auth";

type SettingsTab = "principal" | "seguranca" | "notificacoes" | "privacidade" | "dados" | "integracoes";

const TABS: { key: SettingsTab; label: string }[] = [
  { key: "principal", label: "Principal" },
  { key: "seguranca", label: "Segurança" },
  { key: "notificacoes", label: "Notificações" },
  { key: "privacidade", label: "Privacidade" },
  { key: "dados", label: "Dados" },
  { key: "integracoes", label: "Integrações" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
      backgroundColor: checked ? "var(--m3-primary)" : "rgba(255,255,255,0.15)",
      position: "relative", transition: "background-color 0.2s", flexShrink: 0, padding: 0,
    }}>
      <div style={{
        position: "absolute", top: "3px", left: checked ? "23px" : "3px",
        width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "white",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: "14px", backgroundColor: "var(--m3-surface-container)", border: "1px solid var(--m3-outline)", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--m3-outline)" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--m3-on-surface)" }}>{title}</p>
        {subtitle && <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>{subtitle}</p>}
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "6px", fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, placeholder, type = "text", onChange }: { value: string; placeholder?: string; type?: string; onChange?: (v: string) => void }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%", padding: "10px 14px", borderRadius: "10px",
        border: "1px solid var(--m3-outline)", backgroundColor: "var(--m3-surface)",
        color: "var(--m3-on-surface)", fontSize: "14px", outline: "none", boxSizing: "border-box",
      }}
    />
  );
}

function PasswordInput({ value, placeholder, onChange }: { value: string; placeholder?: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
      borderRadius: "10px", border: "1px solid var(--m3-outline)", backgroundColor: "var(--m3-surface)",
    }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "14px", color: "var(--m3-on-surface)", minWidth: 0 }}
      />
      <button type="button" onClick={() => setShow((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
        {show ? <EyeOff size={16} style={{ color: "var(--m3-on-surface-variant)" }} /> : <Eye size={16} style={{ color: "var(--m3-on-surface-variant)" }} />}
      </button>
    </div>
  );
}

function PreferenceRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "14px 0", borderBottom: "1px solid var(--m3-outline)" }}>
      <div>
        <p style={{ fontSize: "14px", color: "var(--m3-on-surface)", fontWeight: 500 }}>{label}</p>
        {description && <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

function FeedbackMsg({ type, msg }: { type: "success" | "error"; msg: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: "13px", color: type === "success" ? "#22c55e" : "#ef4444", marginTop: "8px" }}>{msg}</p>
  );
}

// ─── Aba Principal ────────────────────────────────────────────────────────────
function AbaP({ initials, onNavigatePlan }: { initials: string; onNavigatePlan?: () => void }) {
  const { user, token, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.nome ?? "", email: user?.email ?? "" });
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [prefs, setPrefs] = useState({ theme: true, confidence: true, notifications: false, tips: true });

  // Sincroniza quando user muda no contexto
  useEffect(() => {
    if (user) setForm({ name: user.nome, email: user.email });
  }, [user]);

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    setSaveMsg(null);
    try {
      const updated = await apiUpdateProfile(token, { nome: form.name, email: form.email });
      updateUser(updated);
      setSaveMsg({ type: "success", text: "Alterações salvas com sucesso!" });
    } catch (err) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (!token) return;
    if (!confirm("Tem certeza? Esta ação removerá todas as suas verificações e é irreversível.")) return;
    try {
      await apiClearHistory(token);
      alert("Histórico limpo com sucesso.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao limpar histórico.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    const confirmed = confirm("Tem certeza? Sua conta e todos os dados serão excluídos permanentemente. Esta ação é irreversível.");
    if (!confirmed) return;
    try {
      await apiDeleteAccount(token);
      logout();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir conta.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
      {/* Left */}
      <div style={{ flex: "2 1 340px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <SectionCard title="Informações da conta" subtitle="Edite seus dados pessoais e informações de perfil.">
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              backgroundColor: "var(--m3-primary-container)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: 700, color: "var(--m3-primary)", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--m3-on-surface)" }}>{form.name}</p>
              <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>{form.email}</p>
            </div>
          </div>

          <FieldRow label="Nome completo">
            <TextInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          </FieldRow>
          <FieldRow label="E-mail">
            <TextInput value={form.email} type="email" onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
          </FieldRow>

          {saveMsg && <FeedbackMsg type={saveMsg.type} msg={saveMsg.text} />}

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              marginTop: "8px", padding: "10px 20px", borderRadius: "10px", border: "none",
              backgroundColor: "var(--m3-primary)", color: "var(--m3-on-primary)",
              fontSize: "14px", fontWeight: 600, cursor: "pointer", opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </button>
        </SectionCard>

        {/* Danger zone */}
        <div style={{ borderRadius: "14px", border: "1px solid rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={16} style={{ color: "#ef4444" }} />
              <p style={{ fontSize: "15px", fontWeight: 600, color: "#ef4444" }}>Zona de perigo</p>
            </div>
            <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>Cuidado com as ações abaixo.</p>
          </div>
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { title: "Limpar o histórico", desc: "Remove todas as verificações do seu histórico.", btn: "Limpar dados", action: handleClearHistory },
              { title: "Excluir sua conta", desc: "Exclui permanentemente sua conta e todos os dados.", btn: "Excluir conta", action: handleDeleteAccount },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--m3-on-surface)" }}>{item.title}</p>
                  <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>{item.desc}</p>
                </div>
                <button
                  onClick={item.action}
                  style={{
                    padding: "7px 14px", borderRadius: "8px", border: "1px solid #ef4444",
                    backgroundColor: "transparent", color: "#ef4444", fontSize: "13px",
                    fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  {item.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <SectionCard title="Plano atual" subtitle="Plano atual e método de pagamento.">
          <div style={{ borderRadius: "12px", padding: "16px", marginBottom: "16px", backgroundColor: "rgba(255,55,132,0.08)", border: "1px solid rgba(255,55,132,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "var(--m3-primary-container)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Crown size={16} style={{ color: "var(--m3-primary)" }} />
              </div>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--m3-primary)" }}>Pro</p>
            </div>
            <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>Acesse todos os recursos avançados do CheckAI.</p>
          </div>
          <button
            onClick={onNavigatePlan}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--m3-primary)",
              backgroundColor: "transparent", color: "var(--m3-primary)", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            Gerenciar plano
            <ChevronRight size={14} />
          </button>
        </SectionCard>

        <SectionCard title="Preferências gerais" subtitle="Personalize sua experiência no CheckAI.">
          <PreferenceRow label="Idioma" description="Idioma da interface">
            <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--m3-outline)", backgroundColor: "var(--m3-surface)", color: "var(--m3-on-surface)", fontSize: "13px", cursor: "pointer" }}>
              Português (Brasil) <ChevronDown size={12} />
            </button>
          </PreferenceRow>
          <PreferenceRow label="Tema de aplicação" description="Aparência escura ou clara">
            <Toggle checked={prefs.theme} onChange={() => setPrefs((p) => ({ ...p, theme: !p.theme }))} />
          </PreferenceRow>
          <PreferenceRow label="Nível de confiança" description="Mostrar indicador de confiança">
            <Toggle checked={prefs.confidence} onChange={() => setPrefs((p) => ({ ...p, confidence: !p.confidence }))} />
          </PreferenceRow>
          <PreferenceRow label="Notificações" description="Receber alertas de verificações">
            <Toggle checked={prefs.notifications} onChange={() => setPrefs((p) => ({ ...p, notifications: !p.notifications }))} />
          </PreferenceRow>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", paddingTop: "14px" }}>
            <div>
              <p style={{ fontSize: "14px", color: "var(--m3-on-surface)", fontWeight: 500 }}>Dicas de uso</p>
              <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>Mostrar dicas ao usar a plataforma</p>
            </div>
            <Toggle checked={prefs.tips} onChange={() => setPrefs((p) => ({ ...p, tips: !p.tips }))} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── Aba Segurança ────────────────────────────────────────────────────────────
function AbaSeguranca() {
  const { token } = useAuth();
  const [form, setForm] = useState({ atual: "", nova: "", confirma: "" });
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nova !== form.confirma) {
      setMsg({ type: "error", text: "As senhas novas não coincidem." });
      return;
    }
    if (form.nova.length < 8) {
      setMsg({ type: "error", text: "A nova senha deve ter no mínimo 8 caracteres." });
      return;
    }
    if (!token) return;
    setIsLoading(true);
    setMsg(null);
    try {
      await apiChangePassword(token, form.atual, form.nova);
      setMsg({ type: "success", text: "Senha alterada com sucesso!" });
      setForm({ atual: "", nova: "", confirma: "" });
    } catch (err) {
      setMsg({ type: "error", text: err instanceof Error ? err.message : "Erro ao alterar senha." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "560px" }}>
      <SectionCard title="Alterar senha" subtitle="Para sua segurança, insira a senha atual antes de definir uma nova.">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <FieldRow label="Senha atual">
            <PasswordInput value={form.atual} placeholder="Digite sua senha atual" onChange={(v) => setForm((f) => ({ ...f, atual: v }))} />
          </FieldRow>
          <FieldRow label="Nova senha">
            <PasswordInput value={form.nova} placeholder="Mínimo 8 caracteres" onChange={(v) => setForm((f) => ({ ...f, nova: v }))} />
          </FieldRow>
          <FieldRow label="Confirmar nova senha">
            <PasswordInput value={form.confirma} placeholder="Repita a nova senha" onChange={(v) => setForm((f) => ({ ...f, confirma: v }))} />
          </FieldRow>

          {msg && <FeedbackMsg type={msg.type} msg={msg.text} />}

          {msg?.type === "success" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#22c55e" }}>
              <CheckCircle2 size={16} />
              <span style={{ fontSize: "13px" }}>Senha atualizada com sucesso.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !form.atual || !form.nova || !form.confirma}
            style={{
              padding: "10px 20px", borderRadius: "10px", border: "none",
              backgroundColor: "var(--m3-primary)", color: "var(--m3-on-primary)",
              fontSize: "14px", fontWeight: 600, cursor: "pointer",
              opacity: (isLoading || !form.atual || !form.nova || !form.confirma) ? 0.5 : 1,
              alignSelf: "flex-start",
            }}
          >
            {isLoading ? "Salvando..." : "Alterar senha"}
          </button>
        </form>
      </SectionCard>

      <div style={{ marginTop: "16px", padding: "16px", borderRadius: "12px", border: "1px solid var(--m3-outline)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <Lock size={15} style={{ color: "var(--m3-on-surface-variant)" }} />
          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--m3-on-surface)" }}>Dicas de segurança</p>
        </div>
        <ul style={{ paddingLeft: "20px", margin: 0 }}>
          {["Use letras maiúsculas, minúsculas, números e símbolos.", "Evite senhas reutilizadas em outros serviços.", "Nunca compartilhe sua senha com ninguém."].map((tip) => (
            <li key={tip} style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "4px" }}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
interface SettingsPageProps {
  onNavigatePlan?: () => void;
}

export function SettingsPage({ onNavigatePlan }: SettingsPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("principal");

  const initials = user?.nome
    ? user.nome.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("")
    : "?";

  return (
    <div style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "4px" }}>Configurações</h1>
        <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>Gerencie suas preferências, segurança e dados da conta.</p>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--m3-outline)", marginBottom: "24px", overflowX: "auto" }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "10px 18px", fontSize: "14px",
              fontWeight: active ? 600 : 400,
              color: active ? "var(--m3-primary)" : "var(--m3-on-surface-variant)",
              background: "none", border: "none",
              borderBottom: active ? "2px solid var(--m3-primary)" : "2px solid transparent",
              cursor: "pointer", marginBottom: "-1px", whiteSpace: "nowrap", transition: "color 0.15s",
            }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "principal" && <AbaP initials={initials} onNavigatePlan={onNavigatePlan} />}
      {activeTab === "seguranca" && <AbaSeguranca />}
      {activeTab !== "principal" && activeTab !== "seguranca" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "40vh", gap: "8px" }}>
          <p style={{ fontSize: "18px", fontWeight: 500, color: "var(--m3-on-surface)" }}>{TABS.find((t) => t.key === activeTab)?.label}</p>
          <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>Em construção</p>
        </div>
      )}
    </div>
  );
}
