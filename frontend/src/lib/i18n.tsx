import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { brand } from "@/lib/brand"
import { dictionaries, type DictKey } from "@/lib/dictionary"
import { localeOf, localize, type Lang, type Localized } from "@/lib/locale"

type Params = Record<string, string | number>

interface I18nContextValue {
  lang: Lang
  /** Mã locale cho Intl / toLocaleDateString (vd. "vi-VN"). */
  locale: string
  setLang: (lang: Lang) => void
  t: (key: DictKey, params?: Params) => string
  /** Lấy chuỗi theo ngôn ngữ hiện tại từ dữ liệu có đủ vi/en. */
  tr: (value: Localized | string) => string
}

const STORAGE_KEY = "school-portal:lang"
const I18nContext = createContext<I18nContextValue | null>(null)

function readStored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === "vi" || v === "en" ? v : "vi"
  } catch {
    return "vi"
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStored)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = brand.name[lang]
    document.querySelector('meta[name="description"]')?.setAttribute("content", brand.description[lang])
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // bỏ qua nếu trình duyệt chặn storage
    }
  }, [])

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[lang]
    return {
      lang,
      locale: localeOf(lang),
      setLang,
      t: (key, params) =>
        dict[key].replace(/\{(\w+)\}/g, (match, name: string) => (name in (params ?? {}) ? String(params![name]) : match)),
      tr: (v) => localize(v, lang),
    }
  }, [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
