import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Download,
  FileText,
  Languages,
  Mail,
  MapPin,
  Menu,
  Mic,
  Phone,
  Plane,
  X,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { brand } from "@/lib/brand"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { landingContent, type Feature } from "@/pages/landing-content"

const featureIcons: Record<Feature["icon"], LucideIcon> = {
  mic: Mic,
  plane: Plane,
  award: Award,
  briefcase: Briefcase,
}

const contactIcons = { pin: MapPin, phone: Phone, mail: Mail } as const

function Logo({ className }: { className?: string }) {
  const { tr } = useI18n()
  return (
    <Link to="/" className={cn("flex items-center gap-3", className)} aria-label={tr(brand.name)}>
      <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <Languages className="size-5" />
      </span>
      <span className="grid leading-tight">
        <span className="text-sm font-semibold">{tr(brand.name)}</span>
        <span className="text-xs text-muted-foreground">{tr(brand.nameAlt)}</span>
      </span>
    </Link>
  )
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-wider text-primary uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-muted-foreground">{text}</p>}
    </div>
  )
}

export default function LandingPage() {
  const { user } = useAuth()
  const { lang, t, tr } = useI18n()
  const [open, setOpen] = useState(false)
  const c = landingContent[lang]

  const portalCta = user ? (
    <Button nativeButton={false} render={<Link to="/dashboard" />}>
      {c.ui.enterPortal}
    </Button>
  ) : (
    <div className="flex items-center gap-2">
      <Button variant="ghost" nativeButton={false} render={<Link to="/register" />}>
        {t("register.link")}
      </Button>
      <Button nativeButton={false} render={<Link to="/login" />}>
        {c.ui.login}
      </Button>
    </div>
  )

  return (
    <div className="min-h-svh scroll-smooth bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label={c.ui.mainNav} className="hidden items-center gap-6 lg:flex">
            {c.nav.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <div className="hidden sm:block">{portalCta}</div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={open ? c.ui.closeMenu : c.ui.openMenu}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav aria-label={c.ui.mobileNav} className="border-t bg-background px-4 py-3 lg:hidden">
            <ul className="space-y-1">
              {c.nav.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-2 sm:hidden">{portalCta}</li>
            </ul>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="border-b">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div>
              <p className="flex items-center gap-3 text-sm font-semibold tracking-wider text-primary uppercase">
                <span className="h-px w-8 bg-primary" aria-hidden /> {c.hero.eyebrow}
              </p>
              <h1 className="mt-5 text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {c.hero.titleBefore}
                <span className="text-primary">{c.hero.titleHighlight}</span>
                {c.hero.titleAfter}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">{c.hero.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="h-11 px-6 text-base" nativeButton={false} render={<a href="#tuyen-sinh" />}>
                  {c.hero.primaryCta} <ArrowRight />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-6 text-base"
                  nativeButton={false}
                  render={<a href="#nganh-dao-tao" />}
                >
                  {c.hero.secondaryCta}
                </Button>
              </div>
            </div>

            <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
              <img
                src="/images/hero-students.jpg"
                alt={c.hero.imageAlt}
                width={1400}
                height={1810}
                className="aspect-[4/4.2] w-full rounded-sm object-cover object-bottom"
              />
              <figcaption className="absolute bottom-0 left-0 bg-primary px-5 py-3 text-primary-foreground">
                <p className="text-2xl font-semibold">{c.hero.captionValue}</p>
                <p className="text-xs text-primary-foreground/85">{c.hero.captionLabel}</p>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Stats */}
        <section aria-label={c.statsLabel} className="border-y bg-card">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
            {c.stats.map((s) => (
              <div key={s.label} className="text-center">
                <dd className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">{s.value}</dd>
                <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* Programs */}
        <section id="nganh-dao-tao" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHeading {...c.programsSection} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.programs.map((p) => (
              <Card key={p.native} className="transition-shadow hover:shadow-lg">
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="flex size-12 items-center justify-center rounded-sm bg-primary/10 text-2xl font-semibold text-primary"
                      aria-hidden
                    >
                      {p.glyph}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">{p.native}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {p.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Campus life */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <SectionHeading eyebrow={c.campus.eyebrow} title={c.campus.title} text={c.campus.text} />
          <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <img
              src={c.campus.images[0].src}
              alt={c.campus.images[0].alt}
              loading="lazy"
              className="h-64 w-full rounded-sm object-cover md:col-span-2 md:row-span-2 md:h-full md:min-h-[26rem]"
            />
            <img
              src={c.campus.images[1].src}
              alt={c.campus.images[1].alt}
              loading="lazy"
              className="h-56 w-full rounded-sm object-cover"
            />
            <img
              src={c.campus.images[2].src}
              alt={c.campus.images[2].alt}
              loading="lazy"
              className="h-56 w-full rounded-sm object-cover"
            />
          </div>
        </section>

        {/* Why us */}
        <section id="vi-sao-chon" className="scroll-mt-20 bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold tracking-wider text-primary-foreground/80 uppercase">
                {c.why.eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{c.why.title}</h2>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {c.features.map(({ icon, title, text }) => {
                const Icon = featureIcons[icon]
                return (
                  <div key={icon} className="rounded-md bg-white/10 p-6 ring-1 ring-white/15">
                    <span className="flex size-11 items-center justify-center rounded-md bg-white text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-semibold">{title}</h3>
                    <p className="mt-2 text-sm text-primary-foreground/85">{text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Admissions */}
        <section id="tuyen-sinh" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHeading eyebrow={c.admissions.eyebrow} title={c.admissions.title} text={c.admissions.text} />
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {c.steps.map((s, i) => (
              <li key={s.date} className="relative rounded-md border bg-card p-6">
                <span className="flex size-9 items-center justify-center rounded-sm bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <CalendarDays className="size-3.5" /> {s.date}
                </p>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="h-11 px-6" nativeButton={false} render={<a href="#lien-he" />}>
              {c.admissions.consult} <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6" nativeButton={false} render={<Link to="/login" />}>
              <BookOpen /> {c.ui.portal}
            </Button>
          </div>
        </section>

        {/* News */}
        <section id="tin-tuc" className="scroll-mt-20 border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <SectionHeading eyebrow={c.news.eyebrow} title={c.news.title} />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {c.news.items.map((n) => (
                <article key={n.image} className="flex flex-col overflow-hidden rounded-md border bg-background">
                  <img src={n.image} alt={n.alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between text-xs">
                      <Badge>{n.tag}</Badge>
                      <time className="text-muted-foreground">{n.date}</time>
                    </div>
                    <h3 className="mt-4 font-semibold text-balance">{n.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{n.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Documents: file tĩnh trong public/tai-lieu, tải trực tiếp không cần đăng nhập (KT1) */}
        <section id="tai-lieu" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHeading eyebrow={c.documents.eyebrow} title={c.documents.title} text={c.documents.text} />
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4">
            {c.documents.items.map((d) => (
              <li key={d.href} className="flex flex-col gap-4 rounded-md border bg-card p-5 sm:flex-row sm:items-center">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="secondary">{d.format}</Badge>
                    <time className="text-muted-foreground">{d.date}</time>
                  </div>
                  <h3 className="mt-1.5 font-semibold">{d.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                </div>
                <Button variant="outline" nativeButton={false} render={<a href={d.href} download />}>
                  <Download /> {c.documents.download}
                </Button>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="relative isolate overflow-hidden">
          <img
            src="/images/library-lights.jpg"
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 -z-10 size-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-black/65" />
          <div className="mx-auto max-w-3xl px-4 py-20 text-center text-white sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{c.cta.title}</h2>
            <p className="mt-3 text-white/80">{c.cta.text}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="h-11 px-6 text-base" nativeButton={false} render={<a href="#lien-he" />}>
                {c.cta.primary} <ArrowRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 border-white/40 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
                nativeButton={false}
                render={<Link to="/login" />}
              >
                {c.cta.secondary}
              </Button>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="lien-he" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow={c.contactSection.eyebrow}
            title={c.contactSection.title}
            text={c.contactSection.text}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {c.contactSection.items.map(({ icon, label, value }) => {
              const Icon = contactIcons[icon]
              return (
                <div key={icon} className="flex items-start gap-4 rounded-md border bg-card p-6">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="font-medium break-words">{value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Building2 className="size-4" />
            <span>{t("common.copyright", { year: brand.year, name: tr(brand.name) })}</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-foreground">
              {c.ui.portal}
            </Link>
            <a href="#lien-he" className="hover:text-foreground">
              {c.ui.contact}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
