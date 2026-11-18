import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { Image } from "expo-image";
import OfflineMessage from "./OfflineMessage";
import PokemonCard from "./PokemonCard";
import Detalle from "./Detalle";
import styles from "./styles.js";
import Objetos from "./Objetos";
import { isNetworkError } from "./useNetworkRetry";

const EMPTY_POKEMON_IMAGE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png";

export default function MainContent({
  activeView,
  canShowOfflineFavorites,
  error,
  favorites,
  favoritesOnly,
  favoritesReady,
  isOffline,
  listRef,
  loading,
  loadingMore,
  onLoadMore,
  onPokemonPress,
  onScroll,
  onToggleFavorite,
  onBack,
  pokemonData,
  searchQuery,
  searchResults,
  searching,
  selectedPokemon,
}) {
  const isSearching =
    activeView !== "items" && searchQuery.trim().length > 0;
  const listData = isSearching ? searchResults : pokemonData;

  const renderPokemonCard = ({ item }) => (
    <PokemonCard
      pokemon={item}
      onPress={onPokemonPress}
      isFavorite={favorites.some((favorite) => favorite.id === item.id)}
      onToggleFavorite={onToggleFavorite}
      favoritesReady={favoritesReady}
    />
  );

  const renderEmptyState = () => {
    if (isSearching) {
      if (searching) {
        return <ActivityIndicator accessibilityLabel="Buscando" />;
      }

      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Sin resultados para &quot;{searchQuery.trim()}&quot;
          </Text>
        </View>
      );
    }

    if (favoritesOnly) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No hay favoritos que coincidan con los filtros
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Image
          source={{ uri: EMPTY_POKEMON_IMAGE_URL }}
          style={styles.emptyImage}
          contentFit="contain"
          accessibilityLabel="Psyduck confundido porque no hay resultados"
        />
        <Text style={styles.emptyText}>Sin resultados</Text>
      </View>
    );
  };

  if (activeView === "items") return <Objetos />;

  if (
    activeView === "pokedex" &&
    (isOffline || isNetworkError(error)) &&
    !(canShowOfflineFavorites && !isSearching)
  ) {
    return <OfflineMessage />;
  }

  if (!isSearching && activeView === "pokedex" && loading) {
    return <ActivityIndicator accessibilityLabel="Cargando pokémones" />;
  }

  if (!isSearching && activeView === "pokedex" && error) {
    return <Text accessibilityRole="alert">{error}</Text>;
  }

  return (
    <>
      <View
        style={[
          styles.mainContent,
          selectedPokemon && styles.hiddenContent,
        ]}
      >
        <FlatList
          ref={listRef}
          data={listData}
          renderItem={renderPokemonCard}
          keyExtractor={(pokemon) => String(pokemon.id)}
          onScroll={onScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={
            isSearching ? (
              <Text style={styles.favoriteListTitle}>
                Resultados para &quot;{searchQuery.trim()}&quot;
              </Text>
            ) : favoritesOnly ? (
              <Text style={styles.favoriteListTitle}>Pokémones favoritos</Text>
            ) : null
          }
          onEndReached={
            activeView === "pokedex" && !isSearching ? onLoadMore : undefined
          }
          onEndReachedThreshold={
            activeView === "pokedex" && !isSearching ? 0.5 : undefined
          }
          ListFooterComponent={
            !isSearching && activeView === "pokedex" && loadingMore ? (
              <ActivityIndicator
                style={styles.loadingMore}
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
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      {selectedPokemon ? (
        <Detalle pokemon={selectedPokemon} onBack={onBack} />
      ) : null}
    </>
  );
}
