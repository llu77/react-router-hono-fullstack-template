import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";

// مفتاح سري للتوقيع (في الإنتاج يجب أن يكون في متغيرات البيئة)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production"
);

const TOKEN_EXPIRY = "7d"; // صلاحية التوكن

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  branchId: number | null;
}

/**
 * إنشاء JWT Token
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * التحقق من JWT Token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * تشفير كلمة المرور
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * التحقق من كلمة المرور
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * استخراج التوكن من الكوكيز
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies["auth_token"] || null;
}

/**
 * إنشاء cookie header للتوكن
 */
export function createAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 أيام بالثواني
  return `auth_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

/**
 * إنشاء cookie header لحذف التوكن
 */
export function clearAuthCookie(): string {
  return "auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0";
}
