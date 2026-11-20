/** The site's own mark: an iron mask inside a shield. */
export function Sigil({ size = 30 }: { size?: number }) {
  return (
    <svg className="sigil" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M16 2.500l11 4.200v9.300c0 6.800-4.500 11.300-11 13.500C9.500 27.300 5 22.800 5 16V6.700z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.800"
      />
      <path d="M9.500 12.500l5.500 2.200v2.300l-5.500-1.200zM22.500 12.500L17 14.700V17l5.500-1.200z" fill="currentColor" />
      <path d="M12.500 21h7M13 23.500h6M16 19.500v6" stroke="currentColor" strokeWidth="1.200" />
    </svg>
  );
}
