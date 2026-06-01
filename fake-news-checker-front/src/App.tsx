import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, Crown, LogOut } from "lucide-react";
import { Sidebar, type AppPage } from "./components/Sidebar";
import { HomePage } from "./components/HomePage";
import { HistoryPage } from "./components/HistoryPage";
import { ResultsPage } from "./components/ResultsPage";
import { SettingsPage } from "./components/SettingsPage";
import { LandingPage } from "./components/LandingPage";
import { ProcessingPage } from "./components/ProcessingPage";
import { VerdictPage } from "./components/VerdictPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { postCheck, mapApiToResult } from "./services/api";
import { apiCriarVerificacao, mapResultado } from "./services/verificacoes";
import { useAuth } from "./contexts/AuthContext";

type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

interface VerificationStep {
  id: number;
  label: string;
  completed: boolean;
}

interface Verification {
  id: string;
  content: string;
  type: "text" | "link" | "image";
  steps: VerificationStep[];
  currentStepIndex: number;
  result?: ResultType;
  timestamp: Date;
  confidence?: number;
}

type FullPage = "landing" | "processing" | "verdict" | "login" | "register" | "forgot-password" | AppPage;

const VERIFICATION_STEPS = [
  { id: 1, label: "Recebendo as informações" },
  { id: 2, label: "Interpretando as informações" },
  { id: 3, label: "Buscando fontes confiáveis sobre o tema" },
  { id: 4, label: "Verificando as informações" },
  { id: 5, label: "Processo concluído" },
];

const CONFIDENCE_BY_RESULT: Record<ResultType, number> = {
  verdadeira: 82,
  falsa: 87,
  nao_verificavel: 45,
};

const PAGE_TITLES: Record<AppPage, string> = {
  home: "Nova verificação",
  history: "Histórico",
  results: "Resultados",
  plan: "Plano",
  settings: "Configurações",
};

const APP_PAGES: AppPage[] = ["home", "history", "results", "plan", "settings"];

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        gap: "12px",
      }}
    >
      <p style={{ fontSize: "24px", fontWeight: 500, color: "var(--m3-on-surface)" }}>
        {title}
      </p>
      <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>
        Em construção
      </p>
    </div>
  );
}

export default function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [currentPage, setCurrentPage] = useState<FullPage>("landing");
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [verdictResult, setVerdictResult] = useState<ResultType>("nao_verificavel");
  const [verdictDetails, setVerdictDetails] = useState<string>("Não foi possível verificar");
  const [verdictContent, setVerdictContent] = useState<string>("");
  const [verdictType, setVerdictType] = useState<"text" | "link" | "image">("text");
  const [verdictTimestamp, setVerdictTimestamp] = useState<Date>(new Date());
  const [activeVerificationId, setActiveVerificationId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const reqIdRef = useRef(0);

  // Auto-navigate when auth state resolves
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && currentPage === "landing") {
      setCurrentPage("home");
    }
    if (!isAuthenticated && APP_PAGES.includes(currentPage as AppPage)) {
      setCurrentPage("login");
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (value: string, attachmentType: "text" | "link" | "image" = "text") => {
    const ts = new Date();
    const newVerification: Verification = {
      id: Date.now().toString(),
      content: value,
      type: attachmentType,
      steps: VERIFICATION_STEPS.map(step => ({ ...step, completed: false })),
      currentStepIndex: 0,
      timestamp: ts,
    };

    setVerdictContent(value);
    setVerdictType(attachmentType);
    setVerdictTimestamp(ts);
    setVerdictResult("nao_verificavel");
    setVerdictDetails("Não foi possível verificar");
    setVerifications(prev => [...prev, newVerification]);
    setActiveVerificationId(newVerification.id);
    setCurrentPage("processing");

    const myId = ++reqIdRef.current;

    const API_TIMEOUT_MS = 8000;
    const t = setTimeout(() => {
      if (reqIdRef.current === myId) {
        setVerdictResult("nao_verificavel");
        setVerdictDetails("Não foi possível verificar");
        setVerifications(prev =>
          prev.map(v => v.id === newVerification.id ? { ...v, result: "nao_verificavel", confidence: 45 } : v)
        );
      }
    }, API_TIMEOUT_MS);

    // Usuário autenticado: salva no banco (classificação + histórico em um endpoint)
    // Usuário não autenticado: apenas classifica via /predict/
    const apiCall = (token && isAuthenticated)
      ? apiCriarVerificacao(token, value, attachmentType).then((data) => {
          const result = mapResultado(data.resultado);
          const confPct = `${(data.confianca * 100).toFixed(1)}%`;
          return { result, details: `Confiança: ${confPct}` };
        })
      : postCheck(value).then(mapApiToResult);

    apiCall
      .then((mapped) => {
        if (reqIdRef.current !== myId) return;
        clearTimeout(t);
        const conf = CONFIDENCE_BY_RESULT[mapped.result];
        setVerdictResult(mapped.result);
        setVerdictDetails(mapped.details);
        setVerifications(prev =>
          prev.map(v => v.id === newVerification.id ? { ...v, result: mapped.result, confidence: conf } : v)
        );
      })
      .catch(() => {
        if (reqIdRef.current !== myId) return;
        clearTimeout(t);
        setVerdictResult("nao_verificavel");
        setVerdictDetails("Não foi possível verificar");
        setVerifications(prev =>
          prev.map(v => v.id === newVerification.id ? { ...v, result: "nao_verificavel", confidence: 45 } : v)
        );
      });

    await runStepAnimation(newVerification.id, VERIFICATION_STEPS.length);
    setCurrentPage("verdict");
  };

  const runStepAnimation = async (verificationId: string, totalSteps: number) => {
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVerifications(prev => prev.map(v =>
        v.id === verificationId
          ? { ...v, currentStepIndex: i, steps: v.steps.map((s, idx) => ({ ...s, completed: idx <= i })) }
          : v
      ));
    }
  };

  const handleNewVerification = () => {
    setActiveVerificationId(null);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    setCurrentPage("landing");
  };

  // Auth pages
  if (currentPage === "login") {
    return (
      <LoginPage
        onGoToRegister={() => setCurrentPage("register")}
        onGoToForgotPassword={() => setCurrentPage("forgot-password")}
        onLoginSuccess={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onGoToLogin={() => setCurrentPage("login")}
        onRegisterSuccess={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "forgot-password") {
    return (
      <ForgotPasswordPage
        onGoToLogin={() => setCurrentPage("login")}
      />
    );
  }

  // Full-page states (no sidebar)
  if (currentPage === "landing") {
    return (
      <LandingPage
        onEnter={() => setCurrentPage("login")}
        onSubmit={(value, type) => handleSubmit(value, type)}
      />
    );
  }

  if (currentPage === "processing") {
    const activeV = verifications.find(v => v.id === activeVerificationId);
    return (
      <ProcessingPage
        steps={activeV?.steps ?? VERIFICATION_STEPS.map(s => ({ ...s, completed: false }))}
        currentStepIndex={activeV?.currentStepIndex ?? 0}
        content={verdictContent}
        onCancel={handleNewVerification}
      />
    );
  }

  if (currentPage === "verdict") {
    return (
      <VerdictPage
        result={verdictResult}
        confidence={CONFIDENCE_BY_RESULT[verdictResult]}
        content={verdictContent}
        details={verdictDetails}
        type={verdictType}
        timestamp={verdictTimestamp}
        onNewVerification={handleNewVerification}
      />
    );
  }

  // Authenticated sidebar layout
  const appPage = currentPage as AppPage;

  // User initials
  const initials = user?.nome
    ? user.nome
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "?";

  return (
    <div
      className="dark"
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--m3-surface)",
      }}
    >
      <Sidebar currentPage={appPage} onNavigate={(p) => setCurrentPage(p)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "12px 24px",
            borderBottom: "1px solid var(--m3-outline)",
            backgroundColor: "var(--m3-surface)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "20px",
              backgroundColor: "var(--m3-primary-container)",
              border: "1px solid rgba(255,55,132,0.3)",
            }}
          >
            <Crown size={12} style={{ color: "var(--m3-primary)" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--m3-primary)" }}>Pro</span>
          </div>

          <button
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: "var(--m3-on-surface-variant)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <Bell size={18} />
          </button>

          {/* User menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 8px",
                borderRadius: "24px",
                border: "1px solid var(--m3-outline)",
                cursor: "pointer",
                backgroundColor: "transparent",
                color: "var(--m3-on-surface)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: "var(--m3-primary-container)",
                  color: "var(--m3-primary)",
                }}
              >
                {initials}
              </div>
              <span style={{ fontSize: "13px", fontWeight: 500 }}>
                {user?.nome ?? "Usuário"}
              </span>
              <ChevronDown size={14} style={{ color: "var(--m3-on-surface-variant)" }} />
            </button>

            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  onClick={() => setShowUserMenu(false)}
                />
                {/* Dropdown */}
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 50,
                    minWidth: "200px",
                    borderRadius: "14px",
                    border: "1px solid var(--m3-outline)",
                    backgroundColor: "var(--m3-surface-container)",
                    padding: "8px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      marginBottom: "4px",
                      borderBottom: "1px solid var(--m3-outline)",
                    }}
                  >
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--m3-on-surface)", margin: 0 }}>
                      {user?.nome}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", margin: 0 }}>
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      color: "#ef4444",
                      fontSize: "13px",
                      fontWeight: 500,
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
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px 120px" }}>
          {appPage === "home" && (
            <HomePage
              verifications={verifications.filter(v => v.id === activeVerificationId)}
              onSubmit={handleSubmit}
            />
          )}
          {appPage === "history" && <HistoryPage />}
          {appPage === "results" && <ResultsPage />}
          {appPage === "plan" && <PlaceholderPage title={PAGE_TITLES.plan} />}
          {appPage === "settings" && <SettingsPage />}
        </div>
      </div>
    </div>
  );
}
