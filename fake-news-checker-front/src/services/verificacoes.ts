import type { ResultType } from "./api";

const BASE = "/api/v1/verificacoes";

export interface VerificacaoApiItem {
  id: number;
  texto_verificado: string;
  tipo: string;
  resultado: "REAL" | "FALSO" | "INCONCLUSIVO";
  confianca: number;
  criado_em: string;
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

export async function apiCriarVerificacao(
  token: string,
  texto: string,
  tipo: "text" | "link" | "image"
): Promise<VerificacaoApiItem> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ texto, tipo: mapTipo(tipo) }),
  });
  return handleResponse<VerificacaoApiItem>(res);
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
