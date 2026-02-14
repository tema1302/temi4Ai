import type { Person } from '../types';
import { logger } from '../services/logger';

export function validatePerson(data: any): data is Person {
  const requiredFields = ['id', 'fullName', 'rank', 'address', 'coordinates'];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      logger.warn(`Validation failed: missing field ${field}`, data);
      return false;
    }
  }

  if (!Array.isArray(data.coordinates) || data.coordinates.length !== 2) {
    logger.warn(`Validation failed: invalid coordinates`, data);
    return false;
  }

  return true;
}

export function validatePeople(data: any[]): Person[] {
  return data.filter(validatePerson);
}
