"use client";

// Log a cardio session. Durations are plain minutes — no m:ss anywhere.

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
  CARDIO_TYPES,
  CARDIO_TYPE_LABELS,
  type CardioSessionDTO,
  type CardioType,
} from "./dto";
import { apiPost, redirectToLogin, UnauthorizedError } from "./utils";

const COLOR = "#2563EB";

const TYPE_OPTIONS = CARDIO_TYPES.map((value) => ({
  value,
  label: CARDIO_TYPE_LABELS[value],
}));

interface CardioLogSheetProps {
  /** Pre-selected session type, e.g. "vo2max" from the 4x4 protocol card. */
  initialType?: CardioType;
  onClose: () => void;
  onLogged: (session: CardioSessionDTO) => void;
}

export function CardioLogSheet({
  initialType = "zone2",
  onClose,
  onLogged,
}: CardioLogSheetProps) {
  const [type, setType] = useState<CardioType>(initialType);
  const [minutes, setMinutes] = useState("");
  const [avgHr, setAvgHr] = useState("");
  const [maxHr, setMaxHr] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minutesNum = Number(minutes);
  const valid =
    minutes !== "" &&
    Number.isFinite(minutesNum) &&
    minutesNum >= 1 &&
    minutesNum <= 600;

  const distanceNum = Number(distanceKm);
  const distanceM =
    distanceKm !== "" && Number.isFinite(distanceNum) && distanceNum > 0
      ? Math.round(distanceNum * 1000)
      : null;

  function optionalInt(raw: string): number | null {
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  }

  async function submit() {
    if (!valid || pending) return;
    setPending(true);
    setError(null);
    try {
      const data = await apiPost<{ session: CardioSessionDTO }>(
        "/api/cardio/sessions",
        {
          type,
          minutes: Math.round(minutesNum),
          avgHr: optionalInt(avgHr),
          maxHr: optionalInt(maxHr),
          distanceM,
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
      title="Log cardio session"
      subtitle="Zone 2 is conversational effort; VO2 max and intervals are the hard days."
      color={COLOR}
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
              color={COLOR}
              ariaLabel="Session type"
            />
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel htmlFor="cardio-minutes">Duration</FieldLabel>
          <div className="mt-2">
            <NumberField
              id="cardio-minutes"
              value={minutes}
              onChange={setMinutes}
              suffix="min"
              placeholder="45"
              color={COLOR}
              autoFocus
              ariaLabel="Duration in minutes"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <FieldLabel htmlFor="cardio-avg-hr" optional>
              Avg HR
            </FieldLabel>
            <div className="mt-2">
              <NumberField
                id="cardio-avg-hr"
                value={avgHr}
                onChange={setAvgHr}
                suffix="bpm"
                placeholder="138"
                color={COLOR}
                ariaLabel="Average heart rate"
              />
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="cardio-max-hr" optional>
              Max HR
            </FieldLabel>
            <div className="mt-2">
              <NumberField
                id="cardio-max-hr"
                value={maxHr}
                onChange={setMaxHr}
                suffix="bpm"
                placeholder="172"
                color={COLOR}
                ariaLabel="Maximum heart rate"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel htmlFor="cardio-distance" optional>
            Distance
          </FieldLabel>
          <div className="mt-2">
            <NumberField
              id="cardio-distance"
              value={distanceKm}
              onChange={setDistanceKm}
              suffix="km"
              placeholder="8.0"
              color={COLOR}
              allowDecimal
              ariaLabel="Distance in kilometres"
            />
          </div>
        </div>

        <div className="mt-4">
          <FieldLabel htmlFor="cardio-notes" optional>
            Notes
          </FieldLabel>
          <div className="mt-2">
            <TextField
              id="cardio-notes"
              value={notes}
              onChange={setNotes}
              placeholder="Treadmill, flat, felt easy"
              color={COLOR}
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
