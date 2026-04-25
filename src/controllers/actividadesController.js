import { getFirestore } from '../services/firebaseAdmin.js';

const db = getFirestore();

export async function getActividades(req, res) {
  try {
    const { destino, categoria, precio_min, precio_max, destacadas, limit = 20, page = 1 } = req.query;

    const snapshot = await db.collection('actividades').get();
    let resultado = snapshot.docs.map(doc => doc.data());

    if (destino) resultado = resultado.filter(a => a.destino.toLowerCase().includes(destino.toLowerCase()));
    if (categoria) resultado = resultado.filter(a => a.categoria === categoria);
    if (precio_min) resultado = resultado.filter(a => a.precio >= parseFloat(precio_min));
    if (precio_max) resultado = resultado.filter(a => a.precio <= parseFloat(precio_max));
    if (destacadas) resultado = resultado.filter(a => a.destacada === true);

    const total = resultado.length;
    const total_pages = Math.ceil(total / parseInt(limit));
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginado = resultado.slice(offset, offset + parseInt(limit));
    const destacadasList = resultado.filter(a => a.destacada);

    return res.status(200).json({
      success: true,
      results: paginado,
      destacadas: destacadasList,
      count: total,
      total_pages
    });
  } catch (error) {
    console.error('Error en getActividades:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener actividades' });
  }
}

export async function getActividadById(req, res) {
  try {
    const { id } = req.params;
    const doc = await db.collection('actividades').doc(String(id)).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Actividad no encontrada' });
    }

    return res.status(200).json({ success: true, ...doc.data() });
  } catch (error) {
    console.error('Error en getActividadById:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener actividad' });
  }
}

export async function actividadExistsById(rawId) {
  const id = typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10);
  if (!Number.isInteger(id) || id < 1) return false;
  const doc = await db.collection('actividades').doc(String(id)).get();
  return doc.exists;
}

export async function getRecomendadas(req, res) {
  try {
    const { preferencias } = req.query;

    if (!preferencias) {
      return res.status(400).json({ success: false, error: 'Preferencias requeridas' });
    }

    const prefs = preferencias.split(',');
    const snapshot = await db.collection('actividades').get();
    const recomendadas = snapshot.docs
      .map(doc => doc.data())
      .filter(a => prefs.includes(a.categoria));

    return res.status(200).json({ success: true, results: recomendadas });
  } catch (error) {
    console.error('Error en getRecomendadas:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener recomendadas' });
  }
}