import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import Navigation from "./navigation";
import PokemonCard from "./PokemonCard";
import styles from "./styles.js";

const API_URL = "https://pokeapi.co/api/v2";
const MAX_CONCURRENT_REQUESTS = 10;

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

async function getPokemonData(filter, signal) {
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
        otherTypePokemon.every((pokemonNames) =>
          pokemonNames.has(pokemon.name),
        ),
      )
      .map(({ pokemon }) => pokemon);
  } else {
    const pokedex = await fetchApiData(`${API_URL}/pokemon?limit=20`, signal);
    entries = pokedex.results;
  }

  const pokemonData = new Array(entries.length);
  let nextIndex = 0;
  const workerCount = Math.min(MAX_CONCURRENT_REQUESTS, entries.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < entries.length) {
        const index = nextIndex++;
        pokemonData[index] = await getPokemonDetails(entries[index].url, signal);
      }
    }),
  );

  return Array.from(
    new Map(pokemonData.map((pokemon) => [pokemon.id, pokemon])).values(),
  )
    .filter(
      (pokemon) =>
        filter.kind !== "type" ||
        filter.values.every((type) => pokemon.types.includes(type)),
    )
    .sort((first, second) => first.id - second.id);
}

export default function Main() {
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ kind: "all" });

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    setLoading(true);
    setError(null);

    getPokemonData(filter, controller.signal)
      .then((data) => {
        if (isActive) {
          setPokemonData(data);
        }
      })
      .catch((error) => {
        if (isActive) {
          controller.abort();
          setError(error.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [filter]);

  const showPokedex = () => setFilter({ kind: "all" });
  const showGeneration = (generationId) =>
    setFilter({ kind: "generation", value: generationId });
  const showTypes = (types) =>
    setFilter(
      types.length > 0
        ? { kind: "type", values: types }
        : { kind: "all" },
    );

  return (
    <SafeAreaProvider>
      <Navigation
        onPokedex={showPokedex}
        onSelectGeneration={showGeneration}
        onSelectType={showTypes}
        selectedTypes={filter.kind === "type" ? filter.values : []}
      >
        {loading ? (
          <ActivityIndicator accessibilityLabel="Cargando Pokémon" />
        ) : error ? (
          <Text accessibilityRole="alert">{error}</Text>
        ) : (
          <FlatList
            data={pokemonData}
            renderItem={({ item }) => <PokemonCard pokemon={item} />}
            keyExtractor={(pokemon) => String(pokemon.id)}
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
