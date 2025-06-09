import React from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Gallery from '../components/home/Gallery';
import Testimonials from '../components/home/Testimonials';
import HowToCreate from '../components/home/HowToCreate';
import FAQ from '../components/home/FAQ';
import CallToAction from '../components/home/CallToAction';

const HomePage = () => {
  return (
    <div className="bg-white">
      <Layout>
        <Hero />
        <Features />
        <Gallery title="Browse our 1,281 free coloring pages; printable in PDF and PNG formats!" />
        <Testimonials />
        <HowToCreate />
        <FAQ />
        <CallToAction />
      </Layout>
    </div>
  );
};

export default HomePage; 