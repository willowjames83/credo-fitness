interface SectionHeaderProps {
  children: React.ReactNode;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <span
      className="uppercase tracking-widest"
      style={{ fontSize: 11, fontWeight: 600, color: "#9E9EA3", letterSpacing: 1.5 }}
    >
      {children}
    </span>
  );
}
