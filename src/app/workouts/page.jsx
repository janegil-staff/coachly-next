"use client";

// app/workouts/page.jsx (or wherever your workouts route lives)
// Renders the catalog (hardcoded, translated) merged with user-custom exercises.

import { useEffect, useMemo, useState } from "react";
import { getTranslations } from "@/lib/translations";
import { getTranslatedCatalog } from "@/lib/exerciseCatalog";
import {
  fetchCustomExercises,
  createCustomExercise,
  deleteCustomExercise,
} from "@/lib/api/exercises";

const A = "#268E86";
const TX = "#1a3a38";
const MU = "#7a9a98";
const BORDER = "rgba(38,142,134,0.14)";

const CATEGORIES = [
  { key: "all", labelKey: "categoryAll" },
  { key: "strength", labelKey: "categoryStrength" },
  { key: "cardio", labelKey: "categoryCardio" },
  { key: "mobility", labelKey: "categoryMobility" },
  { key: "recovery", labelKey: "categoryRecovery" },
  { key: "other", labelKey: "categoryOther" },
];

export default function WorkoutsPage({ lang = "en" }) {
  const t = useMemo(() => getTranslations(lang), [lang]);

  const [customExercises, setCustomExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  // Hardcoded catalog with names translated for current language
  const catalog = useMemo(() => getTranslatedCatalog(t), [t]);

  useEffect(() => {
    fetchCustomExercises()
      .then((res) => setCustomExercises(res.exercises || []))
      .catch(() => setCustomExercises([]))
      .finally(() => setLoading(false));
  }, []);

  // Merge catalog + custom; custom items get isCustom=true
  const allExercises = useMemo(
    () => [
      ...catalog,
      ...customExercises.map((e) => ({ ...e, isCustom: true })),
    ],
    [catalog, customExercises],
  );

  const filtered = useMemo(() => {
    let list = allExercises;
    if (activeCategory !== "all") {
      list = list.filter((e) => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [allExercises, activeCategory, search]);

  // Group by category when "all" is active
  const grouped = useMemo(() => {
    if (activeCategory !== "all") return null;
    const map = {};
    for (const e of filtered) (map[e.category] ||= []).push(e);
    return CATEGORIES.filter((c) => c.key !== "all" && map[c.key]?.length).map(
      (c) => ({ ...c, items: map[c.key] }),
    );
  }, [filtered, activeCategory]);

  const handleAdd = async (name, category) => {
    try {
      const res = await createCustomExercise({ name, category });
      setCustomExercises((prev) => [...prev, res.exercise]);
      setShowAdd(false);
    } catch (err) {
      alert(err?.response?.data?.error ?? t.exerciseCreateFailed ?? "Failed.");
    }
  };

  const handleDelete = async (item) => {
    if (!item.isCustom) return; // catalog items can't be deleted
    if (!confirm(`${t.deleteExerciseConfirm ?? "Remove"} "${item.name}"?`))
      return;
    try {
      await deleteCustomExercise(item._id);
      setCustomExercises((prev) => prev.filter((e) => e._id !== item._id));
    } catch {
      alert(t.exerciseDeleteFailed ?? "Failed.");
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h1
        style={{ fontSize: 22, fontWeight: 700, color: TX, marginBottom: 16 }}
      >
        {t.workouts ?? "Workouts"}
      </h1>

      {/* Search */}
      <input
        type="text"
        placeholder={t.searchExercises ?? "Search exercises…"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: 14,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          marginBottom: 12,
          color: TX,
          outline: "none",
        }}
      />

      {/* Category chips */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 12,
          marginBottom: 8,
        }}
      >
        {CATEGORIES.map((c) => {
          const active = activeCategory === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: `1px solid ${active ? A : BORDER}`,
                background: active ? A : "#fff",
                color: active ? "#fff" : TX,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t[c.labelKey] ?? c.labelKey}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: MU, textAlign: "center", padding: 32 }}>
          {t.loading ?? "Loading…"}
        </p>
      ) : grouped ? (
        grouped.map((group) => (
          <div key={group.key} style={{ marginBottom: 16 }}>
            <h2
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                color: A,
                marginBottom: 6,
              }}
            >
              {t[group.labelKey] ?? group.labelKey}
            </h2>
            {group.items.map((ex) => (
              <ExerciseRow key={ex._id} ex={ex} t={t} onDelete={handleDelete} />
            ))}
          </div>
        ))
      ) : filtered.length === 0 ? (
        <p style={{ color: MU, textAlign: "center", padding: 32 }}>
          {t.noExercisesFound ?? "No exercises found."}
        </p>
      ) : (
        filtered.map((ex) => (
          <ExerciseRow key={ex._id} ex={ex} t={t} onDelete={handleDelete} />
        ))
      )}

      {/* Add button */}
      <button
        onClick={() => setShowAdd(true)}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "13px",
          background: A,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        + {t.addCustom ?? "Add custom"}
      </button>

      {showAdd && (
        <AddModal t={t} onClose={() => setShowAdd(false)} onSave={handleAdd} />
      )}
    </div>
  );
}

function ExerciseRow({ ex, t, onDelete }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        marginBottom: 6,
        background: "#fff",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: TX }}>
          {ex.name}
        </div>
        {ex.isCustom && (
          <div
            style={{
              fontSize: 10,
              color: MU,
              fontStyle: "italic",
              marginTop: 2,
            }}
          >
            {t.customLabel ?? "Custom"}
          </div>
        )}
      </div>
      {ex.isCustom && (
        <button
          onClick={() => onDelete(ex)}
          style={{
            background: "none",
            border: "none",
            color: MU,
            fontSize: 16,
            cursor: "pointer",
            padding: "0 6px",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function AddModal({ t, onClose, onSave }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("strength");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 16, color: TX, fontSize: 17 }}>
          {t.addCustomExercise ?? "Add custom exercise"}
        </h3>

        <label
          style={{
            display: "block",
            fontSize: 11,
            color: MU,
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 6,
            letterSpacing: 0.4,
          }}
        >
          {t.name ?? "Name"}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.exerciseNamePlaceholder ?? "e.g. Cable fly"}
          autoFocus
          style={{
            width: "100%",
            padding: "10px 14px",
            fontSize: 14,
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            color: TX,
            outline: "none",
            marginBottom: 14,
          }}
        />

        <label
          style={{
            display: "block",
            fontSize: 11,
            color: MU,
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: 6,
            letterSpacing: 0.4,
          }}
        >
          {t.category ?? "Category"}
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            marginBottom: 20,
          }}
        >
          {CATEGORIES.filter((c) => c.key !== "all").map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: `1px solid ${active ? A : BORDER}`,
                  background: active ? A : "#fff",
                  color: active ? "#fff" : TX,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t[c.labelKey] ?? c.labelKey}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              background: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              color: TX,
            }}
          >
            {t.cancel ?? "Cancel"}
          </button>
          <button
            onClick={() => name.trim() && onSave(name.trim(), category)}
            disabled={!name.trim()}
            style={{
              flex: 1,
              padding: "12px",
              background: A,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: name.trim() ? "pointer" : "not-allowed",
              opacity: name.trim() ? 1 : 0.4,
            }}
          >
            {t.save ?? "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
