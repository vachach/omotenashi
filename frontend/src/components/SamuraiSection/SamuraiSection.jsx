export default function SamuraiSection() {
  return (
    <section
      id="home"
      className="relative h-screen bg-black flex items-center justify-center"
      style={{
        backgroundImage: 'url("Samurai.png")',
        backgroundSize: 'cover',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      <img
        src="logo/Logo White 915.svg"
        alt="Logo"
        className="relative z-10"
      />
    </section>
  );
}
