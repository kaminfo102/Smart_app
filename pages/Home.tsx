
import React from 'react';
import HeroSlider from '../components/Home/HeroSlider';
import EventsSlider from '../components/Home/EventsSlider';
import FeaturesGrid from '../components/Home/FeaturesGrid';
import TrainingCTA from '../components/Home/TrainingCTA';
import BlogSection from '../components/Home/BlogSection';
import ContactSection from '../components/Home/ContactSection';
import CooperationSection from '../components/Home/CooperationSection';

const Home: React.FC = () => {
  return (
    <div className="bg-[#f5f5f5] dark:bg-black min-h-screen pb-2 pt-2 md:pt-4">
      <div className="max-w-7xl mx-auto space-y-3 md:space-y-6">
        <HeroSlider />
        <FeaturesGrid />
        <EventsSlider />
        <TrainingCTA />
        <BlogSection />
        <CooperationSection />
        <ContactSection />
      </div>
    </div>
  );
};

export default Home;
