import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import reservasRoutes from './routes/reservas.js';

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
app.use('/profile', profileRoutes);
app.use('/reservas', reservasRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API de autenticación',
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      otpSend: 'POST /auth/otp/send { email }',
      otpVerify:
        'POST /auth/otp/verify { email, code } → customToken (signInWithCustomToken en el cliente)',
      me: 'GET /auth/me (requiere Authorization: Bearer <firebase_id_token>)',
      profileGet: 'GET /profile/me (requiere Authorization: Bearer <firebase_id_token>)',
      profileUpdate:
        'PUT /profile/me { name?, phone?, preferences? } (requiere Authorization: Bearer <firebase_id_token>)',
      reservasList: 'GET /reservas (requiere Authorization: Bearer <firebase_id_token>)',
      reservasCreate:
        'POST /reservas { actividadId, actividadNombre, fecha, cantidadPersonas, totalPrecio? } (requiere Authorization: Bearer <firebase_id_token>)',
      reservasCancel:
        'PATCH /reservas/:id/cancelar (requiere Authorization: Bearer <firebase_id_token>)',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

app.listen(config.port, () => {
  console.log(`Servidor en http://localhost:${config.port}`);
});
