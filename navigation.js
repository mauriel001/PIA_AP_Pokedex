import { useState } from 'react';
import { View, Pressable, Text, ScrollView } from 'react-native';
import { Appbar, Modal, Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from "./styles";

const GENERACIONES = [
    { id: 1, nombre: "Generación I", region: "Kanto" },
    { id: 2, nombre: "Generación II", region: "Johto" },
    { id: 3, nombre: "Generación III", region: "Hoenn" },
    { id: 4, nombre: "Generación IV", region: "Sinnoh" },
    { id: 5, nombre: "Generación V", region: "Teselia" },
    { id: 6, nombre: "Generación VI", region: "Kalos" },
    { id: 7, nombre: "Generación VII", region: "Alola" },
    { id: 8, nombre: "Generación VIII", region: "Galar" },
    { id: 9, nombre: "Generación IX", region: "Paldea" },
];

const TIPOS = [
    { api: "normal", nombre: "Normal" },
    { api: "fighting", nombre: "Lucha" },
    { api: "flying", nombre: "Volador" },
    { api: "poison", nombre: "Veneno" },
    { api: "ground", nombre: "Tierra" },
    { api: "rock", nombre: "Roca" },
    { api: "bug", nombre: "Bicho" },
    { api: "ghost", nombre: "Fantasma" },
    { api: "steel", nombre: "Acero" },
    { api: "fire", nombre: "Fuego" },
    { api: "water", nombre: "Agua" },
    { api: "grass", nombre: "Planta" },
    { api: "electric", nombre: "Eléctrico" },
    { api: "psychic", nombre: "Psíquico" },
    { api: "ice", nombre: "Hielo" },
    { api: "dragon", nombre: "Dragón" },
    { api: "dark", nombre: "Siniestro" },
    { api: "fairy", nombre: "Hada" },
];

export default function Navigation({ children, onSelectGeneration, onSelectType, onPokedex }) {
    const [modalActivo, setModalActivo] = useState(null);

    const cerrar = () => setModalActivo(null);

    const elegirGeneracion = (gen) => {
        cerrar();
        if (onSelectGeneration) onSelectGeneration(gen.id);
    };

    const elegirTipo = (tipo) => {
        cerrar();
        if (onSelectType) onSelectType(tipo.api);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Appbar style={styles.navBar}>
                <Pressable onPress={onPokedex}>
                    <Text>Pokedex</Text>
                </Pressable>
                <Pressable onPress={() => setModalActivo("generacion")}>
                    <Text>Generación</Text>
                </Pressable>
                <Pressable onPress={() => setModalActivo("tipo")}>
                    <Text>Tipo</Text>
                </Pressable>
            </Appbar>

            <View style={{ flex: 1 }}>{children}</View>

            {}
            <Modal
                visible={modalActivo === "generacion"}
                onDismiss={cerrar}
                contentContainerStyle={{ marginHorizontal: 24 }}
            >
                <Card>
                    <Card.Title title="Elige una generación" />
                    <Card.Content>
                        <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ gap: 8 }}>
                            {GENERACIONES.map((gen) => (
                                <Button
                                    key={gen.id}
                                    mode="outlined"
                                    onPress={() => elegirGeneracion(gen)}
                                >
                                    {gen.nombre} · {gen.region}
                                </Button>
                            ))}
                        </ScrollView>
                    </Card.Content>
                    <Card.Actions>
                        <Button onPress={cerrar}>Cancelar</Button>
                    </Card.Actions>
                </Card>
            </Modal>

            {}
            <Modal
                visible={modalActivo === "tipo"}
                onDismiss={cerrar}
                contentContainerStyle={{ marginHorizontal: 24 }}
            >
                <Card>
                    <Card.Title title="Elige un tipo" />
                    <Card.Content>
                        <ScrollView style={{ maxHeight: 400 }}>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                                {TIPOS.map((tipo) => (
                                    <Button
                                        key={tipo.api}
                                        mode="outlined"
                                        style={{ width: "48%" }}
                                        onPress={() => elegirTipo(tipo)}
                                    >
                                        {tipo.nombre}
                                    </Button>
                                ))}
                            </View>
                        </ScrollView>
                    </Card.Content>
                    <Card.Actions>
                        <Button onPress={cerrar}>Cancelar</Button>
                    </Card.Actions>
                </Card>
            </Modal>
        </SafeAreaView>
    );
}