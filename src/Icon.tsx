export type IconName =
  | "leaf"
  | "arrow"
  | "back"
  | "camera"
  | "search"
  | "pin"
  | "check"
  | "close"
  | "recycle"
  | "trash"
  | "info"
  | "refresh"
  | "spark"
  | "chevron"
  | "sliders";
const paths: Record<IconName, React.ReactNode> = {
  leaf: (
    <>
      <path d="M5 16C4 6 14 4 21 3c0 9-3 17-11 17-3 0-5-1-5-4Z" />
      <path d="m3 22 12-12" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </>
  ),
  back: (
    <>
      <path d="M20 12H4m6-6-6 6 6 6" />
    </>
  ),
  camera: (
    <>
      <path d="M4 6h4l2-3h4l2 3h4a1 1 0 0 1 1 1v12H3V7a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  recycle: (
    <>
      <path d="m8 7 4-6 4 6m-8-1h8M18 9l4 7h-7m4-5 3 5-3 5M6 10l-4 7h7m-5-5-2 5 3 4" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10v.2" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  sliders: (
    <>
      <path d="M3 6h18M3 12h18M3 18h18" />
      <circle cx="8" cy="6" r="2" fill="currentColor" />
      <circle cx="16" cy="12" r="2" fill="currentColor" />
      <circle cx="9" cy="18" r="2" fill="currentColor" />
    </>
  ),
};
export default function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
