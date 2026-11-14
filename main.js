import { ActivityIndicator, ScrollView, Text } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from "react";
import Navigation from "./navigation";
import PokemonCard from "./PokemonCard";
import styles from "./styles.js";

async function getPokemonData() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
  if (!response.ok) {
    throw new Error(`No se pudo cargar la Pokédex (${response.status}).`);
  }

  const { results } = await response.json();
  return Promise.all(
    results.map(async ({ url }) => {
      const pokemonResponse = await fetch(url);
      if (!pokemonResponse.ok) {
        throw new Error(`No se pudo cargar un Pokémon (${pokemonResponse.status}).`);
      }

      const pokemon = await pokemonResponse.json();
      return {
        id: pokemon.id,
        name: pokemon.name,
        image:
          pokemon.sprites.other["official-artwork"].front_default ??
          pokemon.sprites.front_default,
        types: pokemon.types.map(({ type }) => type.name),
      };
    }),
  );
}

export default function Main() {
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getPokemonData();
        if (isMounted) {
          setPokemonData(data);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Navigation>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {loading ? (
            <ActivityIndicator accessibilityLabel="Cargando Pokémon" />
          ) : error ? (
            <Text accessibilityRole="alert">{error}</Text>
          ) : (
            pokemonData.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))
          )}
        </ScrollView>
      </Navigation>
    </SafeAreaProvider>
  );
}
