export function CortexIllustration() {
  return (
    <svg
      viewBox="0 0 320 150"
      className="nora-illustration"
      role="img"
      aria-label="Side view of the brain, with the prefrontal cortex highlighted in purple at the front."
      data-testid="img-prefrontal-cortex"
    >
      <rect width="320" height="150" rx="16" fill="#f4f0f8" />
      <g stroke="#806bb3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M72 101 C53 98 43 87 44 72 C39 59 47 43 62 39 C66 24 86 20 99 27 C111 17 128 18 139 26 C158 19 176 28 181 40 C202 42 212 56 209 72 C219 89 204 104 183 105 L164 110 L159 128 L142 128 L140 111 C119 119 92 114 72 101Z" fill="#e1d8ef" />
        <path d="M62 39 C47 43 39 59 44 72 C43 87 53 98 72 101 C83 93 89 79 86 67 C89 54 81 40 62 39Z" fill="#9774d2" stroke="#624a96" />
        <path d="M63 51 Q74 56 68 69 Q56 77 64 87 M96 37 Q110 44 105 57 Q91 62 97 77 M121 31 Q129 42 121 51 Q112 61 124 71 M144 38 Q159 37 165 51 Q154 61 163 71 M182 54 Q193 60 188 73 M103 92 Q117 82 132 91 Q144 100 155 88 M172 87 Q184 83 194 90" fill="none" />
      </g>
      <circle cx="64" cy="62" r="4" fill="#fffefd" />
      <text x="234" y="46" textAnchor="middle" fill="#624a96" fontSize="13" fontWeight="700" fontFamily="sans-serif">
        <tspan x="254">Prefrontal</tspan>
        <tspan x="254" dy="18">cortex</tspan>
      </text>
      <path d="M230 67 L76 62" fill="none" stroke="#624a96" strokeWidth="1.5" strokeDasharray="3 4" />
      <text x="61" y="136" textAnchor="middle" fill="#70677b" fontSize="11" fontFamily="sans-serif">Front</text>
    </svg>
  );
}
