
import dynamic from 'next/dynamic';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';

const Dashboard = dynamic(() => import('../../components/Dashboard/Dashboard'));

const AdminPage = () => {
  return (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
  )
};

export default AdminPage;
