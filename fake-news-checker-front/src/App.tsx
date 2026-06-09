import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { Sidebar, type AppPage } from "./components/Sidebar";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { HistoryPage } from "./components/HistoryPage";
import { ResultsPage } from "./components/ResultsPage";
import { SettingsPage } from "./components/SettingsPage";
import { LandingPage } from "./components/LandingPage";
import { SobrePage } from "./components/SobrePage";
import { PlanosPage } from "./components/PlanosPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { ProcessingPage } from "./components/ProcessingPage";
import { VerdictPage } from "./components/VerdictPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { GuestLimitModal } from "./components/GuestLimitModal";
import { MeuPlanoPage } from "./components/MeuPlanoPage";
import { postVerificar, mapVerificarToResult } from "./services/api";
import {
  apiCriarVerificacao,
  apiCriarVerificacaoImagem,
  mapVerificacaoApiItem,
  type FonteInfo,
  type NliVotos,
} from "./services/verificacoes";
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

type FullPage = "landing" | "sobre" | "planos" | "checkout" | "processing" | "verdict" | "login" | "register" | "forgot-password" | AppPage;

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

// Páginas acessíveis sem autenticação (tudo mais redireciona para landing ao sair)
const PUBLIC_PAGES: FullPage[] = [
  "landing", "sobre", "planos", "checkout",
  "login", "register", "forgot-password",
  "processing", "verdict",
];

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
  const [verdictReady, setVerdictReady] = useState(false);
  const [verdictNliAgregado, setVerdictNliAgregado] = useState<string | null | undefined>(null);
  const [verdictNliScore, setVerdictNliScore] = useState<number | null | undefined>(null);
  const [verdictNliVotos, setVerdictNliVotos] = useState<NliVotos | null | undefined>(null);
  const [verdictDecisaoOrigem, setVerdictDecisaoOrigem] = useState<string | null | undefined>(null);
  const [verdictJustificativa, setVerdictJustificativa] = useState<string | null | undefined>(null);
  const [verdictNomeArquivo, setVerdictNomeArquivo] = useState<string | null>(null);
  const [activeVerificationId, setActiveVerificationId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ── Guest verification limit ──
  const [guestHasVerified, setGuestHasVerified] = useState(
    () => sessionStorage.getItem("checkai_guest_verified") === "true"
  );
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);

  const reqIdRef = useRef(0);

  // Auto-navigate when auth state resolves
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && currentPage === "landing") {
      setCurrentPage("home");
    }
    // Redireciona QUALQUER página privada (inclui "verdict", "processing", etc.)
    if (!isAuthenticated && !PUBLIC_PAGES.includes(currentPage)) {
      setVerdictContent("");
      setVerdictNomeArquivo(null);
      setVerdictFontes([]);
      setVerdictResult("nao_verificavel");
      setCurrentPage("landing");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, currentPage]);

  const handleSubmit = async (value: string, attachmentType: "text" | "link" | "image" = "text", imageFile?: File) => {
    // ── Imagem e link exigem login ──
    if (!isAuthenticated && (attachmentType === "image" || attachmentType === "link")) {
      setShowGuestLimitModal(true);
      return;
    }

    // ── Bloquear segunda verificação de visitante ──
    if (!isAuthenticated && guestHasVerified) {
      setShowGuestLimitModal(true);
      return;
    }

    const ts = new Date();
    const displayContent = imageFile ? `[Imagem: ${imageFile.name}]` : value;
    const newVerification: Verification = {
      id: Date.now().toString(),
      content: displayContent,
      type: attachmentType,
      steps: VERIFICATION_STEPS.map(step => ({ ...step, completed: false })),
      currentStepIndex: 0,
      timestamp: ts,
    };

    setVerdictContent(displayContent);
    setVerdictType(attachmentType);
    setVerdictTimestamp(ts);
    setVerdictNomeArquivo(imageFile?.name ?? null);
    setVerdictReady(false);
    setVerifications(prev => [...prev, newVerification]);
    setActiveVerificationId(newVerification.id);
    setCurrentPage("processing");

    void runStepAnimation(newVerification.id, VERIFICATION_STEPS.length);

    const myId = ++reqIdRef.current;

    const tipoApi =
      attachmentType === "text" ? "texto" : attachmentType === "image" ? "imagem" : "link";

    const fetchResult = async (): Promise<{
      result: ResultType;
      details: string;
      confidence: number;
      fontes: FonteInfo[];
      textoVerificado: string;
      nliAgregado?: string | null;
      nliScore?: number | null;
      nliVotos?: NliVotos | null;
      decisaoOrigem?: string | null;
      justificativa?: string | null;
    }> => {
      if (token && isAuthenticated) {
        try {
          const data = imageFile
            ? await apiCriarVerificacaoImagem(token, imageFile)
            : await apiCriarVerificacao(token, value, attachmentType);
          return mapVerificacaoApiItem(data);
        } catch (err) {
          console.warn(
            "[checkai] verificação autenticada falhou; usando rota pública",
            err
          );
        }
      }
      const api = await postVerificar(value, tipoApi);
      return mapVerificarToResult(api);
    };

    const applyResult = (mapped: {
      result: ResultType;
      details: string;
      confidence: number;
      fontes: FonteInfo[];
      textoVerificado: string;
      nliAgregado?: string | null;
      nliScore?: number | null;
      nliVotos?: NliVotos | null;
      decisaoOrigem?: string | null;
      justificativa?: string | null;
    }) => {
      setVerdictResult(mapped.result);
      setVerdictDetails(mapped.details);
      setVerdictFontes(mapped.fontes);
      setVerdictConfidence(mapped.confidence);
      setVerdictNliAgregado(mapped.nliAgregado);
      setVerdictNliScore(mapped.nliScore);
      setVerdictNliVotos(mapped.nliVotos);
      setVerdictDecisaoOrigem(mapped.decisaoOrigem);
      setVerdictJustificativa(mapped.justificativa);
      // Para imagens, substitui o placeholder pelo texto real extraído pelo OCR
      if (attachmentType === "image" && mapped.textoVerificado) {
        setVerdictContent(mapped.textoVerificado);
      }
      setVerifications(prev =>
        prev.map(v =>
          v.id === newVerification.id
            ? { ...v, result: mapped.result, confidence: mapped.confidence }
            : v
        )
      );
    };

    const mapped = await fetchResult();

    if (reqIdRef.current !== myId) return;

    flushSync(() => {
      applyResult(mapped);
      setVerdictReady(true);
    });

    // ── Marcar que o visitante já fez sua verificação gratuita ──
    if (!isAuthenticated) {
      sessionStorage.setItem("checkai_guest_verified", "true");
      setGuestHasVerified(true);
    }

    setCurrentPage("verdict");
  };

  const runStepAnimation = async (verificationId: string, totalSteps: number) => {
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 700));
      setVerifications(prev => prev.map(v =>
        v.id === verificationId
          ? { ...v, currentStepIndex: i, steps: v.steps.map((s, idx) => ({ ...s, completed: idx <= i })) }
          : v
      ));
    }
  };

  const handleNewVerification = () => {
    if (!isAuthenticated) {
      if (guestHasVerified) {
        setShowGuestLimitModal(true);
      } else {
        setCurrentPage("landing");
      }
      return;
    }
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
          onSubmit={(value, type, file) => handleSubmit(value, type, file)}
        />
      );
    }

    if (currentPage === "sobre") {
      return <SobrePage />;
    }

    if (currentPage === "planos") {
      return <PlanosPage onAssinar={() => setCurrentPage("checkout")} />;
    }

    if (currentPage === "checkout") {
      return <CheckoutPage onAlterar={() => setCurrentPage("planos")} />;
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

    if (currentPage === "verdict" && !verdictReady) {
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
          key={`${activeVerificationId}-${verdictConfidence}-${verdictResult}`}
          result={verdictResult}
          confidence={verdictConfidence}
          content={verdictContent}
          details={verdictDetails}
          type={verdictType}
          timestamp={verdictTimestamp}
          fontes={verdictFontes}
          onNewVerification={handleNewVerification}
          isAuthenticated={isAuthenticated}
          nomeArquivo={verdictNomeArquivo ?? undefined}
          nliAgregado={verdictNliAgregado}
          nliScore={verdictNliScore}
          nliVotos={verdictNliVotos}
          decisaoOrigem={verdictDecisaoOrigem}
          justificativa={verdictJustificativa}
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
            onNavigateHistory={() => setCurrentPage("history")}
          />
        )}
        {appPage === "history" && <HistoryPage />}
        {appPage === "results" && <ResultsPage onNavigate={(p) => setCurrentPage(p)} />}
        {appPage === "plan" && <MeuPlanoPage />}
        {appPage === "settings" && <SettingsPage onNavigatePlan={() => setCurrentPage("plan")} />}
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
        showNav={["landing", "sobre", "planos", "checkout"].includes(currentPage)}
        activePage={
          currentPage === "planos" || currentPage === "checkout"
            ? "planos"
            : currentPage === "sobre"
            ? "sobre"
            : "inicio"
        }
        onLoginClick={() => setCurrentPage("login")}
        onLogoClick={() => setCurrentPage(isAuthenticated ? "home" : "landing")}
        onNavInicio={() => setCurrentPage("landing")}
        onNavPlanos={() => setCurrentPage("planos")}
        onNavSobre={() => setCurrentPage("sobre")}
      />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {isAuthenticated && APP_PAGES.includes(currentPage as AppPage) && (
          <Sidebar currentPage={currentPage as AppPage} onNavigate={(p) => setCurrentPage(p)} />
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
          {renderContent()}
        </div>
      </div>

      {/* ── Guest limit modal ── */}
      {showGuestLimitModal && (
        <GuestLimitModal
          onGoToRegister={() => {
            setShowGuestLimitModal(false);
            setCurrentPage("register");
          }}
          onGoToLogin={() => {
            setShowGuestLimitModal(false);
            setCurrentPage("login");
          }}
          onClose={() => setShowGuestLimitModal(false)}
        />
      )}
    </div>
  );
}
