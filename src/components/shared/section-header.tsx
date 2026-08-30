interface SectionHeaderProps {
  children: React.ReactNode;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary">
      {children}
    </span>
  );
}
