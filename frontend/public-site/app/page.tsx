
import React, { Suspense } from 'react';


import Hero from '../components/Hero';
import Presentation from "../components/Presentation";
import Services from '../components/Services';
import About from '../components/About';
import Contact from '../components/Contact';

const Home = (): JSX.Element => {
  return (
    <div id="home"> 
      <Suspense fallback={<div></div>}>
       <Hero /> 
       </Suspense>
       <Suspense fallback={<div></div>}>
       <Presentation/>
       </Suspense>
      <Services /> 
       <About />
      <Contact />
    </div >
  );
};

export default Home;
