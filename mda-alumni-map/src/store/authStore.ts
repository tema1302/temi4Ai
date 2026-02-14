import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: !!localStorage.getItem('mda_admin_token'),
    user: localStorage.getItem('mda_admin_token') ? 'admin' : null as string | null
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
          const { token } = await response.json();
          localStorage.setItem('mda_admin_token', token);
          this.isAuthenticated = true;
          this.user = 'admin';
          return true;
        }
        return false;
      } catch (e) {
        console.error('Login error', e);
        return false;
      }
    },
    logout() {
      localStorage.removeItem('mda_admin_token');
      this.isAuthenticated = false;
      this.user = null;
    }
  }
});