const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ??
  (process.env as any)?.REACT_APP_API_BASE ??
  "http://localhost:8000"; // local fallback

export type PredictResponse = { label: string; score: number };

export async function health(): Promise<{ ok: boolean }> {
  const r = await fetch(`${API_BASE}/health`);
  if (!r.ok) throw new Error(`Health failed: ${r.status}`);
  return r.json();
}

export async function predict(file: File): Promise<PredictResponse> {
  const fd = new FormData();
  fd.append("video", file);
  const r = await fetch(`${API_BASE}/predict`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
