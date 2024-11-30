import Hero from './Hero';
import Presentation from "./Presentation";
import Services from './Services';
import About from './About';
import Contact from './Contact';

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
