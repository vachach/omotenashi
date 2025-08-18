export default function Footer() {
  return (
    <footer className="font-nico bg-gray-300 h-[435px] flex items-center justify-between flex-col p-4 max-w-6xl mx-auto">
      <p>LOGO</p>
      <div className="flex flex-col items-center gap-2">
        <p>Bizni ushbu ijtimoiy tarmoqlarda kuzatishingiz mumkin.</p>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://t.me" target="_blank" rel="noopener noreferrer">Telegram</a>
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
      </div>
    </footer>
  );
}