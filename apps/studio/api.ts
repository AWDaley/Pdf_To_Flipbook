let capability = new URLSearchParams(location.hash.slice(1)).get('cap') ?? sessionStorage.getItem('paperbound-capability') ?? '';
if (capability) sessionStorage.setItem('paperbound-capability', capability);
if (location.hash.startsWith('#cap=')) history.replaceState(null, '', location.pathname + location.search);

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (capability) headers.set('X-Paperbound-Capability', capability);
  const response = await fetch(url, { ...options, headers });
  const data = await response.json() as T & { error?: string; message?: string };
  if (!response.ok) throw new Error(data.message || data.error || `Request failed (${response.status})`);
  return data;
}
export async function connect() {
  if (!capability) throw new Error('Open the launch link printed in the terminal. It connects this browser to your local library.');
  await request('/api/session', { method: 'POST' });
}
export function json(method: string, value: unknown): RequestInit { return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) }; }
export function clearCapability() { capability = ''; sessionStorage.removeItem('paperbound-capability'); }
