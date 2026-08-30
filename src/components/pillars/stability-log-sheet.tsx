"use client";

// Log a stability session: warmup, mobility, balance, or core work.

import { useState } from "react";
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
  STABILITY_TYPES,
  STABILITY_TYPE_LABELS,
  type StabilitySessionDTO,
  type StabilityType,
} from "./dto";
import { apiPost, redirectToLogin, UnauthorizedError } from "./utils";

const TEAL = "var(--color-teal)";

const TYPE_OPTIONS = STABILITY_TYPES.map((value) => ({
  value,
  label: STABILITY_TYPE_LABELS[value],
}));

interface StabilityLogSheetProps {
  initialType?: StabilityType;
  onClose: () => void;
  onLogged: (session: StabilitySessionDTO) => void;
}

export function StabilityLogSheet({
  initialType = "mobility",
  onClose,
  onLogged,
}: StabilityLogSheetProps) {
  const [type, setType] = useState<StabilityType>(initialType);
  const [minutes, setMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minutesNum = Number(minutes);
  const valid =
    minutes !== "" &&
    Number.isFinite(minutesNum) &&
    minutesNum >= 1 &&
    minutesNum <= 180;

  async function submit() {
    if (!valid || pending) return;
    setPending(true);
    setError(null);
    try {
      const data = await apiPost<{ session: StabilitySessionDTO }>(
        "/api/stability/sessions",
        {
          type,
          minutes: Math.round(minutesNum),
          notes: notes.trim() === "" ? null : notes.trim(),
        },
      );
      onLogged(data.session);
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
      title="Log stability work"
      subtitle="Warmups, mobility flows, balance drills, and dedicated core work all count."
      color={TEAL}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="mt-4">
          <FieldLabel>Session type</FieldLabel>
          <div className="mt-2">
            <ChipGroup
              options={TYPE_OPTIONS}
              value={type}
              onChange={setType}
              color={TEAL}
              ariaLabel="Session type"
            />
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel htmlFor="stability-minutes">Duration</FieldLabel>
          <div className="mt-2">
            <NumberField
              id="stability-minutes"
              value={minutes}
              onChange={setMinutes}
              suffix="min"
              placeholder="15"
              color={TEAL}
              autoFocus
              ariaLabel="Duration in minutes"
            />
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel htmlFor="stability-notes" optional>
            Notes
          </FieldLabel>
          <div className="mt-2">
            <TextField
              id="stability-notes"
              value={notes}
              onChange={setNotes}
              placeholder="Hips felt tight on the left"
              color={TEAL}
              ariaLabel="Session notes"
            />
          </div>
        </div>

        {error && <SheetError message={error} />}

        <SubmitButton disabled={!valid} pending={pending} pendingLabel="Logging…">
          Log session
        </SubmitButton>
      </form>
    </BottomSheet>
  );
}
