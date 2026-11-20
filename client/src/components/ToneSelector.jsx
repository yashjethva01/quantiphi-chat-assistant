const tones = [
  ['professional', 'Professional'],
  ['casual', 'Casual'],
  ['concise', 'Concise']
];

export default function ToneSelector({ tone, onChange, disabled }) {
  return (
    <select className="tone-select" value={tone} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
      {tones.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
    </select>
  );
}

