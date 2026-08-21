import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Facebook,
  Instagram,
  Linkedin,
  Lock,
  Mail,
  MessageCircle,
  Send,
  Youtube,
} from "lucide-react";
import { siteSettingsQuery } from "@/lib/queries";
import logo from "@/assets/logo-header.png";

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: settings } = useQuery(siteSettingsQuery);
  const email = settings?.["contact_email"] || "hello@milanstudents.network";
  const instagramUrl =
    settings?.["instagram_url"] || "https://www.instagram.com/milan_students_network/";
  const facebookUrl =
    settings?.["facebook_url"] || "https://www.facebook.com/profile.php?id=61591704673293";
  const linkedinUrl =
    settings?.["linkedin_url"] || "https://www.linkedin.com/company/milan-students-network";
  const youtubeUrl =
    settings?.["youtube_url"] || "https://www.youtube.com/channel/UCazDSeg5TvKbSTgF2i7eNug";
  const whatsappUrl = settings?.["whatsapp_url"] || "https://t.me";
  const telegramGroupUrl = settings?.["telegram_group_url"];
  const telegramBotUrl = settings?.["telegram_bot_url"];

  if (pathname.startsWith("/admin-portal")) return null;

  return (
    <footer className="relative mt-24 overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden
        className="animate-blob absolute -left-24 -top-24 size-72 bg-accent/25 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob absolute -bottom-32 right-0 size-80 bg-secondary/20 blur-3xl"
        style={{ animationDelay: "3s" }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Milan Students Network"
              className="size-11 shrink-0 rounded-full object-cover ring-2 ring-primary-foreground/15"
            />
            <span className="font-display text-lg font-semibold">Milan Students Network</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/75">
            A student-run community helping internationals land softly in Milan — rooms, friends,
            paperwork and everything in between.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:${email}`}
              aria-label="Email us"
              className="press grid size-11 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent"
            >
              <Mail className="size-5" />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="press grid size-11 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent"
            >
              <Instagram className="size-5" />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="press grid size-11 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent"
            >
              <Facebook className="size-5" />
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="press grid size-11 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent"
            >
              <Linkedin className="size-5" />
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="press grid size-11 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent"
            >
              <Youtube className="size-5" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp community"
              className="press grid size-11 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent"
            >
              <MessageCircle className="size-5" />
            </a>
            {telegramGroupUrl && (
              <a
                href={telegramGroupUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram group"
                className="press grid size-11 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent"
              >
                <Send className="size-5" />
              </a>
            )}
            {telegramBotUrl && (
              <a
                href={telegramBotUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram bot"
                className="press grid size-11 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent"
              >
                <Bot className="size-5" />
              </a>
            )}
          </div>
        </div>

        <nav aria-label="Explore" className="text-sm">
          <h2 className="font-display text-base font-semibold">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-primary-foreground/75">
            <li>
              <Link to="/accommodation" className="transition-colors hover:text-secondary">
                Accommodation
              </Link>
            </li>
            <li>
              <Link to="/events" className="transition-colors hover:text-secondary">
                Events
              </Link>
            </li>
            <li>
              <Link to="/services" className="transition-colors hover:text-secondary">
                Services
              </Link>
            </li>
            <li>
              <Link to="/faq" className="transition-colors hover:text-secondary">
                FAQ
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Community" className="text-sm">
          <h2 className="font-display text-base font-semibold">Community</h2>
          <ul className="mt-4 space-y-2.5 text-primary-foreground/75">
            <li>
              <Link to="/about" className="transition-colors hover:text-secondary">
                Our story
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-secondary">
                Contact us
              </Link>
            </li>
            <li>
              <Link
                to="/accommodation"
                hash="find-or-list"
                className="transition-colors hover:text-secondary"
              >
                Find or list a room
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-2 border-t border-primary-foreground/15 px-5 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Milan Students Network. Made by students, for students.</p>
        <p>Milano, Italia · {email}</p>
      </div>

      <Link
        to="/admin-portal/login"
        aria-label="Admin"
        className="absolute bottom-4 right-4 opacity-20 transition-opacity hover:opacity-60"
      >
        <Lock className="size-3.5" />
      </Link>
    </footer>
  );
}
