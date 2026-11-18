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

  // Elimina duplicados y conserva el orden numérico de la Pokédex.
  const unique = new Map(entries.map((entry) => [entry.url, entry]));
  return [...unique.values()].sort(
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
