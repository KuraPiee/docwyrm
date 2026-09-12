export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'github' | 'email';
  plan: 'free_unlimited' | 'plus' | 'pro' | 'enterprise';
  createdAt: number;
}

const SESSION_KEY = 'docwyrm_session_v2';

export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: UserSession = JSON.parse(raw);
    if (!session || !session.name) return null;

    return session;
  } catch {
    return null;
  }
}

export function saveSession(user: Partial<UserSession>): UserSession {
  const session: UserSession = {
    id: user.id || 'usr_' + Math.random().toString(36).slice(2, 9),
    name: user.name || 'Docwyrm Team',
    email: user.email || 'kurapiee@docwyrm.com',
    avatarUrl: user.avatarUrl || 'https://github.com/KuraPiee.png',
    provider: user.provider || 'github',
    plan: user.plan || 'free_unlimited',
    createdAt: user.createdAt || Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      // Permanent persistent cookie for 1 year
      document.cookie = `docwyrm_session=${encodeURIComponent(
        JSON.stringify({ id: session.id, name: session.name, plan: session.plan })
      )}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  }

  return session;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_KEY);
      document.cookie = 'docwyrm_session=; path=/; max-age=0; SameSite=Lax';
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  }
}
