'use client'; // if it needs client features

import React, { Suspense } from 'react';
import NavBar from '../../components/NavBar/NavBar';
import Loading from '../../components/Loading/Loading';

export default function HeaderSection() {
  return (
    <nav>
      <Suspense fallback={<Loading/>}>
        <NavBar />
      </Suspense>
    </nav>
  );
}
