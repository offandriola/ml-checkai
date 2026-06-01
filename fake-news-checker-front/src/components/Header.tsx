import { useState } from "react";
import { ShieldCheck, Bell, Crown, LogOut, ChevronDown, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  showNav?: boolean;
  onLoginClick?: () => void;
  onLogoClick?: () => void;
}

export function Header({ showNav = false, onLoginClick, onLogoClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // User initials
  const initials = user?.nome
    ? user.nome
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "?";

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 h-16 w-full"
      style={{
        backgroundColor: "var(--m3-surface)",
        borderBottom: "1px solid var(--m3-outline)",
      }}
    >
      {/* Lado Esquerdo: Logo */}
      <button
        onClick={onLogoClick}
        className="flex items-center gap-2"
        aria-label="CheckAI - Início"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: "var(--m3-primary-container)",
          }}
        >
          <ShieldCheck size={20} style={{ color: "var(--m3-primary)" }} />
        </div>
        <span
          className="text-xl font-medium"
          style={{ color: "var(--m3-on-surface)" }}
        >
          check<span style={{ color: "var(--m3-primary)" }}>ai</span>
        </span>
      </button>

      {/* Centro: Nav Links (Opcional) */}
      {showNav && !isAuthenticated && (
        <nav
          className="hidden md:flex items-center"
          style={{ gap: "2rem" }}
        >
          <button className="relative py-1 text-sm font-medium" style={{ color: "var(--m3-primary)" }}>
            Início
            <span
              className="absolute bottom-0 left-0 w-full rounded-full"
              style={{ height: "2px", backgroundColor: "var(--m3-primary)" }}
            />
          </button>
          <button
            className="py-1 text-sm font-medium transition-colors hover:text-[var(--m3-on-surface)]"
            style={{ color: "var(--m3-on-surface-variant)" }}
          >
            Planos
          </button>
          <button
            className="py-1 text-sm font-medium transition-colors hover:text-[var(--m3-on-surface)]"
            style={{ color: "var(--m3-on-surface-variant)" }}
          >
            Sobre o CheckAI
          </button>
        </nav>
      )}

      {/* Lado Direito: Ações */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full border"
              style={{
                backgroundColor: "var(--m3-primary-container)",
                borderColor: "rgba(255,55,132,0.3)",
              }}
            >
              <Crown size={12} style={{ color: "var(--m3-primary)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--m3-primary)" }}>
                Pro
              </span>
            </div>

            <button
              className="flex items-center justify-center rounded-full w-9 h-9 border-none cursor-pointer transition-colors"
              style={{
                backgroundColor: "transparent",
                color: "var(--m3-on-surface-variant)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <Bell size={18} />
            </button>

            {/* Menu do Usuário */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded-full border cursor-pointer transition-colors"
                style={{
                  borderColor: "var(--m3-outline)",
                  backgroundColor: "transparent",
                  color: "var(--m3-on-surface)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <div
                  className="flex items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor: "var(--m3-primary-container)",
                    color: "var(--m3-primary)",
                  }}
                >
                  {initials}
                </div>
                <span className="text-sm font-medium">
                  {user?.nome ?? "Usuário"}
                </span>
                <ChevronDown size={14} style={{ color: "var(--m3-on-surface-variant)" }} />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    className="absolute right-0 z-50 min-w-[200px] rounded-2xl border p-2 shadow-2xl"
                    style={{
                      top: "calc(100% + 8px)",
                      borderColor: "var(--m3-outline)",
                      backgroundColor: "var(--m3-surface-container)",
                    }}
                  >
                    <div
                      className="px-3 py-2 mb-1 border-b"
                      style={{ borderColor: "var(--m3-outline)" }}
                    >
                      <p className="text-sm font-semibold m-0" style={{ color: "var(--m3-on-surface)" }}>
                        {user?.nome}
                      </p>
                      <p className="text-xs m-0" style={{ color: "var(--m3-on-surface-variant)" }}>
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-none cursor-pointer text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: "transparent",
                        color: "#ef4444",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <LogOut size={15} />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 hover:bg-white/5"
            style={{
              color: "var(--m3-on-surface)",
              borderColor: "var(--m3-outline)",
              backgroundColor: "transparent",
            }}
          >
            <User size={16} />
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
