import { Image } from "expo-image";
import { Text, View } from "react-native";
import styles from "./styles";

export const OFFLINE_POKEMON_IMAGE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png";

export default function OfflineMessage() {
  return (
    <View style={styles.offlineState}>
      <Image
        source={{ uri: OFFLINE_POKEMON_IMAGE_URL }}
        style={styles.offlineImage}
        contentFit="contain"
        cachePolicy="disk"
        accessibilityLabel="Psyduck confundido porque no hay conexión"
      />
      <Text accessibilityRole="alert" style={styles.offlineTitle}>
        Sin conexión
      </Text>
      <Text style={styles.offlineMessage}>
        La app se actualizará automáticamente al recuperar internet.
      </Text>
    </View>
  );
}
