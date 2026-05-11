// Small speech-bubble icon used both on calendar day cells (to mark days
// with a note) and in the legend below the calendar to explain what the
// indicator means.
export default function NoteIcon({ size = 14, color = "#4a9eca" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="1" width="8" height="6" rx="1.5" fill={color} />
      <polygon points="5.5,7 8,7 8,9.5" fill={color} />
    </svg>
  );
}
