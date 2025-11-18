import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList, HabitFrequency } from "../../types";
import { createHabit } from "../../services/habits";
import { auth } from "../../services/firebase";
import { X } from "phosphor-react-native";

type AddHabitScreenNavigationProp = StackNavigationProp<HomeStackParamList, "AddHabit">;

const DAYS_OF_WEEK = [
  { label: "Dom", value: 0, short: "D" },
  { label: "Lun", value: 1, short: "L" },
  { label: "Mar", value: 2, short: "M" },
  { label: "Mié", value: 3, short: "X" },
  { label: "Jue", value: 4, short: "J" },
  { label: "Vie", value: 5, short: "V" },
  { label: "Sáb", value: 6, short: "S" },
];

const AddHabitScreen: React.FC = () => {
  const navigation = useNavigation<AddHabitScreenNavigationProp>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [quantity, setQuantity] = useState("1");
  const [measure, setMeasure] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleDay = (dayValue: number) => {
    setCustomDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue].sort(),
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Por favor ingresa un nombre para el hábito");
      return;
    }

    if (frequency === "custom" && customDays.length === 0) {
      Alert.alert("Error", "Por favor selecciona al menos un día para hábitos personalizados");
      return;
    }

    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum < 1) {
      Alert.alert("Error", "La cantidad debe ser un número mayor a 0");
      return;
    }

    setLoading(true);

    try {
      const habitData = {
        userId: auth.currentUser?.uid || "",
        name: name.trim(),
        description: description.trim() || undefined,
        frequency,
        quantity: quantityNum,
        measure: measure.trim() || "vez",
        streak: 0,
        longestStreak: 0,
        isActive: true,
        customDays: frequency === "custom" ? customDays : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await createHabit(habitData);

      // El backend puede devolver { success: true, data: {...} } o directamente el hábito
      if (response.success === false || (response.error && !response.data)) {
        throw new Error(response.message || response.error || "Error al crear el hábito");
      }

      Alert.alert("Éxito", "Hábito creado correctamente", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo crear el hábito");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <X size={24} color="#1a233a" weight="bold" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nuevo Hábito</Text>
            <View style={styles.closeButton} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del hábito *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Hacer ejercicio, Leer, Meditar"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu hábito..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {/* Frequency */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frecuencia *</Text>
              <View style={styles.frequencyContainer}>
                <TouchableOpacity
                  style={[styles.frequencyButton, frequency === "daily" && styles.frequencyActive]}
                  onPress={() => {
                    setFrequency("daily");
                    setCustomDays([]);
                  }}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === "daily" && styles.frequencyTextActive,
                    ]}
                  >
                    Diario
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.frequencyButton, frequency === "weekly" && styles.frequencyActive]}
                  onPress={() => {
                    setFrequency("weekly");
                    setCustomDays([]);
                  }}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === "weekly" && styles.frequencyTextActive,
                    ]}
                  >
                    Semanal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.frequencyButton,
                    frequency === "monthly" && styles.frequencyActive,
                  ]}
                  onPress={() => {
                    setFrequency("monthly");
                    setCustomDays([]);
                  }}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === "monthly" && styles.frequencyTextActive,
                    ]}
                  >
                    Mensual
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.frequencyButton, frequency === "custom" && styles.frequencyActive]}
                  onPress={() => setFrequency("custom")}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === "custom" && styles.frequencyTextActive,
                    ]}
                  >
                    Personalizado
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Custom Days */}
            {frequency === "custom" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Selecciona los días *</Text>
                <View style={styles.daysContainer}>
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = customDays.includes(day.value);
                    return (
                      <TouchableOpacity
                        key={day.value}
                        style={[styles.dayButton, isSelected && styles.dayButtonActive]}
                        onPress={() => toggleDay(day.value)}
                      >
                        <Text
                          style={[styles.dayButtonText, isSelected && styles.dayButtonTextActive]}
                        >
                          {day.short}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {customDays.length > 0 && (
                  <Text style={styles.selectedDaysText}>
                    Días seleccionados: {customDays.map((d) => DAYS_OF_WEEK[d].label).join(", ")}
                  </Text>
                )}
              </View>
            )}

            {/* Quantity and Measure */}
            <View style={styles.quantityRow}>
              <View style={[styles.inputGroup, styles.quantityInput]}>
                <Text style={styles.label}>Cantidad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor="#999"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, styles.measureInput]}>
                <Text style={styles.label}>Medida</Text>
                <TextInput
                  style={styles.input}
                  placeholder="vez, página, km..."
                  placeholderTextColor="#999"
                  value={measure}
                  onChangeText={setMeasure}
                  maxLength={20}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>{loading ? "Guardando..." : "Crear Hábito"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a233a",
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a233a",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#1a233a",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  frequencyContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  frequencyButton: {
    minWidth: "47%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  frequencyActive: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  frequencyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  frequencyTextActive: {
    color: "#fff",
  },
  daysContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonActive: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  dayButtonTextActive: {
    color: "#fff",
  },
  selectedDaysText: {
    marginTop: 12,
    fontSize: 14,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  quantityRow: {
    flexDirection: "row",
    gap: 12,
  },
  quantityInput: {
    flex: 1,
    marginBottom: 0,
  },
  measureInput: {
    flex: 2,
    marginBottom: 0,
  },
  saveButton: {
    backgroundColor: "#F44336",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AddHabitScreen;
