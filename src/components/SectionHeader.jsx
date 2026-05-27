// The double-rule section header: a display headline on the left,
// an italic editorial meta note on the right.
export default function SectionHeader({ title, meta }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <div className="meta">{meta}</div>
    </div>
  );
}
