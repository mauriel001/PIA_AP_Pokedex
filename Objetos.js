import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  SectionList,
  Text,
  View,
} from "react-native";
import { Button, Card, Chip } from "react-native-paper";
import { Image } from "expo-image";
import OfflineMessage from "./OfflineMessage";
import useNetworkRetry, { isNetworkError } from "./useNetworkRetry";
import styles from "./styles";

const API_URL = "https://pokeapi.co/api/v2";
const SPRITES_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

// Bolsillos, en el orden que pediste. `general: true` se divide en grupos.
const BOLSILLOS = [
  { id: "botiquin", nombre: "Botiquín", pockets: ["medicine"] },
  { id: "pokeballs", nombre: "Poké Balls", pockets: ["pokeballs"] },
  { id: "mtmo", nombre: "MT y MO", pockets: ["machines"] },
  { id: "bayas", nombre: "Bayas", pockets: ["berries"] },
  { id: "clave", nombre: "Objetos clave", pockets: ["key"] },
  {
    id: "general",
    nombre: "Objetos (general)",
    pockets: ["misc", "battle"],
    general: true,
  },
];

// ── Ajusta estas listas si un objeto cae en el grupo equivocado ──
const CATEGORIAS_EVOLUTIVOS = ["evolution"];
const CATEGORIAS_POTENCIADORES = [
  "held-items",
  "choice",
  "type-enhancement",
  "plates",
  "training",
  "effort-training",
  "species-specific",
  "stat-boosts",
];
const CATEGORIAS_VALIOSOS = ["loot"];
const NOMBRES_VALIOSOS = [
  "tiny-mushroom",
  "big-mushroom",
  "balm-mushroom",
  "pearl",
  "big-pearl",
  "pearl-string",
  "stardust",
  "star-piece",
  "comet-shard",
  "nugget",
  "big-nugget",
  "heart-scale",
  "rare-bone",
];
const NOMBRES_REPELENTES = ["repel", "super-repel", "max-repel"];

const GRUPOS = [
  { id: "evolutivos", titulo: "Objetos evolutivos" },
  { id: "potenciadores", titulo: "Objetos potenciadores" },
  { id: "repelentes", titulo: "Repelentes" },
  { id: "fosiles", titulo: "Fósiles" },
  { id: "valiosos", titulo: "Objetos valiosos" },
  { id: "otros", titulo: "Otros" },
];

function clasificar(nombre, categoria) {
  if (nombre.includes("fossil") || nombre === "old-amber") return "fosiles";
  if (NOMBRES_REPELENTES.includes(nombre)) return "repelentes";
  if (
    NOMBRES_VALIOSOS.includes(nombre) ||
    CATEGORIAS_VALIOSOS.includes(categoria)
  ) {
    return "valiosos";
  }
  if (CATEGORIAS_EVOLUTIVOS.includes(categoria)) return "evolutivos";
  if (CATEGORIAS_POTENCIADORES.includes(categoria)) return "potenciadores";
  return "otros";
}

const getIdFromUrl = (url) => Number(url.split("/").filter(Boolean).pop());
const formatear = (texto) => texto.replace(/-/g, " ");

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`La solicitud a PokéAPI falló (${response.status}).`);
  }
  return response.json();
}

const crearItem = (nombre, url, categoria) => {
  const id = getIdFromUrl(url);
  return {
    key: `${categoria}-${id}`,
    id,
    name: nombre,
    image: `${SPRITES_URL}/${nombre}.png`,
  };
};

// Devuelve las secciones de un bolsillo de la lista de arriba
async function cargarBolsillo(bolsillo, signal) {
  const pockets = await Promise.all(
    bolsillo.pockets.map((p) =>
      fetchJson(`${API_URL}/item-pocket/${p}/`, signal),
    ),
  );

  // Quita categorías repetidas entre bolsillos
  const urls = [
    ...new Set(pockets.flatMap((p) => p.categories.map(({ url }) => url))),
  ];
  const categorias = await Promise.all(
    urls.map((url) => fetchJson(url, signal)),
  );

  if (bolsillo.general) {
    const grupos = Object.fromEntries(GRUPOS.map((g) => [g.id, new Map()]));

    categorias.forEach((categoria) => {
      categoria.items.forEach(({ name, url }) => {
        const grupo = clasificar(name, categoria.name);
        const item = crearItem(name, url, grupo);
        grupos[grupo].set(item.id, item); // Map evita repetidos
      });
    });

    return GRUPOS.map((g) => ({
      title: g.titulo,
      data: [...grupos[g.id].values()].sort((a, b) => a.id - b.id),
    })).filter((seccion) => seccion.data.length > 0);
  }

  return categorias
    .filter((categoria) => categoria.items.length > 0)
    .map((categoria) => ({
      title: formatear(categoria.name),
      data: categoria.items.map(({ name, url }) =>
        crearItem(name, url, categoria.name),
      ),
    }));
}

export default function Objetos() {
  const { isOffline, retryKey } = useNetworkRetry();
  const [activo, setActivo] = useState(BOLSILLOS[0].id);
  const [datos, setDatos] = useState({}); // { idBolsillo: [secciones] }
  const [error, setError] = useState(null);

  const montado = useRef(true);
  const pidiendo = useRef({});
  const controllers = useRef({});
  const lastRetryKey = useRef(0);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      Object.values(controllers.current).forEach((controller) =>
        controller.abort(),
      );
    };
  }, []);

  const cargar = async (idBolsillo, force = false) => {
    if (
      !force &&
      (datos[idBolsillo] || pidiendo.current[idBolsillo])
    ) {
      return;
    }

    const bolsillo = BOLSILLOS.find((b) => b.id === idBolsillo);
    const controller = new AbortController();
    controllers.current[idBolsillo]?.abort();
    controllers.current[idBolsillo] = controller;
    pidiendo.current[idBolsillo] = true;
    setError(null);

    try {
      const secciones = await cargarBolsillo(
        bolsillo,
        controller.signal,
      );
      if (!montado.current || controller.signal.aborted) return;
      setDatos((prev) => ({ ...prev, [idBolsillo]: secciones }));
    } catch (err) {
      if (montado.current && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      if (controllers.current[idBolsillo] === controller) {
        pidiendo.current[idBolsillo] = false;
        delete controllers.current[idBolsillo];
      }
    }
  };

  useEffect(() => {
    const force = retryKey !== lastRetryKey.current;
    lastRetryKey.current = retryKey;
    cargar(activo, force);
  }, [activo, retryKey]);

  useEffect(() => {
    if (!isOffline) return;
    Object.values(controllers.current).forEach((controller) =>
      controller.abort(),
    );
  }, [isOffline]);

  const secciones = datos[activo];

  const renderItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <Card.Content style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{formatear(item.name)}</Text>
          <Text style={styles.itemNumber}>
            #{String(item.id).padStart(4, "0")}
          </Text>
        </View>
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
          contentFit="contain"
          accessibilityLabel={`Imagen de ${formatear(item.name)}`}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.itemContainer}>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemPockets}
        >
          {BOLSILLOS.map((bolsillo) => (
            <Chip
              key={bolsillo.id}
              selected={activo === bolsillo.id}
              showSelectedOverlay
              onPress={() => setActivo(bolsillo.id)}
            >
              {bolsillo.nombre}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {isOffline || isNetworkError(error) ? (
        <OfflineMessage />
      ) : error ? (
        <View style={styles.itemCenter}>
          <Text accessibilityRole="alert">{error}</Text>
          <Button
            onPress={() => {
              setError(null);
              cargar(activo, true);
            }}
          >
            Reintentar
          </Button>
        </View>
      ) : !secciones ? (
        <View style={styles.itemCenter}>
          <ActivityIndicator accessibilityLabel="Cargando objetos" />
        </View>
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={styles.itemSectionHeader}>
              {section.title} ({section.data.length})
            </Text>
          )}
          stickySectionHeadersEnabled
          initialNumToRender={20}
          contentContainerStyle={styles.itemList}
          ListEmptyComponent={
            <Text style={styles.itemEmpty}>
              No hay objetos en este bolsillo
            </Text>
          }
        />
      )}
    </View>
  );
}