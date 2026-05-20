import { Mail, MapPin, Phone } from "lucide-react";

export default function Contacts() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#f7f7f4] px-5 py-24 lg:px-8">
      <img src="Eda.png" alt="" className="absolute -left-10 top-12 h-44 opacity-20" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-[#d62626]">
            Aloqa
          </p>
          <h2 className="break-words font-nico text-3xl leading-tight sm:text-5xl">
            Birinchi dars uchun joy band qiling
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#555] sm:text-lg sm:leading-8">
            Darajangizni aniqlab, sizga mos kurs, jadval va o'qish rejasini
            tanlab beramiz.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: Phone, text: "+998 90 000 00 00" },
              { icon: Mail, text: "hello@omotenashi.academy" },
              { icon: MapPin, text: "Online darslar, butun dunyo bo'ylab" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#111] text-white">
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0 break-words font-semibold text-[#2d2d2d]">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <form className="rounded-lg border border-black/10 bg-white p-6 shadow-xl shadow-black/10 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-[#555] sm:tracking-[0.16em]">
                Ism
              </span>
              <input className="w-full rounded-lg border border-black/10 bg-[#f7f7f4] px-4 py-3 outline-none transition focus:border-[#d62626]" placeholder="Ismingiz" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-[#555] sm:tracking-[0.16em]">
                Telefon
              </span>
              <input className="w-full rounded-lg border border-black/10 bg-[#f7f7f4] px-4 py-3 outline-none transition focus:border-[#d62626]" placeholder="+998" />
            </label>
          </div>
          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-[#555] sm:tracking-[0.16em]">
              Daraja
            </span>
            <select className="w-full rounded-lg border border-black/10 bg-[#f7f7f4] px-4 py-3 outline-none transition focus:border-[#d62626]">
              <option>Boshlang'ich</option>
              <option>N5-N4</option>
              <option>N3-N2</option>
              <option>N1 yoki suhbat</option>
            </select>
          </label>
          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-bold uppercase tracking-[0.1em] text-[#555] sm:tracking-[0.16em]">
              Xabar
            </span>
            <textarea className="min-h-32 w-full resize-none rounded-lg border border-black/10 bg-[#f7f7f4] px-4 py-3 outline-none transition focus:border-[#d62626]" placeholder="Maqsadingizni yozing" />
          </label>
          <button className="mt-6 w-full rounded-full bg-[#ff3838] px-7 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#e42c2c] sm:tracking-[0.16em]">
            Yuborish
          </button>
        </form>
      </div>
    </section>
  );
}
