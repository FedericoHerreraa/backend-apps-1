const actividades = [
  {
    id: 1,
    nombre: "Free Tour Centro Histórico Buenos Aires",
    destino: "Buenos Aires",
    categoria: "free tour",
    descripcion: "Recorrido a pie por los barrios más históricos de Buenos Aires con guía experto.",
    que_incluye: "Guía en español, mapa del recorrido",
    punto_encuentro: "Obelisco, Av. Corrientes",
    guia: "Carlos Pérez",
    duracion: "3 horas",
    idioma: "Español",
    precio: 0,
    cupos_disponibles: 20,
    politica_cancelacion: "Cancelación gratuita hasta 24hs antes",
    imagen: "https://picsum.photos/id/1018/800/600",
    destacada: true
  },
  {
    id: 2,
    nombre: "Excursión Cataratas del Iguazú",
    destino: "Misiones",
    categoria: "excursión",
    descripcion: "Día completo en las majestuosas Cataratas del Iguazú.",
    que_incluye: "Transporte, entrada al parque, guía y almuerzo",
    punto_encuentro: "Hotel en Puerto Iguazú",
    guia: "María González",
    duracion: "8 horas",
    idioma: "Español / Inglés",
    precio: 45000,
    cupos_disponibles: 15,
    politica_cancelacion: "Cancelación gratuita hasta 48hs antes",
    imagen: "https://picsum.photos/id/1043/800/600",
    destacada: true
  },
  {
    id: 3,
    nombre: "Tour Gastronómico Palermo",
    destino: "Buenos Aires",
    categoria: "experiencia gastronómica",
    descripcion: "Recorrido por los mejores restaurantes y bares de Palermo.",
    que_incluye: "Degustaciones en 5 locales, guía gastronómica",
    punto_encuentro: "Plaza Serrano, Palermo",
    guia: "Ana Martínez",
    duracion: "4 horas",
    idioma: "Español",
    precio: 18000,
    cupos_disponibles: 10,
    politica_cancelacion: "Cancelación gratuita hasta 24hs antes",
    imagen: "https://picsum.photos/id/292/800/600",
    destacada: false
  },
  {
    id: 4,
    nombre: "Trekking Cerro Aconcagua",
    destino: "Mendoza",
    categoria: "aventura",
    descripcion: "Trekking guiado por las faldas del Aconcagua.",
    que_incluye: "Guía de montaña, equipo de seguridad, snacks",
    punto_encuentro: "Acceso Horcones, Mendoza",
    guia: "Roberto Silva",
    duracion: "10 horas",
    idioma: "Español / Inglés",
    precio: 35000,
    cupos_disponibles: 8,
    politica_cancelacion: "Sin reembolso por cancelación",
    imagen: "https://picsum.photos/id/29/800/600",
    destacada: true
  },
  {
    id: 5,
    nombre: "Visita Guiada Museo MALBA",
    destino: "Buenos Aires",
    categoria: "visita guiada",
    descripcion: "Tour por las colecciones del Museo de Arte Latinoamericano.",
    que_incluye: "Entrada al museo, guía especializado",
    punto_encuentro: "Av. Figueroa Alcorta 3415",
    guia: "Laura López",
    duracion: "2 horas",
    idioma: "Español",
    precio: 8000,
    cupos_disponibles: 25,
    politica_cancelacion: "Cancelación gratuita hasta 12hs antes",
    imagen: "https://picsum.photos/id/137/800/600",
    destacada: false
  }
];

export async function getActividades(req, res) {
  try {
    const { destino, categoria, precio_min, precio_max, fecha, destacadas, limit = 20, page = 1 } = req.query;

    let resultado = [...actividades];

    if (destino) resultado = resultado.filter(a => a.destino.toLowerCase().includes(destino.toLowerCase()));
    if (categoria) resultado = resultado.filter(a => a.categoria === categoria);
    if (precio_min) resultado = resultado.filter(a => a.precio >= parseFloat(precio_min));
    if (precio_max) resultado = resultado.filter(a => a.precio <= parseFloat(precio_max));
    if (destacadas) resultado = resultado.filter(a => a.destacada === true);

    const total = resultado.length;
    const total_pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginado = resultado.slice(offset, offset + parseInt(limit));
    const destacadasList = actividades.filter(a => a.destacada);

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
    const actividad = actividades.find(a => a.id === parseInt(id));

    if (!actividad) {
      return res.status(404).json({ success: false, error: 'Actividad no encontrada' });
    }

    return res.status(200).json({ success: true, ...actividad });
  } catch (error) {
    console.error('Error en getActividadById:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener actividad' });
  }
}

export async function getRecomendadas(req, res) {
  try {
    const { preferencias } = req.query;

    if (!preferencias) {
      return res.status(400).json({ success: false, error: 'Preferencias requeridas' });
    }

    const prefs = preferencias.split(',');
    const recomendadas = actividades.filter(a => prefs.includes(a.categoria));

    return res.status(200).json({ success: true, results: recomendadas });
  } catch (error) {
    console.error('Error en getRecomendadas:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener recomendadas' });
  }
}