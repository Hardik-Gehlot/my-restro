import AdminDashboard from '@/components/admin/AdminDashboard';
import { ToastProvider } from '@/components/shared/CustomToast';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminDashboard>
        {children}
      </AdminDashboard>
    </ToastProvider>
  );
}