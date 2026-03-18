import bcrypt from 'bcryptjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const USERS_FILE = join(DATA_DIR, 'users.json');

function loadUsers() {
  try {
    if (existsSync(USERS_FILE)) {
      const data = readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error cargando usuarios:', e);
  }
  return [];
}

function saveUsers(users) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}


export async function createUser({ email, password, name }) {
  const users = loadUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (users.some((u) => u.email === normalizedEmail)) {
    throw new Error('El email ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    email: normalizedEmail,
    password: hashedPassword,
    name: name || null,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function findByEmail(email) {
  const users = loadUsers();
  return users.find((u) => u.email === email.toLowerCase());
}


export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password);
}
