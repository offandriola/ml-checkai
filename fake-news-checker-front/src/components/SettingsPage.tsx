import { useState } from "react";
import { Crown, ChevronDown, ChevronRight, AlertTriangle, User } from "lucide-react";

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
    <button
      onClick={onChange}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        backgroundColor: checked ? "var(--m3-primary)" : "rgba(255,255,255,0.15)",
        position: "relative",
        transition: "background-color 0.2s",
        flexShrink: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: checked ? "23px" : "3px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "white",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: "14px",
        backgroundColor: "var(--m3-surface-container)",
        border: "1px solid var(--m3-outline)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--m3-outline)" }}>
        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--m3-on-surface)" }}>{title}</p>
        {subtitle && (
          <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>{subtitle}</p>
        )}
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

function TextInput({ value, placeholder, onChange }: { value: string; placeholder?: string; onChange?: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "10px",
        border: "1px solid var(--m3-outline)",
        backgroundColor: "var(--m3-surface)",
        color: "var(--m3-on-surface)",
        fontSize: "14px",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

function PreferenceRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "14px 0",
        borderBottom: "1px solid var(--m3-outline)",
      }}
    >
      <div>
        <p style={{ fontSize: "14px", color: "var(--m3-on-surface)", fontWeight: 500 }}>{label}</p>
        {description && (
          <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("principal");
  const [prefs, setPrefs] = useState({
    theme: true,
    confidence: true,
    notifications: false,
    tips: true,
  });
  const [form, setForm] = useState({
    name: "Lucas Martins",
    username: "lucasmartins",
    email: "lucas@email.com",
    empresa: "",
    telefone: "(11) 99999-9999",
  });

  const togglePref = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "4px" }}>
          Configurações
        </h1>
        <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>
          Gerencie suas preferências, segurança e dados da conta.
        </p>
      </div>

      {/* Sub-tabs */}
      <div
        style={{
          display: "flex",
          gap: "0",
          borderBottom: "1px solid var(--m3-outline)",
          marginBottom: "24px",
          overflowX: "auto",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--m3-primary)" : "var(--m3-on-surface-variant)",
                background: "none",
                border: "none",
                borderBottom: active ? "2px solid var(--m3-primary)" : "2px solid transparent",
                cursor: "pointer",
                marginBottom: "-1px",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "principal" && (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Left column */}
          <div style={{ flex: "2 1 340px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Account info */}
            <SectionCard
              title="Informações da conta"
              subtitle="Edite seus dados pessoais e informações de perfil."
            >
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    backgroundColor: "var(--m3-primary-container)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "var(--m3-primary)",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  LM
                </div>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--m3-on-surface)" }}>
                    {form.name}
                  </p>
                  <button
                    style={{
                      marginTop: "4px",
                      fontSize: "12px",
                      color: "var(--m3-primary)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: 0,
                    }}
                  >
                    <User size={13} /> Alterar foto
                  </button>
                </div>
              </div>

              <FieldRow label="Nome completo">
                <TextInput value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
              </FieldRow>
              <FieldRow label="Nome de usuário">
                <TextInput value={form.username} onChange={(v) => setForm((f) => ({ ...f, username: v }))} />
              </FieldRow>
              <FieldRow label="E-mail">
                <TextInput value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              </FieldRow>
              <FieldRow label="Empresa (opcional)">
                <TextInput
                  value={form.empresa}
                  placeholder="Nome da empresa"
                  onChange={(v) => setForm((f) => ({ ...f, empresa: v }))}
                />
              </FieldRow>
              <FieldRow label="Telefone">
                <TextInput value={form.telefone} onChange={(v) => setForm((f) => ({ ...f, telefone: v }))} />
              </FieldRow>

              <button
                style={{
                  marginTop: "8px",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "var(--m3-primary)",
                  color: "var(--m3-on-primary)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Salvar alterações
              </button>
            </SectionCard>

            {/* Danger zone */}
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid rgba(239,68,68,0.3)",
                backgroundColor: "rgba(239,68,68,0.05)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertTriangle size={16} style={{ color: "#ef4444" }} />
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#ef4444" }}>Zona de perigo</p>
                </div>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>
                  Cuidado com as ações abaixo.
                </p>
              </div>
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { title: "Limpar o histórico", desc: "Remove todas as verificações do seu histórico.", btn: "Limpar dados" },
                  { title: "Excluir sua conta", desc: "Exclui permanentemente sua conta e todos os dados.", btn: "Excluir conta" },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--m3-on-surface)" }}>{item.title}</p>
                      <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>{item.desc}</p>
                    </div>
                    <button
                      style={{
                        padding: "7px 14px",
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
                      {item.btn}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Current plan */}
            <SectionCard title="Plano atual" subtitle="Plano atual e método de pagamento.">
              <div
                style={{
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "16px",
                  backgroundColor: "rgba(255,55,132,0.08)",
                  border: "1px solid rgba(255,55,132,0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      backgroundColor: "var(--m3-primary-container)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Crown size={16} style={{ color: "var(--m3-primary)" }} />
                  </div>
                  <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--m3-primary)" }}>Pro</p>
                </div>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginBottom: "4px" }}>
                  Acesse todos os recursos avançados do CheckAI.
                </p>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
                  Renova em <span style={{ color: "var(--m3-on-surface)", fontWeight: 500 }}>31 de julho de 2025</span>
                </p>
              </div>
              <button
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--m3-primary)",
                  backgroundColor: "transparent",
                  color: "var(--m3-primary)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Gerenciar plano
                <ChevronRight size={14} />
              </button>
            </SectionCard>

            {/* Preferences */}
            <SectionCard title="Preferências gerais" subtitle="Personalize sua experiência no CheckAI.">
              {/* Idioma */}
              <div style={{ marginBottom: "4px" }}>
                <PreferenceRow label="Idioma" description="Idioma da interface">
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "1px solid var(--m3-outline)",
                      backgroundColor: "var(--m3-surface)",
                      color: "var(--m3-on-surface)",
                      fontSize: "13px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Português (Brasil)
                    <ChevronDown size={12} />
                  </button>
                </PreferenceRow>
                <PreferenceRow label="Tema de aplicação" description="Aparência escura ou clara">
                  <Toggle checked={prefs.theme} onChange={() => togglePref("theme")} />
                </PreferenceRow>
                <PreferenceRow label="Nível de confiança" description="Mostrar indicador de confiança">
                  <Toggle checked={prefs.confidence} onChange={() => togglePref("confidence")} />
                </PreferenceRow>
                <PreferenceRow label="Notificações" description="Receber alertas de verificações">
                  <Toggle checked={prefs.notifications} onChange={() => togglePref("notifications")} />
                </PreferenceRow>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", paddingTop: "14px" }}>
                  <div>
                    <p style={{ fontSize: "14px", color: "var(--m3-on-surface)", fontWeight: 500 }}>Dicas de uso</p>
                    <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>
                      Mostrar dicas ao usar a plataforma
                    </p>
                  </div>
                  <Toggle checked={prefs.tips} onChange={() => togglePref("tips")} />
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {activeTab !== "principal" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "40vh",
            gap: "8px",
          }}
        >
          <p style={{ fontSize: "18px", fontWeight: 500, color: "var(--m3-on-surface)" }}>
            {TABS.find((t) => t.key === activeTab)?.label}
          </p>
          <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>Em construção</p>
        </div>
      )}
    </div>
  );
}
