import { View, Text } from "react-native";
import { Card } from "react-native-paper";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "./styles.js";

export default function PokemonCard() {
    return (
        <Card>
            <Card.Content style={styles.rowContainer}>
                <View>
                    <Text>#000  Name</Text>
                    <Text>Planta  Veneno</Text>
                </View>
                <MaterialCommunityIcons name="star-outline" size={24} color="black" />
                <Image source={{ uri: "https://via.placeholder.com/100" }} style={{ width: 100, height: 100 }} />
            </Card.Content>
        </Card>
    );
}