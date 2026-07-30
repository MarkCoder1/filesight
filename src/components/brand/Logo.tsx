interface Props {
  size?: number;
  className?: string;
}

export function LogoFull({ size = 32, className }: Props) {
  return (
    <svg width={size * 4} height={size} viewBox="0 0 128 32" fill="none" className={className}>
      <rect
        x="2"
        y="6"
        width="20"
        height="20"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="4"
        y="10"
        width="16"
        height="12"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path d="M7 14h10M7 18h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path
        d="M12 6l-2-4M12 6l2-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="30"
        y="22"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="currentColor"
      >
        FileSight
      </text>
    </svg>
  );
}

export function LogoIcon({ size = 32, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="4" y="8" width="24" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="12" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1" />
      <path d="M10 16h12M10 20h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M16 8l-3-5M16 8l3-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoMark({ size = 32, className }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M6 10a2 2 0 012-2h16a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V10z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 8l-3-5M16 8l3-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 15h12M10 19h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
