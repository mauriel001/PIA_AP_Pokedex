import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card, ProgressBar } from "react-native-paper";
import { colorPastel } from "./colores.js";
import Alternativas from "./Alternativas";
import OfflineMessage from "./OfflineMessage";
import useNetworkRetry, { isNetworkError } from "./useNetworkRetry";

const API_URL = "https://pokeapi.co/api/v2";

const TIPOS_EN_ESPANOL = {
  normal: "Normal",
  fighting: "Lucha",
  flying: "Volador",
  poison: "Veneno",
  ground: "Tierra",
  rock: "Roca",
  bug: "Bicho",
  ghost: "Fantasma",
  steel: "Acero",
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Eléctrico",
  psychic: "Psíquico",
  ice: "Hielo",
  dragon: "Dragón",
  dark: "Siniestro",
  fairy: "Hada",
};

const STATS_EN_ESPANOL = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "Ataque esp.",
  "special-defense": "Defensa esp.",
  speed: "Velocidad",
};

const MAX_STAT = 255; // valor máximo posible de una estadística base

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`La solicitud a PokéAPI falló (${response.status}).`);
  }
  return response.json();
}

export default function Detalle({ pokemon, onBack }) {
  const { isOffline, retryKey } = useNetworkRetry();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colorSeccion = { backgroundColor: colorPastel(pokemon) };

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [data, species] = await Promise.all([
          fetchJson(`${API_URL}/pokemon/${pokemon.id}/`, controller.signal),
          fetchJson(
            `${API_URL}/pokemon-species/${pokemon.id}/`,
            controller.signal,
          ).catch((speciesError) => {
            if (isNetworkError(speciesError)) throw speciesError;
            return null;
          }),
        ]);

        const descripcion = species?.flavor_text_entries?.find(
          (entry) => entry.language.name === "es",
        )?.flavor_text;

        if (!isActive) return;
        setInfo({
          altura: data.height / 10, // decímetros -> metros
          peso: data.weight / 10, // hectogramos -> kg
          experiencia: data.base_experience,
          habilidades: data.abilities.map(({ ability, is_hidden }) => ({
            nombre: ability.name.replace(/-/g, " "),
            oculta: is_hidden,
          })),
          stats: data.stats.map(({ base_stat, stat }) => ({
            nombre: STATS_EN_ESPANOL[stat.name] ?? stat.name,
            valor: base_stat,
          })),
          descripcion: descripcion?.replace(/[\n\f]/g, " "),
        });
      } catch (err) {
        if (isActive) setError(err.message);
      } finally {
        if (isActive) setLoading(false);
      }
    })();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [pokemon.id, retryKey]);

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Volver a la lista"
        style={estilos.botonVolver}
      >
        <Text style={estilos.textoVolver}>← Volver</Text>
      </Pressable>

      <Alternativas pokemon={pokemon} tiposEs={TIPOS_EN_ESPANOL} />

      {isOffline || isNetworkError(error) ? (
        <OfflineMessage />
      ) : loading ? (
        <ActivityIndicator
          style={{ marginTop: 24 }}
          accessibilityLabel="Cargando detalles"
        />
      ) : error ? (
        <Text accessibilityRole="alert" style={estilos.error}>
          {error}
        </Text>
      ) : (
        <>
          {info.descripcion ? (
            <Card style={[estilos.seccion, colorSeccion]}>
              <Card.Content>
                <Text style={estilos.titulo}>Descripción</Text>
                <Text>{info.descripcion}</Text>
              </Card.Content>
            </Card>
          ) : null}

          <Card style={[estilos.seccion, colorSeccion]}>
            <Card.Content>
              <Text style={estilos.titulo}>Características</Text>
              <Text>Altura: {info.altura} m</Text>
              <Text>Peso: {info.peso} kg</Text>
              <Text>Experiencia base: {info.experiencia ?? "—"}</Text>
            </Card.Content>
          </Card>

          <Card style={[estilos.seccion, colorSeccion]}>
            <Card.Content>
              <Text style={estilos.titulo}>Habilidades</Text>
              {info.habilidades.map((h) => (
                <Text key={h.nombre} style={{ textTransform: "capitalize" }}>
                  • {h.nombre}
                  {h.oculta ? " (oculta)" : ""}
                </Text>
              ))}
            </Card.Content>
          </Card>

          <Card style={[estilos.seccion, colorSeccion]}>
            <Card.Content>
              <Text style={estilos.titulo}>Estadísticas base</Text>
              {info.stats.map((s) => (
                <View key={s.nombre} style={estilos.fila}>
                  <Text style={estilos.statNombre}>{s.nombre}</Text>
                  <Text style={estilos.statValor}>{s.valor}</Text>
                  <ProgressBar
                    progress={Math.min(s.valor / MAX_STAT, 1)}
                    style={estilos.barra}
                  />
                </View>
              ))}
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 16, gap: 12 },
  botonVolver: { alignSelf: "flex-start", paddingVertical: 8 },
  textoVolver: { fontSize: 16, fontWeight: "bold" },
  seccion: { marginTop: 4 },
  titulo: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  fila: { marginBottom: 10 },
  statNombre: { fontWeight: "600" },
  statValor: { position: "absolute", right: 0 },
  barra: { height: 8, borderRadius: 4, marginTop: 4 },
  error: { marginTop: 24, textAlign: "center" },
});