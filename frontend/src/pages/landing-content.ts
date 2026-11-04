import type { Lang } from "@/lib/locale"

export interface Program {
  glyph: string
  name: string
  native: string
  description: string
  tags: string[]
}

export interface Feature {
  icon: "mic" | "plane" | "award" | "briefcase"
  title: string
  text: string
}

export interface NewsItem {
  image: string
  alt: string
  tag: string
  date: string
  title: string
  text: string
}

export interface LandingContent {
  nav: { href: string; label: string }[]
  ui: {
    mainNav: string
    mobileNav: string
    openMenu: string
    closeMenu: string
    enterPortal: string
    login: string
    portal: string
    contact: string
  }
  hero: {
    eyebrow: string
    titleBefore: string
    titleHighlight: string
    titleAfter: string
    text: string
    primaryCta: string
    secondaryCta: string
    imageAlt: string
    captionValue: string
    captionLabel: string
  }
  statsLabel: string
  stats: { value: string; label: string }[]
  programsSection: { eyebrow: string; title: string; text: string }
  programs: Program[]
  campus: {
    eyebrow: string
    title: string
    text: string
    images: { src: string; alt: string }[]
  }
  why: { eyebrow: string; title: string }
  features: Feature[]
  admissions: { eyebrow: string; title: string; text: string; consult: string }
  steps: { date: string; title: string; text: string }[]
  news: { eyebrow: string; title: string; items: NewsItem[] }
  cta: { title: string; text: string; primary: string; secondary: string }
  contactSection: {
    eyebrow: string
    title: string
    text: string
    items: { icon: "pin" | "phone" | "mail"; label: string; value: string }[]
  }
}

const vi: LandingContent = {
  nav: [
    { href: "#nganh-dao-tao", label: "Ngành đào tạo" },
    { href: "#vi-sao-chon", label: "Vì sao chọn chúng tôi" },
    { href: "#tuyen-sinh", label: "Tuyển sinh" },
    { href: "#tin-tuc", label: "Tin tức" },
    { href: "#lien-he", label: "Liên hệ" },
  ],
  ui: {
    mainNav: "Điều hướng chính",
    mobileNav: "Điều hướng di động",
    openMenu: "Mở menu",
    closeMenu: "Đóng menu",
    enterPortal: "Vào cổng sinh viên",
    login: "Đăng nhập",
    portal: "Cổng sinh viên",
    contact: "Liên hệ",
  },
  hero: {
    eyebrow: "Tuyển sinh năm học 2027",
    titleBefore: "Mở cánh cửa thế giới bằng ",
    titleHighlight: "ngoại ngữ",
    titleAfter: ".",
    text: "Đại học Ngoại ngữ Ánh Dương đào tạo nguồn nhân lực ngôn ngữ chất lượng cao: thành thạo ngoại ngữ, am hiểu văn hóa và sẵn sàng làm việc trong môi trường toàn cầu.",
    primaryCta: "Đăng ký xét tuyển",
    secondaryCta: "Khám phá ngành học",
    imageAlt: "Nhóm sinh viên cười tươi ngồi cạnh nhau ngoài trời",
    captionValue: "12.000+",
    captionLabel: "sinh viên đang theo học",
  },
  statsLabel: "Con số nổi bật",
  stats: [
    { value: "8", label: "Ngôn ngữ đào tạo" },
    { value: "12.000+", label: "Sinh viên đang theo học" },
    { value: "350+", label: "Giảng viên & chuyên gia bản ngữ" },
    { value: "96%", label: "Sinh viên có việc làm sau 12 tháng" },
  ],
  programsSection: {
    eyebrow: "Ngành đào tạo",
    title: "Chọn ngôn ngữ, chọn con đường của riêng cậu",
    text: "Mỗi ngành được thiết kế theo chuẩn đầu ra quốc tế, kết hợp thực hành dịch thuật và trải nghiệm văn hóa.",
  },
  programs: [
    {
      glyph: "Aa",
      name: "Ngôn ngữ Anh",
      native: "English",
      description: "Biên – phiên dịch, giảng dạy tiếng Anh, tiếng Anh thương mại và truyền thông quốc tế.",
      tags: ["IELTS 7.0+", "Phiên dịch"],
    },
    {
      glyph: "あ",
      name: "Ngôn ngữ Nhật",
      native: "日本語",
      description: "Đào tạo tiếng Nhật từ sơ cấp đến N1, kết hợp văn hóa doanh nghiệp và thực tập tại Nhật.",
      tags: ["JLPT N2+", "Thực tập Nhật"],
    },
    {
      glyph: "한",
      name: "Ngôn ngữ Hàn Quốc",
      native: "한국어",
      description: "Chương trình tiếng Hàn gắn với văn hóa, truyền thông và thương mại Hàn Quốc.",
      tags: ["TOPIK 5+", "Trao đổi SV"],
    },
    {
      glyph: "中",
      name: "Ngôn ngữ Trung Quốc",
      native: "中文",
      description: "Tiếng Trung thương mại, du lịch, biên – phiên dịch với lộ trình HSK rõ ràng.",
      tags: ["HSK 5+", "Thương mại"],
    },
    {
      glyph: "Éé",
      name: "Ngôn ngữ Pháp",
      native: "Français",
      description: "Tiếng Pháp chuyên ngành, văn hóa Pháp ngữ và cơ hội học bổng Pháp – Canada.",
      tags: ["DELF B2+", "Học bổng"],
    },
    {
      glyph: "Ää",
      name: "Ngôn ngữ Đức",
      native: "Deutsch",
      description: "Tiếng Đức kỹ thuật và kinh tế, hướng đến du học nghề và làm việc tại Đức.",
      tags: ["Goethe B2+", "Du học nghề"],
    },
  ],
  campus: {
    eyebrow: "Đời sống sinh viên",
    title: "Một môi trường để nói, để đọc và để kết bạn",
    text: "Thư viện đa ngôn ngữ, phòng học nhóm và các câu lạc bộ giúp cậu dùng ngoại ngữ mỗi ngày, không chỉ trong giờ học.",
    images: [
      { src: "/images/study-group.jpg", alt: "Sinh viên cùng học nhóm bên giá sách" },
      { src: "/images/library-aisle.jpg", alt: "Sinh viên bước giữa các dãy kệ trong thư viện" },
      { src: "/images/team-work.jpg", alt: "Ba sinh viên trao đổi bài vui vẻ" },
    ],
  },
  why: { eyebrow: "Vì sao chọn chúng tôi", title: "Học ngôn ngữ để làm việc ở bất cứ đâu" },
  features: [
    {
      icon: "mic",
      title: "Học cùng giảng viên bản ngữ",
      text: "Hơn 60 giảng viên và chuyên gia bản ngữ đồng hành trong các học phần nghe – nói, dịch thuật.",
    },
    {
      icon: "plane",
      title: "Trao đổi & thực tập quốc tế",
      text: "Hợp tác với hơn 40 trường đại học và doanh nghiệp tại Anh, Nhật, Hàn, Trung, Pháp, Đức.",
    },
    {
      icon: "award",
      title: "Chuẩn đầu ra quốc tế",
      text: "Cam kết chứng chỉ IELTS, JLPT, TOPIK, HSK, DELF, Goethe… ngay khi tốt nghiệp.",
    },
    {
      icon: "briefcase",
      title: "Kết nối nghề nghiệp",
      text: "Hội chợ việc làm hằng năm cùng 200+ doanh nghiệp đối tác trong nước và quốc tế.",
    },
  ],
  admissions: {
    eyebrow: "Tuyển sinh 2027",
    title: "Lộ trình xét tuyển đơn giản, minh bạch",
    text: "Xét tuyển theo học bạ, điểm thi tốt nghiệp THPT hoặc chứng chỉ ngoại ngữ quốc tế.",
    consult: "Nhận tư vấn tuyển sinh",
  },
  steps: [
    { date: "01/03 – 30/05", title: "Nhận hồ sơ xét tuyển", text: "Nộp trực tuyến hoặc tại phòng Tuyển sinh." },
    { date: "15/06", title: "Đánh giá năng lực ngoại ngữ", text: "Bài thi đầu vào để xếp lớp phù hợp trình độ." },
    { date: "30/06", title: "Công bố kết quả", text: "Thông báo trúng tuyển và hướng dẫn nhập học." },
    { date: "15/08", title: "Nhập học & khai giảng", text: "Làm quen môi trường, nhận thẻ sinh viên và lịch học." },
  ],
  news: {
    eyebrow: "Tin tức & sự kiện",
    title: "Đời sống học thuật tại Ánh Dương",
    items: [
      {
        image: "/images/campus-sign.jpg",
        alt: "Biển “Love to learn” tại khuôn viên trường",
        tag: "Sự kiện",
        date: "19/11/2026",
        title: "Ngày hội Ngôn ngữ & Văn hóa quốc tế",
        text: "Gian hàng văn hóa Anh – Nhật – Hàn – Trung – Pháp – Đức cùng nhiều tiết mục biểu diễn.",
      },
      {
        image: "/images/lecture.jpg",
        alt: "Giảng viên trình bày trước lớp trong phòng học",
        tag: "Học thuật",
        date: "10/11/2026",
        title: "Hội thảo “AI và tương lai nghề biên – phiên dịch”",
        text: "Các chuyên gia chia sẻ về công cụ dịch máy, kỹ năng hậu biên tập và cơ hội nghề nghiệp mới.",
      },
      {
        image: "/images/friends.jpg",
        alt: "Nhóm bạn sinh viên trò chuyện vui vẻ dưới nắng",
        tag: "Thành tích",
        date: "28/10/2026",
        title: "Sinh viên đạt giải Nhất Hùng biện tiếng Anh toàn quốc",
        text: "Đội tuyển của trường xuất sắc vượt qua 48 đội đến từ các trường đại học trên cả nước.",
      },
    ],
  },
  cta: {
    title: "Bắt đầu hành trình ngoại ngữ của cậu từ hôm nay",
    text: "Hồ sơ xét tuyển nhận đến hết ngày 30/05. Đội ngũ tư vấn sẽ liên hệ trong 24 giờ.",
    primary: "Nhận tư vấn",
    secondary: "Cổng sinh viên",
  },
  contactSection: {
    eyebrow: "Liên hệ",
    title: "Cần tư vấn? Chúng tôi luôn sẵn sàng",
    text: "Phòng Tuyển sinh làm việc từ thứ Hai đến thứ Bảy, 8:00 – 17:00.",
    items: [
      { icon: "pin", label: "Địa chỉ", value: "123 Đường Ngôn Ngữ, Quận 1, TP. Hồ Chí Minh" },
      { icon: "phone", label: "Hotline tuyển sinh", value: "1900 1234" },
      { icon: "mail", label: "Email", value: "tuyensinh@adu.edu.vn" },
    ],
  },
}

const en: LandingContent = {
  nav: [
    { href: "#nganh-dao-tao", label: "Programs" },
    { href: "#vi-sao-chon", label: "Why choose us" },
    { href: "#tuyen-sinh", label: "Admissions" },
    { href: "#tin-tuc", label: "News" },
    { href: "#lien-he", label: "Contact" },
  ],
  ui: {
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    enterPortal: "Go to student portal",
    login: "Sign in",
    portal: "Student portal",
    contact: "Contact",
  },
  hero: {
    eyebrow: "Admissions for the 2027 academic year",
    titleBefore: "Open the doors to the world with ",
    titleHighlight: "languages",
    titleAfter: ".",
    text: "Ánh Dương University of Foreign Languages trains high-quality language professionals: fluent in foreign languages, culturally aware and ready to work in a global environment.",
    primaryCta: "Apply now",
    secondaryCta: "Explore programs",
    imageAlt: "A group of smiling students sitting together outdoors",
    captionValue: "12,000+",
    captionLabel: "students enrolled",
  },
  statsLabel: "Key figures",
  stats: [
    { value: "8", label: "Languages taught" },
    { value: "12,000+", label: "Students enrolled" },
    { value: "350+", label: "Lecturers & native-speaker experts" },
    { value: "96%", label: "Graduates employed within 12 months" },
  ],
  programsSection: {
    eyebrow: "Programs",
    title: "Choose a language, choose your own path",
    text: "Every program follows international outcome standards and combines translation practice with cultural immersion.",
  },
  programs: [
    {
      glyph: "Aa",
      name: "English Studies",
      native: "English",
      description: "Translation and interpreting, English teaching, business English and international communication.",
      tags: ["IELTS 7.0+", "Interpreting"],
    },
    {
      glyph: "あ",
      name: "Japanese Studies",
      native: "日本語",
      description: "Japanese from beginner to N1, combined with corporate culture and internships in Japan.",
      tags: ["JLPT N2+", "Japan internship"],
    },
    {
      glyph: "한",
      name: "Korean Studies",
      native: "한국어",
      description: "A Korean program tied to Korean culture, media and commerce.",
      tags: ["TOPIK 5+", "Student exchange"],
    },
    {
      glyph: "中",
      name: "Chinese Studies",
      native: "中文",
      description: "Business and tourism Chinese, translation and interpreting with a clear HSK pathway.",
      tags: ["HSK 5+", "Business"],
    },
    {
      glyph: "Éé",
      name: "French Studies",
      native: "Français",
      description: "Specialized French, Francophone culture and scholarship opportunities in France and Canada.",
      tags: ["DELF B2+", "Scholarships"],
    },
    {
      glyph: "Ää",
      name: "German Studies",
      native: "Deutsch",
      description: "Technical and economic German, leading to vocational study and work in Germany.",
      tags: ["Goethe B2+", "Vocational study"],
    },
  ],
  campus: {
    eyebrow: "Student life",
    title: "A place to speak, to read and to make friends",
    text: "A multilingual library, group study rooms and clubs let you use your languages every day, not just in class.",
    images: [
      { src: "/images/study-group.jpg", alt: "Students studying together by the bookshelves" },
      { src: "/images/library-aisle.jpg", alt: "A student walking between library shelves" },
      { src: "/images/team-work.jpg", alt: "Three students happily discussing their work" },
    ],
  },
  why: { eyebrow: "Why choose us", title: "Learn languages to work anywhere" },
  features: [
    {
      icon: "mic",
      title: "Learn with native-speaker lecturers",
      text: "More than 60 native-speaker lecturers and experts support listening, speaking and translation courses.",
    },
    {
      icon: "plane",
      title: "International exchange & internships",
      text: "Partnerships with 40+ universities and companies in the UK, Japan, Korea, China, France and Germany.",
    },
    {
      icon: "award",
      title: "International outcome standards",
      text: "IELTS, JLPT, TOPIK, HSK, DELF, Goethe… certificates guaranteed by graduation.",
    },
    {
      icon: "briefcase",
      title: "Career connections",
      text: "An annual job fair with 200+ partner companies, both domestic and international.",
    },
  ],
  admissions: {
    eyebrow: "2027 Admissions",
    title: "A simple, transparent admissions path",
    text: "Admission based on high-school transcripts, national exam scores or international language certificates.",
    consult: "Get admissions advice",
  },
  steps: [
    { date: "Mar 1 – May 30", title: "Application period", text: "Apply online or at the Admissions Office." },
    { date: "Jun 15", title: "Language proficiency assessment", text: "An entrance test to place you in the right level." },
    { date: "Jun 30", title: "Results announced", text: "Admission notices and enrollment instructions." },
    { date: "Aug 15", title: "Enrollment & opening ceremony", text: "Get to know the campus, receive your student card and timetable." },
  ],
  news: {
    eyebrow: "News & events",
    title: "Academic life at Ánh Dương",
    items: [
      {
        image: "/images/campus-sign.jpg",
        alt: "“Love to learn” sign on campus",
        tag: "Event",
        date: "Nov 19, 2026",
        title: "International Language & Culture Festival",
        text: "Cultural booths from the UK, Japan, Korea, China, France and Germany, plus many performances.",
      },
      {
        image: "/images/lecture.jpg",
        alt: "A lecturer presenting to the class in a lecture room",
        tag: "Academic",
        date: "Nov 10, 2026",
        title: "Workshop: “AI and the future of translation careers”",
        text: "Experts share insights on machine translation tools, post-editing skills and new career opportunities.",
      },
      {
        image: "/images/friends.jpg",
        alt: "A group of students chatting happily in the sun",
        tag: "Achievement",
        date: "Oct 28, 2026",
        title: "Students win first prize at the national English Debate",
        text: "Our team outperformed 48 teams from universities across the country.",
      },
    ],
  },
  cta: {
    title: "Start your language journey today",
    text: "Applications are open until May 30. Our advisors will contact you within 24 hours.",
    primary: "Get advice",
    secondary: "Student portal",
  },
  contactSection: {
    eyebrow: "Contact",
    title: "Need advice? We're always ready",
    text: "The Admissions Office is open Monday to Saturday, 8:00 AM – 5:00 PM.",
    items: [
      { icon: "pin", label: "Address", value: "123 Ngôn Ngữ Street, District 1, Ho Chi Minh City" },
      { icon: "phone", label: "Admissions hotline", value: "1900 1234" },
      { icon: "mail", label: "Email", value: "tuyensinh@adu.edu.vn" },
    ],
  },
}

export const landingContent: Record<Lang, LandingContent> = { vi, en }
