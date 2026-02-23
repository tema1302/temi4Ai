import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.id ?? null)
  const userEmail = computed(() => user.value?.email ?? null)

  // Initialize: check existing session
  async function initialize() {
    if (!isSupabaseConfigured) {
      isLoading.value = false
      return
    }

    try {
      // Use getUser() instead of getSession() for fresher data from the server
      const { data: { user } } = await supabase.auth.getUser()
      user.value = user
    } catch (err) {
      console.error('Auth init error:', err)
    } finally {
      isLoading.value = false
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  // Sign up with email/password
  async function signUp(email: string, password: string) {
    error.value = null
    isLoading.value = true

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      user.value = data.user
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Sign in with email/password
  async function signIn(email: string, password: string) {
    error.value = null
    isLoading.value = true

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      user.value = data.user
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Sign out
  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
  }

  // Password recovery
  async function resetPassword(email: string) {
    error.value = null
    isLoading.value = true
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      })
      if (resetError) throw resetError
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to send reset email'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function updatePassword(password: string) {
    error.value = null
    isLoading.value = true
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })
      if (updateError) throw updateError
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to update password'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userId,
    userEmail,
    // Actions
    initialize,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }
})
