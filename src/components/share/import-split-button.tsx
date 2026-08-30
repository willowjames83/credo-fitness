"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ImportSplitButton({ code }: { code: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    setState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/share/${code}/import`, { method: "POST" });
      if (res.status === 401) {
        router.push(`/login?next=/s/${code}`);
        return;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error ?? "Could not import this split.");
      }
      router.push("/app/profile/splits");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not import this split.");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleImport}
        disabled={state === "loading"}
        className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-[#E8501A] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#D3480F] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state === "loading" && <Loader2 size={16} className="animate-spin" />}
        Import this split
      </button>
      {error && <p className="mt-2 text-[13px] text-[#C43B3B]">{error}</p>}
    </div>
  );
}
