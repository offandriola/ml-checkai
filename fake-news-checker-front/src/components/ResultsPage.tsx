import { useState } from "react";
import { TrendingUp, ChevronDown, ArrowRight, Calendar } from "lucide-react";

// ── Mock data ─────────────────────────────────────────────────────────────────

const STATS = {
  total: 128,
  totalDelta: "+12 que o período anterior",
  verdadeiras: 92,
  verdadeirasPercent: 72,
  falsas: 23,
  falsasPercent: 18,
  inconclusivas: 13,
  inconclusivasPercent: 10,
};

const WEEKLY_BARS = [
  { day: "Seg", total: 14, verdadeiras: 9, falsas: 3, inconclusivas: 2 },
  { day: "Ter", total: 22, verdadeiras: 16, falsas: 4, inconclusivas: 2 },
  { day: "Qua", total: 18, verdadeiras: 13, falsas: 3, inconclusivas: 2 },
  { day: "Qui", total: 25, verdadeiras: 18, falsas: 5, inconclusivas: 2 },
  { day: "Sex", total: 20, verdadeiras: 14, falsas: 4, inconclusivas: 2 },
  { day: "Sáb", total: 16, verdadeiras: 11, falsas: 3, inconclusivas: 2 },
  { day: "Dom", total: 13, verdadeiras: 11, falsas: 1, inconclusivas: 1 },
];

const RECENT_ITEMS = [
  { content: "Bolsonaro anuncia nova isenção de imposto para quem ganha até...", result: "nao_verificavel" as const, confidence: 45 },
  { content: "Pix terá cobrança de taxa para pessoas físicas a partir de julho.", result: "falsa" as const, confidence: 18 },
  { content: "Vacina brasileira contra a dengue é aprovada pela Anvisa.", result: "verdadeira" as const, confidence: 92 },
  { content: "INSS vai devolver automaticamente valores descontados indevidamente.", result: "verdadeira" as const, confidence: 88 },
  { content: "O Banco Central lançou uma nova nota de R$ 200.", result: "falsa" as const, confidence: 15 },
];

const SOURCES = [
  { name: "Exame Brasil", url: "exame.com", count: 34, icon: "E" },
  { name: "Agência Brasil", url: "agenciabrasil.gov.br", count: 28, icon: "A" },
  { name: "G1 – Globo", url: "g1.globo.com", count: 22, icon: "G" },
  { name: "Folha de S.Paulo", url: "folha.uol.com.br", count: 18, icon: "F" },
  { name: "UOL Notícias", url: "noticias.uol.com.br", count: 14, icon: "U" },
  { name: "TRE / TSE", url: "tre.jus.br", count: 10, icon: "T" },
];

type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

const RESULT_CFG: Record<ResultType, { label: string; color: string }> = {
  verdadeira: { label: "Verdadeira", color: "#22c55e" },
  falsa: { label: "Falsa", color: "#ef4444" },
  nao_verificavel: { label: "Inconclusivo", color: "#f59e0b" },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  subColor,
  delta,
}: {
  label: string;
  value: number;
  sub?: string;
  subColor?: string;
  delta?: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        padding: "20px",
        borderRadius: "14px",
        backgroundColor: "var(--m3-surface-container)",
        border: "1px solid var(--m3-outline)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <p style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)", fontWeight: 500 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span style={{ fontSize: "32px", fontWeight: 700, color: "var(--m3-on-surface)", lineHeight: 1 }}>
          {value}
        </span>
        {sub && (
          <span style={{ fontSize: "14px", fontWeight: 600, color: subColor || "var(--m3-on-surface-variant)" }}>
            {sub}
          </span>
        )}
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

function DonutChart() {
  const cx = 80, cy = 80, r = 60, stroke = 22;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { pct: 0.72, color: "#22c55e" },
    { pct: 0.18, color: "#ef4444" },
    { pct: 0.10, color: "#f59e0b" },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = seg.pct * circumference;
    const gap = circumference - dash;
    const rotation = offset * 360 - 90;
    offset += seg.pct;
    return { ...seg, dash, gap, rotation };
  });

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeLinecap="butt"
          transform={`rotate(${arc.rotation}, ${cx}, ${cy})`}
        />
      ))}
      {/* Center label */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--m3-on-surface)" fontSize="22" fontWeight="700">
        {STATS.total}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--m3-on-surface-variant)" fontSize="10">
        verificações
      </text>
    </svg>
  );
}

function WeeklyBarChart() {
  const maxTotal = Math.max(...WEEKLY_BARS.map((b) => b.total));

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "140px", paddingBottom: "24px", position: "relative" }}>
      {WEEKLY_BARS.map((bar) => {
        const heightPct = bar.total / maxTotal;
        const vH = Math.round(heightPct * 116 * (bar.verdadeiras / bar.total));
        const fH = Math.round(heightPct * 116 * (bar.falsas / bar.total));
        const iH = Math.round(heightPct * 116 * (bar.inconclusivas / bar.total));

        return (
          <div
            key={bar.day}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column-reverse",
                borderRadius: "4px",
                overflow: "hidden",
                gap: "1px",
              }}
            >
              <div style={{ height: `${vH}px`, backgroundColor: "#22c55e", minHeight: vH > 0 ? "2px" : "0" }} />
              <div style={{ height: `${fH}px`, backgroundColor: "#ef4444", minHeight: fH > 0 ? "2px" : "0" }} />
              <div style={{ height: `${iH}px`, backgroundColor: "#f59e0b", minHeight: iH > 0 ? "2px" : "0" }} />
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
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 8px",
        borderRadius: "20px",
        backgroundColor: `${cfg.color}18`,
        border: `1px solid ${cfg.color}44`,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: cfg.color }} />
      <span style={{ fontSize: "11px", fontWeight: 500, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResultsPage() {
  const [_period] = useState("04/05/2025 - 31/05/2025");

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
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
            Resultados
          </h1>
          <p style={{ fontSize: "14px", color: "var(--m3-on-surface-variant)" }}>
            Acompanhe o desempenho das suas verificações e descubra insights importantes.
          </p>
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
          <Calendar size={14} />
          04/05/2025 – 31/05/2025
          <ChevronDown size={13} style={{ color: "var(--m3-on-surface-variant)" }} />
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard
          label="Total de verificações"
          value={STATS.total}
          delta={STATS.totalDelta}
        />
        <StatCard
          label="Verdadeiras"
          value={STATS.verdadeiras}
          sub={`(${STATS.verdadeirasPercent}%)`}
          subColor="#22c55e"
        />
        <StatCard
          label="Falsas"
          value={STATS.falsas}
          sub={`(${STATS.falsasPercent}%)`}
          subColor="#ef4444"
        />
        <StatCard
          label="Inconclusivas"
          value={STATS.inconclusivas}
          sub={`(${STATS.inconclusivasPercent}%)`}
          subColor="#f59e0b"
        />
      </div>

      {/* Middle row: Donut + Bar chart */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
        {/* Donut */}
        <div
          style={{
            flex: "1 1 280px",
            padding: "20px",
            borderRadius: "14px",
            backgroundColor: "var(--m3-surface-container)",
            border: "1px solid var(--m3-outline)",
          }}
        >
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)", marginBottom: "16px" }}>
            Distribuição dos resultados
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <DonutChart />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Verdadeiras", value: STATS.verdadeiras, pct: STATS.verdadeirasPercent, color: "#22c55e" },
                { label: "Falsas", value: STATS.falsas, pct: STATS.falsasPercent, color: "#ef4444" },
                { label: "Inconclusivas", value: STATS.inconclusivas, pct: STATS.inconclusivasPercent, color: "#f59e0b" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "3px",
                      backgroundColor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--m3-on-surface)" }}>
                        {item.value}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--m3-on-surface-variant)" }}>
                        {item.pct}%
                      </span>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)" }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div
          style={{
            flex: "2 1 340px",
            padding: "20px",
            borderRadius: "14px",
            backgroundColor: "var(--m3-surface-container)",
            border: "1px solid var(--m3-outline)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)" }}>
              Verificações nos últimos 7 dias
            </p>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                borderRadius: "8px",
                border: "1px solid var(--m3-outline)",
                backgroundColor: "transparent",
                color: "var(--m3-on-surface)",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Últimos 7 dias
              <ChevronDown size={12} />
            </button>
          </div>
          <WeeklyBarChart />
          {/* Legend */}
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
            {[
              { label: "Verdadeiras", color: "#22c55e" },
              { label: "Falsas", color: "#ef4444" },
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
        <div
          style={{
            flex: "1 1 340px",
            borderRadius: "14px",
            backgroundColor: "var(--m3-surface-container)",
            border: "1px solid var(--m3-outline)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid var(--m3-outline)",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)" }}>
              Últimas verificações
            </p>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: "none",
                border: "none",
                color: "var(--m3-primary)",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Ver completo
              <ArrowRight size={13} />
            </button>
          </div>
          {RECENT_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 20px",
                borderBottom: i < RECENT_ITEMS.length - 1 ? "1px solid var(--m3-outline)" : "none",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--m3-on-surface)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.content}
                </p>
              </div>
              <ResultBadgeMini result={item.result} />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: RESULT_CFG[item.result].color,
                  minWidth: "36px",
                  textAlign: "right",
                }}
              >
                {item.confidence}%
              </span>
            </div>
          ))}
        </div>

        {/* Sources */}
        <div
          style={{
            flex: "1 1 280px",
            borderRadius: "14px",
            backgroundColor: "var(--m3-surface-container)",
            border: "1px solid var(--m3-outline)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--m3-outline)" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--m3-on-surface)" }}>
              Fontes mais consultadas
            </p>
          </div>
          {SOURCES.map((src, i) => {
            const maxCount = SOURCES[0].count;
            return (
              <div
                key={src.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 20px",
                  borderBottom: i < SOURCES.length - 1 ? "1px solid var(--m3-outline)" : "none",
                }}
              >
                {/* Source icon */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,55,132,0.12)",
                    color: "var(--m3-primary)",
                    fontSize: "13px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {src.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", color: "var(--m3-on-surface)", fontWeight: 500 }}>
                    {src.name}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--m3-on-surface-variant)", marginTop: "2px" }}>
                    {src.url}
                  </p>
                  {/* Mini bar */}
                  <div
                    style={{
                      marginTop: "4px",
                      height: "3px",
                      borderRadius: "2px",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(src.count / maxCount) * 100}%`,
                        borderRadius: "2px",
                        backgroundColor: "var(--m3-primary)",
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--m3-on-surface)", minWidth: "24px", textAlign: "right" }}>
                  {src.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
