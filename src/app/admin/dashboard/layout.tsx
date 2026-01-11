import AdminDashboard from '@/components/admin/AdminDashboard';
import { db } from '@/lib/mock-data';
import { ToastProvider } from '@/components/shared/CustomToast';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you'd get the logged-in user's restaurant ID from the session
  const restaurantId = "pizza_paradise_123";
  const restaurant = await db.getRestaurantById(restaurantId);

  return (
    <ToastProvider>
      <AdminDashboard restaurant={restaurant}>
        {children}
      </AdminDashboard>
    </ToastProvider>
  );
}