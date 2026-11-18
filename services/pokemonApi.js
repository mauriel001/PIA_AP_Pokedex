const API_URL = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 50;

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

async function getEntries(filters, favorites, signal) {
  const pokedex = await fetchApiData(`${API_URL}/pokemon?limit=1025`, signal);
  let entries = pokedex.results;

  if (filters.generation !== null) {
    const generation = await fetchApiData(
      `${API_URL}/generation/${filters.generation}/`,
      signal,
    );
    const generationIds = new Set(
      generation.pokemon_species.map(({ url }) => getIdFromUrl(url)),
    );
    entries = entries.filter((entry) =>
      generationIds.has(getIdFromUrl(entry.url)),
    );
  }

  if (filters.types.length > 0) {
    const typeResponses = await Promise.all(
      filters.types.map((type) =>
        fetchApiData(`${API_URL}/type/${type}/`, signal),
      ),
    );
    const pokemonByType = typeResponses.map(
      (type) =>
        new Set(type.pokemon.map(({ pokemon }) => pokemon.name)),
    );
    entries = entries.filter((entry) =>
      pokemonByType.every((pokemonNames) => pokemonNames.has(entry.name)),
    );
  }

  if (filters.favoritesOnly) {
    const favoriteIds = new Set(favorites.map(({ id }) => id));
    entries = entries.filter((entry) =>
      favoriteIds.has(getIdFromUrl(entry.url)),
    );
  }

  return entries.sort(
    (a, b) => getIdFromUrl(a.url) - getIdFromUrl(b.url),
  );
}

function getPokemonPage(entries, start, signal) {
  // Carga una página en paralelo para reducir el tiempo de espera de la lista.
  return Promise.all(
    entries
      .slice(start, start + PAGE_SIZE)
      .map((entry) => getPokemonDetails(entry.url, signal)),
  );
}

export {
  API_URL,
  fetchApiData,
  getEntries,
  getIdFromUrl,
  getPokemonDetails,
  getPokemonPage,
};
