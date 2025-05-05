import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <section className="p-4 md:p-8 lg:p-10 bg-secondary-background min-h-[80px] flex items-center">
      <div className="mx-auto max-w-screen-xl text-center">
        <span className="text-sm sm:text-center text-gray-300">
          © 2025{" "}
          <Link 
            href="https://gonzalotorresgrau.com" 
            className="hover:underline" 
            title="Gonzalo Torres Grau"
          >
            Gonzalo Torres Grau
          </Link>. All Rights Reserved.
        </span>
      </div>
    </section>
  );
}
