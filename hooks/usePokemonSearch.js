import { useEffect, useRef, useState } from "react";
import {
  API_URL,
  fetchApiData,
  getIdFromUrl,
  getPokemonDetails,
} from "../services/pokemonApi";
import { isNetworkError } from "../useNetworkRetry";

export default function usePokemonSearch(retryKey, setError) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const nameIndexRef = useRef(null);

  // Espera a que termine de escribir y cancela solicitudes de búsquedas anteriores.
  /* eslint-disable react-hooks/set-state-in-effect -- Clear stale results when the query changes. */
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setError(null);
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    let isActive = true;
    setError(null);
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
        if (error.name === "AbortError") return;
        console.warn("Error en la búsqueda:", error);
        if (isActive) {
          if (isNetworkError(error)) setError(error.message);
          setSearchResults([]);
        }
      } finally {
        if (isActive) setSearching(false);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, retryKey, setError]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return { searchQuery, setSearchQuery, searchResults, searching };
}
