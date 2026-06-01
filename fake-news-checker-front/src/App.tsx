import { useState, useRef, useEffect } from "react";
import { Sidebar, type AppPage } from "./components/Sidebar";
import { Header } from "./components/Header";
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
import { apiCriarVerificacao, mapResultado, type FonteInfo } from "./services/verificacoes";
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
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();

  const [currentPage, setCurrentPage] = useState<FullPage>("landing");
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [verdictResult, setVerdictResult] = useState<ResultType>("nao_verificavel");
  const [verdictDetails, setVerdictDetails] = useState<string>("Não foi possível verificar");
  const [verdictContent, setVerdictContent] = useState<string>("");
  const [verdictType, setVerdictType] = useState<"text" | "link" | "image">("text");
  const [verdictTimestamp, setVerdictTimestamp] = useState<Date>(new Date());
  const [verdictFontes, setVerdictFontes] = useState<FonteInfo[]>([]);
  const [verdictConfidence, setVerdictConfidence] = useState<number>(0);
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
    setVerdictFontes([]);
    setVerdictConfidence(0);
    setVerifications(prev => [...prev, newVerification]);
    setActiveVerificationId(newVerification.id);
    setCurrentPage("processing");

    const myId = ++reqIdRef.current;

    const API_TIMEOUT_MS = 15000;
    const t = setTimeout(() => {
      if (reqIdRef.current === myId) {
        setVerdictResult("nao_verificavel");
        setVerdictDetails("Tempo limite excedido");
        setVerdictConfidence(0);
        setVerifications(prev =>
          prev.map(v => v.id === newVerification.id ? { ...v, result: "nao_verificavel", confidence: 0 } : v)
        );
      }
    }, API_TIMEOUT_MS);

    const apiCall = (token && isAuthenticated)
      ? apiCriarVerificacao(token, value, attachmentType).then((data) => {
          const result = mapResultado(data.resultado);
          const conf = Math.round(data.confianca * 100);
          const fontes = data.fontes ?? [];
          return { result, details: `Confiança: ${conf}%`, confidence: conf, fontes };
        })
      : postCheck(value).then((api) => {
          const mapped = mapApiToResult(api);
          const conf = api && typeof api.confianca === "number" ? Math.round(api.confianca * 100) : 0;
          return { ...mapped, confidence: conf, fontes: [] as FonteInfo[] };
        });

    apiCall
      .then((mapped) => {
        if (reqIdRef.current !== myId) return;
        clearTimeout(t);
        setVerdictResult(mapped.result);
        setVerdictDetails(mapped.details);
        setVerdictFontes(mapped.fontes);
        setVerdictConfidence(mapped.confidence);
        setVerifications(prev =>
          prev.map(v => v.id === newVerification.id ? { ...v, result: mapped.result, confidence: mapped.confidence } : v)
        );
      })
      .catch(() => {
        if (reqIdRef.current !== myId) return;
        clearTimeout(t);
        setVerdictResult("nao_verificavel");
        setVerdictDetails("Não foi possível verificar");
        setVerdictFontes([]);
        setVerdictConfidence(0);
        setVerifications(prev =>
          prev.map(v => v.id === newVerification.id ? { ...v, result: "nao_verificavel", confidence: 0 } : v)
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

  const renderContent = () => {
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
          confidence={verdictConfidence}
          content={verdictContent}
          details={verdictDetails}
          type={verdictType}
          timestamp={verdictTimestamp}
          fontes={verdictFontes}
          onNewVerification={handleNewVerification}
        />
      );
    }

    const appPage = currentPage as AppPage;
    return (
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
    );
  };

  return (
    <div
      className="dark"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--m3-surface)",
      }}
    >
      <Header
        showNav={currentPage === "landing"}
        onLoginClick={() => setCurrentPage("login")}
        onLogoClick={() => setCurrentPage(isAuthenticated ? "home" : "landing")}
      />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {isAuthenticated && APP_PAGES.includes(currentPage as AppPage) && (
          <Sidebar currentPage={currentPage as AppPage} onNavigate={(p) => setCurrentPage(p)} />
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
