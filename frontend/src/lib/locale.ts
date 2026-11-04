export type Lang = "vi" | "en"

export const languages: { value: Lang; label: string; short: string; locale: string }[] = [
  { value: "vi", label: "Tiếng Việt", short: "VI", locale: "vi-VN" },
  { value: "en", label: "English", short: "EN", locale: "en-US" },
]

/** Văn bản có đủ cả hai ngôn ngữ — dùng cho dữ liệu mẫu (môn học, thông báo...). */
export type Localized = Record<Lang, string>

/** Chấp nhận cả chuỗi thường để tương thích dữ liệu cũ đã lưu trong localStorage. */
export function localize(value: Localized | string, lang: Lang): string {
  return typeof value === "string" ? value : value[lang]
}

export const localeOf = (lang: Lang) => languages.find((l) => l.value === lang)!.locale
