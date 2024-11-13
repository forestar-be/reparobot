import Hero from '../components/Hero';
import Presentation from "../components/Presentation/";
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';

const Home = (): JSX.Element => {
  return (
    <div id="home">
      <Hero />
      <Presentation/>
      <Services />
      <About />
      <Contact />
    </div>
  );
};

export default Home;
