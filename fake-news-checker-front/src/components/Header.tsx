import { useState } from "react";
import { Bell, Crown, LogOut, ChevronDown, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoSvg from "../../assets/icon.svg";

interface HeaderProps {
  showNav?: boolean;
  onLoginClick?: () => void;
  onLogoClick?: () => void;
}

export function Header({ showNav = false, onLoginClick, onLogoClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      className="sticky top-0 z-30 w-full"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: "64px",
        backgroundColor: "#070707",
        borderBottom: "1px solid #252525",
      }}
    >
      {/* Logo — ancorada à esquerda */}
      <button
        onClick={onLogoClick}
        aria-label="CheckAI - Início"
        style={{
          position: "absolute",
          left: "32px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <img
          src={logoSvg}
          alt="CheckAI"
          style={{ width: "36px", height: "36px", flexShrink: 0 }}
        />
        <span
          style={{
            fontSize: "22px",
            fontWeight: 600,
            color: "#F2EEED",
            lineHeight: 1,
          }}
        >
          check<span style={{ color: "#FF3784" }}>ai</span>
        </span>
      </button>

      {/* Nav — centralizado no meio real da tela */}
      {showNav && !isAuthenticated && (
        <nav
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            style={{
              position: "relative",
              paddingTop: "4px",
              paddingBottom: "4px",
              paddingLeft: "20px",
              paddingRight: "20px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#FF3784",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Início
            <span
              style={{
                position: "absolute",
                bottom: 0,
                left: "20px",
                right: "20px",
                height: "2px",
                borderRadius: "9999px",
                backgroundColor: "#FF3784",
              }}
            />
          </button>
          <button
            style={{
              paddingTop: "4px",
              paddingBottom: "4px",
              paddingLeft: "20px",
              paddingRight: "20px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#9E9E9E",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Planos
          </button>
          <button
            style={{
              paddingTop: "4px",
              paddingBottom: "4px",
              paddingLeft: "20px",
              paddingRight: "20px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#9E9E9E",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Sobre o CheckAI
          </button>
        </nav>
      )}

      {/* Ações — ancoradas à direita */}
      <div
        style={{
          position: "absolute",
          right: "32px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {isAuthenticated ? (
          <>
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full border"
              style={{
                backgroundColor: "rgba(255,55,132,0.14)",
                borderColor: "rgba(255,55,132,0.3)",
              }}
            >
              <Crown size={12} style={{ color: "#FF3784" }} />
              <span className="text-xs font-semibold" style={{ color: "#FF3784" }}>
                Pro
              </span>
            </div>

            <button
              className="flex items-center justify-center rounded-full w-9 h-9"
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#9E9E9E",
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
                className="flex items-center gap-2 px-2 py-1 rounded-full border cursor-pointer"
                style={{
                  borderColor: "#252525",
                  backgroundColor: "transparent",
                  color: "#F2EEED",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <div
                  className="flex items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor: "rgba(255,55,132,0.18)",
                    color: "#FF3784",
                  }}
                >
                  {initials}
                </div>
                <span className="text-sm font-medium">{user?.nome ?? "Usuário"}</span>
                <ChevronDown size={14} style={{ color: "#9E9E9E" }} />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div
                    className="absolute right-0 z-50 min-w-[200px] rounded-2xl border p-2 shadow-2xl"
                    style={{
                      top: "calc(100% + 8px)",
                      borderColor: "#252525",
                      backgroundColor: "#111111",
                    }}
                  >
                    <div className="px-3 py-2 mb-1 border-b" style={{ borderColor: "#252525" }}>
                      <p className="text-sm font-semibold m-0" style={{ color: "#F2EEED" }}>
                        {user?.nome}
                      </p>
                      <p className="text-xs m-0" style={{ color: "#9E9E9E" }}>
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-none cursor-pointer text-sm font-medium"
                      style={{ backgroundColor: "transparent", color: "#ef4444" }}
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: "#FF3784",
              color: "#F2EEED",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e61e6c"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FF3784"; }}
          >
            <User size={16} />
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
