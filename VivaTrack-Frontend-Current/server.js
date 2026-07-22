const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Viva Tracking API Running' });
});

app.get('/api/viva', async (req, res) => {
  const data = await prisma.vivaCase.findMany();
  res.json(data);
});

app.post('/api/viva', async (req, res) => {
  const viva = await prisma.vivaCase.create({
    data: req.body,
  });

  res.json(viva);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
