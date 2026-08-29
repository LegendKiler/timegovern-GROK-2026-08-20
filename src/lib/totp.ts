/**
 * RFC 6238 TOTP — works with Google Authenticator & Microsoft Authenticator.
 * Pure Web Crypto; no paid services.
 */

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecret(bytes = 20): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return base32Encode(arr);
}

export function base32Encode(data: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data[i];
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Uint8Array {
  const cleaned = s.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const c of cleaned) {
    const idx = B32.indexOf(c);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

async function hmacSha1(key: Uint8Array, msg: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msg.buffer as ArrayBuffer);
  return new Uint8Array(sig);
}

function counterBuffer(counter: number): Uint8Array {
  const buf = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  return buf;
}

export async function generateTotp(
  secretBase32: string,
  timeMs: number = Date.now(),
  stepSec = 30,
  digits = 6
): Promise<string> {
  const key = base32Decode(secretBase32);
  const counter = Math.floor(timeMs / 1000 / stepSec);
  const mac = await hmacSha1(key, counterBuffer(counter));
  const offset = mac[mac.length - 1] & 0x0f;
  const bin =
    ((mac[offset] & 0x7f) << 24) |
    ((mac[offset + 1] & 0xff) << 16) |
    ((mac[offset + 2] & 0xff) << 8) |
    (mac[offset + 3] & 0xff);
  const otp = bin % 10 ** digits;
  return String(otp).padStart(digits, '0');
}

export async function verifyTotp(
  secretBase32: string,
  code: string,
  window = 1
): Promise<boolean> {
  const clean = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean)) return false;
  const now = Date.now();
  for (let w = -window; w <= window; w++) {
    const t = now + w * 30_000;
    const expected = await generateTotp(secretBase32, t);
    if (expected === clean) return true;
  }
  return false;
}

export function buildOtpAuthUrl(opts: {
  secret: string;
  email: string;
  issuer?: string;
}): string {
  const issuer = encodeURIComponent(opts.issuer || 'TimeGovern');
  const label = encodeURIComponent(`${opts.issuer || 'TimeGovern'}:${opts.email}`);
  return `otpauth://totp/${label}?secret=${opts.secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const n = crypto.getRandomValues(new Uint32Array(2));
    codes.push(
      (n[0] % 100000000).toString().padStart(8, '0').slice(0, 4) +
        '-' +
        (n[1] % 100000000).toString().padStart(8, '0').slice(0, 4)
    );
  }
  return codes;
}
