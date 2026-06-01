const BASE = "/api/v1/auth";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  nome: string;
  email: string;
}

export interface ForgotPasswordResponse {
  mensagem: string;
  token_recuperacao?: string | null;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? "Erro na requisição");
  }
  return res.json();
}

export async function apiLogin(email: string, senha: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  return handleResponse<LoginResponse>(res);
}

export async function apiRegister(
  nome: string,
  email: string,
  senha: string
): Promise<UserResponse> {
  const res = await fetch(`${BASE}/cadastro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha }),
  });
  return handleResponse<UserResponse>(res);
}

export async function apiMe(token: string): Promise<UserResponse> {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<UserResponse>(res);
}

export async function apiForgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const res = await fetch(`${BASE}/recuperar-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<ForgotPasswordResponse>(res);
}

export async function apiUpdateProfile(
  token: string,
  data: { nome?: string; email?: string }
): Promise<UserResponse> {
  const res = await fetch(`${BASE}/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<UserResponse>(res);
}

export async function apiChangePassword(
  token: string,
  senha_atual: string,
  nova_senha: string
): Promise<void> {
  const res = await fetch(`${BASE}/me/senha`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ senha_atual, nova_senha }),
  });
  await handleResponse<{ mensagem: string }>(res);
}

export async function apiClearHistory(token: string): Promise<void> {
  const res = await fetch(`${BASE}/me/historico`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse<{ mensagem: string }>(res);
}

export async function apiDeleteAccount(token: string): Promise<void> {
  const res = await fetch(`${BASE}/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse<{ mensagem: string }>(res);
}
