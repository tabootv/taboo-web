interface VerifiedBadgeProps {
  size?: number;
}

export function VerifiedBadge({ size = 18 }: VerifiedBadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 0L9.79611 1.52786L12.1244 1.52786L12.7023 3.76393L14.7023 5.04508L14.0489 7.29814L14.7023 9.55119L12.7023 10.8323L12.1244 13.0684L9.79611 13.0684L8 14.5963L6.20389 13.0684L3.87564 13.0684L3.29772 10.8323L1.29772 9.55119L1.95106 7.29814L1.29772 5.04508L3.29772 3.76393L3.87564 1.52786L6.20389 1.52786L8 0Z"
        fill="#AB0013"
      />
      <path
        d="M5.5 7.5L7 9L10.5 5.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

