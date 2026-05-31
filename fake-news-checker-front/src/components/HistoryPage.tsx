import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";

type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

interface Verification {
  id: string;
  content: string;
  type: "text" | "link" | "image";
  result?: ResultType;
  timestamp: Date;
  confidence?: number;
}

interface HistoryPageProps {
  verifications: Verification[];
}

type TabType = "todas" | "verdadeiras" | "falsas" | "inconclusivas";

const MOCK_ITEMS: Verification[] = [
  {
    id: "m1",
    content: "Governo anuncia nova isenção de imposto para quem ganha até...",
    type: "text",
    result: "nao_verificavel",
    timestamp: new Date("2025-05-21T10:24:00"),
    confidence: 45,
  },
  {
    id: "m2",
    content: "Pix terá cobrança de taxa para pessoas físicas a partir de julho.",
    type: "text",
    result: "falsa",
    timestamp: new Date("2025-05-20T14:10:00"),
    confidence: 18,
  },
  {
    id: "m3",
    content: "Vacina brasileira contra a dengue é aprovada pela Anvisa.",
    type: "text",
    result: "verdadeira",
    timestamp: new Date("2025-05-19T09:48:00"),
    confidence: 92,
  },
  {
    id: "m4",
    content: "INSS vai devolver automaticamente valores descontados indev...",
    type: "text",
    result: "verdadeira",
    timestamp: new Date("2025-05-18T16:32:00"),
    confidence: 88,
  },
  {
    id: "m5",
    content: "O Banco Central lançou uma nova nota de R$ 200.",
    type: "text",
    result: "falsa",
    timestamp: new Date("2025-05-17T11:07:00"),
    confidence: 15,
  },
  {
    id: "m6",
    content: "Lei garante redução de jornada de trabalho sem redução de salário.",
    type: "text",
    result: "nao_verificavel",
    timestamp: new Date("2025-05-16T08:21:00"),
    confidence: 40,
  },
];

const RESULT_CONFIG: Record<ResultType, { label: string; color: string; dot: string }> = {
  verdadeira: { label: "Verdadeira", color: "#22c55e", dot: "#22c55e" },
  falsa: { label: "Falsa", color: "#ef4444", dot: "#ef4444" },
  nao_verificavel: { label: "Inconclusivo", color: "#f59e0b", dot: "#f59e0b" },
};

const TABS: { key: TabType; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "verdadeiras", label: "Verdadeiras" },
  { key: "falsas", label: "Falsas" },
  { key: "inconclusivas", label: "Inconclusivas" },
];

const ITEMS_PER_PAGE = 10;

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "80px" }}>
      <span style={{ fontSize: "18px", fontWeight: 700, color, lineHeight: 1 }}>
        {value}%
      </span>
      <div
        style={{
          height: "4px",
          borderRadius: "2px",
          backgroundColor: "rgba(255,255,255,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            borderRadius: "2px",
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function ResultBadge({ result }: { result: ResultType }) {
  const cfg = RESULT_CONFIG[result];
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "20px",
        backgroundColor: `${cfg.dot}18`,
        border: `1px solid ${cfg.dot}44`,
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: cfg.dot,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: "13px", fontWeight: 500, color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}

export function HistoryPage({ verifications }: HistoryPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const completed = verifications.filter((v) => v.result);
  const source = completed.length > 0
    ? completed.map((v) => ({
        ...v,
        confidence: v.result === "verdadeira" ? 85 : v.result === "falsa" ? 20 : 45,
      }))
    : MOCK_ITEMS;

  const filtered = source.filter((item) => {
    const matchesTab =
      activeTab === "todas" ||
      (activeTab === "verdadeiras" && item.result === "verdadeira") ||
      (activeTab === "falsas" && item.result === "falsa") ||
      (activeTab === "inconclusivas" && item.result === "nao_verificavel");
    const matchesSearch =
      !search || item.content.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const pageNumbers: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1, 2, 3, "...", totalPages);
  }

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "4px" }}>
            Histórico de verificações
          </h1>
          <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>
            Acompanhe todas as verificações que você já realizou.
          </p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "10px",
              backgroundColor: "var(--m3-surface-container)",
              border: "1px solid var(--m3-outline)",
              minWidth: "220px",
            }}
          >
            <Search size={15} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por palavra-chave"
              style={{
                background: "none",
                border: "none",
                outline: "none",
                fontSize: "13px",
                color: "var(--m3-on-surface)",
                width: "100%",
              }}
            />
          </div>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid var(--m3-outline)",
              backgroundColor: "var(--m3-surface-container)",
              color: "var(--m3-on-surface)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <SlidersHorizontal size={15} />
            Filtros
            <ChevronDown size={13} style={{ color: "var(--m3-on-surface-variant)" }} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0",
          borderBottom: "1px solid var(--m3-outline)",
          marginBottom: "0",
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: active ? "var(--m3-primary)" : "var(--m3-on-surface-variant)",
                background: "none",
                border: "none",
                borderBottom: active ? "2px solid var(--m3-primary)" : "2px solid transparent",
                cursor: "pointer",
                marginBottom: "-1px",
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: "var(--m3-surface-container)",
          border: "1px solid var(--m3-outline)",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          overflow: "hidden",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 120px 110px 40px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--m3-outline)",
            backgroundColor: "rgba(255,255,255,0.02)",
          }}
        >
          {[
            { label: "CONTEÚDO VERIFICADO", sortable: false },
            { label: "RESULTADO", sortable: false },
            { label: "CONFIANÇA", sortable: false },
            { label: "DATA", sortable: true },
          ].map((col) => (
            <div
              key={col.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--m3-on-surface-variant)",
                letterSpacing: "0.05em",
                cursor: col.sortable ? "pointer" : "default",
              }}
            >
              {col.label}
              {col.sortable && <ArrowUpDown size={12} />}
            </div>
          ))}
          <div />
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--m3-on-surface-variant)" }}>
            Nenhuma verificação encontrada.
          </div>
        ) : (
          paginated.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 120px 110px 40px",
                padding: "16px 20px",
                borderBottom: i < paginated.length - 1 ? "1px solid var(--m3-outline)" : "none",
                alignItems: "center",
                cursor: "pointer",
                transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {/* Content */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0 }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={16} style={{ color: "var(--m3-on-surface-variant)" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--m3-on-surface)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "380px",
                    }}
                  >
                    {item.content}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>
                    Tipo: {item.type === "text" ? "Texto" : item.type === "link" ? "Link" : "Imagem"}
                  </p>
                </div>
              </div>

              {/* Result */}
              <div>{item.result && <ResultBadge result={item.result} />}</div>

              {/* Confidence */}
              <div>
                {item.result && item.confidence !== undefined && (
                  <ConfidenceBar
                    value={item.confidence}
                    color={RESULT_CONFIG[item.result].color}
                  />
                )}
              </div>

              {/* Date */}
              <div>
                <p style={{ fontSize: "13px", color: "var(--m3-on-surface)", lineHeight: 1.4 }}>
                  {formatDate(item.timestamp)}
                </p>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
                  {formatTime(item.timestamp)}
                </p>
              </div>

              {/* Arrow */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ChevronRight size={16} style={{ color: "var(--m3-on-surface-variant)" }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        {/* Per page */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>Exibir:</span>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "8px",
              border: "1px solid var(--m3-outline)",
              backgroundColor: "var(--m3-surface-container)",
              color: "var(--m3-on-surface)",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {ITEMS_PER_PAGE} por página
            <ChevronDown size={12} />
          </button>
        </div>

        {/* Page numbers */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid var(--m3-outline)",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.4 : 1,
              color: "var(--m3-on-surface)",
            }}
          >
            <ChevronLeft size={14} />
          </button>

          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                style={{ padding: "0 4px", color: "var(--m3-on-surface-variant)", fontSize: "13px" }}
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p as number)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: currentPage === p ? "var(--m3-primary)" : "var(--m3-outline)",
                  backgroundColor: currentPage === p ? "var(--m3-primary)" : "transparent",
                  color: currentPage === p ? "var(--m3-on-primary)" : "var(--m3-on-surface)",
                  fontSize: "13px",
                  fontWeight: currentPage === p ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid var(--m3-outline)",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.4 : 1,
              color: "var(--m3-on-surface)",
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Total */}
        <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
          {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length} resultados
        </p>
      </div>
    </div>
  );
}
