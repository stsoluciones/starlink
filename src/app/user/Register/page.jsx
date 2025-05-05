import dynamic from 'next/dynamic';

const Register = dynamic(() => import('../../../components/Login/Register.jsx'));

export default function loginPage() {
  return <Register />
}
