import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useAudioPlayer } from "expo-audio";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import Navigation from "./navigation";
import PokemonCard from "./PokemonCard";
import Detalle from "./Detalle";
import styles from "./styles.js";

const API_URL = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 50;
const FAVORITES_STORAGE_KEY = "@pokedex/favorites";


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
    cry: `https://play.pokemonshowdown.com/audio/cries/${pokemon.name.replace(
      /[^a-z0-9]/g,
      "",
    )}.mp3`,
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
  const [favorites, setFavorites] = useState([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [activeView, setActiveView] = useState("pokedex");
  const cryPlayer = useAudioPlayer(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const nameIndexRef = useRef(null);

  const controllerRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const listRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    let isActive = true;

    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(
          FAVORITES_STORAGE_KEY,
        );
        if (storedFavorites === null) return;

        const parsedFavorites = JSON.parse(storedFavorites);
        if (!Array.isArray(parsedFavorites)) {
          throw new Error("El formato guardado de favoritos no es válido.");
        }
        if (isActive) setFavorites(parsedFavorites);
      } catch (error) {
        console.warn("No se pudieron cargar los favoritos:", error);
      } finally {
        if (isActive) setFavoritesReady(true);
      }
    };

    loadFavorites();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!favoritesReady) return;
    AsyncStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favorites),
    ).catch((error) =>
      console.warn("No se pudieron guardar los favoritos:", error),
    );
  }, [favorites, favoritesReady]);


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


  useEffect(() => {
    if (selectedPokemon) return;
    const id = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: scrollOffsetRef.current,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [selectedPokemon]);


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

    useEffect(() => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      const controller = new AbortController();
      let isActive = true;
      setSearching(true);

      const timer = setTimeout(async () => {
        try {
          if (!nameIndexRef.current) {
            const data = await fetchApiData(
              `${API_URL}/pokemon?limit=1025`,
              controller.signal,
            );
            nameIndexRef.current = data.results;
          }

          const matches = nameIndexRef.current
            .filter(
              ({ name, url }) =>
                name.includes(query) || String(getIdFromUrl(url)) === query,
            )
            .slice(0, 20);

          const results = await Promise.all(
            matches.map(({ url }) => getPokemonDetails(url, controller.signal)),
          );
          if (isActive) setSearchResults(results.sort((a, b) => a.id - b.id));
        } catch (error) {
          if (isActive && error.name !== "AbortError") setSearchResults([]);
        } finally {
          if (isActive) setSearching(false);
        }
      }, 300);

      return () => {
        isActive = false;
        clearTimeout(timer);
        controller.abort();
      };
    }, [searchQuery]);
  };


  const handlePokemonPress = (pokemon) => {
    setSelectedPokemon(pokemon);
    if (pokemon.cry) {
      cryPlayer.replace(pokemon.cry);
      cryPlayer.play();
    }
  };
  const toggleFavorite = (pokemon) => {
    if (!favoritesReady) return;
    setFavorites((currentFavorites) =>
      currentFavorites.some((favorite) => favorite.id === pokemon.id)
        ? currentFavorites.filter((favorite) => favorite.id !== pokemon.id)
        : [...currentFavorites, pokemon].sort((a, b) => a.id - b.id),
    );
  };


  const showPokedex = () => {
    setSearchQuery("");
    scrollOffsetRef.current = 0;
    setSelectedPokemon(null);
    setFilter({ kind: "all" });
  };
  const showGeneration = (generationId) => {
    setSearchQuery("");
    scrollOffsetRef.current = 0;
    setSelectedPokemon(null);
    setFilter({ kind: "generation", value: generationId });
  };
  const showTypes = (types) => {
    setSearchQuery("");
    scrollOffsetRef.current = 0;
    setSelectedPokemon(null);
    setFilter(
      types.length > 0 ? { kind: "type", values: types } : { kind: "all" },
    );
  };
  const showFavorites = () => {
    setSelectedPokemon(null);
    setActiveView("favorites");
  };

  const displayedPokemon =
    activeView === "favorites" ? favorites : pokemonData;
  const isSearching = searchQuery.trim().length > 0;
  const listData = isSearching ? searchResults : displayedPokemon;
  const renderPokemonCard = ({ item }) => (
    <PokemonCard
      pokemon={item}
      onPress={handlePokemonPress}
      isFavorite={favorites.some((favorite) => favorite.id === item.id)}
      onToggleFavorite={toggleFavorite}
      favoritesReady={favoritesReady}
    />
  );

  return (
    <SafeAreaProvider>
      <Navigation
        onPokedex={showPokedex}
        onShowFavorites={showFavorites}
        onSelectGeneration={showGeneration}
        onSelectType={showTypes}
        selectedTypes={filter.kind === "type" ? filter.values : []}
        onSearch={(texto) => {
          scrollOffsetRef.current = 0;
          setSearchQuery(texto);
        }}
        searchQuery={searchQuery}
      >
        {!isSearching && activeView === "favorites" && !favoritesReady ? (
          <ActivityIndicator accessibilityLabel="Cargando favoritos" />
        ) : !isSearching && activeView === "pokedex" && loading ? (
          <ActivityIndicator accessibilityLabel="Cargando pokémones" />
        ) : !isSearching && activeView === "pokedex" && error ? (
          <Text accessibilityRole="alert">{error}</Text>
        ) : (
          <>
            <View
              style={{ flex: 1, display: selectedPokemon ? "none" : "flex" }}
            >
              <FlatList
                ref={listRef}
                data={listData}
                renderItem={renderPokemonCard}
                keyExtractor={(pokemon) => String(pokemon.id)}
                onScroll={(event) => {
                  if (!selectedPokemon) {
                    scrollOffsetRef.current =
                      event.nativeEvent.contentOffset.y;
                  }
                }}
                scrollEventThrottle={16}
                ListHeaderComponent={
                  isSearching ? (
                    <Text style={styles.favoriteListTitle}>
                      Resultados para "{searchQuery.trim()}"
                    </Text>
                  ) : activeView === "favorites" ? (
                    <Text style={styles.favoriteListTitle}>
                      Pokémones favoritos
                    </Text>
                  ) : null
                }
                onEndReached={
                  activeView === "pokedex" && !isSearching
                    ? loadMore
                    : undefined
                }
                onEndReachedThreshold={
                  activeView === "pokedex" && !isSearching ? 0.5 : undefined
                }
                ListFooterComponent={
                  !isSearching && activeView === "pokedex" && loadingMore ? (
                    <ActivityIndicator
                      style={{ marginVertical: 16 }}
                      accessibilityLabel="Cargando más Pokémon"
                    />
                  ) : null
                }
                contentContainerStyle={[
                  styles.scrollView,
                  listData.length === 0 &&
                  (isSearching || activeView === "pokedex") &&
                  styles.emptyList,
                ]}
                ListEmptyComponent={
                  isSearching ? (
                    searching ? (
                      <ActivityIndicator accessibilityLabel="Buscando" />
                    ) : (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                          Sin resultados para "{searchQuery.trim()}"
                        </Text>
                      </View>
                    )
                  ) : activeView === "favorites" ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>
                        Aún no tienes pokémones favoritos
                      </Text>
                    </View>
                  ) : (
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
                  )
                }
              />
            </View>

            {selectedPokemon ? (
              <Detalle
                pokemon={selectedPokemon}
                onBack={() => setSelectedPokemon(null)}
              />
            ) : null}
          </>
        )}
      </Navigation>
    </SafeAreaProvider>
  );
}