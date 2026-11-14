import { View, Text } from "react-native";
import { Card } from "react-native-paper";
import { Image } from "expo-image";
import styles from "./styles.js";

const TIPOS_EN_ESPANOL = {
    normal: "Normal",
    fighting: "Lucha",
    flying: "Volador",
    poison: "Veneno",
    ground: "Tierra",
    rock: "Roca",
    bug: "Bicho",
    ghost: "Fantasma",
    steel: "Acero",
    fire: "Fuego",
    water: "Agua",
    grass: "Planta",
    electric: "Eléctrico",
    psychic: "Psíquico",
    ice: "Hielo",
    dragon: "Dragón",
    dark: "Siniestro",
    fairy: "Hada",
};

export default function PokemonCard({ pokemon }) {
    return (
        <Card>
            <Card.Content style={styles.rowContainer}>
                <View style={styles.pokemonInfo}>
                    <Text style={styles.pokemonName}>
                        #{String(pokemon.id).padStart(3, "0")}{" "}
                        {pokemon.name}
                    </Text>
                    <View style={styles.typeContainer}>
                        {pokemon.types.map((type) => (
                            <Text key={type} style={styles.pokemonType}>
                                {TIPOS_EN_ESPANOL[type] ?? type}
                            </Text>
                        ))}
                    </View>
                </View>
                <Image
                    source={{ uri: pokemon.image }}
                    style={styles.pokemonImage}
                    contentFit="contain"
                    accessibilityLabel={`Imagen de ${pokemon.name}`}
                />
            </Card.Content>
        </Card>
    );
}