import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { authApi, ApiRequestError, hasTokens, setSessionExpiredHandler, setTokens, type ApiUser } from "@/lib/api-client"
import { demoUsers, type Role, type User } from "@/lib/mock-data"

const STORAGE_KEY = "school-portal:user"

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Backend chỉ có id, email, họ tên, vai trò. Các trường còn lại của trang hồ sơ (lớp, mã SV, SĐT, địa chỉ,
 * ngày sinh) CHƯA có API nên tạm lấy từ dữ liệu mẫu theo vai trò.
 * Giao diện chỉ có 2 kiểu: sinh viên và giảng viên -> admin dùng giao diện giảng viên.
 */
function toUser(u: ApiUser): User {
  const role: Role = u.role === "student" ? "student" : "teacher"
  return { ...demoUsers[role], id: u.id, name: u.fullName, email: u.email, role }
}

function readStored(): User | null {
  if (!hasTokens()) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function persist(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // bỏ qua nếu trình duyệt chặn storage
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Hiện ngay người dùng đã lưu (không nháy trang đăng nhập), rồi hỏi lại backend ở useEffect bên dưới.
  const [user, setUser] = useState<User | null>(readStored)

  const clear = useCallback(() => {
    setTokens(null)
    persist(null)
    setUser(null)
  }, [])

  const apply = useCallback((u: ApiUser) => {
    const next = toUser(u)
    persist(next)
    setUser(next)
    return next
  }, [])

  // Phiên hết hạn hẳn (refresh token hết hạn/bị thu hồi) -> AppLayout tự đưa về /login
  useEffect(() => setSessionExpiredHandler(clear), [clear])

  // Mở lại trang: kiểm tra token còn dùng được không và lấy thông tin mới nhất
  useEffect(() => {
    if (!hasTokens()) return
    authApi.me().then(apply, (err) => {
      // Mất mạng thì giữ phiên; còn token sai/hết hạn thì đăng xuất
      if (err instanceof ApiRequestError && err.status !== 0 && err.status < 500) clear()
    })
  }, [apply, clear])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password)
      setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken })
      return apply(res.user)
    },
    [apply]
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout() // thu hồi refresh token trên server
    } catch {
      // server lỗi vẫn xoá phiên ở trình duyệt
    }
    clear()
  }, [clear])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword)
  }, [])

  const value = useMemo(() => ({ user, login, logout, changePassword }), [user, login, logout, changePassword])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
