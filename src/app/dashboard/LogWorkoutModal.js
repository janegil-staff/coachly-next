// components/LogWorkoutModal.jsx
// Used inside the daily LogEntry flow. Lets the user pick an exercise from
// their library (catalog + custom) and fill any of sets/reps/weight/duration.
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LangContext";
import { fetchExercises } from "../api/exercises";

const CATEGORIES = [
  { key: "all", labelKey: "categoryAll" },
  { key: "strength", labelKey: "categoryStrength" },
  { key: "cardio", labelKey: "categoryCardio" },
  { key: "mobility", labelKey: "categoryMobility" },
  { key: "recovery", labelKey: "categoryRecovery" },
  { key: "other", labelKey: "categoryOther" },
];

export default function LogWorkoutModal({ visible, onClose, onSave }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const styles = getStyles(colors);

  // Stage 1: pick exercise. Stage 2: fill values.
  const [stage, setStage] = useState("pick");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selected, setSelected] = useState(null);

  // Stage 2 fields
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!visible) return;
    setStage("pick");
    setSelected(null);
    setSearch("");
    setActiveCategory("all");
    setSets("");
    setReps("");
    setWeight("");
    setDuration("");
    setNote("");

    setLoading(true);
    fetchExercises()
      .then((res) => setExercises(res.exercises || []))
      .catch(() => setExercises([]))
      .finally(() => setLoading(false));
  }, [visible]);

  const filtered = useMemo(() => {
    let list = exercises;
    if (activeCategory !== "all") {
      list = list.filter((e) => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [exercises, activeCategory, search]);

  const pick = (ex) => {
    setSelected(ex);
    setStage("values");
  };

  const save = () => {
    const numOrNull = (s) => {
      if (!s || !s.trim()) return null;
      const n = Number(s.replace(",", "."));
      return Number.isFinite(n) ? n : null;
    };

    onSave({
      exercise: selected._id,
      exerciseName: selected.name,
      category: selected.category,
      sets: numOrNull(sets),
      reps: numOrNull(reps),
      weight: numOrNull(weight),
      durationMinutes: numOrNull(duration),
      note: note.trim(),
    });
  };

  // Has at least one value been entered?
  const hasAnyValue =
    sets.trim() || reps.trim() || weight.trim() || duration.trim();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {stage === "pick"
                ? (t.pickExercise ?? "Pick an exercise")
                : selected?.name}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {stage === "pick" ? (
            <>
              <TextInput
                style={styles.search}
                placeholder={t.searchExercises ?? "Search…"}
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8, gap: 8 }}
              >
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    onPress={() => setActiveCategory(c.key)}
                    style={[
                      styles.chip,
                      activeCategory === c.key && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        activeCategory === c.key && styles.chipTextActive,
                      ]}
                    >
                      {t[c.labelKey] ?? c.labelKey}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {loading ? (
                <ActivityIndicator color={colors.accent} style={{ marginTop: 30 }} />
              ) : (
                <ScrollView style={{ maxHeight: 360 }}>
                  {filtered.length === 0 ? (
                    <Text style={styles.empty}>
                      {t.noExercisesFound ?? "No exercises found."}
                    </Text>
                  ) : (
                    filtered.map((ex) => (
                      <TouchableOpacity
                        key={ex._id}
                        onPress={() => pick(ex)}
                        style={styles.row}
                      >
                        <Text style={styles.rowName}>{ex.name}</Text>
                        <Text style={styles.rowCat}>
                          {t[`category${capitalize(ex.category)}`] ?? ex.category}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              )}
            </>
          ) : (
            <>
              <Text style={styles.hint}>
                {t.fillWhatApplies ?? "Fill in whatever applies — leave the rest blank."}
              </Text>

              <View style={styles.fieldGrid}>
                <Field
                  label={t.sets ?? "Sets"}
                  value={sets}
                  onChange={setSets}
                  styles={styles}
                  colors={colors}
                />
                <Field
                  label={t.reps ?? "Reps"}
                  value={reps}
                  onChange={setReps}
                  styles={styles}
                  colors={colors}
                />
                <Field
                  label={`${t.weight ?? "Weight"} (kg)`}
                  value={weight}
                  onChange={setWeight}
                  styles={styles}
                  colors={colors}
                />
                <Field
                  label={`${t.duration ?? "Duration"} (min)`}
                  value={duration}
                  onChange={setDuration}
                  styles={styles}
                  colors={colors}
                />
              </View>

              <Text style={styles.fieldLabel}>{t.note ?? "Note"}</Text>
              <TextInput
                style={[styles.fieldInput, { height: 70 }]}
                placeholder={t.optional ?? "Optional"}
                placeholderTextColor={colors.muted}
                value={note}
                onChangeText={setNote}
                multiline
              />

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => setStage("pick")}
                  style={styles.back}
                >
                  <Text style={styles.backText}>← {t.back ?? "Back"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={save}
                  disabled={!hasAnyValue}
                  style={[styles.save, !hasAnyValue && { opacity: 0.4 }]}
                >
                  <Text style={styles.saveText}>{t.save ?? "Save"}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChange, styles, colors }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="—"
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

const getStyles = (colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    card: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 36,
      maxHeight: "90%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    title: { fontSize: 17, fontWeight: "700", color: colors.text, flex: 1 },
    close: { fontSize: 20, color: colors.muted, paddingLeft: 12 },
    search: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      marginRight: 8,
    },
    chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    chipText: { fontSize: 12, fontWeight: "600", color: colors.text },
    chipTextActive: { color: "#fff" },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      borderRadius: 10,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowName: { fontSize: 14, color: colors.text, fontWeight: "500" },
    rowCat: { fontSize: 11, color: colors.muted, fontStyle: "italic" },
    empty: {
      textAlign: "center",
      color: colors.muted,
      fontSize: 13,
      marginTop: 24,
    },
    hint: { fontSize: 12, color: colors.muted, marginBottom: 14 },
    fieldGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    field: { width: "47%", marginBottom: 8 },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.muted,
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    fieldInput: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
    },
    actions: { flexDirection: "row", gap: 10, marginTop: 20 },
    back: {
      flex: 1,
      paddingVertical: 13,
      alignItems: "center",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    backText: { color: colors.text, fontSize: 14, fontWeight: "600" },
    save: {
      flex: 1,
      paddingVertical: 13,
      alignItems: "center",
      borderRadius: 10,
      backgroundColor: colors.accent,
    },
    saveText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  });