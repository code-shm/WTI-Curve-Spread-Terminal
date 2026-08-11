type Direction = "up-good" | "up-bad" | "neutral";

function deltaColor(direction: Direction) {
  if (direction === "up-good") return "var(--good)";
  if (direction === "up-bad") return "var(--critical)";
  return "var(--text-secondary)";
}

export function StatTile({
  label,
  value,
  delta,
  direction = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  direction?: Direction;
}) {
  return (
    <div className="card p-4">
      <p className="text-muted text-xs mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {delta && (
        <p className="text-xs mt-1" style={{ color: deltaColor(direction) }}>
          {delta}
        </p>
      )}
    </div>
  );
}
