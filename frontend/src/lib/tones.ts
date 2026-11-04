import type { Subject } from "@/lib/mock-data"

/** Màu theo môn học — toàn bộ nằm trong dải đỏ/hồng/cam để giữ đồng bộ tông đỏ – trắng. */
export const toneClasses: Record<Subject["tone"], string> = {
  red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-900",
  rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-900",
  orange:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-200 dark:border-orange-900",
  amber:
    "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900",
  pink: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-200 dark:border-pink-900",
  stone:
    "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-900/60 dark:text-stone-200 dark:border-stone-800",
}
