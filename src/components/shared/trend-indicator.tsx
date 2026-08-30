interface TrendIndicatorProps {
  delta: string;
  direction: "up" | "down" | "flat";
  positive?: boolean;
}

export function TrendIndicator({ delta, direction, positive = true }: TrendIndicatorProps) {
  const colorClass =
    direction === "flat"
      ? "text-text-tertiary"
      : positive
        ? "text-success"
        : "text-danger";
  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";

  return (
    <span className={`text-[12px] font-medium ${colorClass}`}>
      {arrow} {delta}
    </span>
  );
}
