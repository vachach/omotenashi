import { BookOpenCheck, CalendarCheck, MessageCircle, Target } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Maqsadga mos reja",
    text: "Har bir o'quvchi daraja testi va maqsadiga qarab alohida yo'nalishga joylanadi.",
  },
  {
    icon: BookOpenCheck,
    title: "JLPT struktura",
    text: "N5 dan N1 gacha grammatika, kanji va test strategiyasi bosqichma-bosqich beriladi.",
  },
  {
    icon: MessageCircle,
    title: "Speaking amaliyoti",
    text: "Darslar faqat qoida emas, suhbat, talaffuz va real vaziyatlar bilan mustahkamlanadi.",
  },
  {
    icon: CalendarCheck,
    title: "Moslashuvchan jadval",
    text: "Online format tufayli darslarni o'qish, ish yoki shaxsiy rejangiz bilan moslaysiz.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#f7f7f4] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-[#d62626]">
              Nega bizni tanlashadi
            </p>
            <h2 className="break-words font-nico text-3xl leading-tight text-[#141414] sm:text-5xl">
              Natijaga olib boradigan tizim
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[#555]">
            Akademiya formatida siz kursdan kursga adashib o'tirmaysiz:
            onboarding, daraja, uy vazifasi, mentor feedback va yakuniy maqsad
            bitta yo'l xaritasida turadi.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-lg border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#111] text-white">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-[#151515]">{feature.title}</h3>
                <p className="mt-3 leading-7 text-[#5f5f5f]">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
