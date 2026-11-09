export type IconName = "arrow" | "github" | "linkedin" | "x" | "mail" | "sparkles";

/** Sprite SVG (renderizado uma vez no App). As telas podem usar <Icon name="sparkles" />. */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="i-arrow" viewBox="0 0 20 20">
        <path d="M4 10h11M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
      </symbol>
      <symbol id="i-github" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 2C5.58 2 2 5.58 2 10c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 18 10c0-4.42-3.58-8-8-8z"
          fill="currentColor"
        />
      </symbol>
      <symbol id="i-linkedin" viewBox="0 0 20 20">
        <path
          d="M4.5 3C3.67 3 3 3.67 3 4.5S3.67 6 4.5 6 6 5.33 6 4.5 5.33 3 4.5 3zM3 7.5h3v9.5H3V7.5zm5 0h2.88v1.3h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.6V17h-3v-4.43c0-1.06-.02-2.42-1.47-2.42-1.48 0-1.71 1.15-1.71 2.35V17H8V7.5z"
          fill="currentColor"
        />
      </symbol>
      <symbol id="i-x" viewBox="0 0 20 20">
        <path
          d="M14.7 3h2.3l-5.02 5.74L17.9 17h-4.63l-3.63-4.75L5.5 17H3.2l5.37-6.14L2.8 3h4.75l3.28 4.34L14.7 3zm-.81 12.62h1.28L6.46 4.31H5.09l8.8 11.31z"
          fill="currentColor"
        />
      </symbol>
      <symbol id="i-mail" viewBox="0 0 20 20">
        <path
          d="M3.5 5h13a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5v-8A1.5 1.5 0 0 1 3.5 5zm0 1.5v.35l6.5 4.33 6.5-4.33V6.5h-13zm13 8v-6.52l-6.1 4.07a.75.75 0 0 1-.8 0L3.5 7.98v6.52h13z"
          fill="currentColor"
        />
      </symbol>
      <symbol id="i-sparkles" viewBox="0 0 20 20">
        <path
          d="M10 2l1.6 4.4L16 8l-4.4 1.6L10 14l-1.6-4.4L4 8l4.4-1.6L10 2zm6 11l.8 2.2L19 16l-2.2.8L16 19l-.8-2.2L13 16l2.2-.8.8-2.2zM4 13l.8 2.2L7 16l-2.2.8L4 19l-.8-2.2L1 16l2.2-.8.8-2.2z"
          fill="currentColor"
        />
      </symbol>
    </svg>
  );
}

export function Icon({ name, size, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
