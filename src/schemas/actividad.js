
export function serializeFechaForApi(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'string') return raw;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString();
  if (typeof raw.toDate === 'function') {
    const d = raw.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d.toISOString() : null;
  }
  const sec = raw.seconds ?? raw._seconds;
  if (typeof sec === 'number') {
    const nano = raw.nanoseconds ?? raw._nanoseconds ?? 0;
    const d = new Date(sec * 1000 + nano / 1e6);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}


export function normalizeActividadForApi(actividad) {
  if (actividad == null || typeof actividad !== 'object') return actividad;
  return {
    ...actividad,
    fecha: serializeFechaForApi(actividad.fecha),
  };
}
