export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="card p-6 text-sm">
      <p className="font-medium mb-1">{title}</p>
      <p className="text-secondary">{detail}</p>
    </div>
  );
}
