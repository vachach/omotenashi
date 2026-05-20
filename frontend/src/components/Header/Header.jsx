import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Bosh sahifa", href: "#home" },
  { label: "Biz haqimizda", href: "#about" },
  { label: "Kurslar", href: "#services" },
  { label: "Maqolalar", href: "#articles" },
  { label: "Aloqa", href: "#contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? "border-b border-white/10 bg-[#0d0d0d]/95 shadow-2xl shadow-black/20 backdrop-blur"
          : "bg-gradient-to-b from-black/75 to-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
        <a href="#home" className="flex min-w-0 items-center gap-3" aria-label="Omotenashi Academy">
          <img src="logo/Logo White 40.svg" alt="" className="h-12 w-12 flex-none" />
          <div className="min-w-0 leading-tight">
            <span className="block truncate font-nico text-sm uppercase tracking-[0.18em] text-white sm:tracking-[0.25em]">
              Omotenashi
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-[#e34b4b] sm:tracking-[0.35em]">
              Academy
            </span>
          </div>
        </a>

        <div className="hidden items-center gap-6 lg:flex xl:gap-7">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-white/75 transition hover:text-[#ff5b5b] xl:text-sm xl:tracking-[0.16em]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className="hidden rounded-full border border-[#ff5b5b]/60 bg-[#ff3838] px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-[#e92828] xl:inline-flex"
        >
          Ro'yxatdan o'tish
        </a>

        <button
          className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10 lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Menyuni yopish" : "Menyuni ochish"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#0d0d0d] px-5 pb-5 pt-2 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/80 hover:bg-white/10 hover:text-[#ff5b5b] sm:tracking-[0.16em]"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-full bg-[#ff3838] px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.1em] text-white sm:tracking-[0.14em]"
            >
              Ro'yxatdan o'tish
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
