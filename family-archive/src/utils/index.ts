/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr: string, style: 'full' | 'short' = 'full'): string {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  
  if (style === 'short') {
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'short' 
    })
  }
  
  return date.toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
