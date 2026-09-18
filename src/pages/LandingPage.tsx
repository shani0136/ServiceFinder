import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { UrbanHeroSection } from './sections/UrbanHeroSection';
import { SpotlightSection } from './sections/SpotlightSection';
import { CommunityTrustSection } from './sections/CommunityTrustSection';
import { useApp } from '../store/appState';
import type { PublicView } from '../types';

interface LandingPageProps {
  onNavigate: (view: PublicView) => void;
  onSignIn: () => void;
  onRegisterProvider?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSignIn, onRegisterProvider }) => {
  const { setProblemText, setArea } = useApp();

  const handleCategorySelect = (serviceCategory: string) => {
    setProblemText(`${serviceCategory} service`);
    onNavigate('providers');
  };

  const handleDirectMatch = (service: string, area: string) => {
    if (service) setProblemText(service);
    if (area) setArea(area);
    onNavigate('providers');
  };

  const handleSearchSubmit = (problem: string) => {
    setProblemText(problem);
    onNavigate('providers');
  };

  const handleRegisterAsProvider = () => {
    if (onRegisterProvider) {
      onRegisterProvider();
    } else {
      onNavigate('provider');
    }
  };

  return (
    <>
      <Navbar
        currentView="home"
        onNavigate={onNavigate}
        onSignIn={onSignIn}
        onRegister={handleRegisterAsProvider}
        onSearchSubmit={handleSearchSubmit}
      />

      <main>
        {/* Mumbai Local Discovery Hero Section */}
        <UrbanHeroSection
          onSelectCategory={handleCategorySelect}
          onSearchSubmit={handleSearchSubmit}
          onDirectMatch={handleDirectMatch}
        />

        {/* Frequently Needed Everyday Services */}
        <SpotlightSection onSelectService={handleCategorySelect} />

        {/* Honest Trust & Transparency */}
        <CommunityTrustSection />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={onNavigate}
        onRegister={handleRegisterAsProvider}
      />
    </>
  );
};

export default LandingPage;
