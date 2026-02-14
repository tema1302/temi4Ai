import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = 'mda-super-secret-key-2026';

app.use(cors());
app.use(express.json());

// --- Zod Schemas ---
const AlumniSchema = z.object({
  originalId: z.number().optional(),
  fullName: z.string({ required_error: "ФИО обязательно" }).min(5, "ФИО должно быть не менее 5 символов"),
  rank: z.string({ required_error: "Выберите статус или сан" }),
  church: z.string({ required_error: "Укажите название храма" }).min(3, "Название храма слишком короткое"),
  address: z.string({ required_error: "Укажите адрес" }).min(5, "Адрес слишком короткий"),
  coordinates: z.tuple([z.number(), z.number()], { invalid_type_error: "Координаты должны быть массивом чисел" }),
  contact: z.string().optional(),
  consentAccepted: z.boolean().refine(val => val === true, "Необходимо согласие на обработку данных")
});

// --- Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({
      where: { username: username || '' }
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// --- Public Routes ---
app.get('/api/alumni', async (req, res) => {
  const alumni = await prisma.alumni.findMany({
    where: { status: 'approved' }
  });
  const mapped = alumni.map(a => ({
    id: a.id,
    fullName: a.fullName,
    rank: a.rank,
    address: a.church,
    fullAddress: a.address,
    coordinates: [a.lat, a.lon],
    slug: a.fullName.toLowerCase().replace(/\s+/g, '-'),
    isVerified: a.isVerified,
    contacts: { phone: a.contact }
  }));
  res.json(mapped);
});

app.post('/api/alumni', async (req, res) => {
  try {
    const data = AlumniSchema.parse(req.body);
    
    const newAlumni = await prisma.alumni.create({
      data: {
        originalId: data.originalId,
        fullName: data.fullName,
        rank: data.rank,
        church: data.church,
        address: data.address,
        lat: data.coordinates[0],
        lon: data.coordinates[1],
        contact: data.contact,
        consentAccepted: data.consentAccepted,
        status: 'pending'
      }
    });
    
    res.json({ success: true, id: newAlumni.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      return res.json({ success: false, fieldErrors });
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// --- Admin Routes ---
app.get('/api/admin/pending', authenticate, async (req, res) => {
  const pending = await prisma.alumni.findMany({
    where: { status: 'pending' }
  });
  res.json(pending);
});

app.post('/api/admin/approve/:id', authenticate, async (req, res) => {
  const pendingRecord = await prisma.alumni.findUnique({
    where: { id: Number(req.params.id) }
  });

  if (!pendingRecord) return res.status(404).json({ error: 'Not found' });

  if (pendingRecord.originalId) {
    await prisma.alumni.update({
      where: { id: pendingRecord.originalId },
      data: {
        fullName: pendingRecord.fullName,
        rank: pendingRecord.rank,
        church: pendingRecord.church,
        address: pendingRecord.address,
        lat: pendingRecord.lat,
        lon: pendingRecord.lon,
        contact: pendingRecord.contact,
        isVerified: true
      }
    });
    await prisma.alumni.delete({ where: { id: pendingRecord.id } });
  } else {
    await prisma.alumni.update({
      where: { id: pendingRecord.id },
      data: { status: 'approved', isVerified: true }
    });
  }
  
  res.json({ success: true });
});

app.post('/api/admin/reject/:id', authenticate, async (req, res) => {
  await prisma.alumni.update({
    where: { id: Number(req.params.id) },
    data: { status: 'rejected' }
  });
  res.json({ success: true });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
