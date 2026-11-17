import { StyleSheet } from "react-native";

export default StyleSheet.create({
    navBar: {
        justifyContent: "space-evenly",
    },
    bottomBar: {
        justifyContent: "flex-end",
    },
    cardContent: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },
    rowContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    favoriteButton: {
        margin: 0,
    },
    scrollView: {
        gap: 20,
        padding: 16,
    },
    pokemonInfo: {
        flex: 1,
        gap: 8,
    },
    pokemonName: {
        fontWeight: "bold",
        textTransform: "capitalize",
    },
    typeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    pokemonType: {
        textTransform: "capitalize",
    },
    pokemonImage: {
        width: 100,
        height: 100,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: "center",
    },
    emptyState: {
        alignItems: "center",
        gap: 12,
    },
    emptyImage: {
        width: 180,
        height: 180,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: "bold",
    },
    favoriteListTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
})