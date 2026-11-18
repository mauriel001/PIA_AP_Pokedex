import { useEffect, useRef, useState } from "react";
import { getEntries, getPokemonPage } from "../services/pokemonApi";
import { isNetworkError } from "../useNetworkRetry";

export default function usePokemonCatalog(filter, retryKey) {
  const [entries, setEntries] = useState([]);
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // Recarga el catálogo al cambiar el filtro o al recuperar la conexión.
  /* eslint-disable react-hooks/set-state-in-effect -- Reset the list before loading the new filter. */
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
  }, [filter, retryKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Añade la siguiente página al acercarse al final de la lista.
  const loadMore = async () => {
    if (
      loading ||
      loadingMoreRef.current ||
      pokemonData.length >= entries.length
    ) {
      return;
    }

    const controller = controllerRef.current;
    if (!controller) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = await getPokemonPage(
        entries,
        pokemonData.length,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setPokemonData((previousPage) => [...previousPage, ...nextPage]);
    } catch (error) {
      if (!controller.signal.aborted) {
        console.warn(error.message);
        if (isNetworkError(error)) setError(error.message);
      }
    } finally {
      if (!controller.signal.aborted) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  };

  return {
    error,
    loading,
    loadingMore,
    loadMore,
    pokemonData,
    setError,
  };
}
