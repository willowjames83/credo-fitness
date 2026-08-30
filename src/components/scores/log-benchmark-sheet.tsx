"use client";

// Bottom-sheet modal for logging a Credo Ten benchmark result.
// Mount inside an <AnimatePresence> so exit animations run.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { BenchmarkDTO } from "@/lib/types";
import { formatMmss, ordinal, postJson, UnauthorizedError } from "./utils";

export interface LoggedBenchmarkResult {
  name: string;
  value: number;
  percentile: number | null;
  testedAt: string;
}

interface LogBenchmarkSheetProps {
  benchmark: BenchmarkDTO;
  color: string;
  onClose: () => void;
  /** Called with the API result so the parent can optimistically update the card. */
  onLogged: (result: LoggedBenchmarkResult) => void;
}

export function LogBenchmarkSheet({
  benchmark,
  color,
  onClose,
  onLogged,
}: LogBenchmarkSheetProps) {
  // The 1000m Row is the only inversed, seconds-based test: dual m:ss input.
  const isRowTime = benchmark.isInversed && benchmark.unit === "sec";

  const [valueStr, setValueStr] = useState("");
  const [minStr, setMinStr] = useState("");
  const [secStr, setSecStr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logged, setLogged] = useState<LoggedBenchmarkResult | null>(null);

  // Percentile before this log, captured once — the parent updates the
  // benchmark prop optimistically, so read it before that happens.
  const previousPercentile = useRef<number | null>(
    benchmark.latest?.percentile ?? null,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const minutes = Number(minStr === "" ? 0 : minStr);
  const seconds = Number(secStr === "" ? 0 : secStr);
  const parsedValue = isRowTime
    ? minStr === "" && secStr === ""
      ? NaN
      : minutes * 60 + seconds
    : Number(valueStr === "" ? NaN : valueStr);
  const secondsOutOfRange =
    isRowTime && (!Number.isInteger(seconds) || seconds < 0 || seconds > 59);
  const valid =
    Number.isFinite(parsedValue) && parsedValue > 0 && !secondsOutOfRange;

  async function submit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await postJson<{ result: LoggedBenchmarkResult }>(
        "/api/benchmarks/log",
        { name: benchmark.name, value: parsedValue },
      );
      onLogged(data.result);
      setLogged(data.result);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        window.location.href = "/login";
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const prev = previousPercentile.current;
  const improvement =
    logged && logged.percentile !== null && prev !== null
      ? Math.round(logged.percentile - prev)
      : null;

  const unitAffordance =
    benchmark.unit === "lbs" ? "lb" : benchmark.unit;

  const inputClass =
    "w-full rounded-[10px] border border-[#E5E5E8] bg-white px-3 py-2.5 font-mono text-[18px] font-semibold text-[#1A1A1E] outline-none focus:border-[#E8501A]";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        className="relative w-full max-w-[640px] rounded-t-[20px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Log ${benchmark.name} result`}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[#E5E5E8]" />

        {logged ? (
          /* ── Success state ─────────────────────────────── */
          <div className="pb-1 pt-2 text-center">
            <div className="text-[13px] font-semibold uppercase tracking-widest text-[#9E9EA3]">
              Result logged
            </div>
            <div className="mt-3 font-mono text-[40px] font-bold leading-none text-[#1A1A1E]">
              {isRowTime ? formatMmss(logged.value) : logged.value}
              {!isRowTime && (
                <span className="ml-1.5 text-[15px] font-normal text-[#6B6B73]">
                  {unitAffordance}
                </span>
              )}
            </div>
            <div className="mt-2 text-[14px] font-medium text-[#1A1A1E]">
              {benchmark.name}
            </div>
            {logged.percentile !== null && (
              <div className="mt-1 text-[13px] text-[#6B6B73]">
                {ordinal(logged.percentile)} percentile
              </div>
            )}
            {improvement !== null && improvement > 0 && (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 300, delay: 0.1 }}
                className="mt-3 inline-block rounded-full bg-[#E8F5ED] px-3.5 py-1.5 text-[13px] font-semibold text-[#2D8A4E]"
              >
                Up {improvement} percentile point{improvement === 1 ? "" : "s"}
              </motion.div>
            )}
            {improvement === null && logged.percentile !== null && prev === null && (
              <div className="mt-3 inline-block rounded-full bg-[#F7F7F8] px-3.5 py-1.5 text-[13px] font-medium text-[#6B6B73]">
                First result on record
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-[12px] bg-[#E8501A] py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#D3480F]"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Entry form ────────────────────────────────── */
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-[16px] font-semibold text-[#1A1A1E]">
                    {benchmark.name}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B6B73]">
                  {benchmark.description}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1.5 text-[#9E9EA3] transition-colors hover:bg-[#F7F7F8] hover:text-[#1A1A1E]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 rounded-[10px] bg-[#F7F7F8] p-3">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#9E9EA3]">
                How to test
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6B6B73]">
                {benchmark.instructions}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <label className="mt-4 block text-[11px] font-semibold uppercase tracking-widest text-[#9E9EA3]">
                Your result
              </label>
              {isRowTime ? (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoFocus
                      placeholder="3"
                      value={minStr}
                      onChange={(e) => setMinStr(e.target.value.replace(/[^0-9]/g, ""))}
                      className={inputClass}
                      aria-label="Minutes"
                    />
                    <div className="mt-1 text-center text-[11px] text-[#9E9EA3]">min</div>
                  </div>
                  <span className="pb-5 font-mono text-[20px] font-bold text-[#1A1A1E]">
                    :
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="18"
                      value={secStr}
                      onChange={(e) => setSecStr(e.target.value.replace(/[^0-9]/g, ""))}
                      className={inputClass}
                      aria-label="Seconds"
                    />
                    <div className="mt-1 text-center text-[11px] text-[#9E9EA3]">sec</div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 rounded-[10px] border border-[#E5E5E8] bg-white px-3 focus-within:border-[#E8501A]">
                  <input
                    type="text"
                    inputMode="decimal"
                    autoFocus
                    placeholder="0"
                    value={valueStr}
                    onChange={(e) => setValueStr(e.target.value.replace(/[^0-9.]/g, ""))}
                    className="w-full bg-transparent py-2.5 font-mono text-[18px] font-semibold text-[#1A1A1E] outline-none"
                    aria-label={`${benchmark.name} result in ${unitAffordance}`}
                  />
                  <span className="shrink-0 text-[13px] font-medium text-[#9E9EA3]">
                    {unitAffordance}
                  </span>
                </div>
              )}

              {secondsOutOfRange && (
                <div className="mt-2 text-[12px] font-medium text-[#C43B3B]">
                  Seconds must be between 0 and 59.
                </div>
              )}
              {error && (
                <div className="mt-2 text-[12px] font-medium text-[#C43B3B]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!valid || submitting}
                className="mt-4 w-full rounded-[12px] bg-[#E8501A] py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#D3480F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Logging…" : "Log result"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
