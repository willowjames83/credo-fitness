interface TrendIndicatorProps {
  delta: string;
  direction: "up" | "down" | "flat";
  positive?: boolean;
}

export function TrendIndicator({ delta, direction, positive = true }: TrendIndicatorProps) {
  const color = direction === "flat" ? "#9E9EA3" : positive ? "#2D8A4E" : "#C43B3B";
  const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";

  return (
    <span style={{ fontSize: 12, fontWeight: 500, color }}>
      {arrow} {delta}
    </span>
  );
}
