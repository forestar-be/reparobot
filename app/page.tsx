import React, { Suspense } from 'react';

import Hero from '../components/Hero';
import Presentation from '../components/Presentation';
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';

const Home = (): JSX.Element => {
  return (
    <div id="home">
      <Suspense fallback={<div></div>}>
        <Hero />
      </Suspense>
      <Services />
      <About />
      <Suspense fallback={<div></div>}>
        <Presentation />
      </Suspense>
      <Contact />
    </div>
  );
};

export default Home;
