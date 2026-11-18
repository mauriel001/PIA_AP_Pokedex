import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { iniciarSesion, registrar } from "./auth";

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login"); // "login" | "registro"
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const esRegistro = modo === "registro";

  const enviar = async () => {
    if (cargando) return;
    setCargando(true);
    setError(null);
    try {
      const usuario = esRegistro
        ? await registrar({ nombre, correo, password })
        : await iniciarSesion({ correo, password });
      onLogin(usuario);
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  const cambiarModo = () => {
    setModo(esRegistro ? "login" : "registro");
    setError(null);
  };

  return (
    <SafeAreaView style={estilos.pantalla}>
      <Card style={estilos.tarjeta}>
        <Card.Content style={estilos.contenido}>
          <Text variant="headlineMedium" style={estilos.titulo}>
            Pokédex
          </Text>
          <Text style={estilos.subtitulo}>
            {esRegistro ? "Crea tu cuenta" : "Inicia sesión para continuar"}
          </Text>

          {esRegistro ? (
            <TextInput
              label="Nombre"
              mode="outlined"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          ) : null}

          <TextInput
            label="Correo"
            mode="outlined"
            value={correo}
            onChangeText={setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            label="Contraseña"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!verPassword}
            autoCapitalize="none"
            onSubmitEditing={enviar}
            right={
              <TextInput.Icon
                icon={verPassword ? "eye-off" : "eye"}
                onPress={() => setVerPassword(!verPassword)}
                accessibilityLabel={
                  verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              />
            }
          />

          {error ? (
            <Text accessibilityRole="alert" style={estilos.error}>
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={enviar}
            loading={cargando}
            disabled={cargando}
          >
            {esRegistro ? "Crear cuenta" : "Entrar"}
          </Button>

          <Button mode="text" onPress={cambiarModo} disabled={cargando}>
            {esRegistro
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </Button>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, justifyContent: "center", padding: 16 },
  tarjeta: { width: "100%", maxWidth: 420, alignSelf: "center" },
  contenido: { gap: 12 },
  titulo: { textAlign: "center", fontWeight: "bold" },
  subtitulo: { textAlign: "center", opacity: 0.7, marginBottom: 4 },
  error: { color: "#B3261E" },
});