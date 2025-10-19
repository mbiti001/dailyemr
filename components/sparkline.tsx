type SparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
};

export function Sparkline({
  values,
  width = 160,
  height = 60,
  stroke = "#0EA5E9",
  strokeWidth = 2,
  fill = "rgba(14,165,233,0.12)"
}: SparklineProps) {
  if (!values.length) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="No data">
        <rect width={width} height={height} fill="rgba(148,163,184,0.12)" rx={8} />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length > 1 ? width / (values.length - 1) : width;

  const points = values
    .map((value, index) => {
      const x = index * step;
      const normalized = (value - min) / range;
      const y = height - normalized * (height - strokeWidth * 2) - strokeWidth;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const areaPath = `M0 ${height} L ${points} L ${width} ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
      <path d={areaPath} fill={fill} />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
