export default function AboutUs() {
  return (
    <section
      id="about"
      className="relative min-h-screen bg-white flex flex-col lg:flex-row items-center justify-between px-10 py-20"
    >
      {/* Title & Text */}
      <div className="max-w-xl">
        <h2 className="font-nico text-4xl mb-6">BIZ HAQIMIZDA</h2>
        <p className="font-ubuntu text-gray-700 leading-relaxed">
          Biz sizga N1 va N2 sertifikatiga ega, malakali o‘qituvchilar bilan
          ta’lim olish imkoniyatini taqdim etamiz. Dunyoning istalgan
          nuqtasidan, o‘zingizga qulay vaqtda online darslarni davom
          ettirishingiz mumkin. O‘qituvchilarimiz orasida Yaponiyada o‘z
          karyerasini muvaffaqiyatli davom ettirayotgan mutaxassislar ham, uzoq
          yillardan beri yuzlab talabalarga ta’lim berib kelayotgan tajribali
          ustozlar ham bor.
        </p>
      </div>

      {/* Right Side Torii */}
      <div className="absolute right-16 top-20">
        <img src="Torii.png" alt="Torii" width={180} height={400} />
      </div>

      {/* Images Section */}
      <div className="mt-16 lg:mt-28 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        <div className="bg-black rounded-xl flex items-center justify-center p-6">
          <img src="about/Kenshi.png" alt="Kenshi" className="object-contain" />
        </div>
        <div className="bg-black rounded-xl flex items-center justify-center p-6">
          <img src="about/Kabuto.png" alt="Kabuto" className="object-contain" />
        </div>
        <div className="bg-black rounded-xl flex items-center justify-center p-6">
          <img src="about/Hasu.png" alt="Hasu" className="object-contain" />
        </div>
        <div className="bg-black rounded-xl flex items-center justify-center p-6">
          <img src="about/Geisha.png" alt="Geisha" className="object-contain" />
        </div>
        <div className="bg-black rounded-xl flex items-center justify-center p-6">
          <img
            src="about/Origami.png"
            alt="Origami"
            className="object-contain"
          />
        </div>
        <div className="bg-black rounded-xl flex items-center justify-center p-6">
          <img src="about/Tsuru.png" alt="Tsuru" className="object-contain" />
        </div>
      </div>
    </section>
  );
}
