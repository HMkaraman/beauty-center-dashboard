// Simple token-based auth for client portal
// Token = base64(clientId:tenantId:expiry:signature)

const SECRET =
  process.env.CLIENT_PORTAL_SECRET || "client-portal-secret-change-me";

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function createClientToken(
  clientId: string,
  tenantId: string
): string {
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = `${clientId}:${tenantId}:${expiry}`;
  const signature = simpleHash(payload + SECRET);
  return btoa(`${payload}:${signature}`);
}

export function verifyClientToken(
  token: string
): { clientId: string; tenantId: string } | null {
  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;

    const [clientId, tenantId, expiryStr, signature] = parts;
    const expiry = parseInt(expiryStr);

    if (Date.now() > expiry) return null; // Expired

    const expectedSig = simpleHash(
      `${clientId}:${tenantId}:${expiryStr}` + SECRET
    );
    if (signature !== expectedSig) return null;

    return { clientId, tenantId };
  } catch {
    return null;
  }
}

export function getClientFromToken(
  authHeader: string | null
): { clientId: string; tenantId: string } | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyClientToken(authHeader.slice(7));
}
