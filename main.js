import { ScrollView } from "react-native";
import Navigation from "./navigation";
import PokemonCard from "./PokemonCard";
import styles from "./styles.js";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";

export default function Main() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Navigation>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <PokemonCard />
            <PokemonCard />
            <PokemonCard />
          </ScrollView>
        </Navigation>
      </PaperProvider>
    </SafeAreaProvider>
  );
}