import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // hamburger icon va close icon

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll event
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`font-nico fixed w-full z-50 transition-colors duration-300 
      ${scrolled ? "bg-black" : "bg-transparent"}`}
    >
      <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="text-red-600">
          <a href="#home"><img src="logo/Logo White 40.svg" alt="Logo" className="h-20 w-20"/></a>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          <a href="#home" className="text-white hover:text-red-500">BOSH SAHIFA</a>
          <a href="#about" className="text-white hover:text-red-500">BIZ HAQIMIZDA</a>
          <a href="#services" className="text-white hover:text-red-500">XIZMATLARIMIZ</a>
          <a href="#articles" className="text-white hover:text-red-500">MAQOLALAR</a>
          <a href="#contact" className="text-white hover:text-red-500">ALOQA</a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-black text-white flex flex-col items-center gap-4 py-4">
          <a href="#home" onClick={() => setIsOpen(false)}>BOSH SAHIFA</a>
          <a href="#about" onClick={() => setIsOpen(false)}>BIZ HAQIMIZDA</a>
          <a href="#services" onClick={() => setIsOpen(false)}>XIZMATLARIMIZ</a>
          <a href="#articles" onClick={() => setIsOpen(false)}>MAQOLALAR</a>
          <a href="#contact" onClick={() => setIsOpen(false)}>ALOQA</a>
        </div>
      )}
    </nav>
  );
}
