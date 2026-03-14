interface PercentileBarProps {
  value: number;
  color: string;
}

export function PercentileBar({ value, color }: PercentileBarProps) {
  return (
    <div className="w-full" style={{ height: 4, background: "#EEEFF1", borderRadius: 2 }}>
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
