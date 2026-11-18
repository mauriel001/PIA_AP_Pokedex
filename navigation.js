import { useState } from "react";
import { Text, View, ScrollView } from "react-native";
import { Image } from "expo-image";
import {
    Appbar,
    Modal,
    Card,
    Button,
    Searchbar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
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

export default function Navigation({
    children,
    onSelectGeneration,
    onSelectType,
    onPokedex,
    onShowFavorites,
    onShowItems,
    onSearch,
    searchQuery = "",
    selectedTypes = [],
}) {
    const [modalActivo, setModalActivo] = useState(null);
    const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
    const [buscando, setBuscando] = useState(false);

    const cerrar = () => setModalActivo(null);

    const abrirTipos = () => {
        setTiposSeleccionados(selectedTypes);
        setModalActivo("tipo");
    };

    const alternarBusqueda = () => {
        if (buscando) onSearch?.(""); // al cerrar, se limpia la búsqueda
        setBuscando(!buscando);
    };

    const elegirGeneracion = (gen) => {
        cerrar();
        if (onSelectGeneration) onSelectGeneration(gen.id);
    };

    const elegirTipos = () => {
        cerrar();
        if (onSelectType) onSelectType(tiposSeleccionados);
    };

    const alternarTipo = (tipo) => {
        setTiposSeleccionados((seleccionados) =>
            seleccionados.includes(tipo)
                ? seleccionados.filter((seleccionado) => seleccionado !== tipo)
                : [...seleccionados, tipo],
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.appHeader} accessibilityRole="header">
                <Image
                    source={require("./assets/app-icon-square.png")}
                    style={styles.appLogo}
                    contentFit="contain"
                    accessibilityLabel="Logo de Poké Ball"
                />
                <Text style={styles.appTitle}>Pokédex</Text>
            </View>

            <Appbar style={styles.navBar}>
                <Button
                    mode="contained-tonal"
                    buttonColor="#E3EEFA"
                    textColor="#1F3A5F"
                    compact
                    onPress={onPokedex}
                >
                    Pokedex
                </Button>
                <Button
                    mode="contained-tonal"
                    buttonColor="#E3EEFA"
                    textColor="#1F3A5F"
                    compact
                    onPress={() => setModalActivo("generacion")}
                >
                    Generación
                </Button>
                <Button
                    mode="contained-tonal"
                    buttonColor="#E3EEFA"
                    textColor="#1F3A5F"
                    compact
                    onPress={abrirTipos}
                >
                    Tipo
                </Button>
                <Appbar.Action
                    icon={buscando ? "close" : "magnify"}
                    onPress={alternarBusqueda}
                    accessibilityLabel={
                        buscando ? "Cerrar búsqueda" : "Buscar pokémon"
                    }
                />
            </Appbar>

            {buscando ? (
                <Searchbar
                    placeholder="Nombre o número"
                    value={searchQuery}
                    onChangeText={(texto) => onSearch?.(texto)}
                    autoFocus
                    style={{ margin: 8 }}
                />
            ) : null}

            <View style={{ flex: 1 }}>{children}</View>

            <Appbar style={styles.bottomBar}>
                <Appbar.Action
                    icon="cog-outline"
                    accessibilityLabel="Opciones"
                    onPress={() => setModalActivo("opciones")}
                />
            </Appbar>

            <Modal
                visible={modalActivo === "opciones"}
                onDismiss={cerrar}
                contentContainerStyle={{ marginHorizontal: 24 }}
            >
                <Card>
                    <Card.Title title="Opciones" />
                    <Card.Content style={{ gap: 8 }}>
                        <Button
                            mode="outlined"
                            icon="star-outline"
                            onPress={() => {
                                cerrar();
                                onShowFavorites?.();
                            }}
                        >
                            Favoritos
                        </Button>
                        <Button
                            mode="outlined"
                            icon="bag-personal-outline"
                            onPress={() => {
                                cerrar();
                                onShowItems?.();
                            }}
                        >
                            Objetos
                        </Button>
                    </Card.Content>
                    <Card.Actions>
                        <Button onPress={cerrar}>Cerrar</Button>
                    </Card.Actions>
                </Card>
            </Modal>

            <Modal
                visible={modalActivo === "generacion"}
                onDismiss={cerrar}
                contentContainerStyle={{ marginHorizontal: 24 }}
            >
                <Card>
                    <Card.Title title="Elige una generación" />
                    <Card.Content>
                        <ScrollView
                            style={{ maxHeight: 400 }}
                            contentContainerStyle={{ gap: 8 }}
                        >
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

            <Modal
                visible={modalActivo === "tipo"}
                onDismiss={cerrar}
                contentContainerStyle={{ marginHorizontal: 24 }}
            >
                <Card>
                    <Card.Title
                        title="Elige uno o más tipos"
                        subtitle={`${tiposSeleccionados.length} seleccionados`}
                    />
                    <Card.Content>
                        <ScrollView style={{ maxHeight: 400 }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: 8,
                                }}
                            >
                                {TIPOS.map((tipo) => (
                                    <Button
                                        key={tipo.api}
                                        mode={
                                            tiposSeleccionados.includes(tipo.api)
                                                ? "contained"
                                                : "outlined"
                                        }
                                        style={{ width: "48%" }}
                                        onPress={() => alternarTipo(tipo.api)}
                                    >
                                        {tipo.nombre}
                                    </Button>
                                ))}
                            </View>
                        </ScrollView>
                    </Card.Content>
                    <Card.Actions>
                        <Button onPress={cerrar}>Cancelar</Button>
                        <Button onPress={elegirTipos}>Aplicar</Button>
                    </Card.Actions>
                </Card>
            </Modal>
        </SafeAreaView>
    );
}