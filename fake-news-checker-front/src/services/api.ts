import type { FonteInfo } from "./verificacoes";
import { mapResultado } from "./verificacoes";

export type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

export interface VerificarPublicoApi {
  texto_verificado: string;
  tipo: string;
  resultado: "REAL" | "FALSO" | "INCONCLUSIVO";
  confianca: number;
  modelo_ativo: boolean;
  fontes: FonteInfo[];
}

const VERIFICAR_API_URL =
  import.meta.env.VITE_VERIFICAR_API_URL?.toString() || "/api/v1/verificar";

export async function postVerificar(
  texto: string,
  tipo: "texto" | "link" | "imagem" = "texto",
  timeoutMs = 90000
): Promise<VerificarPublicoApi | null> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(VERIFICAR_API_URL, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ texto, tipo }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return null;
    return data as VerificarPublicoApi;
  } catch (e) {
    console.error("[api] erro na verificação:", e);
    return null;
  } finally {
    clearTimeout(to);
  }
}

export function mapVerificarToResult(api: VerificarPublicoApi | null): {
  result: ResultType;
  details: string;
  confidence: number;
  fontes: FonteInfo[];
} {
  if (!api) {
    return {
      result: "nao_verificavel",
      details: "Não foi possível verificar",
      confidence: 0,
      fontes: [],
    };
  }
  const conf = Math.round(api.confianca * 100);
  return {
    result: mapResultado(api.resultado),
    details: `Confiança: ${conf}%`,
    confidence: conf,
    fontes: api.fontes ?? [],
  };
}
