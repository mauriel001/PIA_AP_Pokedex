import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_STORAGE_KEY = "@pokedex/favorites";

export default function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [favoritesReady, setFavoritesReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem(
          FAVORITES_STORAGE_KEY,
        );
        if (savedFavorites === null) return;

        const parsedFavorites = JSON.parse(savedFavorites);
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

  // Evita guardar la lista vacía antes de terminar la lectura inicial.
  useEffect(() => {
    if (!favoritesReady) return;

    AsyncStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favorites),
    ).catch((error) =>
      console.warn("No se pudieron guardar los favoritos:", error),
    );
  }, [favorites, favoritesReady]);

  const toggleFavorite = (pokemon) => {
    if (!favoritesReady) return;

    setFavorites((currentFavorites) => {
      const isFavorite = currentFavorites.some(
        (favorite) => favorite.id === pokemon.id,
      );
      if (isFavorite) {
        return currentFavorites.filter(
          (favorite) => favorite.id !== pokemon.id,
        );
      }
      return [...currentFavorites, pokemon].sort((a, b) => a.id - b.id);
    });
  };

  return { favorites, favoritesReady, toggleFavorite };
}
