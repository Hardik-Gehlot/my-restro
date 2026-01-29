import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminDashboard>
      {children}
    </AdminDashboard>
  );
}