export default function Footer() {
  return (
    <footer className="font-nico bg-black h-[435px] flex items-center justify-between flex-col p-4 w-full mx-auto">
      {/* Logo */}
      <div>
        <a href="#home">
          <img src="logo/Logo White 40.svg" alt="Logo" className="h-20 w-20" />
        </a>
      </div>
      {/* Social Networks */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-white">
          Bizni ushbu ijtimoiy tarmoqlarda kuzatishingiz mumkin.
        </p>
        {/* Instagram */}
        <a
          className="text-white hover:text-red-500"
          href="https://www.instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        {/* Telegram */}
        <a
          className="text-white hover:text-red-500"
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram
        </a>
        {/* Facebook */}
        <a
          className="text-white hover:text-red-500"
          href="https://www.facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        {/* YouTube */}
        <a
          className="text-white hover:text-red-500"
          href="https://www.youtube.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube
        </a>
      </div>
    </footer>
  );
}
