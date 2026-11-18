import { BackHandler } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";
import Navigation from "./navigation";
import MainContent from "./MainContent";
import useFavorites from "./hooks/useFavorites";
import usePokemonCatalog from "./hooks/usePokemonCatalog";
import usePokemonSearch from "./hooks/usePokemonSearch";
import useNetworkRetry from "./useNetworkRetry";

export default function Main() {
  const { isOffline, retryKey } = useNetworkRetry();
  const [filters, setFilters] = useState({
    generation: null,
    types: [],
    favoritesOnly: false,
  });
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [activeView, setActiveView] = useState("pokedex");
  const cryPlayer = useAudioPlayer(null);
  const listRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  const { favorites, favoritesReady, toggleFavorite } = useFavorites();
  const favoritesForFilter = filters.favoritesOnly ? favorites : null;
  const {
    error,
    loading,
    loadingMore,
    loadMore,
    pokemonData,
    setError,
  } = usePokemonCatalog(filters, favoritesForFilter, retryKey);
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
  } = usePokemonSearch(retryKey, setError);

  // Restaura la posición anterior al volver del detalle a la lista.
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

  // En Android, el botón atrás cierra el detalle antes de salir de la app.
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

  const handlePokemonPress = (pokemon) => {
    setSelectedPokemon(pokemon);
    if (pokemon.cry) {
      cryPlayer.replace(pokemon.cry);
      cryPlayer.play();
    }
  };

  const preparePokedex = () => {
    setSearchQuery("");
    scrollOffsetRef.current = 0;
    setSelectedPokemon(null);
    setActiveView("pokedex");
  };

  const toggleGeneration = (generation) => {
    preparePokedex();
    setFilters((currentFilters) => ({
      ...currentFilters,
      generation:
        currentFilters.generation === generation ? null : generation,
    }));
  };

  const toggleType = (type) => {
    preparePokedex();
    setFilters((currentFilters) => ({
      ...currentFilters,
      types: currentFilters.types.includes(type)
        ? currentFilters.types.filter((selectedType) => selectedType !== type)
        : [...currentFilters.types, type],
    }));
  };

  const toggleFavoritesFilter = () => {
    preparePokedex();
    setFilters((currentFilters) => ({
      ...currentFilters,
      favoritesOnly: !currentFilters.favoritesOnly,
    }));
  };

  const showItems = () => {
    setSearchQuery("");
    scrollOffsetRef.current = 0;
    setSelectedPokemon(null);
    setActiveView("items");
  };

  const handleSearch = (text) => {
    scrollOffsetRef.current = 0;
    setSearchQuery(text);
  };

  const handleListScroll = (event) => {
    if (!selectedPokemon) {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    }
  };

  return (
    <SafeAreaProvider>
      <Navigation
        activeView={activeView}
        onOpenFilters={preparePokedex}
        onShowPokedex={preparePokedex}
        onToggleGeneration={toggleGeneration}
        onToggleType={toggleType}
        onToggleFavorites={toggleFavoritesFilter}
        onShowItems={showItems}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        selectedGeneration={filters.generation}
        selectedTypes={filters.types}
        favoritesOnly={filters.favoritesOnly}
        favoritesReady={favoritesReady}
      >
        <MainContent
          activeView={activeView}
          error={error}
          favorites={favorites}
          favoritesOnly={filters.favoritesOnly}
          favoritesReady={favoritesReady}
          canShowOfflineFavorites={filters.favoritesOnly && filters.generation === null}
          isOffline={isOffline}
          listRef={listRef}
          loading={loading}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          onPokemonPress={handlePokemonPress}
          onScroll={handleListScroll}
          onToggleFavorite={toggleFavorite}
          onBack={() => setSelectedPokemon(null)}
          pokemonData={pokemonData}
          searchQuery={searchQuery}
          searchResults={searchResults}
          searching={searching}
          selectedPokemon={selectedPokemon}
        />
      </Navigation>
    </SafeAreaProvider>
  );
}
