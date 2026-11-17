import { Pressable, View, Text } from "react-native";
import { Card, IconButton } from "react-native-paper";
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

export default function PokemonCard({
    pokemon,
    onPress,
    isFavorite = false,
    onToggleFavorite,
    favoritesReady = true,
}) {
    return (
        <Card>
            <Card.Content style={styles.cardContent}>
                <Pressable
                    style={styles.rowContainer}
                    onPress={() => onPress?.(pokemon)}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver detalle de ${pokemon.name}`}
                >
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
                </Pressable>
                <IconButton
                    icon={isFavorite ? "star" : "star-outline"}
                    iconColor={isFavorite ? "#F4B400" : undefined}
                    style={styles.favoriteButton}
                    disabled={!favoritesReady}
                    onPress={() => onToggleFavorite?.(pokemon)}
                    accessibilityLabel={
                        isFavorite
                            ? `Quitar a ${pokemon.name} de favoritos`
                            : `Agregar a ${pokemon.name} a favoritos`
                    }
                    accessibilityState={{ selected: isFavorite }}
                />
            </Card.Content>
        </Card>
    );
}