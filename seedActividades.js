import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccount.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

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
    cuposDisponibles: 20,
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
    cuposDisponibles: 15,
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
    cuposDisponibles: 10,
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
    cuposDisponibles: 8,
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
    cuposDisponibles: 25,
    politica_cancelacion: "Cancelación gratuita hasta 12hs antes",
    imagen: "https://picsum.photos/id/137/800/600",
    destacada: false
  }
];

async function seedActividades() {
  const batch = db.batch();
  
  for (const actividad of actividades) {
    const ref = db.collection('actividades').doc(String(actividad.id));
    batch.set(ref, actividad);
  }
  
  await batch.commit();
  console.log('✅ Actividades subidas a Firestore correctamente!');
  process.exit(0);
}

seedActividades().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});