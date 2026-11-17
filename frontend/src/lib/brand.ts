import type { Localized } from "@/lib/locale"

export const brand = {
  name: { vi: "Đại học Ngoại ngữ Lumina", en: "Lumina University of Languages" },
  /** Tên bằng ngôn ngữ còn lại — hiển thị phụ dưới logo. */
  nameAlt: { vi: "Lumina University of Languages", en: "Đại học Ngoại ngữ Lumina" },
  shortName: { vi: "ĐH Ngoại ngữ Lumina", en: "Lumina Univ. of Languages" },
  portalName: { vi: "Cổng Sinh viên", en: "Student Portal" },
  description: {
    vi: "Đại học Ngoại ngữ Lumina – đào tạo Anh, Nhật, Hàn, Trung, Pháp, Đức. Tuyển sinh 2027 và cổng thông tin sinh viên.",
    en: "Lumina University of Languages – English, Japanese, Korean, Chinese, French and German programs. 2027 admissions and student portal.",
  },
  year: 2026,
} as const satisfies Record<string, Localized | number>
