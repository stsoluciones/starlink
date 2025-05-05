"use client";

import React from "react";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("../../components/Footer/Footer"), { ssr: false });
const VolverArriba = dynamic(() => import("../../components/VolverArriba/VolverArriba"), { ssr: false });
const BotonWsp = dynamic(() => import("../../components/BotonWSP/BotonWsp"), { ssr: false });


export default function FooterSection() {
  return (
    <footer className="flex flex-col">
      <Footer />
      <VolverArriba />
      <BotonWsp />
    </footer>
  );
}
