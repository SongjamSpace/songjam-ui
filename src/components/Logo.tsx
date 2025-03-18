const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
        <feComposite in="SourceGraphic" in2="coloredBlur" operator="over" />
      </filter>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 16 16"
        to="360 16 16"
        dur="8s"
        repeatCount="indefinite"
      />
    </defs>

    {/* Dynamic voice wave pattern */}
    <g filter="url(#glow)">
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 16 16"
        to="360 16 16"
        dur="8s"
        repeatCount="indefinite"
      />
      <path
        d="M6 16 Q10 8 16 16 Q22 24 26 16"
        stroke="url(#logo-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M10 16 Q13 12 16 16 Q19 20 22 16"
        stroke="url(#logo-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 16 Q15 14 16 16 Q17 18 18 16"
        stroke="url(#logo-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </g>

    {/* Central focus point */}
    <circle cx="16" cy="16" r="3" fill="url(#logo-gradient)" />

    {/* Subtle background elements */}
    <circle cx="16" cy="16" r="15" stroke="url(#logo-gradient)" strokeWidth="0.5" opacity="0.3" />
    <circle cx="16" cy="16" r="12" stroke="url(#logo-gradient)" strokeWidth="0.5" opacity="0.2" />
  </svg>
);

export default Logo;