import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Alumni API', () => {
  beforeAll(async () => {
    // Clean DB
    await prisma.alumni.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should fetch empty alumni list initially', async () => {
    const res = await request(app).get('/api/alumni');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should submit a new alumni', async () => {
    const newAlumni = {
      fullName: 'Test Priest',
      rank: 'ierey',
      church: 'Test Church',
      address: 'Test Address',
      coordinates: [55.0, 37.0],
      consentAccepted: true
    };

    const res = await request(app).post('/api/alumni').send(newAlumni);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should verify submitted alumni is pending', async () => {
    const pending = await prisma.alumni.findFirst({ where: { fullName: 'Test Priest' } });
    expect(pending).toBeTruthy();
    expect(pending?.status).toBe('pending');
  });
});
