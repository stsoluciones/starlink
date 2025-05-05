"use client";
import HeaderSection from './home/HeaderSection';
import FooterSection from './home/FooterSection';

const ClientLayout = ({ children }) => {
  return (
    <>
      <HeaderSection />
      {children}
      <FooterSection />
    </>
  );
};

export default ClientLayout;
