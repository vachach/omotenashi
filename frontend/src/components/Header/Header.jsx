export default function Header(){
    return(
        <nav className="font-nico sticky top-0 flex justify-evenly items-center bg-black p-4">
            <div className="text-red-600"><a href="#home">LOGO</a></div>
            <div className="text-white"><a href="#home">BOSH SAHIFA</a></div>
            <div className="text-white"><a href="#about">BIZ HAQIMIZDA</a></div>
            <div className="text-white"><a href="#services">XIZMATLARIMIZ</a></div>
            <div className="text-white"><a href="#articles">MAQOLALAR</a></div>
            <div className="text-white"><a href="#contact">ALOQA</a></div>
        </nav>
    )
}