import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Card, Chip } from "react-native-paper";
import { Image } from "expo-image";

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

async function fetchJson(url) {
  const response = await fetch(url);
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
async function cargarBolsillo(bolsillo) {
  const pockets = await Promise.all(
    bolsillo.pockets.map((p) => fetchJson(`${API_URL}/item-pocket/${p}/`)),
  );

  // Quita categorías repetidas entre bolsillos
  const urls = [
    ...new Set(pockets.flatMap((p) => p.categories.map(({ url }) => url))),
  ];
  const categorias = await Promise.all(urls.map((url) => fetchJson(url)));

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
  const [activo, setActivo] = useState(BOLSILLOS[0].id);
  const [datos, setDatos] = useState({}); // { idBolsillo: [secciones] }
  const [error, setError] = useState(null);

  const montado = useRef(true);
  const pidiendo = useRef({});

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const cargar = async (idBolsillo) => {
    if (datos[idBolsillo] || pidiendo.current[idBolsillo]) return;

    const bolsillo = BOLSILLOS.find((b) => b.id === idBolsillo);
    pidiendo.current[idBolsillo] = true;
    setError(null);

    try {
      const secciones = await cargarBolsillo(bolsillo);
      if (!montado.current) return;
      setDatos((prev) => ({ ...prev, [idBolsillo]: secciones }));
    } catch (err) {
      if (montado.current) setError(err.message);
    } finally {
      pidiendo.current[idBolsillo] = false;
    }
  };

  useEffect(() => {
    cargar(activo);
  }, [activo]);

  const secciones = datos[activo];

  const renderItem = ({ item }) => (
    <Card style={estilos.tarjeta}>
      <Card.Content style={estilos.fila}>
        <View style={estilos.info}>
          <Text style={estilos.nombre}>{formatear(item.name)}</Text>
          <Text style={estilos.numero}>
            #{String(item.id).padStart(4, "0")}
          </Text>
        </View>
        <Image
          source={{ uri: item.image }}
          style={estilos.imagen}
          contentFit="contain"
          accessibilityLabel={`Imagen de ${formatear(item.name)}`}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={estilos.contenedor}>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.chips}
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

      {error ? (
        <View style={estilos.centro}>
          <Text accessibilityRole="alert">{error}</Text>
          <Button
            onPress={() => {
              setError(null);
              cargar(activo);
            }}
          >
            Reintentar
          </Button>
        </View>
      ) : !secciones ? (
        <View style={estilos.centro}>
          <ActivityIndicator accessibilityLabel="Cargando objetos" />
        </View>
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={estilos.encabezado}>
              {section.title} ({section.data.length})
            </Text>
          )}
          stickySectionHeadersEnabled
          initialNumToRender={20}
          contentContainerStyle={estilos.lista}
          ListEmptyComponent={
            <Text style={estilos.vacio}>No hay objetos en este bolsillo</Text>
          }
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1 },
  chips: { flexDirection: "row", gap: 8, padding: 12 },
  lista: { paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  encabezado: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: "#FFFFFF",
  },
  tarjeta: { backgroundColor: "#F5F0F8" },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: "bold", textTransform: "capitalize" },
  numero: { opacity: 0.6, marginTop: 2 },
  imagen: { width: 56, height: 56 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  vacio: { textAlign: "center", marginTop: 24 },
});