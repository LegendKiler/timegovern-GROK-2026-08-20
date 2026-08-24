/** Web Crypto password hashing — works in Cloudflare Workers */
export async function hashPassword(password: string, saltB64?: string): Promise<{ salt: string; hash: string }> {
  const enc = new TextEncoder();
  const salt = saltB64
    ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArr = new Uint8Array(bits);
  const b64 = (u8: Uint8Array) => btoa(String.fromCharCode(...u8));
  return { salt: b64(salt), hash: b64(hashArr) };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt);
  return hash === expectedHash;
}

export function randomToken(bytes = 32): string {
  const u8 = crypto.getRandomValues(new Uint8Array(bytes));
  return [...u8].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}

export function corsOptions(): Response {
  return json({ ok: true }, 204);
}
