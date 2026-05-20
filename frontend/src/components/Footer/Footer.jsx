import { Facebook, Instagram, Send, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#080808] px-5 py-12 text-white lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <a href="#home" className="flex items-center gap-3">
          <img src="logo/Logo White 40.svg" alt="" className="h-14 w-14" />
          <div>
            <p className="font-nico text-lg uppercase tracking-[0.16em] sm:tracking-[0.24em]">Omotenashi</p>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff6262] sm:tracking-[0.36em]">Academy</p>
          </div>
        </a>

        <div className="flex gap-3">
          {[
            { icon: Instagram, href: "https://www.instagram.com", label: "Instagram" },
            { icon: Send, href: "https://t.me", label: "Telegram" },
            { icon: Facebook, href: "https://www.facebook.com", label: "Facebook" },
            { icon: Youtube, href: "https://www.youtube.com", label: "YouTube" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/75 transition hover:border-[#ff6262] hover:text-[#ff6262]"
              >
                <Icon size={19} />
              </a>
            );
          })}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/45">
        © 2026 Omotenashi Academy. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
