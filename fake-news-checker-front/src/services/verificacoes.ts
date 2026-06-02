import type { ResultType } from "./api";

const BASE = "/api/v1/verificacoes";

export interface FonteInfo {
  titulo: string;
  url: string;
  snippet: string;
  fonte: string;
  texto_extraido?: string | null;
  // campos NLI e ranking (opcionais — chegam quando o backend está atualizado)
  nli_label?: string | null;
  nli_score?: number | null;
  tipo_fonte?: string | null;
  confiabilidade_fonte?: string | null;
  peso_fonte?: number | null;
}

export interface NliVotos {
  SUPPORTS: number;
  REFUTES: number;
  NEUTRAL: number;
}

export interface VerificacaoApiItem {
  id: number;
  texto_verificado: string;
  tipo: string;
  resultado: "REAL" | "FALSO" | "INCONCLUSIVO";
  confianca: number;
  fontes: FonteInfo[];
  criado_em: string;
  // campos NLI agregados (opcionais)
  nli_resultado_agregado?: string | null;
  nli_score_agregado?: number | null;
  nli_votos?: NliVotos | null;
  decisao_origem?: string | null;
  justificativa_decisao?: string | null;
}

export interface ResumoApiResponse {
  total_verificacoes: number;
  total_reais: number;
  total_falsas: number;
  total_inconclusivas: number;
  percentual_reais: number;
}

export interface ListagemResponse {
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
  itens: VerificacaoApiItem[];
}

// Converte resultado do backend para o tipo do frontend
export function mapResultado(resultado: "REAL" | "FALSO" | "INCONCLUSIVO"): ResultType {
  if (resultado === "REAL") return "verdadeira";
  if (resultado === "FALSO") return "falsa";
  return "nao_verificavel";
}

export function mapVerificacaoApiItem(data: VerificacaoApiItem): {
  result: ResultType;
  details: string;
  confidence: number;
  fontes: FonteInfo[];
  nliAgregado?: string | null;
  nliScore?: number | null;
  nliVotos?: NliVotos | null;
  decisaoOrigem?: string | null;
  justificativa?: string | null;
} {
  const raw = typeof data.confianca === "number" ? data.confianca : 0;
  let conf = Math.round(raw * 100);
  if (data.resultado === "INCONCLUSIVO" && conf === 0) conf = 55;
  return {
    result: mapResultado(data.resultado),
    details: `Confiança: ${conf}%`,
    confidence: conf,
    fontes: data.fontes ?? [],
    nliAgregado: data.nli_resultado_agregado,
    nliScore: data.nli_score_agregado,
    nliVotos: data.nli_votos,
    decisaoOrigem: data.decisao_origem,
    justificativa: data.justificativa_decisao,
  };
}

// Converte tipo do frontend para o backend
function mapTipo(tipo: "text" | "link" | "image"): string {
  if (tipo === "text") return "texto";
  if (tipo === "image") return "imagem";
  return "link";
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? "Erro na requisição");
  }
  return res.json();
}

export async function apiCriarVerificacaoImagem(
  token: string,
  file: File,
  timeoutMs = 120000
): Promise<VerificacaoApiItem> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const form = new FormData();
    form.append("imagem", file);
    const res = await fetch(`${BASE}/imagem`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      signal: controller.signal,
    });
    return handleResponse<VerificacaoApiItem>(res);
  } finally {
    clearTimeout(to);
  }
}

export async function apiCriarVerificacao(
  token: string,
  texto: string,
  tipo: "text" | "link" | "image",
  timeoutMs = 90000
): Promise<VerificacaoApiItem> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ texto, tipo: mapTipo(tipo) }),
      signal: controller.signal,
    });
    return handleResponse<VerificacaoApiItem>(res);
  } finally {
    clearTimeout(to);
  }
}

export async function apiListarVerificacoes(
  token: string,
  opts: {
    resultado?: "REAL" | "FALSO" | "INCONCLUSIVO";
    busca?: string;
    pagina?: number;
    por_pagina?: number;
  } = {}
): Promise<ListagemResponse> {
  const params = new URLSearchParams();
  if (opts.resultado) params.set("resultado", opts.resultado);
  if (opts.busca) params.set("busca", opts.busca);
  if (opts.pagina) params.set("pagina", String(opts.pagina));
  if (opts.por_pagina) params.set("por_pagina", String(opts.por_pagina));

  const res = await fetch(`${BASE}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ListagemResponse>(res);
}

export async function apiObterResumo(token: string): Promise<ResumoApiResponse> {
  const res = await fetch(`${BASE}/resumo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ResumoApiResponse>(res);
}
