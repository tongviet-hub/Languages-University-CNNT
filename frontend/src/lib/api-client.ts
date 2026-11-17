/**
 * Lớp gọi API thật tới Portal (/api/v1/portal/...).
 *
 * - Web và API chạy cùng domain (Ingress/Nginx chia /api/v1 sang Portal) nên chỉ cần đường dẫn tương đối.
 *   Khi `npm run dev`, Vite chuyển /api sang http://localhost:8080 (xem vite.config.ts).
 * - Access token sống 15 phút. Gặp 401 thì tự đổi refresh token lấy cặp mới rồi gọi lại đúng 1 lần.
 * - Backend xoay vòng refresh token (token cũ chết ngay khi cấp token mới), nên nhiều request cùng gặp 401
 *   phải dùng CHUNG một lần refresh, nếu không lần refresh thứ hai sẽ dùng token đã chết và bị đăng xuất.
 */

const BASE = "/api/v1/portal"
const TOKENS_KEY = "school-portal:tokens"

export type ApiRole = "admin" | "teacher" | "student"

export interface ApiUser {
  id: string
  email: string
  fullName: string
  role: ApiRole
  isActive: boolean
}

interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends Tokens {
  user: ApiUser
  expiresIn: number
}

/** Lỗi theo định dạng chuẩn của backend: {"error":{"code","message","requestId"}}. */
export class ApiRequestError extends Error {
  /** Mã HTTP; 0 = không kết nối được máy chủ. */
  readonly status: number
  readonly code: string
  readonly requestId?: string

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message)
    this.name = "ApiRequestError"
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

// ---- Lưu token ----

let tokens: Tokens | null = readTokens()

function readTokens(): Tokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    return raw ? (JSON.parse(raw) as Tokens) : null
  } catch {
    return null
  }
}

export function setTokens(next: Tokens | null) {
  tokens = next
  try {
    if (next) localStorage.setItem(TOKENS_KEY, JSON.stringify(next))
    else localStorage.removeItem(TOKENS_KEY)
  } catch {
    // trình duyệt chặn storage: vẫn chạy được, chỉ là tải lại trang sẽ phải đăng nhập lại
  }
}

export const hasTokens = () => tokens !== null

/** Gọi khi phiên hết hạn hẳn (refresh thất bại). AuthProvider đăng ký để đưa người dùng về trang đăng nhập. */
let onSessionExpired: () => void = () => {}
export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn
}

// ---- Gọi API ----

async function toError(res: Response): Promise<ApiRequestError> {
  try {
    const body = (await res.json()) as { error?: { code?: string; message?: string; requestId?: string } }
    if (body.error) {
      return new ApiRequestError(res.status, body.error.code ?? "ERROR", body.error.message ?? res.statusText, body.error.requestId)
    }
  } catch {
    // body không phải JSON (vd lỗi từ proxy)
  }
  return new ApiRequestError(res.status, "HTTP_" + res.status, res.statusText || "Lỗi kết nối máy chủ")
}

async function send(path: string, init: RequestInit, withAuth: boolean): Promise<Response> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set("Content-Type", "application/json")
  if (withAuth && tokens) headers.set("Authorization", `Bearer ${tokens.accessToken}`)
  try {
    return await fetch(BASE + path, { ...init, headers })
  } catch {
    throw new ApiRequestError(0, "NETWORK_ERROR", "Không kết nối được máy chủ")
  }
}

let refreshing: Promise<boolean> | null = null

/** Đổi refresh token lấy cặp mới. Nhiều lời gọi cùng lúc dùng chung một Promise. */
function refreshTokens(): Promise<boolean> {
  if (!tokens) return Promise.resolve(false)
  refreshing ??= (async () => {
    try {
      const res = await send("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken: tokens!.refreshToken }) }, false)
      if (!res.ok) return false
      const data = (await res.json()) as AuthResponse
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
      return true
    } catch {
      return false
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

interface RequestOptions {
  method?: "GET" | "POST"
  body?: unknown
  /** false = không gửi token, không tự refresh (đăng nhập, đăng ký). */
  auth?: boolean
}

export async function apiRequest<T>(path: string, { method = "GET", body, auth = true }: RequestOptions = {}): Promise<T> {
  const init: RequestInit = { method, body: body === undefined ? undefined : JSON.stringify(body) }

  let res = await send(path, init, auth)
  if (res.status === 401 && auth && tokens) {
    if (await refreshTokens()) {
      res = await send(path, init, auth)
    } else {
      setTokens(null)
      onSessionExpired()
    }
  }

  if (!res.ok) throw await toError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// ---- Các endpoint của Portal ----

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  register: (email: string, password: string, fullName: string) =>
    apiRequest<AuthResponse>("/auth/register", { method: "POST", body: { email, password, fullName }, auth: false }),
  me: () => apiRequest<ApiUser>("/me"),
  logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<void>("/auth/change-password", { method: "POST", body: { currentPassword, newPassword } }),
}
