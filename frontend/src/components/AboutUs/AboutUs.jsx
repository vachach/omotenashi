import { CheckCircle2 } from "lucide-react";

const cultureItems = [
  { src: "about/Kenshi.png", label: "Intizom" },
  { src: "about/Kabuto.png", label: "Himoya" },
  { src: "about/Hasu.png", label: "Sabr" },
  { src: "about/Geisha.png", label: "Madaniyat" },
  { src: "about/Origami.png", label: "Aniqlik" },
  { src: "about/Tsuru.png", label: "Maqsad" },
];

export default function AboutUs() {
  return (
    <section id="about" className="relative overflow-hidden bg-white px-5 py-24 sm:py-28 lg:px-8">
      <img src="Torii.png" alt="" className="absolute -right-8 top-20 hidden h-80 opacity-10 lg:block" />
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-[#d62626]">
            Biz haqimizda
          </p>
          <h2 className="break-words font-nico text-3xl leading-tight text-[#141414] sm:text-5xl">
            Til, madaniyat va maqsad bir joyda
          </h2>
          <p className="mt-7 text-base leading-7 text-[#4e4e4e] sm:text-lg sm:leading-8">
            Omotenashi Academy yapon tilini o'quvchining real maqsadiga bog'lab
            o'rgatadi: JLPT sertifikati, Yaponiyada o'qish, ish intervyusi yoki
            kundalik muloqot. Darslar online, ammo jarayon shaxsiy nazorat va
            muntazam feedback bilan olib boriladi.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "N1 va N2 darajadagi tajribali o'qituvchilar",
              "Kichik guruhlar va individual progress tracking",
              "Kanji, grammatika, speaking va listening uchun alohida bloklar",
            ].map((item) => (
              <div key={item} className="flex gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-[#d62626]" />
                <p className="text-base leading-7 text-[#3a3a3a]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {cultureItems.map((item, index) => (
            <div
              key={item.label}
              className={`group rounded-lg border border-black/10 bg-[#111] p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 ${
                index % 2 === 0 ? "sm:translate-y-6" : ""
              }`}
            >
              <div className="flex aspect-square items-center justify-center">
                <img src={item.src} alt="" className="max-h-28 object-contain transition group-hover:scale-105" />
              </div>
              <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-white/70 sm:tracking-[0.22em]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
