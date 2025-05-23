
import dynamic from 'next/dynamic';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import ClientLayout from '../ClientLayout';

const Dashboard = dynamic(() => import('../../components/Dashboard/Dashboard'));

const AdminPage = () => {
  return (
      <ProtectedRoute>
        <ClientLayout title="Dashboard" className="flex flex-col ">
          <main className="flex-1 overflow-y-auto h-screen">
            <Dashboard />
          </main>
        </ClientLayout>
      </ProtectedRoute>
  )
};

export default AdminPage;
