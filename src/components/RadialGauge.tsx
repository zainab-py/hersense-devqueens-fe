interface RadialGaugeProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  size?: number;
}

const RadialGauge = ({ value, max = 100, label, unit = '%', size = 100 }: RadialGaugeProps) => {
  const pct = Math.min(value / max, 1);
  const r = (size - 12) / 2;
  const circ = Math.PI * r; // semi-circle
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
        {/* Background arc */}
        <path
          d={`M 6 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M 6 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2 + 6}`}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s ease-out',
            filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))',
          }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          className="fill-foreground font-display"
          fontSize="18"
          fontWeight="600"
        >
          {Math.round(value)}
          <tspan fontSize="10" className="fill-muted-foreground">{unit}</tspan>
        </text>
      </svg>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
};

export default RadialGauge;
