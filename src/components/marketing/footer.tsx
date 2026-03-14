const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#pillars" },
      { label: "Pricing", href: "#pricing" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0D0D0F] pt-16 pb-8 px-6 relative">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8501A]/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="text-xs font-bold tracking-[2.5px] uppercase text-[#E8501A]">
            CREDO
          </span>
          <p className="mt-3 text-sm text-[#6B6B73] max-w-xs">
            Train for longevity. One app. One score.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#6B6B73] hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-6">
          <p className="text-xs text-[#6B6B73]">
            &copy; {new Date().getFullYear()} Credo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
