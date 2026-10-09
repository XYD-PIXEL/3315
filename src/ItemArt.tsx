import type { Item } from "./data";

export default function ItemArt({
  kind,
  className = "",
}: {
  kind: Item["art"];
  className?: string;
}) {
  return (
    <svg
      className={`item-art ${className}`}
      viewBox="0 0 200 230"
      aria-hidden="true"
    >
      <ellipse cx="103" cy="210" rx="51" ry="8" fill="#163629" opacity=".1" />
      {kind === "bottle" && (
        <g transform="rotate(8 100 115)">
          <path
            d="M84 25h32v27l15 20v109c0 16-11 23-31 23s-31-7-31-23V72l15-20Z"
            fill="#d7e5df"
            stroke="#749589"
            strokeWidth="2"
          />
          <path
            d="M91 54 78 77v104c0 9 4 13 8 15"
            fill="none"
            stroke="white"
            strokeWidth="6"
            opacity=".8"
          />
          <path
            d="M70 88h60m-60 13h60m-60 70h60m-60 12h60"
            stroke="#a4bcb1"
            strokeWidth="2"
          />
          <rect x="81" y="19" width="38" height="24" rx="5" fill="#365c48" />
          <path
            d="M88 23v15m8-15v15m8-15v15m8-15v15"
            stroke="#62836d"
            strokeWidth="2"
          />
          <path d="M68 111h64v49H68Z" fill="#e8e8c5" />
          <path d="m96 145 0-23c15 0 24 9 0 23Z" fill="#477257" />
          <path d="m92 148 15-16" stroke="#477257" strokeWidth="2" />
          <path d="M79 116h13m-13 38h43" stroke="#babd92" strokeWidth="2" />
        </g>
      )}
      {kind === "cup" && (
        <g transform="rotate(-8 100 120)">
          <path
            d="m54 62 15 127c2 15 60 15 62 0l15-127Z"
            fill="#eee4d0"
            stroke="#c3b696"
            strokeWidth="2"
          />
          <path d="m60 113 7 55c17 7 49 7 67 0l6-55Z" fill="#b7936c" />
          <ellipse cx="100" cy="62" rx="49" ry="11" fill="#314d3b" />
          <path d="M50 59v9c9 14 91 14 100 0v-9" fill="#42634c" />
          <ellipse cx="100" cy="58" rx="50" ry="11" fill="#496e53" />
          <path
            d="M66 55c14-6 39-6 53-2"
            stroke="#789582"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M88 146c-2-17 19-20 24-20 0 19-11 26-24 20Z"
            fill="#f3ecd7"
          />
          <path d="m88 153 14-17" stroke="#f3ecd7" strokeWidth="2" />
        </g>
      )}
      {kind === "container" && (
        <g transform="rotate(-9 100 120)">
          <path
            d="M38 93h128l-12 87c-1 16-105 16-108 0Z"
            fill="#d6e3dc"
            stroke="#779c8a"
            strokeWidth="2"
          />
          <rect
            x="29"
            y="79"
            width="145"
            height="34"
            rx="13"
            fill="#f1f5ec"
            stroke="#779c8a"
            strokeWidth="2"
          />
          <path
            d="M45 91h112m-105 38 5 43m15-43 3 47m18-47v48m22-48-2 47m22-47-5 43"
            stroke="#aec8b9"
            strokeWidth="3"
          />
          <path
            d="M72 86c8-14 39-14 48 0"
            stroke="#a2b8a6"
            strokeWidth="3"
            fill="none"
          />
        </g>
      )}
      {kind === "packet" && (
        <g transform="rotate(8 100 120)">
          <path
            d="m47 42 9 10 9-10 9 10 9-10 9 10 9-10 9 10 9-10 9 10 9-10 12 10-5 146-9-8-9 8-9-8-9 8-9-8-9 8-9-8-9 8-9-8-9 8Z"
            fill="#d6a778"
            stroke="#ae8155"
            strokeWidth="2"
          />
          <path d="M49 63h98m-98 116h98" stroke="#bd8d60" strokeWidth="3" />
          <ellipse cx="99" cy="119" rx="37" ry="38" fill="#f3dfb2" />
          <path d="M78 114c8-26 34-25 39-3s-22 21-39 3Z" fill="#dfbe69" />
          <path d="m86 106 20 9m-22 3 17 5" stroke="#c8a149" strokeWidth="2" />
        </g>
      )}
      {kind === "banana" && (
        <g>
          <path
            d="M150 45c25 108-74 157-112 127 55 3 94-37 93-100Z"
            fill="#f1ce62"
            stroke="#b69b36"
            strokeWidth="2"
          />
          <path d="m145 41 14 5-3 19-20-5Z" fill="#625d37" />
          <path
            d="M130 68c-42 19-49 71-83 89 48 2 77-34 83-89Z"
            fill="#f4df98"
            stroke="#c3aa58"
            strokeWidth="2"
          />
          <path
            d="M130 68c21 43 19 89 51 98-35 11-54-31-51-98Z"
            fill="#f4df98"
            stroke="#c3aa58"
            strokeWidth="2"
          />
        </g>
      )}
      {kind === "can" && (
        <g transform="rotate(7 100 120)">
          <rect
            x="60"
            y="51"
            width="80"
            height="143"
            rx="17"
            fill="#b3c4b7"
            stroke="#5f7e6c"
            strokeWidth="2"
          />
          <ellipse
            cx="100"
            cy="53"
            rx="39"
            ry="10"
            fill="#dfe5df"
            stroke="#859c8b"
            strokeWidth="2"
          />
          <ellipse cx="100" cy="52" rx="12" ry="4" fill="#718b79" />
          <path d="M61 87h78v66H61Z" fill="#eeecd3" />
          <text
            x="100"
            y="125"
            textAnchor="middle"
            fontSize="22"
            fontFamily="sans-serif"
            fontWeight="700"
            fill="#48634c"
          >
            fizz.
          </text>
          <path d="M70 68v108" stroke="#fff" opacity=".5" strokeWidth="5" />
        </g>
      )}
      {kind === "paper" && (
        <g transform="rotate(-10 100 120)">
          <path
            d="M54 46h76l22 25v128H54Z"
            fill="#f4f0df"
            stroke="#bdb8a1"
            strokeWidth="2"
          />
          <path d="M130 46v25h22" fill="#ddd8c2" />
          <path
            d="M70 88h65m-65 16h65m-65 16h42m-42 34h65m-65 16h56"
            stroke="#b6beaa"
            strokeWidth="4"
          />
        </g>
      )}
    </svg>
  );
}
