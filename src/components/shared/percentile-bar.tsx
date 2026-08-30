interface PercentileBarProps {
  value: number;
  color: string;
}

export function PercentileBar({ value, color }: PercentileBarProps) {
  return (
    <div className="w-full rounded-full bg-surface-elevated" style={{ height: 4 }}>
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: color,
          borderRadius: 2,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}
