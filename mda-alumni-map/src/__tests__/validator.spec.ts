import { describe, it, expect } from 'vitest';
import { validatePerson } from '../utils/validator';

describe('validatePerson', () => {
  it('should return true for a valid person object', () => {
    const validPerson = {
      id: 1,
      fullName: 'Test Person',
      rank: 'ierey',
      address: 'Test Church',
      coordinates: [55, 37]
    };
    expect(validatePerson(validPerson)).toBe(true);
  });

  it('should return false if required fields are missing', () => {
    const invalidPerson = {
      id: 1,
      fullName: 'Test Person'
      // missing rank, address, coordinates
    };
    expect(validatePerson(invalidPerson)).toBe(false);
  });

  it('should return false for invalid coordinates', () => {
    const invalidPerson = {
      id: 1,
      fullName: 'Test Person',
      rank: 'ierey',
      address: 'Test Church',
      coordinates: [55] // only one coordinate
    };
    expect(validatePerson(invalidPerson)).toBe(false);
  });
});
