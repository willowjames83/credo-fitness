"use client";

// One sheet, two modes: confirm a quick-add food (grams pre-filled from the
// food database) or enter protein manually.

import { useState } from "react";
import type { FoodItem } from "@/services/data/food-database";
import {
  BottomSheet,
  ChipGroup,
  FieldLabel,
  NumberField,
  SheetError,
  SubmitButton,
  TextField,
} from "./log-sheet";
import {
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  type MealType,
  type ProteinEntryDTO,
} from "./dto";
import { apiPost, redirectToLogin, UnauthorizedError } from "./utils";

const PURPLE = "#7C3AED";

const MEAL_OPTIONS = MEAL_TYPES.map((value) => ({
  value,
  label: MEAL_TYPE_LABELS[value],
}));

/** Best guess at which meal this is, from the viewer's local clock. */
export function defaultMealType(now: Date = new Date()): MealType {
  const h = now.getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 21) return "dinner";
  return "snack";
}

interface ProteinLogSheetProps {
  /** Quick-add food being confirmed; omit for manual entry. */
  food?: FoodItem | null;
  onClose: () => void;
  onLogged: (entry: ProteinEntryDTO) => void;
}

export function ProteinLogSheet({
  food,
  onClose,
  onLogged,
}: ProteinLogSheetProps) {
  const [grams, setGrams] = useState(
    food ? String(Math.round(food.proteinG)) : "",
  );
  const [label, setLabel] = useState("");
  const [mealType, setMealType] = useState<MealType>(defaultMealType());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gramsNum = Number(grams);
  const valid =
    grams !== "" && Number.isFinite(gramsNum) && gramsNum >= 1 && gramsNum <= 300;

  async function submit() {
    if (!valid || pending) return;
    setPending(true);
    setError(null);
    try {
      const data = await apiPost<{ entry: ProteinEntryDTO }>(
        "/api/nutrition/log",
        {
          grams: Math.round(gramsNum),
          mealType,
          ...(food
            ? { foodId: food.id }
            : { label: label.trim() === "" ? null : label.trim() }),
        },
      );
      onLogged(data.entry);
      onClose();
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        redirectToLogin();
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <BottomSheet
      title={food ? food.name : "Log protein"}
      subtitle={
        food
          ? `${food.servingLabel} · ${Math.round(food.proteinG)}g protein · ${food.calories} cal`
          : "Grams of protein. A label makes the day's log easier to scan later."
      }
      color={PURPLE}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="mt-4">
          <FieldLabel htmlFor="protein-grams">Protein</FieldLabel>
          <div className="mt-2">
            <NumberField
              id="protein-grams"
              value={grams}
              onChange={setGrams}
              suffix="g"
              placeholder="30"
              color={PURPLE}
              autoFocus={!food}
              ariaLabel="Protein in grams"
            />
          </div>
        </div>

        {!food && (
          <div className="mt-4">
            <FieldLabel htmlFor="protein-label" optional>
              Label
            </FieldLabel>
            <div className="mt-2">
              <TextField
                id="protein-label"
                value={label}
                onChange={setLabel}
                placeholder="Post-lift shake"
                color={PURPLE}
                ariaLabel="Entry label"
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <FieldLabel>Meal</FieldLabel>
          <div className="mt-2">
            <ChipGroup
              options={MEAL_OPTIONS}
              value={mealType}
              onChange={setMealType}
              color={PURPLE}
              ariaLabel="Meal"
            />
          </div>
        </div>

        {error && <SheetError message={error} />}

        <SubmitButton disabled={!valid} pending={pending} pendingLabel="Adding…">
          {valid ? `Add ${Math.round(gramsNum)}g` : "Add"}
        </SubmitButton>
      </form>
    </BottomSheet>
  );
}
