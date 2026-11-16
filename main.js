import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import Navigation from "./navigation";
import PokemonCard from "./PokemonCard";
import Detalle from "./Detalle";
import styles from "./styles.js";

const API_URL = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 10;

async function fetchApiData(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`La solicitud a PokéAPI falló (${response.status}).`);
  }
  return response.json();
}

async function getPokemonDetails(url, signal) {
  const pokemon = await fetchApiData(url, signal);
  return {
    id: pokemon.id,
    name: pokemon.name,
    image:
      pokemon.sprites.other?.["official-artwork"]?.front_default ??
      pokemon.sprites.front_default,
    types: pokemon.types.map(({ type }) => type.name),
  };
}

const getIdFromUrl = (url) => Number(url.split("/").filter(Boolean).pop());

async function getEntries(filter, signal) {
  let entries;

  if (filter.kind === "generation") {
    const generation = await fetchApiData(
      `${API_URL}/generation/${filter.value}/`,
      signal,
    );
    entries = generation.pokemon_species.map(({ url }) => {
      const speciesId = url.split("/").filter(Boolean).pop();
      if (!speciesId) {
        throw new Error("PokéAPI devolvió una especie sin identificador.");
      }
      return { url: `${API_URL}/pokemon/${speciesId}/` };
    });
  } else if (filter.kind === "type") {
    const typeResponses = await Promise.all(
      filter.values.map((type) =>
        fetchApiData(`${API_URL}/type/${type}/`, signal),
      ),
    );
    const [firstType, ...otherTypes] = typeResponses;
    const otherTypePokemon = otherTypes.map(
      (type) => new Set(type.pokemon.map(({ pokemon }) => pokemon.name)),
    );
    entries = firstType.pokemon
      .filter(({ pokemon }) =>
        otherTypePokemon.every((names) => names.has(pokemon.name)),
      )
      .map(({ pokemon }) => pokemon);
  } else {
    const pokedex = await fetchApiData(`${API_URL}/pokemon?limit=1025`, signal);
    entries = pokedex.results;
  }

  const unique = new Map(entries.map((entry) => [entry.url, entry]));
  return [...unique.values()].sort(
    (a, b) => getIdFromUrl(a.url) - getIdFromUrl(b.url),
  );
}

function getPokemonPage(entries, start, signal) {
  return Promise.all(
    entries
      .slice(start, start + PAGE_SIZE)
      .map((entry) => getPokemonDetails(entry.url, signal)),
  );
}

export default function Main() {
  const [entries, setEntries] = useState([]);
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ kind: "all" });
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  const controllerRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // Carga inicial (y cada vez que cambia el filtro)
  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    let isActive = true;

    setLoading(true);
    setError(null);
    setEntries([]);
    setPokemonData([]);
    setLoadingMore(false);
    loadingMoreRef.current = false;

    (async () => {
      try {
        const allEntries = await getEntries(filter, controller.signal);
        const firstPage = await getPokemonPage(
          allEntries,
          0,
          controller.signal,
        );
        if (!isActive) return;
        setEntries(allEntries);
        setPokemonData(firstPage);
      } catch (error) {
        if (isActive) setError(error.message);
      } finally {
        if (isActive) setLoading(false);
      }
    })();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [filter]);

  // Botón "atrás" de Android: cierra el detalle en vez de salir de la app
  useEffect(() => {
    if (!selectedPokemon) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setSelectedPokemon(null);
        return true;
      },
    );
    return () => subscription.remove();
  }, [selectedPokemon]);

  // Cargar los siguientes 10
  const loadMore = async () => {
    if (
      loading ||
      loadingMoreRef.current ||
      pokemonData.length >= entries.length
    ) {
      return;
    }

    const controller = controllerRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = await getPokemonPage(
        entries,
        pokemonData.length,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setPokemonData((prev) => [...prev, ...nextPage]);
    } catch (error) {
      if (!controller.signal.aborted) console.warn(error.message);
    } finally {
      if (!controller.signal.aborted) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  };

  // Al hacer clic en una tarjeta se abre el detalle
  const handlePokemonPress = (pokemon) => setSelectedPokemon(pokemon);

  // Al usar el menú, se cierra el detalle y se aplica el filtro
  const showPokedex = () => {
    setSelectedPokemon(null);
    setFilter({ kind: "all" });
  };
  const showGeneration = (generationId) => {
    setSelectedPokemon(null);
    setFilter({ kind: "generation", value: generationId });
  };
  const showTypes = (types) => {
    setSelectedPokemon(null);
    setFilter(
      types.length > 0 ? { kind: "type", values: types } : { kind: "all" },
    );
  };

  return (
    <SafeAreaProvider>
      <Navigation
        onPokedex={showPokedex}
        onSelectGeneration={showGeneration}
        onSelectType={showTypes}
        selectedTypes={filter.kind === "type" ? filter.values : []}
      >
        {selectedPokemon ? (
          <Detalle
            pokemon={selectedPokemon}
            onBack={() => setSelectedPokemon(null)}
          />
        ) : loading ? (
          <ActivityIndicator accessibilityLabel="Cargando Pokémon" />
        ) : error ? (
          <Text accessibilityRole="alert">{error}</Text>
        ) : (
          <FlatList
            data={pokemonData}
            renderItem={({ item }) => (
              <PokemonCard pokemon={item} onPress={handlePokemonPress} />
            )}
            keyExtractor={(pokemon) => String(pokemon.id)}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  style={{ marginVertical: 16 }}
                  accessibilityLabel="Cargando más Pokémon"
                />
              ) : null
            }
            contentContainerStyle={[
              styles.scrollView,
              pokemonData.length === 0 && styles.emptyList,
            ]}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Image
                  source={{
                    uri: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png",
                  }}
                  style={styles.emptyImage}
                  contentFit="contain"
                  accessibilityLabel="Psyduck confundido porque no hay resultados"
                />
                <Text style={styles.emptyText}>Sin resultados</Text>
              </View>
            )}
          />
        )}
      </Navigation>
    </SafeAreaProvider>
  );
}