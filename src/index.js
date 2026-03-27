import express from 'express';
import { config } from './config/index.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API de autenticación',
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      me: 'GET /auth/me (requiere Authorization: Bearer <firebase_id_token>)',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

app.listen(config.port, () => {
  console.log(`Servidor en http://localhost:${config.port}`);
});
