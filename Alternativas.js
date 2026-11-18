import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Card, IconButton } from "react-native-paper";
import { Image } from "expo-image";
import OfflineMessage from "./OfflineMessage";
import useNetworkRetry, { isNetworkError } from "./useNetworkRetry";

const API_URL = "https://pokeapi.co/api/v2";

// Devuelve el nombre de la forma, o null si no es Mega / Alola / Gigamax
function clasificar(nombre) {
  if (/totem|cap$/.test(nombre)) return null;
  if (nombre.includes("-gmax")) return "Gigamax";
  if (nombre.includes("-mega")) {
    if (nombre.endsWith("-x")) return "Mega Evolución X";
    if (nombre.endsWith("-y")) return "Mega Evolución Y";
    return "Mega Evolución";
  }
  if (nombre.includes("-alola")) return "Forma de Alola";
  return null;
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`La solicitud a PokéAPI falló (${response.status}).`);
  }
  return response.json();
}

export default function Alternativas({ pokemon, tiposEs = {} }) {
  const { isOffline, retryKey } = useNetworkRetry();
  const [formas, setFormas] = useState([]);
  const [error, setError] = useState(null);
  const [ancho, setAncho] = useState(0);
  const [indice, setIndice] = useState(0);
  const listaRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    setFormas([]);
    setIndice(0);
    setError(null);

    (async () => {
      try {
        const species = await fetchJson(
          `${API_URL}/pokemon-species/${pokemon.id}/`,
          controller.signal,
        );

        const candidatas = species.varieties
          .filter(({ is_default }) => !is_default)
          .map(({ pokemon: p }) => ({
            nombre: p.name,
            url: p.url,
            etiqueta: clasificar(p.name),
          }))
          .filter((forma) => forma.etiqueta);

        const detalles = await Promise.all(
          candidatas.map(async (forma) => {
            const data = await fetchJson(forma.url, controller.signal);
            const imagen =
              data.sprites.other?.["official-artwork"]?.front_default ??
              data.sprites.front_default;
            return {
              nombre: forma.nombre,
              etiqueta: forma.etiqueta,
              imagen,
              types: data.types.map(({ type }) => type.name),
            };
          }),
        );

        if (isActive) setFormas(detalles);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn(error.message);
          if (isActive && isNetworkError(error)) setError(error.message);
        }
      }
    })();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [pokemon.id, retryKey]);

  const paginas = [
    {
      clave: "principal",
      imagen: pokemon.image,
      titulo: `#${String(pokemon.id).padStart(3, "0")} ${pokemon.name}`,
      subtitulo: null,
      types: pokemon.types,
    },
    ...formas.map((forma) => ({
      clave: forma.nombre,
      imagen: forma.imagen,
      titulo: forma.etiqueta,
      subtitulo: forma.nombre.replace(/-/g, " "),
      types: forma.types,
    })),
  ];

  const hayFormas = formas.length > 0;

  if (isOffline || isNetworkError(error)) return <OfflineMessage />;

  const irA = (nuevo) => {
    const destino = Math.max(0, Math.min(paginas.length - 1, nuevo));
    listaRef.current?.scrollToOffset({
      offset: destino * ancho,
      animated: true,
    });
    setIndice(destino);
  };

  const renderPagina = (pagina) => (
    <View style={[estilos.pagina, ancho > 0 && { width: ancho }]}>
      {pagina.imagen ? (
        <Image
          source={{ uri: pagina.imagen }}
          style={estilos.imagen}
          contentFit="contain"
          accessibilityLabel={`Imagen de ${pagina.titulo}`}
        />
      ) : (
        <View style={[estilos.imagen, estilos.sinImagen]}>
          <Text>Sin imagen</Text>
        </View>
      )}
      <Text style={estilos.titulo}>{pagina.titulo}</Text>
      {pagina.subtitulo ? (
        <Text style={estilos.subtitulo}>{pagina.subtitulo}</Text>
      ) : null}
      <View style={estilos.tipos}>
        {pagina.types.map((type) => (
          <Text key={type} style={estilos.tipo}>
            {tiposEs[type] ?? type}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <Card>
      <Card.Content>
        <View onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
          {hayFormas && ancho > 0 ? (
            <>
              <FlatList
                ref={listaRef}
                horizontal
                pagingEnabled
                data={paginas}
                keyExtractor={(pagina) => pagina.clave}
                renderItem={({ item }) => renderPagina(item)}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={(event) =>
                  setIndice(
                    Math.round(event.nativeEvent.contentOffset.x / ancho),
                  )
                }
                getItemLayout={(_, i) => ({
                  length: ancho,
                  offset: ancho * i,
                  index: i,
                })}
              />

              {indice > 0 ? (
                <IconButton
                  icon="chevron-left"
                  size={32}
                  style={[estilos.flecha, { left: -12 }]}
                  onPress={() => irA(indice - 1)}
                  accessibilityLabel="Forma anterior"
                />
              ) : null}
              {indice < paginas.length - 1 ? (
                <IconButton
                  icon="chevron-right"
                  size={32}
                  style={[estilos.flecha, { right: -12 }]}
                  onPress={() => irA(indice + 1)}
                  accessibilityLabel="Siguiente forma"
                />
              ) : null}

              <View style={estilos.puntos}>
                {paginas.map((pagina, i) => (
                  <View
                    key={pagina.clave}
                    style={[estilos.punto, i === indice && estilos.puntoActivo]}
                  />
                ))}
              </View>
            </>
          ) : (
            renderPagina(paginas[0])
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const estilos = StyleSheet.create({
  pagina: { alignItems: "center" },
  imagen: { width: 220, height: 220 },
  sinImagen: { alignItems: "center", justifyContent: "center", opacity: 0.6 },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "capitalize",
    textAlign: "center",
  },
  subtitulo: {
    opacity: 0.7,
    textTransform: "capitalize",
    textAlign: "center",
  },
  tipos: { flexDirection: "row", gap: 8, marginTop: 8 },
  tipo: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#e8e0f0",
    overflow: "hidden",
  },
  flecha: { position: "absolute", top: 80 },
  puntos: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  punto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CFC6D9",
  },
  puntoActivo: { backgroundColor: "#6B5B8C" },
});