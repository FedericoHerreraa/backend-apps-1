import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/auth.js';
import actividadesRoutes from './routes/actividadesRoutes.js';
import profileRoutes from './routes/profile.js';

const app = express();

const corsOrigins = config.corsOrigins.trim();
const corsOptions =
  corsOrigins === '*'
    ? { origin: true, credentials: true }
    : {
        origin: corsOrigins.split(',').map((o) => o.trim()).filter(Boolean),
        credentials: true,
      };

app.use(cors(corsOptions));
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/actividades', actividadesRoutes);
app.use('/profile', profileRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API de autenticación',
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      otpSend: 'POST /auth/otp/send { email }',
      otpVerify: 'POST /auth/otp/verify { email, code }',
      me: 'GET /auth/me',
      actividades: 'GET /actividades',
      actividadById: 'GET /actividades/:id',
      recomendadas: 'GET /actividades/recomendadas',
      profileGet: 'GET /profile/me',
      profileUpdate: 'PUT /profile/me',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

app.listen(config.port, () => {
  console.log(`Servidor en http://localhost:${config.port}`);
});
