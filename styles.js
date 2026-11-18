import { StyleSheet } from "react-native";

export default StyleSheet.create({
    appHeader: {
        alignItems: "center",
        backgroundColor: "#D32F2F",
        flexDirection: "row",
        gap: 10,
        height: 64,
        justifyContent: "center",
    },
    appLogo: {
        borderRadius: 22,
        height: 44,
        width: 44,
    },
    appTitle: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "bold",
    },
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
    offlineState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
    },
    offlineImage: {
        width: 200,
        height: 200,
    },
    offlineTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    offlineMessage: {
        fontSize: 16,
        textAlign: "center",
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