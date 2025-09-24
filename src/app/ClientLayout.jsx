"use client";
import HeaderSection from './home/HeaderSection';
import FooterSection from './home/FooterSection';
import dynamic from 'next/dynamic';

const LCPObserver = dynamic(() => import('../components/Client/LCPObserver'), { ssr: false });

const ClientLayout = ({ children }) => {
  return (
    <>
      <HeaderSection />
      {/* LCP debug overlay (enable with NEXT_PUBLIC_DEBUG_LCP=1) */}
      <LCPObserver />
      {children}
      <FooterSection />
    </>
  );
};

export default ClientLayout;
