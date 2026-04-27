import * as firestoreFavoritosService from '../services/firestoreFavoritosService.js';

function parseActividadId(raw) {
  const id = parseInt(String(raw), 10);
  if (!Number.isInteger(id) || id < 1) {
    const err = new Error('actividadId inválido');
    err.statusCode = 400;
    throw err;
  }
  return id;
}

export async function getMisFavoritos(req, res) {
  try {
    const favoritos = await firestoreFavoritosService.listFavoritosByUser(req.user.uid);
    return res.status(200).json({ success: true, favoritos });
  } catch (error) {
    console.error('Error en getMisFavoritos:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener favoritos' });
  }
}

export async function addFavorito(req, res) {
  try {
    const actividadId = parseActividadId(req.params.actividadId);
    const result = await firestoreFavoritosService.addFavorito(req.user.uid, actividadId);
    return res.status(201).json({
      success: true,
      message: 'Agregado a favoritos',
      favorito: result,
    });
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    if (statusCode === 500) console.error('Error en addFavorito:', error);
    const errorMsg = statusCode === 500 ? 'Error al agregar favorito' : error.message;
    return res.status(statusCode).json({ success: false, error: errorMsg });
  }
}

export async function removeFavorito(req, res) {
  try {
    const actividadId = parseActividadId(req.params.actividadId);
    await firestoreFavoritosService.removeFavorito(req.user.uid, actividadId);
    return res.status(200).json({ success: true, message: 'Quitado de favoritos' });
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    if (statusCode === 500) console.error('Error en removeFavorito:', error);
    const errorMsg = statusCode === 500 ? 'Error al quitar favorito' : error.message;
    return res.status(statusCode).json({ success: false, error: errorMsg });
  }
}

export async function checkFavorito(req, res) {
  try {
    const actividadId = parseActividadId(req.params.actividadId);
    const esFavorito = await firestoreFavoritosService.isFavorito(req.user.uid, actividadId);
    return res.status(200).json({ success: true, esFavorito });
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    if (statusCode === 500) console.error('Error en checkFavorito:', error);
    const errorMsg = statusCode === 500 ? 'Error al consultar favorito' : error.message;
    return res.status(statusCode).json({ success: false, error: errorMsg });
  }
}
