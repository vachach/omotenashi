import { ArrowRight, PlayCircle } from "lucide-react";

export default function SamuraiSection() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <img
        src="Samurai.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40 saturate-[0.55]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_24%,rgba(255,64,64,0.26),transparent_28%),linear-gradient(90deg,rgba(5,5,5,0.96)_0%,rgba(8,8,8,0.82)_42%,rgba(8,8,8,0.34)_100%)]" />
      <img
        src="Sun.png"
        alt=""
        className="absolute right-8 top-28 hidden h-32 w-32 opacity-90 md:block"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-20 pt-28 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex max-w-full items-center gap-3 border-l-4 border-[#ff3838] bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur sm:mb-7 sm:text-xs sm:tracking-[0.28em]">
            Online yapon tili akademiyasi
          </div>
          <h1 className="max-w-full break-words font-nico text-4xl leading-[1.08] text-white sm:text-6xl lg:text-8xl">
            Omotenashi Academy
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:mt-7 sm:text-xl sm:leading-8">
            N5 dan N1 gacha yapon tilini tartibli, jonli va natijaga yo'naltirilgan
            formatda o'rganing. Tajribali ustozlar, kichik guruhlar va Yaponiyaga
            tayyorgarlik uchun amaliy dastur.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff3838] px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-2xl shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-[#e42c2c] sm:px-7 sm:text-sm sm:tracking-[0.15em]"
            >
              Kurslarni ko'rish <ArrowRight size={18} />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 sm:px-7 sm:text-sm sm:tracking-[0.15em]"
            >
              <PlayCircle size={18} /> Akademiya haqida
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 border-y border-white/10 py-5 sm:mt-14 sm:grid-cols-3">
            {[
              ["N1-N2", "sertifikatli ustozlar"],
              ["6+", "daraja bo'yicha kurs"],
              ["24/7", "online qo'llab-quvvatlash"],
            ].map(([value, label]) => (
              <div key={value}>
                <p className="font-nico text-2xl text-white sm:text-3xl">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.1em] text-white/60 sm:tracking-[0.18em]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
