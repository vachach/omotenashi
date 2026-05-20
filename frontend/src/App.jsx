import Header from './components/Header/Header.jsx';
import SamuraiSection from './components/SamuraiSection/SamuraiSection.jsx';
import AboutUs from './components/AboutUs/AboutUs.jsx';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs.jsx';
import Services from './components/Services/Services.jsx';
import Articles from './components/Articles/Articles.jsx';
import Contacts from './components/Contacts/Contacts.jsx';
import Footer from './components/Footer/Footer.jsx';

export default function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f7f4] text-[#151515]">
      <Header />
      <SamuraiSection />
      <AboutUs />
      <WhyChooseUs />
      <Services />
      <Articles />
      <Contacts />
      <Footer />
    </div>
  );
}
