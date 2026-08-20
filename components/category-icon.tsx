const iconClass = "h-5 w-5 shrink-0";

export function CategoryIcon({ slug, className = iconClass }: { slug: string; className?: string }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    className,
    "aria-hidden": true as const,
  };

  switch (slug) {
    case "odezhda":
      return (
        <svg {...props}>
          <path d="M8 4.5 12 7l4-2.5 2.5 3L16 9.5V20H8V9.5L5.5 7.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "obuv":
      return (
        <svg {...props}>
          <path d="M4 15.5h13.5c1.7 0 2.5-1 2.5-2.2 0-2.4-3-3.6-5.2-4.1L13 7H8.5L4 14.2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M4 15.5v2.2h13.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "aksessuary":
      return (
        <svg {...props}>
          <path d="M7 9h10l-.8 10H7.8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 9V7.2A3 3 0 0 1 12 4.2 3 3 0 0 1 15 7.2V9" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case "ukrasheniya":
      return (
        <svg {...props}>
          <path d="M12 3.8 14.2 8l4.8.4-3.7 3.2 1.2 4.7L12 14.1 7.5 16.3 8.7 11.6 5 8.4 9.8 8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "elektronika":
      return (
        <svg {...props}>
          <rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M11 18.5h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "bytovaya":
      return (
        <svg {...props}>
          <path d="M9 8V5.5h6V8M8 8h8v11H8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M11 13h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "kompjutery":
      return (
        <svg {...props}>
          <rect x="3.5" y="5" width="17" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 19h8M12 16v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "igry":
      return (
        <svg {...props}>
          <path d="M5.5 9.5h13a3 3 0 0 1 2.6 4.4l-1.2 2.2A2.4 2.4 0 0 1 17.8 17.5H6.2a2.4 2.4 0 0 1-2.1-1.4l-1.2-2.2A3 3 0 0 1 5.5 9.5z" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 12v3M6.5 13.5h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="15.2" cy="12.6" r=".8" fill="currentColor" />
          <circle cx="17" cy="14.4" r=".8" fill="currentColor" />
        </svg>
      );
    case "dom":
      return (
        <svg {...props}>
          <path d="M4 11.5 12 4l8 7.5V20H4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "mebel":
      return (
        <svg {...props}>
          <path d="M5 13.5h14v5H5zM7 13.5V10h10v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M6 18.5v2M18 18.5v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "kuhnya":
      return (
        <svg {...props}>
          <path d="M6 10.5h12v8.5H6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 10.5V7.5M15 10.5V7.5M7.5 14.5h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "sad":
      return (
        <svg {...props}>
          <path d="M12 20V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M12 11c-3.2-1-5.5-3.6-5.8-6.8 3.4.4 6 2.6 7 5.8 1-3.2 3.6-5.4 7-5.8C20 7.4 17.7 10 14.5 11" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "remont":
      return (
        <svg {...props}>
          <path d="M14.2 5.2a4.2 4.2 0 0 0-5.4 5.4L4 15.4 8.6 20l4.8-4.8a4.2 4.2 0 0 0 5.4-5.4L16 12.6 11.4 8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "krasota":
      return (
        <svg {...props}>
          <path d="M12 3.5 13.8 8l4.7.4-3.6 3.1 1.1 4.6L12 13.9 7.9 16.1l1.1-4.6L5.5 8.4 10.2 8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      );
    case "zdorovie":
      return (
        <svg {...props}>
          <path d="M12 4.5 9.2 8.2H6.5v4.2L12 20l5.5-7.6V8.2h-2.7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M10 10.3h4M12 8.4v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "detiam":
      return (
        <svg {...props}>
          <circle cx="9" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="15.5" cy="10.5" r="3.2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M7.2 16.5c.8-1.6 2.1-2.4 3.6-2.4M13 16.8c.7-1.4 2-2.2 3.5-2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "zootovary":
      return (
        <svg {...props}>
          <circle cx="8" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16" cy="9" r="1.6" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="6.4" cy="13.2" r="1.4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17.6" cy="13.2" r="1.4" stroke="currentColor" strokeWidth="1.6" />
          <ellipse cx="12" cy="16" rx="3.2" ry="2.4" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case "sport":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M12 3.8v16.4M3.8 12h16.4M6.2 6.2c2.4 2 5.2 3 5.8 5.8M17.8 6.2C15.4 8.2 12.6 9.2 12 12M6.2 17.8c2.4-2 5.2-3 5.8-5.8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "hobbi":
      return (
        <svg {...props}>
          <path d="M4.8 16.5c2.4-6 6-10.8 10.7-12.4 1.4 4.2-.2 8.6-3.8 11.6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="7.2" cy="17.4" r="2.2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M14.5 6.2l4.2 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "knigi":
      return (
        <svg {...props}>
          <path d="M5 5.5h10.5A2.5 2.5 0 0 1 18 8v11.5H7.5A2.5 2.5 0 0 0 5 22z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M5 5.5V22" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    case "kantselyariya":
      return (
        <svg {...props}>
          <path d="M14.5 4.5 19.5 9.5 9 20H4v-5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M13 6.2 17.8 11" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case "produkty":
      return (
        <svg {...props}>
          <path d="M6 7h15l-1.4 8.2A2 2 0 0 1 17.6 17H9.2A2 2 0 0 1 7.3 15.4L5 4H2" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <circle cx="10" cy="20" r="1.3" fill="currentColor" />
          <circle cx="17" cy="20" r="1.3" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
  }
}
