import {
  ShieldCheck,
  PenLine,
  History,
  BarChart2,
  Layers,
  Settings,
  Crown,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export type AppPage = "home" | "history" | "results" | "plan" | "settings";

interface NavItem {
  page: AppPage;
  label: string;
  icon: typeof PenLine;
}

const NAV_ITEMS: NavItem[] = [
  { page: "home", label: "Nova verificação", icon: PenLine },
  { page: "history", label: "Histórico", icon: History },
  { page: "results", label: "Resultados", icon: BarChart2 },
  { page: "plan", label: "Plano", icon: Layers },
];

interface SidebarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--m3-surface-container)",
        borderRight: "1px solid var(--m3-outline)",
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 12px" }}>
        <button
          onClick={() => onNavigate("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--m3-primary-container)",
            }}
          >
            <ShieldCheck size={18} style={{ color: "var(--m3-primary)" }} />
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 500,
              color: "var(--m3-on-surface)",
            }}
          >
            check<span style={{ color: "var(--m3-primary)" }}>ai</span>
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 8px 0" }}>
        {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                marginBottom: "2px",
                backgroundColor: active
                  ? "var(--m3-primary-container)"
                  : "transparent",
                color: active
                  ? "var(--m3-primary)"
                  : "var(--m3-on-surface-variant)",
                fontWeight: active ? 500 : 400,
                fontSize: "14px",
                textAlign: "left",
                transition: "background-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}

        {/* Separator before Configurações */}
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--m3-outline)",
            margin: "8px 4px",
          }}
        />

        <button
          onClick={() => onNavigate("settings")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            marginBottom: "2px",
            backgroundColor:
              currentPage === "settings"
                ? "var(--m3-primary-container)"
                : "transparent",
            color:
              currentPage === "settings"
                ? "var(--m3-primary)"
                : "var(--m3-on-surface-variant)",
            fontWeight: currentPage === "settings" ? 500 : 400,
            fontSize: "14px",
            textAlign: "left",
            transition: "background-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            if (currentPage !== "settings")
              e.currentTarget.style.backgroundColor =
                "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            if (currentPage !== "settings")
              e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Settings size={18} />
          Configurações
        </button>
      </nav>

      {/* Bottom Section */}
      <div style={{ padding: "8px" }}>
        {/* Plan Card */}
        <div
          style={{
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "8px",
            backgroundColor: "rgba(255,55,132,0.08)",
            border: "1px solid rgba(255,55,132,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "4px",
            }}
          >
            <Crown size={14} style={{ color: "var(--m3-primary)" }} />
            <span
              style={{
                fontSize: "11px",
                color: "var(--m3-on-surface-variant)",
              }}
            >
              Você está no plano
            </span>
          </div>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--m3-primary)",
              marginBottom: "4px",
            }}
          >
            Pro
          </p>
          <p
            style={{
              fontSize: "11px",
              color: "var(--m3-on-surface-variant)",
              lineHeight: 1.4,
              marginBottom: "10px",
            }}
          >
            Acesse todos os recursos avançados do CheckAI.
          </p>
          <button
            onClick={() => onNavigate("plan")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              borderRadius: "8px",
              border: "1px solid var(--m3-primary)",
              backgroundColor: "transparent",
              color: "var(--m3-primary)",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Gerenciar plano
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Help */}
        <div
          style={{
            borderRadius: "12px",
            padding: "12px",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid var(--m3-outline)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "4px",
            }}
          >
            <HelpCircle size={14} style={{ color: "var(--m3-on-surface-variant)" }} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--m3-on-surface)",
              }}
            >
              Precisa de ajuda?
            </span>
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "var(--m3-on-surface-variant)",
              lineHeight: 1.4,
              marginBottom: "8px",
            }}
          >
            Acesse nossa central de ajuda e tire suas dúvidas.
          </p>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--m3-primary)",
              fontSize: "12px",
              fontWeight: 500,
              padding: 0,
            }}
          >
            Abrir ajuda
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
