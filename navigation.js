import { useState } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { Appbar, Button, IconButton, Searchbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import ListaDespegable from "./ListaDespegable";
import styles, { colors } from "./styles";

const GENERACIONES = [
  { value: 1, label: "Generación I · Kanto", shortName: "Gen. I" },
  { value: 2, label: "Generación II · Johto", shortName: "Gen. II" },
  { value: 3, label: "Generación III · Hoenn", shortName: "Gen. III" },
  { value: 4, label: "Generación IV · Sinnoh", shortName: "Gen. IV" },
  { value: 5, label: "Generación V · Teselia", shortName: "Gen. V" },
  { value: 6, label: "Generación VI · Kalos", shortName: "Gen. VI" },
  { value: 7, label: "Generación VII · Alola", shortName: "Gen. VII" },
  { value: 8, label: "Generación VIII · Galar", shortName: "Gen. VIII" },
  { value: 9, label: "Generación IX · Paldea", shortName: "Gen. IX" },
];

const TIPOS = [
  { value: "normal", label: "Normal" },
  { value: "fighting", label: "Lucha" },
  { value: "flying", label: "Volador" },
  { value: "poison", label: "Veneno" },
  { value: "ground", label: "Tierra" },
  { value: "rock", label: "Roca" },
  { value: "bug", label: "Bicho" },
  { value: "ghost", label: "Fantasma" },
  { value: "steel", label: "Acero" },
  { value: "fire", label: "Fuego" },
  { value: "water", label: "Agua" },
  { value: "grass", label: "Planta" },
  { value: "electric", label: "Eléctrico" },
  { value: "psychic", label: "Psíquico" },
  { value: "ice", label: "Hielo" },
  { value: "dragon", label: "Dragón" },
  { value: "dark", label: "Siniestro" },
  { value: "fairy", label: "Hada" },
];

export default function Navigation({
  activeView,
  children,
  usuario,
  onLogout,
  onOpenFilters,
  onShowPokedex,
  onToggleGeneration,
  onToggleType,
  onToggleFavorites,
  onShowItems,
  onSearch,
  searchQuery = "",
  selectedGeneration = null,
  selectedTypes = [],
  favoritesOnly = false,
  favoritesReady = true,
}) {
  const [listaAbierta, setListaAbierta] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const generation = GENERACIONES.find(
    (item) => item.value === selectedGeneration,
  );

  const alternarLista = (lista) => {
    if (listaAbierta === lista) {
      setListaAbierta(null);
      return;
    }

    onOpenFilters();
    setBuscando(false);
    setListaAbierta(lista);
  };

  const alternarBusqueda = () => {
    if (buscando) onSearch("");
    setBuscando(!buscando);
    setListaAbierta(null);
  };

  const mostrarPokedex = () => {
    setListaAbierta(null);
    setBuscando(false);
    onShowPokedex();
  };

  const mostrarObjetos = () => {
    setListaAbierta(null);
    setBuscando(false);
    onShowItems();
  };

  return (
    <SafeAreaView style={styles.navigationContainer}>
      <View style={styles.appHeader} accessibilityRole="header">
        <Image
          source={require("./assets/app-icon-square.png")}
          style={styles.appLogo}
          contentFit="contain"
          accessibilityLabel="Logo de Poké Ball"
        />
        <Text style={styles.appTitle}>Pokédex</Text>

        {usuario ? (
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Text
              numberOfLines={1}
              style={{ flexShrink: 1, opacity: 0.7, fontSize: 13 }}
            >
              {usuario.nombre}
            </Text>
            <IconButton
              icon="logout"
              size={22}
              onPress={onLogout}
              accessibilityLabel={`Cerrar sesión de ${usuario.nombre}`}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.sectionTabs}>
        <Button
          mode={activeView === "pokedex" ? "contained" : "outlined"}
          buttonColor={
            activeView === "pokedex"
              ? colors.selectedControl
              : colors.sectionTabBackground
          }
          textColor={
            activeView === "pokedex" ? colors.white : colors.inactiveText
          }
          style={styles.sectionTabButton}
          onPress={mostrarPokedex}
        >
          Pokédex
        </Button>
        <Button
          mode={activeView === "items" ? "contained" : "outlined"}
          buttonColor={
            activeView === "items"
              ? colors.selectedControl
              : colors.sectionTabBackground
          }
          textColor={activeView === "items" ? colors.white : colors.inactiveText}
          style={styles.sectionTabButton}
          onPress={mostrarObjetos}
        >
          Objetos
        </Button>
      </View>

      {activeView === "pokedex" ? (
        <>
          <Appbar style={styles.navBar}>
            <Button
              mode={generation ? "contained" : "contained-tonal"}
              buttonColor={
                generation ? colors.selectedControl : colors.inactiveControl
              }
              textColor={generation ? colors.white : colors.inactiveText}
              compact
              onPress={() => alternarLista("generacion")}
            >
              {generation ? generation.shortName : "Generación"}
            </Button>
            <Button
              mode={
                selectedTypes.length > 0 ? "contained" : "contained-tonal"
              }
              buttonColor={
                selectedTypes.length > 0
                  ? colors.selectedControl
                  : colors.inactiveControl
              }
              textColor={
                selectedTypes.length > 0 ? colors.white : colors.inactiveText
              }
              compact
              onPress={() => alternarLista("tipo")}
            >
              {selectedTypes.length > 0
                ? `Tipo (${selectedTypes.length})`
                : "Tipo"}
            </Button>
            <Button
              mode={favoritesOnly ? "contained" : "contained-tonal"}
              buttonColor={
                favoritesOnly ? colors.selectedControl : colors.inactiveControl
              }
              textColor={favoritesOnly ? colors.white : colors.inactiveText}
              icon={favoritesOnly ? "star" : "star-outline"}
              compact
              disabled={!favoritesReady}
              onPress={() => {
                setListaAbierta(null);
                setBuscando(false);
                onToggleFavorites();
              }}
            >
              Favoritos
            </Button>
            <Appbar.Action
              icon={buscando ? "close" : "magnify"}
              onPress={alternarBusqueda}
              accessibilityLabel={
                buscando ? "Cerrar búsqueda" : "Buscar pokémon"
              }
            />
          </Appbar>

          {listaAbierta === "generacion" ? (
            <ListaDespegable
              title="Elige una generación"
              options={GENERACIONES}
              selectedValues={generation ? [generation.value] : []}
              onToggle={onToggleGeneration}
              onClose={() => setListaAbierta(null)}
              closeOnSelect
            />
          ) : null}

          {listaAbierta === "tipo" ? (
            <ListaDespegable
              title="Elige uno o más tipos"
              options={TIPOS}
              selectedValues={selectedTypes}
              onToggle={onToggleType}
              onClose={() => setListaAbierta(null)}
            />
          ) : null}

          {buscando ? (
            <Searchbar
              placeholder="Nombre o número"
              value={searchQuery}
              onChangeText={onSearch}
              autoFocus
              style={styles.navigationSearch}
            />
          ) : null}
        </>
      ) : null}

      <View style={styles.navigationContent}>{children}</View>
    </SafeAreaView>
  );
}