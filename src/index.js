import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/auth.js';
import actividadesRoutes from './routes/actividadesRoutes.js';
import profileRoutes from './routes/profile.js';
import usuariosHistorialRoutes from './routes/usuariosHistorial.js';
import reservasRoutes from './routes/reservas.js';
import favoritosRoutes from './routes/favoritos.js';
import noticiasRoutes from './routes/noticias.js';
import https from 'https'

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
app.use('/usuarios/historial', usuariosHistorialRoutes);
app.use('/reservas', reservasRoutes);
app.use('/favoritos', favoritosRoutes);
app.use('/noticias', noticiasRoutes);

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
      historialReview: 'POST /usuarios/historial/review (Bearer) { actividadId, calificacionActividad, calificacionGuia, comentario }',
      reservasGet: 'GET /reservas (Bearer)',
      reservasCreate: 'POST /reservas (Bearer) { actividadId, ... }',
      reservasCancel: 'PATCH /reservas/:id/cancelar (Bearer)',
      favoritosGet: 'GET /favoritos (Bearer) → lista con flag tieneNovedad',
      favoritosAdd: 'POST /favoritos/:actividadId (Bearer)',
      favoritosRemove: 'DELETE /favoritos/:actividadId (Bearer)',
      favoritosCheck: 'GET /favoritos/:actividadId/check (Bearer) → { esFavorito }',
      noticias: 'GET /noticias'
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

app.listen(config.port, () => {
  console.log(`Servidor en http://localhost:${config.port}`);

  const keepAlive = () => {
    const url = 'https://backend-apps-1.onrender.com';
    
    https.get(url, (res) => {
      console.log(`Keep-alive ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Keep-alive error:', err.message);
    });
  };
  
  setInterval(keepAlive, 10 * 60 * 1000);
});