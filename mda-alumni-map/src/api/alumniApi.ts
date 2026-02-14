import type { Person } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export const alumniApi = {
  async submitAlumni(personData: Partial<Person>): Promise<ApiResponse<void>> {
    try {
      const response = await fetch('/api/alumni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData)
      });
      return await response.json();
    } catch (e) {
      return { success: false, error: 'Network Error' };
    }
  },

  // Client-side pre-validation remains for UX
  validate(data: Partial<Person>): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!data.fullName || data.fullName.length < 5) errors.fullName = 'ФИО должно быть не менее 5 символов';
    return errors;
  }
};
