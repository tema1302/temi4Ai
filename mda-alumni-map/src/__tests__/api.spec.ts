import { describe, it, expect } from 'vitest';
import { alumniApi } from '../api/alumniApi';

describe('Alumni API Integration (Mocked)', () => {
  it('should successfully submit valid alumni data', async () => {
    const validData = {
      fullName: 'Протоиерей Иоанн Кронштадтский',
      rank: 'protoierey' as any,
      address: 'г. Кронштадт, собор',
      coordinates: [59.99, 29.77] as [number, number],
      consentAccepted: true
    };

    const response = await alumniApi.submitAlumni(validData);
    expect(response.success).toBe(true);
    expect(response.error).toBeUndefined();
  });

  it('should fail if 152-FZ consent is missing', async () => {
    const invalidData = {
      fullName: 'Иванов Иван',
      rank: 'ierey' as any,
      address: 'Храм',
      coordinates: [55, 37] as [number, number],
      consentAccepted: false
    };

    const response = await alumniApi.submitAlumni(invalidData);
    expect(response.success).toBe(false);
    expect(response.error).toContain('152-ФЗ');
  });

  it('should fail for extremely short names', async () => {
    const invalidData = {
      fullName: 'Иван', // Too short
      rank: 'ierey' as any,
      address: 'Храм',
      coordinates: [55, 37] as [number, number],
      consentAccepted: true
    };

    const response = await alumniApi.submitAlumni(invalidData);
    expect(response.success).toBe(false);
    expect(response.error).toContain('ФИО');
  });
});
