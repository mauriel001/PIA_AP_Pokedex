import { ScrollView, Text, View } from "react-native";
import { Button } from "react-native-paper";
import styles, { colors } from "./styles";

export default function ListaDespegable({
  title,
  options,
  selectedValues,
  onToggle,
  onClose,
  closeOnSelect = false,
}) {
  return (
    <View style={styles.dropdownContainer}>
      <View style={styles.dropdownHeader}>
        <Text style={styles.dropdownTitle}>{title}</Text>
        <Button compact onPress={onClose}>
          Cerrar
        </Button>
      </View>
      <ScrollView
        style={styles.dropdownList}
        contentContainerStyle={styles.dropdownOptions}
      >
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <Button
              key={option.value}
              mode={isSelected ? "contained" : "outlined"}
              buttonColor={
                isSelected ? colors.selectedControl : colors.white
              }
              textColor={isSelected ? colors.white : colors.inactiveText}
              compact
              onPress={() => {
                onToggle(option.value);
                if (closeOnSelect) onClose();
              }}
            >
              {option.label}
            </Button>
          );
        })}
      </ScrollView>
    </View>
  );
}
