import { ShieldCheck, ArrowLeft, ArrowRight, UserPlus } from "lucide-react";

interface GuestLimitModalProps {
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onClose: () => void;
}

export function GuestLimitModal({ onGoToRegister, onGoToLogin, onClose }: GuestLimitModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "guestModalFadeIn 0.25s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "440px",
          margin: "0 16px",
          borderRadius: "20px",
          padding: "36px 32px 32px",
          backgroundColor: "#111111",
          border: "1.5px solid rgba(255, 55, 132, 0.35)",
          boxShadow: "0 0 60px rgba(255, 55, 132, 0.12), 0 24px 48px rgba(0,0,0,0.5)",
          animation: "guestModalSlideUp 0.3s ease",
          textAlign: "center",
        }}
      >
        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            color: "#9E9E9E",
            fontSize: "13px",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "8px",
            transition: "color 0.15s, background-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#F2EEED";
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9E9E9E";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        {/* Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            backgroundColor: "rgba(255, 55, 132, 0.12)",
            border: "2px solid rgba(255, 55, 132, 0.25)",
          }}
        >
          <ShieldCheck size={34} style={{ color: "#FF3784" }} />
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#F2EEED",
            marginBottom: "10px",
            lineHeight: 1.3,
          }}
        >
          Crie sua conta para continuar verificando
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "14px",
            color: "#9E9E9E",
            lineHeight: 1.6,
            marginBottom: "28px",
            maxWidth: "340px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Você já utilizou sua verificação gratuita. Crie uma conta para verificar quantas informações quiser.
        </p>

        {/* Register button */}
        <button
          onClick={onGoToRegister}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "14px 20px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#FF3784",
            color: "#F2EEED",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.15s, transform 0.15s",
            marginBottom: "12px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.88";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <UserPlus size={17} />
          Criar conta grátis
          <ArrowRight size={16} />
        </button>

        {/* Login link */}
        <button
          onClick={onGoToLogin}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "12px 20px",
            borderRadius: "12px",
            border: "1px solid #252525",
            backgroundColor: "transparent",
            color: "#9E9E9E",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#FF3784";
            e.currentTarget.style.color = "#F2EEED";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#252525";
            e.currentTarget.style.color = "#9E9E9E";
          }}
        >
          Já tenho uma conta
        </button>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes guestModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes guestModalSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
