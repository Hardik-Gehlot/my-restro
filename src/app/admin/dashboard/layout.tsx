import ProtectedRoute from '@/components/admin/ProtectedRoute';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <main className="min-h-screen">
          <div className="mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}