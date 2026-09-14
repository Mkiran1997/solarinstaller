export function SolarIllustration() {
  return (
    <svg viewBox="0 0 360 280" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <circle cx="290" cy="60" r="34" fill="#fbbf24" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1={290 + Math.cos((angle * Math.PI) / 180) * 46}
          y1={60 + Math.sin((angle * Math.PI) / 180) * 46}
          x2={290 + Math.cos((angle * Math.PI) / 180) * 58}
          y2={60 + Math.sin((angle * Math.PI) / 180) * 58}
          stroke="#fbbf24"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}

      <path d="M20 210 L170 110 L320 210 Z" fill="#312e81" opacity="0.9" />
      <rect x="45" y="210" width="250" height="70" rx="6" fill="#3730a3" />

      <g opacity="0.95">
        {[0, 1, 2, 3].map((col) => (
          <rect
            key={col}
            x={62 + col * 48}
            y={168}
            width="40"
            height="34"
            rx="3"
            fill="#818cf8"
            stroke="#eef2ff"
            strokeWidth="2"
            transform={`skewY(-18) translate(${col * 6} ${col * -2})`}
          />
        ))}
      </g>

      <rect x="150" y="235" width="40" height="45" fill="#4338ca" />
      <rect x="90" y="245" width="24" height="24" fill="#a5b4fc" opacity="0.6" />
      <rect x="230" y="245" width="24" height="24" fill="#a5b4fc" opacity="0.6" />

      <path d="M0 280 H360" stroke="#4338ca" strokeWidth="2" opacity="0.3" />
    </svg>
  )
}
