export default function Badge({ type, label }: { type: string; label?: string }) {
  return (
    <span className={`badge ${type.toLowerCase()}`}>
      <span />
      {label || type}
    </span>
  );
}
