const SESSION_KEY = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface Session {
  userId: string;
  email: string;
  restaurantId: string;
  expiresAt: number;
}

const isBrowser = typeof window !== "undefined";

export const auth = {
  // Save session to localStorage
  saveSession: (user: any) => {
    if (!isBrowser) return;
    const session: Session = {
      userId: user.id,
      email: user.email,
      restaurantId: user.restaurantId,
      expiresAt: Date.now() + SESSION_DURATION,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  // Get current session (client only)
  getSession: (): Session | null => {
    if (!isBrowser) return null;
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

  // Clear session (client only)
  clearSession: () => {
    if (!isBrowser) return;
    localStorage.removeItem(SESSION_KEY);
  },

  // Check if user is authenticated (client only)
  isAuthenticated: (): boolean => {
    if (!isBrowser) return false;
    return auth.getSession() !== null;
  },

  // Get restaurant ID from session (client only)
  getRestaurantId: (): string | null => {
    if (!isBrowser) return null;
    const session = auth.getSession();
    return session?.restaurantId || null;
  },
};
