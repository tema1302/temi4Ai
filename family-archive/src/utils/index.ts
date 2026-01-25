/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr: string, style: 'full' | 'short' = 'full'): string {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  
  if (style === 'short') {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Delay execution (for simulating API calls)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return crypto.randomUUID()
}
