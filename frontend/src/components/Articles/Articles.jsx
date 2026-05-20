const articles = [
  {
    tag: "JLPT",
    title: "N5 dan N3 gacha qancha vaqt kerak?",
    text: "Darajalar orasidagi farq, haftalik yuklama va real tayyorgarlik ritmi.",
  },
  {
    tag: "Kanji",
    title: "Kanji yodlashni tizimga solish",
    text: "Radikal, kontekst va spaced repetition orqali ko'proq eslab qolish.",
  },
  {
    tag: "Japan",
    title: "Yaponiyada o'qish uchun til minimumi",
    text: "Maktab, senmon va universitet yo'nalishlari uchun zarur darajalar.",
  },
];

export default function Articles() {
  return (
    <section id="articles" className="bg-white px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-[#d62626]">
              Maqolalar
            </p>
            <h2 className="break-words font-nico text-3xl leading-tight sm:text-5xl">
              O'qishni osonlashtiradigan yo'l-yo'riqlar
            </h2>
          </div>
          <a href="#contact" className="text-sm font-bold uppercase tracking-[0.1em] text-[#d62626] sm:tracking-[0.18em]">
            Mentor bilan gaplashish
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.title}
              className="rounded-lg border border-black/10 bg-[#f7f7f4] p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
            >
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#d62626] sm:tracking-[0.22em]">
                {article.tag}
              </span>
              <h3 className="mt-5 text-2xl font-bold leading-snug text-[#151515]">{article.title}</h3>
              <p className="mt-4 leading-7 text-[#626262]">{article.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
