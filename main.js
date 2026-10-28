import { ScrollView } from "react-native";
import Navigation from "./navigation";
import PokemonCard from "./PokemonCard";
import styles from "./styles.js";

export default function Main() {
  return (
    <Navigation>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <PokemonCard/>
        <PokemonCard/>
        <PokemonCard/>
        <PokemonCard/>
        <PokemonCard/>
        <PokemonCard/>
        <PokemonCard/>
        <PokemonCard/>
        <PokemonCard/>
        <PokemonCard/>
      </ScrollView>
    </Navigation>
  );
}
