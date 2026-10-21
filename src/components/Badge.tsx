export default function Badge({ type }: { type: string }) {
  return (
    <span className={`badge ${type.toLowerCase()}`}>
      <span />
      {type}
    </span>
  );
}
