import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  SlidersHorizontal,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  apiListarVerificacoes,
  apiExportarVerificacoes,
  mapResultado,
  type ListarVerificacoesOpts,
} from "../services/verificacoes";
import { VerificacaoDetalheModal } from "./VerificacaoDetalheModal";

type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

interface HistoryItem {
  id: number;
  content: string;
  tipo: string;
  result: ResultType;
  confidence: number;
  timestamp: Date;
}

type TabType = "todas" | "verdadeiras" | "falsas" | "inconclusivas";

const RESULT_CONFIG: Record<ResultType, { label: string; color: string }> = {
  verdadeira: { label: "Verdadeira", color: "#22c55e" },
  falsa: { label: "Falsa", color: "#ef4444" },
  nao_verificavel: { label: "Inconclusivo", color: "#f59e0b" },
};

const TABS: { key: TabType; label: string; backendValue?: "REAL" | "FALSO" | "INCONCLUSIVO" }[] = [
  { key: "todas", label: "Todas" },
  { key: "verdadeiras", label: "Verdadeiras", backendValue: "REAL" },
  { key: "falsas", label: "Falsas", backendValue: "FALSO" },
  { key: "inconclusivas", label: "Inconclusivas", backendValue: "INCONCLUSIVO" },
];

const POR_PAGINA_OPTS = [10, 25, 50];

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "80px" }}>
      <span style={{ fontSize: "18px", fontWeight: 700, color, lineHeight: 1 }}>{value}%</span>
      <div style={{ height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, borderRadius: "2px", backgroundColor: color }} />
      </div>
    </div>
  );
}

function ResultBadge({ result }: { result: ResultType }) {
  const cfg = RESULT_CONFIG[result];
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "4px 10px", borderRadius: "20px",
      backgroundColor: `${cfg.color}18`, border: `1px solid ${cfg.color}44`, whiteSpace: "nowrap",
    }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: cfg.color, flexShrink: 0 }} />
      <span style={{ fontSize: "13px", fontWeight: 500, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

// ── Filter panel ────────────────────────────────────────────────────────────

interface FilterState {
  tipo: "" | "texto" | "link" | "imagem";
  data_inicio: string;
  data_fim: string;
}

function FilterPanel({
  filters,
  onChange,
  onClear,
  onClose,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const hasFilters = filters.tipo !== "" || filters.data_inicio !== "" || filters.data_fim !== "";

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        zIndex: 200,
        width: 280,
        background: "var(--m3-surface-container-high, #1e293b)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--m3-on-surface)" }}>Filtros</span>
        {hasFilters && (
          <button onClick={onClear} style={{ background: "none", border: "none", color: "#60a5fa", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
            Limpar
          </button>
        )}
      </div>

      {/* Tipo */}
      <div>
        <label style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", display: "block", marginBottom: 6 }}>Tipo</label>
        <select
          value={filters.tipo}
          onChange={(e) => onChange({ ...filters, tipo: e.target.value as FilterState["tipo"] })}
          style={{
            width: "100%", padding: "7px 10px", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--m3-on-surface)", fontSize: 13,
          }}
        >
          <option value="">Todos</option>
          <option value="texto">Texto</option>
          <option value="link">Link</option>
          <option value="imagem">Imagem</option>
        </select>
      </div>

      {/* Período */}
      <div>
        <label style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", display: "block", marginBottom: 6 }}>Período inicial</label>
        <input
          type="date"
          value={filters.data_inicio}
          onChange={(e) => onChange({ ...filters, data_inicio: e.target.value })}
          style={{
            width: "100%", padding: "7px 10px", borderRadius: 8, boxSizing: "border-box",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--m3-on-surface)", fontSize: 13,
          }}
        />
      </div>
      <div>
        <label style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", display: "block", marginBottom: 6 }}>Período final</label>
        <input
          type="date"
          value={filters.data_fim}
          onChange={(e) => onChange({ ...filters, data_fim: e.target.value })}
          style={{
            width: "100%", padding: "7px 10px", borderRadius: 8, boxSizing: "border-box",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)",
            color: "var(--m3-on-surface)", fontSize: 13,
          }}
        />
      </div>

      <button
        onClick={onClose}
        style={{
          padding: "8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.06)", color: "var(--m3-on-surface)",
          fontSize: 13, cursor: "pointer", fontWeight: 500,
        }}
      >
        Aplicar
      </button>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export function HistoryPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [ordenacao, setOrdenacao] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<FilterState>({ tipo: "", data_inicio: "", data_fim: "" });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [exportando, setExportando] = useState(false);

  // Debounce busca
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(id);
  }, [search]);

  // Reset página ao mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch, filters, porPagina, ordenacao]);

  const buildOpts = useCallback((): ListarVerificacoesOpts => {
    const tab = TABS.find((t) => t.key === activeTab);
    return {
      resultado: tab?.backendValue,
      tipo: filters.tipo || undefined,
      busca: debouncedSearch || undefined,
      data_inicio: filters.data_inicio || undefined,
      data_fim: filters.data_fim || undefined,
      ordenacao,
      pagina: currentPage,
      por_pagina: porPagina,
    };
  }, [activeTab, debouncedSearch, filters, ordenacao, currentPage, porPagina]);

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await apiListarVerificacoes(token, buildOpts());
      setItems(
        data.itens.map((v) => ({
          id: v.id,
          content: v.texto_verificado,
          tipo: v.tipo,
          result: mapResultado(v.resultado),
          confidence: Math.round(v.confianca * 100),
          timestamp: new Date(v.criado_em),
        }))
      );
      setTotal(data.total);
      setTotalPages(data.total_paginas || 1);
    } catch {
      setError("Não foi possível carregar o histórico.");
    } finally {
      setIsLoading(false);
    }
  }, [token, buildOpts]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExportar = async (formato: "xlsx" | "csv") => {
    if (!token || exportando) return;
    setExportando(true);
    try {
      const tab = TABS.find((t) => t.key === activeTab);
      const blob = await apiExportarVerificacoes(token, formato, {
        resultado: tab?.backendValue,
        tipo: filters.tipo || undefined,
        busca: debouncedSearch || undefined,
        data_inicio: filters.data_inicio || undefined,
        data_fim: filters.data_fim || undefined,
        ordenacao,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `checkai_historico.${formato}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert((e as Error).message ?? "Erro ao exportar.");
    } finally {
      setExportando(false);
    }
  };

  const clearFilters = () => setFilters({ tipo: "", data_inicio: "", data_fim: "" });

  const hasActiveFilters = filters.tipo !== "" || filters.data_inicio !== "" || filters.data_fim !== "";

  const pageNumbers: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1, 2, 3, "...", totalPages);
  }

  const start = total === 0 ? 0 : (currentPage - 1) * porPagina + 1;
  const end = Math.min(currentPage * porPagina, total);

  const SortIcon = ordenacao === "desc" ? ArrowDown : ArrowUp;

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "4px" }}>
            Histórico de verificações
          </h1>
          <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>
            Acompanhe todas as verificações que você já realizou.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
            borderRadius: "10px", backgroundColor: "var(--m3-surface-container)",
            border: "1px solid var(--m3-outline)", minWidth: "220px",
          }}>
            <Search size={15} style={{ color: "var(--m3-on-surface-variant)", flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por palavra-chave"
              style={{ background: "none", border: "none", outline: "none", fontSize: "13px", color: "var(--m3-on-surface)", width: "100%" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--m3-on-surface-variant)", display: "flex", padding: 0 }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter button */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowFilterPanel((p) => !p)}
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
                borderRadius: "10px", border: `1px solid ${hasActiveFilters ? "var(--m3-primary)" : "var(--m3-outline)"}`,
                backgroundColor: hasActiveFilters ? "rgba(var(--m3-primary-rgb,99,102,241),0.12)" : "var(--m3-surface-container)",
                color: hasActiveFilters ? "var(--m3-primary)" : "var(--m3-on-surface)",
                fontSize: "13px", fontWeight: 500, cursor: "pointer",
              }}
            >
              <SlidersHorizontal size={15} />
              Filtros
              {hasActiveFilters && <span style={{ fontSize: 11, background: "var(--m3-primary)", color: "#fff", borderRadius: 10, padding: "0 6px", lineHeight: "18px" }}>!</span>}
              <ChevronDown size={13} style={{ color: "var(--m3-on-surface-variant)" }} />
            </button>

            {showFilterPanel && (
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
                onClose={() => setShowFilterPanel(false)}
              />
            )}
          </div>

          {/* Export button */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => handleExportar("xlsx")}
              disabled={exportando}
              title="Exportar como Excel (.xlsx)"
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
                borderRadius: "10px", border: "1px solid var(--m3-outline)",
                backgroundColor: "var(--m3-surface-container)", color: "var(--m3-on-surface)",
                fontSize: "13px", fontWeight: 500, cursor: exportando ? "not-allowed" : "pointer",
                opacity: exportando ? 0.6 : 1,
              }}
            >
              {exportando ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
              Exportar
              <ChevronDown size={12} style={{ color: "var(--m3-on-surface-variant)" }}
                onClick={(e) => { e.stopPropagation(); handleExportar("csv"); }}
                title="Exportar como CSV"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--m3-outline)", marginBottom: "0" }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "10px 20px", fontSize: "14px",
              fontWeight: active ? 600 : 400,
              color: active ? "var(--m3-primary)" : "var(--m3-on-surface-variant)",
              background: "none", border: "none",
              borderBottom: active ? "2px solid var(--m3-primary)" : "2px solid transparent",
              cursor: "pointer", marginBottom: "-1px", transition: "color 0.15s",
            }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{
        backgroundColor: "var(--m3-surface-container)", border: "1px solid var(--m3-outline)",
        borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 160px 120px 110px 40px",
          padding: "12px 20px", borderBottom: "1px solid var(--m3-outline)",
          backgroundColor: "rgba(255,255,255,0.02)",
        }}>
          {[
            { label: "CONTEÚDO VERIFICADO", sortable: false },
            { label: "RESULTADO", sortable: false },
            { label: "CONFIANÇA", sortable: false },
            { label: "DATA", sortable: true },
          ].map((col) => (
            <div
              key={col.label}
              onClick={col.sortable ? () => setOrdenacao((o) => o === "desc" ? "asc" : "desc") : undefined}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                fontSize: "11px", fontWeight: 600, color: "var(--m3-on-surface-variant)",
                letterSpacing: "0.05em",
                cursor: col.sortable ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              {col.label}
              {col.sortable && (
                ordenacao !== undefined
                  ? <SortIcon size={12} style={{ color: "var(--m3-primary)" }} />
                  : <ArrowUpDown size={12} />
              )}
            </div>
          ))}
          <div />
        </div>

        {/* Body */}
        {isLoading ? (
          <div style={{ padding: "48px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "var(--m3-on-surface-variant)" }}>
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "14px" }}>Carregando...</span>
          </div>
        ) : error ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "#ef4444", fontSize: "14px" }}>
            {error}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--m3-on-surface-variant)", fontSize: "14px" }}>
            Nenhuma verificação encontrada.
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                display: "grid", gridTemplateColumns: "1fr 160px 120px 110px 40px",
                padding: "16px 20px",
                borderBottom: i < items.length - 1 ? "1px solid var(--m3-outline)" : "none",
                alignItems: "center", cursor: "pointer", transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0 }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.05)", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <FileText size={16} style={{ color: "var(--m3-on-surface-variant)" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontSize: "14px", color: "var(--m3-on-surface)",
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", maxWidth: "380px",
                    margin: 0,
                  }}>
                    {item.content}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "2px", margin: "2px 0 0" }}>
                    {item.tipo === "texto" ? "Texto" : item.tipo === "link" ? "Link" : "Imagem"}
                  </p>
                </div>
              </div>

              <div><ResultBadge result={item.result} /></div>
              <div><ConfidenceBar value={item.confidence} color={RESULT_CONFIG[item.result].color} /></div>

              <div>
                <p style={{ fontSize: "13px", color: "var(--m3-on-surface)", lineHeight: 1.4, margin: 0 }}>
                  {formatDate(item.timestamp)}
                </p>
                <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", margin: "2px 0 0" }}>
                  {formatTime(item.timestamp)}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <ChevronRight size={16} style={{ color: "var(--m3-on-surface-variant)" }} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px", flexWrap: "wrap", gap: "12px" }}>
          {/* Per-page selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>Exibir:</span>
            <select
              value={porPagina}
              onChange={(e) => setPorPagina(Number(e.target.value))}
              style={{
                padding: "4px 10px", borderRadius: "8px", border: "1px solid var(--m3-outline)",
                backgroundColor: "var(--m3-surface-container)", color: "var(--m3-on-surface)",
                fontSize: "13px", cursor: "pointer",
              }}
            >
              {POR_PAGINA_OPTS.map((n) => (
                <option key={n} value={n}>{n} por página</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--m3-outline)",
                backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.4 : 1, color: "var(--m3-on-surface)",
              }}
            >
              <ChevronLeft size={14} />
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} style={{ padding: "0 4px", color: "var(--m3-on-surface-variant)", fontSize: "13px" }}>...</span>
              ) : (
                <button key={p} onClick={() => setCurrentPage(p as number)} style={{
                  width: "32px", height: "32px", borderRadius: "8px", border: "1px solid",
                  borderColor: currentPage === p ? "var(--m3-primary)" : "var(--m3-outline)",
                  backgroundColor: currentPage === p ? "var(--m3-primary)" : "transparent",
                  color: currentPage === p ? "var(--m3-on-primary)" : "var(--m3-on-surface)",
                  fontSize: "13px", fontWeight: currentPage === p ? 600 : 400, cursor: "pointer",
                }}>
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--m3-outline)",
                backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.4 : 1, color: "var(--m3-on-surface)",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>
            {total === 0 ? "0 resultados" : `${start}–${end} de ${total} resultados`}
          </p>
        </div>
      )}

      {/* Detail modal */}
      {selectedId !== null && (
        <VerificacaoDetalheModal
          verificacaoId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
