const SESSION_KEY = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface Session {
  userId: string;
  email: string;
  restaurantId: string;
  expiresAt: number;
}

export const auth = {
  // Save session to localStorage
  saveSession: (user: AdminUser) => {
    const session: Session = {
      userId: user.id,
      email: user.email,
      restaurantId: user.restaurantId,
      expiresAt: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  // Get current session
  getSession: (): Session | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    const session: Session = JSON.parse(sessionStr);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      auth.clearSession();
      return null;
    }

    return session;
  },

  // Clear session
  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return auth.getSession() !== null;
  },

  // Get restaurant ID from session
  getRestaurantId: (): string | null => {
    const session = auth.getSession();
    return session?.restaurantId || null;
  }
};