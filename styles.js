import { StyleSheet } from "react-native";

export const colors = {
  selectedControl: "#546E7A",
  inactiveControl: "#E3EEFA",
  inactiveText: "#1F3A5F",
  sectionTabBackground: "#FFFFFF",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
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
  navigationContainer: {
    flex: 1,
  },
  sectionTabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionTabButton: {
    flex: 1,
  },
  navBar: {
    justifyContent: "space-evenly",
  },
  navigationSearch: {
    margin: 8,
  },
  navigationContent: {
    flex: 1,
  },
  dropdownContainer: {
    backgroundColor: "#F3F6FA",
    borderBottomColor: "#D0D7DE",
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  dropdownHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownTitle: {
    color: "#1F3A5F",
    fontWeight: "bold",
  },
  dropdownList: {
    maxHeight: 220,
  },
  dropdownOptions: {
    gap: 8,
    paddingBottom: 8,
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
  mainContent: {
    flex: 1,
  },
  hiddenContent: {
    display: "none",
  },
  loadingMore: {
    marginVertical: 16,
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
  itemContainer: {
    flex: 1,
  },
  itemPockets: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  itemList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  itemSectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: "#FFFFFF",
  },
  itemCard: {
    backgroundColor: "#F5F0F8",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  itemNumber: {
    opacity: 0.6,
    marginTop: 2,
  },
  itemImage: {
    width: 56,
    height: 56,
  },
  itemCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemEmpty: {
    textAlign: "center",
    marginTop: 24,
  },
});

export default styles;
