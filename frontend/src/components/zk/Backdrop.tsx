export function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* High-performance static gradient mesh - 0% GPU overhead, silky smooth 60fps */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_-10%,rgba(108,92,231,0.22),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_20%,rgba(0,242,254,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_110%,rgba(162,155,254,0.12),transparent_70%)]" />
      <div className="absolute inset-0 grid-noise opacity-40" />
    </div>
  );
}
