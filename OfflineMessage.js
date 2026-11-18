import { Image } from "expo-image";
import { Text, View } from "react-native";
import styles from "./styles";

export default function OfflineMessage() {
  return (
    <View style={styles.offlineState}>
      <Image
        source={require("./assets/psyduck.png")}
        style={styles.offlineImage}
        contentFit="contain"
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
