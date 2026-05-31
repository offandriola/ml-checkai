export type ApiWire = { classificacao?: string; confianca?: number } | null;
export type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

const CHECK_API_URL =
  import.meta.env.VITE_CHECK_API_URL?.toString() || "/predict/";

export async function postCheck(texto: string, timeoutMs = 8000): Promise<ApiWire> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(CHECK_API_URL, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    console.log("[api] status:", res.status, "data:", data);
    if (!res.ok) return null;
    return data;
  } catch (e) {
    console.error("[api] erro:", e);
    return null;
  } finally {
    clearTimeout(to);
  }
}

export function mapApiToResult(api: ApiWire): { result: ResultType; details: string } {
  if (!api || typeof api !== "object") {
    return { result: "nao_verificavel", details: "Não foi possível verificar" };
  }
  const classe = (api.classificacao ?? "").toString().trim().toLowerCase();
  const conf = typeof api.confianca === "number" ? api.confianca : undefined;
  const confPct = conf != null ? `${(conf * 100).toFixed(1)}%` : null;

  if (classe.includes("verd")) return { result: "verdadeira", details: confPct ? `Confiança: ${confPct}` : "Confiança indisponível" };
  if (classe.includes("fals")) return { result: "falsa", details: confPct ? `Confiança: ${confPct}` : "Confiança indisponível" };
  return { result: "nao_verificavel", details: "Não foi possível verificar" };
}
