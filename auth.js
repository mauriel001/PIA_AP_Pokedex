import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const USERS_KEY = "@pokedex/users";
const SESSION_KEY = "@pokedex/session";

const normalizar = (correo) => correo.trim().toLowerCase();

const hashear = (password, salt) =>
  Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + password,
  );

async function leerUsuarios() {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function registrar({ nombre, correo, password }) {
  const email = normalizar(correo);

  if (!nombre.trim()) throw new Error("Escribe tu nombre.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Correo no válido.");
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const usuarios = await leerUsuarios();
  if (usuarios[email]) {
    throw new Error("Ya existe una cuenta con ese correo.");
  }

  const salt = Crypto.randomUUID();
  usuarios[email] = {
    nombre: nombre.trim(),
    salt,
    hash: await hashear(password, salt),
  };

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
  await AsyncStorage.setItem(SESSION_KEY, email);
  return { nombre: usuarios[email].nombre, correo: email };
}

export async function iniciarSesion({ correo, password }) {
  const email = normalizar(correo);
  const usuarios = await leerUsuarios();
  const usuario = usuarios[email];

  // Mismo mensaje en ambos casos para no revelar si el correo existe
  if (!usuario || (await hashear(password, usuario.salt)) !== usuario.hash) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  await AsyncStorage.setItem(SESSION_KEY, email);
  return { nombre: usuario.nombre, correo: email };
}

// Devuelve el usuario con sesión guardada, o null
export async function obtenerSesion() {
  const email = await AsyncStorage.getItem(SESSION_KEY);
  if (!email) return null;

  const usuarios = await leerUsuarios();
  const usuario = usuarios[email];
  return usuario ? { nombre: usuario.nombre, correo: email } : null;
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(SESSION_KEY);
}