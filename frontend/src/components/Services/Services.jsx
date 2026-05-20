import { ArrowUpRight, GraduationCap, Languages, Plane, Users } from "lucide-react";

const courses = [
  {
    icon: Languages,
    level: "N5-N4",
    title: "Foundation Japanese",
    text: "Hiragana, katakana, asosiy grammatika, kundalik dialog va birinchi JLPT bazasi.",
    duration: "3 oy",
  },
  {
    icon: GraduationCap,
    level: "N3-N2",
    title: "JLPT Intensive",
    text: "Kanji tizimi, murakkab grammatika, reading va listening bo'yicha test amaliyoti.",
    duration: "4 oy",
  },
  {
    icon: Plane,
    level: "Japan ready",
    title: "Study & Work Prep",
    text: "Suhbat, hujjat, motivatsion xat va Yaponiyaga ketish jarayoni uchun tayyorgarlik.",
    duration: "6 hafta",
  },
  {
    icon: Users,
    level: "1:1",
    title: "Individual Mentor",
    text: "Shaxsiy jadval, aniq zaif nuqtalar va ustoz bilan tezkor progress rejasi.",
    duration: "Moslashuvchan",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative overflow-hidden bg-[#101010] px-5 py-24 text-white lg:px-8">
      <img src="fuji-mountain.png" alt="" className="absolute bottom-0 right-0 h-72 opacity-10" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-[#ff6262]">
            Kurslar
          </p>
          <h2 className="break-words font-nico text-3xl leading-tight sm:text-5xl">
            Qaysi darajadan boshlasangiz ham, yo'l aniq
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <article
                key={course.title}
                className="group rounded-lg border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition hover:-translate-y-1 hover:border-[#ff6262]/50 hover:bg-white/[0.09]"
              >
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff3838] p-3 text-white">
                    <Icon size={25} />
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white/70 sm:px-4 sm:tracking-[0.18em]">
                    {course.level}
                  </span>
                </div>
                <h3 className="text-2xl font-bold">{course.title}</h3>
                <p className="mt-3 leading-7 text-white/70">{course.text}</p>
                <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                    {course.duration}
                  </span>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-[#ff6262] sm:tracking-[0.14em]"
                  >
                    Tanlash <ArrowUpRight size={16} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
