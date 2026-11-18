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
  const [filter, setFilter] = useState({ kind: "all" });
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [activeView, setActiveView] = useState("pokedex");
  const cryPlayer = useAudioPlayer(null);
  const listRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  const {
    error,
    loading,
    loadingMore,
    loadMore,
    pokemonData,
    setError,
  } = usePokemonCatalog(filter, retryKey);
  const { favorites, favoritesReady, toggleFavorite } = useFavorites();
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

  // Limpia la búsqueda y el detalle al cambiar de sección o filtro.
  const resetView = (view, nextFilter) => {
    setSearchQuery("");
    scrollOffsetRef.current = 0;
    setSelectedPokemon(null);
    setActiveView(view);
    if (nextFilter) setFilter(nextFilter);
  };

  const showPokedex = () => resetView("pokedex", { kind: "all" });
  const showGeneration = (generationId) =>
    resetView("pokedex", { kind: "generation", value: generationId });
  const showTypes = (types) =>
    resetView(
      "pokedex",
      types.length > 0 ? { kind: "type", values: types } : { kind: "all" },
    );
  const showFavorites = () => resetView("favorites");
  const showItems = () => resetView("items");

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
        // Funciones de acción:
        onPokedex={showPokedex}             // Vuelve a la Pokédex completa
        onShowFavorites={showFavorites}     // Muestra favoritos
        onShowItems={showItems}             // Muestra objetos
        onSelectGeneration={showGeneration} // Aplica el filtro de generación elegida
        onSelectType={showTypes}            // Aplica los tipos elegidos
        onSearch={handleSearch}             // Actualiza o limpia el texto de búsqueda
        // Datos o estados:
        searchQuery={searchQuery}                                   // Texto actual de búsqueda
        selectedTypes={filter.kind === "type" ? filter.values : []} // Tipos seleccionados actualmente
      >
        <MainContent
          // Funciones de acción:
          onLoadMore={loadMore}                   // Carga la siguiente página
          onPokemonPress={handlePokemonPress}     // Abre el detalle del pokémon y reproduce el sonido del pokémon
          onScroll={handleListScroll}             // Guarda la posición de desplazamiento
          onToggleFavorite={toggleFavorite}       // Agrega/quita un favorito
          onBack={() => setSelectedPokemon(null)} // Cierra el detalle
          // Datos o estados:
          activeView={activeView}                 // Sección activa (Pokédex/Favoritos/Ítems)
          error={error}                           // Error actual de carga o búsqueda
          favorites={favorites}                   // Lista de pokémones favoritos
          favoritesReady={favoritesReady}         // Indica si ya terminó de cargar favoritos
          isOffline={isOffline}                   // Indica si el dispositivo no tiene conexión
          listRef={listRef}                       // Referencia a la lista, usada para restaurar el desplazamiento
          loading={loading}                       // Indica la carga inicial de la Pokédex
          loadingMore={loadingMore}               // Indica que se está cargando otra página
          pokemonData={pokemonData}               // Pokémones cargados para la Pokédex
          searchQuery={searchQuery}               // Texto de búsqueda actual
          searchResults={searchResults}           // Resultados de búsqueda
          searching={searching}                   // Indica que la búsqueda está en curso
          selectedPokemon={selectedPokemon}       // Pokémon cuyo detalle está abierto (null si no hay detalle seleccionado)
        />
      </Navigation>
    </SafeAreaProvider>
  );
}
