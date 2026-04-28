import { fetchNoticias } from '../services/newsService.js';

export async function getNoticias(req, res) {
  try {
    const noticias = await fetchNoticias();
    return res.status(200).json(noticias);
  } catch (error) {
    console.error('Error en getNoticias:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener noticias' });
  }
}
