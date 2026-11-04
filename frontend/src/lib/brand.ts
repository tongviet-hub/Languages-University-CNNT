import type { Localized } from "@/lib/locale"

export const brand = {
  name: { vi: "Đại học Ngoại ngữ Ánh Dương", en: "Ánh Dương University of Foreign Languages" },
  /** Tên bằng ngôn ngữ còn lại — hiển thị phụ dưới logo. */
  nameAlt: { vi: "Ánh Dương University of Foreign Languages", en: "Đại học Ngoại ngữ Ánh Dương" },
  shortName: { vi: "ĐH Ngoại ngữ Ánh Dương", en: "Ánh Dương Univ. of Languages" },
  portalName: { vi: "Cổng Sinh viên", en: "Student Portal" },
  description: {
    vi: "Đại học Ngoại ngữ Ánh Dương – đào tạo Anh, Nhật, Hàn, Trung, Pháp, Đức. Tuyển sinh 2027 và cổng thông tin sinh viên.",
    en: "Ánh Dương University of Foreign Languages – English, Japanese, Korean, Chinese, French and German programs. 2027 admissions and student portal.",
  },
  year: 2026,
} as const satisfies Record<string, Localized | number>
