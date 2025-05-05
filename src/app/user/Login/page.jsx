import React from 'react'
import dynamic from 'next/dynamic';

const Login = dynamic(() => import('../../../components/Login/Login'));

export default function loginPage() {
  return <Login />
}
