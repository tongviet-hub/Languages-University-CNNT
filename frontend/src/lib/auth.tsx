import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"

import { demoUsers, type Role, type User } from "@/lib/mock-data"

const STORAGE_KEY = "school-portal:user"

interface AuthContextValue {
  user: User | null
  login: (role: Role, email?: string) => void
  logout: () => void
  updateUser: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStored(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as User
    const source = demoUsers[stored.role]
    // Các trường đa ngôn ngữ luôn lấy từ dữ liệu gốc (bản lưu cũ chỉ có chuỗi tiếng Việt).
    return source ? { ...stored, className: source.className, address: source.address } : null
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
  const [user, setUser] = useState<User | null>(readStored)

  const login = useCallback((role: Role, email?: string) => {
    const next = { ...demoUsers[role], ...(email ? { email } : {}) }
    persist(next)
    setUser(next)
  }, [])

  const logout = useCallback(() => {
    persist(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      persist(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ user, login, logout, updateUser }), [user, login, logout, updateUser])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
