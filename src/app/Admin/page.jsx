import React from 'react'
import dynamic from 'next/dynamic';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';

const Admin = dynamic(() => import('../../components/Admin/Admin'));

const AdminPage = () => {
  return (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
  )
};

export default AdminPage;
