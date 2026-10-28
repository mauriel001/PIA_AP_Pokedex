import { View, Pressable, Text } from 'react-native';
import { Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from "./styles";

export default function Navigation({ children }) {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Appbar style={styles.navBar}>
                <Pressable>
                    <Text>Pokedex</Text>
                </Pressable>
                <Pressable>
                    <Text>Generación</Text>
                </Pressable>
                <Pressable>
                    <Text>Tipo</Text>
                </Pressable>
            </Appbar>
            <View style={{ flex: 1 }}>{ children }</View>
        </SafeAreaView>
    );
}