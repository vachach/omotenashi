export default function SamuraiSection() {
  return (
    <>
      <div
        id="home"
        className="h-screen bg-black flex items-center justify-center"
        style={{
          backgroundImage: 'url("Samurai.png")',
          backgroundSize: "cover",
          filter: "brightness(0.5) saturate(0.3)",
        }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <img
          src="logo/Logo White 915.svg"
          alt="Logo"
          className="top-center left-0 z-10"
        />
      </div>
    </>
  );
}
