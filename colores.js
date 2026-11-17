export const COLORES_PASTEL = {
  normal: "#E4E4D4",
  fighting: "#F2C4C0",
  flying: "#D9D4F5",
  poison: "#E3C4E3",
  ground: "#EFE0B8",
  rock: "#DDD3A8",
  bug: "#DDE8B0",
  ghost: "#D0C6DD",
  steel: "#D8D8E4",
  fire: "#FAD0B0",
  water: "#C6D6FA",
  grass: "#C8EBB8",
  electric: "#FBEFB0",
  psychic: "#FAC6D8",
  ice: "#D0EEEE",
  dragon: "#CBB8FA",
  dark: "#CFC0B4",
  fairy: "#F8D4E4",
};

export const colorPastel = (pokemon) =>
  COLORES_PASTEL[pokemon.types[0]] ?? "#F5F0F8";