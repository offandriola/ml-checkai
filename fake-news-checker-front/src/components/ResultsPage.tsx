import { useState, useEffect } from "react";
import { ChevronDown, ArrowRight, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  apiObterResumo,
  apiListarVerificacoes,
  apiObterFontesTop,
  apiObterSerieTemporal,
  mapResultado,
  type ResumoApiResponse,
  type FonteTopItem,
  type Periodo,
  type PontoSerieTemporal,
} from "../services/verificacoes";
import type { AppPage } from "./Sidebar";

type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

const RESULT_CFG: Record<ResultType, { label: string; color: string }> = {
  verdadeira: { label: "Verdadeira", color: "#22c55e" },
  falsa:      { label: "Falsa",      color: "#ef4444" },
  nao_verificavel: { label: "Inconclusivo", color: "#f59e0b" },
};

const PERIODO_OPTS: { value: Periodo; label: string }[] = [
  { value: "7d",  label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "all", label: "Todo período" },
];

const PERIODO_CHART_LABEL: Record<Periodo, string> = {
  "7d":  "Verificações — Últimos 7 dias",
  "30d": "Verificações — Últimos 30 dias",
  "90d": "Verificações — Últimas 13 semanas",
  "all": "Verificações — Todo período",
};

function periodoParaDatas(periodo: Periodo): { data_inicio?: string; data_fim?: string } {
  if (periodo === "all") return {};
  const hoje = new Date();
  const fim = hoje.toISOString().split("T")[0];
  const dias = periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - dias);
  return { data_inicio: inicio.toISOString().split("T")[0], data_fim: fim };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, subColor }: { label: string; value: number; sub?: string; subColor?: string }) {
  return (
    <div style={{ flex: "1 1 160px", padding: "20px", borderRadius: "14px", backgroundColor: "var(--m3-surface-container)", border: "1px solid var(--m3-outline)", display: "flex", flexDirection: "column", gap: "6px" }}>
      <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", fontWeight: 500 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "32px", fontWeight: 700, color: "var(--m3-on-surface)", lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontSize: "14px", fontWeight: 600, color: subColor ?? "var(--m3-on-surface-variant)" }}>{sub}</span>}
      </div>
    </div>
  );
}

function DonutChart({ total, verdadeiras, falsas, inconclusivas }: { total: number; verdadeiras: number; falsas: number; inconclusivas: number }) {
  const cx = 80, cy = 80, r = 60, stroke = 22;
  const circumference = 2 * Math.PI * r;

  const segments =
    total === 0
      ? [{ pct: 1, color: "rgba(255,255,255,0.08)" }]
      : [
          { pct: verdadeiras / total,   color: "#22c55e" },
          { pct: falsas / total,        color: "#ef4444" },
          { pct: inconclusivas / total, color: "#f59e0b" },
        ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = seg.pct * circumference;
    const gap  = circumference - dash;
    const rotation = offset * 360 - 90;
    offset += seg.pct;
    return { ...seg, dash, gap, rotation };
  });

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      {arcs.map((arc, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color} strokeWidth={stroke}
          strokeDasharray={`${arc.dash} ${arc.gap}`} strokeLinecap="butt"
          transform={`rotate(${arc.rotation}, ${cx}, ${cy})`} />
      ))}
      <text x={cx} y={cy - 8}  textAnchor="middle" fill="var(--m3-on-surface)"        fontSize="22" fontWeight="700">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--m3-on-surface-variant)" fontSize="10">verificações</text>
    </svg>
  );
}

function WeeklyBarChart({ bars }: { bars: PontoSerieTemporal[] }) {
  if (bars.length === 0) {
    return (
      <div style={{ height: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>Nenhum dado no período.</p>
      </div>
    );
  }
  const totals = bars.map(b => b.verdadeiras + b.falsas + b.inconclusivas);
  const maxTotal = Math.max(...totals, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "140px", paddingBottom: "24px", position: "relative", overflowX: "auto" }}>
      {bars.map((bar, idx) => {
        const total = bar.verdadeiras + bar.falsas + bar.inconclusivas;
        const barH = Math.round((total / maxTotal) * 116);
        const vH   = total > 0 ? Math.round(barH * (bar.verdadeiras  / total)) : 0;
        const fH   = total > 0 ? Math.round(barH * (bar.falsas        / total)) : 0;
        const iH   = total > 0 ? Math.round(barH * (bar.inconclusivas / total)) : 0;
        return (
          <div key={idx} style={{ flex: "1 0 20px", minWidth: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "100%", display: "flex", flexDirection: "column-reverse", borderRadius: "4px", overflow: "hidden", gap: "1px" }}>
              {total === 0 ? (
                <div style={{ height: "2px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "4px" }} />
              ) : (
                <>
                  <div style={{ height: `${vH}px`, backgroundColor: "#22c55e", minHeight: vH > 0 ? "2px" : "0" }} />
                  <div style={{ height: `${fH}px`, backgroundColor: "#ef4444", minHeight: fH > 0 ? "2px" : "0" }} />
                  <div style={{ height: `${iH}px`, backgroundColor: "#f59e0b", minHeight: iH > 0 ? "2px" : "0" }} />
                </>
              )}
            </div>
            <span style={{ fontSize: "10px", color: "var(--m3-on-surface-variant)", position: "absolute", bottom: "0", whiteSpace: "nowrap" }}>{bar.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ResultBadgeMini({ result }: { result: ResultType }) {
  const cfg = RESULT_CFG[result];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 8px", borderRadius: "20px", backgroundColor: `${cfg.color}18`, border: `1px solid ${cfg.color}44`, whiteSpace: "nowrap" }}>
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: cfg.color }} />
      <span style={{ fontSize: "11px", fontWeight: 500, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

function PeriodDropdown({ value, onChange }: { value: Periodo; onChange: (v: Periodo) => void }) {
  const [open, setOpen] = useState(false);
  const label = PERIODO_OPTS.find((o) => o.value === value)?.label ?? "Período";
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
          borderRadius: "10px", border: "1px solid var(--m3-outline)",
          backgroundColor: "var(--m3-surface-container)", color: "var(--m3-on-surface)",
          fontSize: "13px", fontWeight: 500, cursor: "pointer",
        }}
      >
        <Calendar size={14} />
        {label}
        <ChevronDown size={13} style={{ color: "var(--m3-on-surface-variant)" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
          background: "var(--m3-surface-container-high, #1e293b)",
          border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)", overflow: "hidden", minWidth: 170,
        }}>
          {PERIODO_OPTS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 16px", border: "none", cursor: "pointer",
                background: opt.value === value ? "rgba(255,255,255,0.06)" : "none",
                color: opt.value === value ? "var(--m3-primary)" : "var(--m3-on-surface)",
                fontSize: 13, fontWeight: opt.value === value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResultsPage({ onNavigate }: { onNavigate?: (page: AppPage) => void }) {
  const { token } = useAuth();
  const [periodo, setPeriodo] = useState<Periodo>("7d");
  const [resumo,      setResumo]      = useState<ResumoApiResponse | null>(null);
  const [recentItems, setRecentItems] = useState<{ content: string; result: ResultType; confidence: number }[]>([]);
  const [serieTemp,   setSerieTemp]   = useState<PontoSerieTemporal[]>([]);
  const [fontesTop,   setFontesTop]   = useState<FonteTopItem[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    setIsLoading(true);

    const datas = periodoParaDatas(periodo);

    Promise.all([
      apiObterResumo(token, periodo).catch(() => null),
      apiListarVerificacoes(token, { por_pagina: 5, ordenacao: "desc", ...datas }).catch(() => null),
      apiObterFontesTop(token, periodo, 5).catch(() => null),
      apiObterSerieTemporal(token, periodo).catch(() => null),
    ]).then(([resumoData, listData, fontesData, serieData]) => {
      if (resumoData) setResumo(resumoData);
      if (listData) {
        setRecentItems(
          listData.itens.map(v => ({
            content:    v.texto_verificado,
            result:     mapResultado(v.resultado),
            confidence: Math.round(v.confianca * 100),
          }))
        );
      }
      if (fontesData) setFontesTop(fontesData);
      if (serieData) setSerieTemp(serieData);
    }).finally(() => setIsLoading(false));
  }, [token, periodo]);

  const stats = resumo
    ? {
        total:               resumo.total_verificacoes,
        verdadeiras:         resumo.total_reais,
        verdadeirasPercent:  resumo.total_verificacoes > 0 ? Math.round(resumo.total_reais        / resumo.total_verificacoes * 100) : 0,
        falsas:              resumo.total_falsas,
        falsasPercent:       resumo.total_verificacoes > 0 ? Math.round(resumo.total_falsas       / resumo.total_verificacoes * 100) : 0,
        inconclusivas:       resumo.total_inconclusivas,
        inconclusivasPercent: resumo.total_verificacoes > 0 ? Math.round(resumo.total_inconclusivas / resumo.total_verificacoes * 100) : 0,
      }
    : { total: 0, verdadeiras: 0, verdadeirasPercent: 0, falsas: 0, falsasPercent: 0, inconclusivas: 0, inconclusivasPercent: 0 };

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
        <Loader2 size={28} style={{ color: "var(--m3-primary)", animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>Carregando resultados…</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "4px" }}>Resultados</h1>
          <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>
            Acompanhe o desempenho das suas verificações e descubra insights importantes.
          </p>
        </div>
        <PeriodDropdown value={periodo} onChange={setPeriodo} />
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard label="Total de verificações" value={stats.total} />
        <StatCard label="Verdadeiras"   value={stats.verdadeiras}   sub={`(${stats.verdadeirasPercent}%)`}   subColor="#22c55e" />
        <StatCard label="Falsas"        value={stats.falsas}        sub={`(${stats.falsasPercent}%)`}        subColor="#ef4444" />
        <StatCard label="Inconclusivas" value={stats.inconclusivas} sub={`(${stats.inconclusivasPercent}%)`} subColor="#f59e0b" />
      </div>

      {/* Middle row: Donut + Bar chart */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
        {/* Donut */}
        <div style={{ flex: "1 1 280px", padding: "20px", borderRadius: "14px", backgroundColor: "var(--m3-surface-container)", border: "1px solid var(--m3-outline)" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "16px" }}>
            Distribuição dos resultados
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <DonutChart total={stats.total} verdadeiras={stats.verdadeiras} falsas={stats.falsas} inconclusivas={stats.inconclusivas} />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Verdadeiras",   value: stats.verdadeiras,   pct: stats.verdadeirasPercent,   color: "#22c55e" },
                { label: "Falsas",        value: stats.falsas,        pct: stats.falsasPercent,        color: "#ef4444" },
                { label: "Inconclusivas", value: stats.inconclusivas, pct: stats.inconclusivasPercent, color: "#f59e0b" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: item.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--m3-on-surface)" }}>{item.value}</span>
                      <span style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>{item.pct}%</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)" }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {stats.total === 0 && (
            <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", marginTop: "16px", textAlign: "center" }}>
              Faça sua primeira verificação para ver a distribuição.
            </p>
          )}
        </div>

        {/* Bar chart */}
        <div style={{ flex: "2 1 340px", padding: "20px", borderRadius: "14px", backgroundColor: "var(--m3-surface-container)", border: "1px solid var(--m3-outline)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)" }}>
              {PERIODO_CHART_LABEL[periodo]}
            </p>
          </div>
          <WeeklyBarChart bars={serieTemp} />
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
            {[
              { label: "Verdadeiras",   color: "#22c55e" },
              { label: "Falsas",        color: "#ef4444" },
              { label: "Inconclusivas", color: "#f59e0b" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", backgroundColor: l.color }} />
                <span style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Recent verifications + Top sources */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {/* Recent */}
        <div style={{ flex: "1 1 340px", borderRadius: "14px", backgroundColor: "var(--m3-surface-container)", border: "1px solid var(--m3-outline)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--m3-outline)" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)" }}>Últimas verificações</p>
            <button
              onClick={() => onNavigate?.("history")}
              style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "var(--m3-primary)", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
            >
              Ver histórico completo <ArrowRight size={13} />
            </button>
          </div>
          {recentItems.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>Nenhuma verificação ainda.</p>
            </div>
          ) : (
            recentItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", borderBottom: i < recentItems.length - 1 ? "1px solid var(--m3-outline)" : "none" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", color: "var(--m3-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                    {item.content}
                  </p>
                </div>
                <ResultBadgeMini result={item.result} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: RESULT_CFG[item.result].color, minWidth: "36px", textAlign: "right" }}>
                  {item.confidence}%
                </span>
              </div>
            ))
          )}
        </div>

        {/* Top sources — real data */}
        <div style={{ flex: "1 1 280px", borderRadius: "14px", backgroundColor: "var(--m3-surface-container)", border: "1px solid var(--m3-outline)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--m3-outline)" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)" }}>Fontes mais consultadas</p>
          </div>

          {fontesTop.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)", lineHeight: 1.6 }}>
                As fontes aparecerão aqui conforme você fizer verificações com busca web ativa.
              </p>
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {fontesTop.map((fonte, i) => (
                <div key={fonte.dominio} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 20px",
                  borderBottom: i < fontesTop.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <span style={{ fontSize: 12, color: "var(--m3-on-surface-variant)", minWidth: 18, fontWeight: 600 }}>
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "var(--m3-on-surface)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fonte.dominio}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      {/* Mini bar */}
                      <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        <div style={{ width: `${fonte.percentual}%`, height: "100%", background: "#60a5fa", borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--m3-on-surface-variant)", minWidth: 28, textAlign: "right" }}>
                        {fonte.percentual}%
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--m3-on-surface-variant)", minWidth: 28, textAlign: "right" }}>
                    {fonte.total}×
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
