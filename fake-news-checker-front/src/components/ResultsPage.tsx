import { useState, useEffect } from "react";
import { TrendingUp, ChevronDown, ArrowRight, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  apiObterResumo,
  apiListarVerificacoes,
  mapResultado,
  type ResumoApiResponse,
  type VerificacaoApiItem,
} from "../services/verificacoes";
import type { AppPage } from "./Sidebar";

type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

const RESULT_CFG: Record<ResultType, { label: string; color: string }> = {
  verdadeira: { label: "Verdadeira", color: "#22c55e" },
  falsa:      { label: "Falsa",      color: "#ef4444" },
  nao_verificavel: { label: "Inconclusivo", color: "#f59e0b" },
};

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface WeekBar {
  day: string;
  total: number;
  verdadeiras: number;
  falsas: number;
  inconclusivas: number;
}

function buildWeeklyBars(verifications: VerificacaoApiItem[]): WeekBar[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const dd   = String(d.getDate()).padStart(2, "0");
    const dayStr = `${yyyy}-${mm}-${dd}`;
    const items = verifications.filter(v => v.criado_em.startsWith(dayStr));
    return {
      day: DAY_LABELS[d.getDay()],
      total: items.length,
      verdadeiras:  items.filter(v => v.resultado === "REAL").length,
      falsas:       items.filter(v => v.resultado === "FALSO").length,
      inconclusivas: items.filter(v => v.resultado === "INCONCLUSIVO").length,
    };
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, subColor, delta,
}: {
  label: string;
  value: number;
  sub?: string;
  subColor?: string;
  delta?: string;
}) {
  return (
    <div style={{ flex: "1 1 160px", padding: "20px", borderRadius: "14px", backgroundColor: "var(--m3-surface-container)", border: "1px solid var(--m3-outline)", display: "flex", flexDirection: "column", gap: "6px" }}>
      <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", fontWeight: 500 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "32px", fontWeight: 700, color: "var(--m3-on-surface)", lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontSize: "14px", fontWeight: 600, color: subColor ?? "var(--m3-on-surface-variant)" }}>{sub}</span>}
      </div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <TrendingUp size={12} style={{ color: "#22c55e" }} />
          <span style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)" }}>{delta}</span>
        </div>
      )}
    </div>
  );
}

function DonutChart({
  total, verdadeiras, falsas, inconclusivas,
}: {
  total: number;
  verdadeiras: number;
  falsas: number;
  inconclusivas: number;
}) {
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
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeLinecap="butt"
          transform={`rotate(${arc.rotation}, ${cx}, ${cy})`}
        />
      ))}
      <text x={cx} y={cy - 8}  textAnchor="middle" fill="var(--m3-on-surface)"         fontSize="22" fontWeight="700">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--m3-on-surface-variant)"  fontSize="10">verificações</text>
    </svg>
  );
}

function WeeklyBarChart({ bars }: { bars: WeekBar[] }) {
  const maxTotal = Math.max(...bars.map(b => b.total), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "140px", paddingBottom: "24px", position: "relative" }}>
      {bars.map((bar) => {
        const barH = Math.round((bar.total / maxTotal) * 116);
        const vH   = bar.total > 0 ? Math.round(barH * (bar.verdadeiras  / bar.total)) : 0;
        const fH   = bar.total > 0 ? Math.round(barH * (bar.falsas        / bar.total)) : 0;
        const iH   = bar.total > 0 ? Math.round(barH * (bar.inconclusivas / bar.total)) : 0;

        return (
          <div key={bar.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "100%", display: "flex", flexDirection: "column-reverse", borderRadius: "4px", overflow: "hidden", gap: "1px" }}>
              {bar.total === 0 ? (
                <div style={{ height: "2px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "4px" }} />
              ) : (
                <>
                  <div style={{ height: `${vH}px`, backgroundColor: "#22c55e", minHeight: vH > 0 ? "2px" : "0" }} />
                  <div style={{ height: `${fH}px`, backgroundColor: "#ef4444", minHeight: fH > 0 ? "2px" : "0" }} />
                  <div style={{ height: `${iH}px`, backgroundColor: "#f59e0b", minHeight: iH > 0 ? "2px" : "0" }} />
                </>
              )}
            </div>
            <span style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)", position: "absolute", bottom: "0" }}>
              {bar.day}
            </span>
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

// ── Main component ─────────────────────────────────────────────────────────────

export function ResultsPage({ onNavigate }: { onNavigate?: (page: AppPage) => void }) {
  const { token } = useAuth();
  const [resumo,      setResumo]      = useState<ResumoApiResponse | null>(null);
  const [recentItems, setRecentItems] = useState<{ content: string; result: ResultType; confidence: number }[]>([]);
  const [weeklyBars,  setWeeklyBars]  = useState<WeekBar[]>(() => buildWeeklyBars([]));
  const [isLoading,   setIsLoading]   = useState(true);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }

    Promise.all([
      apiObterResumo(token).catch(() => null),
      apiListarVerificacoes(token, { por_pagina: 100 }).catch(() => null),
    ]).then(([resumoData, listData]) => {
      if (resumoData) setResumo(resumoData);
      if (listData) {
        setRecentItems(
          listData.itens.slice(0, 5).map(v => ({
            content:    v.texto_verificado,
            result:     mapResultado(v.resultado),
            confidence: Math.round(v.confianca * 100),
          }))
        );
        setWeeklyBars(buildWeeklyBars(listData.itens));
      }
    }).finally(() => setIsLoading(false));
  }, [token]);

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
        <button
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", border: "1px solid var(--m3-outline)", backgroundColor: "var(--m3-surface-container)", color: "var(--m3-on-surface)", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
        >
          <Calendar size={14} />
          Últimos 7 dias
          <ChevronDown size={13} style={{ color: "var(--m3-on-surface-variant)" }} />
        </button>
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
            <DonutChart
              total={stats.total}
              verdadeiras={stats.verdadeiras}
              falsas={stats.falsas}
              inconclusivas={stats.inconclusivas}
            />
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
              Verificações nos últimos 7 dias
            </p>
            <button style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "8px", border: "1px solid var(--m3-outline)", backgroundColor: "transparent", color: "var(--m3-on-surface)", fontSize: "12px", cursor: "pointer" }}>
              Últimos 7 dias <ChevronDown size={12} />
            </button>
          </div>
          <WeeklyBarChart bars={weeklyBars} />
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
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", borderBottom: i < recentItems.length - 1 ? "1px solid var(--m3-outline)" : "none" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", color: "var(--m3-on-surface)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

        {/* Sources */}
        <div style={{ flex: "1 1 280px", borderRadius: "14px", backgroundColor: "var(--m3-surface-container)", border: "1px solid var(--m3-outline)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--m3-outline)" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)" }}>Fontes mais consultadas</p>
          </div>
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: "var(--m3-on-surface-variant)" }}>
              As fontes aparecerão aqui conforme você fizer verificações com busca web ativa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
