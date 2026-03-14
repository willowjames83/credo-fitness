import { APP_LINKS } from "@/lib/constants";

interface AppDownloadBadgesProps {
  className?: string;
  badgeHeight?: number;
}

export function AppDownloadBadges({
  className = "",
  badgeHeight = 40,
}: AppDownloadBadgesProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-3 ${className}`}>
      {/* Apple App Store */}
      <a
        href={APP_LINKS.appStore}
        aria-label="Download on the App Store"
        className="transition-opacity hover:opacity-80"
      >
        <svg
          width={badgeHeight * 3.375}
          height={badgeHeight}
          viewBox="0 0 135 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="135" height="40" rx="5" fill="#000" />
          <rect
            x="0.5"
            y="0.5"
            width="134"
            height="39"
            rx="4.5"
            stroke="#A6A6A6"
            strokeWidth="1"
            fill="none"
          />
          {/* Apple logo */}
          <g transform="translate(14, 7)">
            <path
              d="M18.128 12.436c-.027-3.065 2.498-4.536 2.612-4.607-1.422-2.08-3.637-2.365-4.425-2.398-1.883-.19-3.676 1.11-4.633 1.11-.955 0-2.435-1.082-4-1.054-2.06.03-3.957 1.197-5.017 3.042-2.14 3.714-.548 9.216 1.537 12.23 1.018 1.472 2.233 3.126 3.83 3.068 1.536-.062 2.117-.994 3.975-.994 1.858 0 2.378.994 4.003.962 1.654-.027 2.706-1.5 3.716-2.978 1.17-1.71 1.653-3.365 1.681-3.451-.036-.017-3.226-1.237-3.26-4.907z"
              fill="#fff"
              transform="scale(0.8)"
            />
            <path
              d="M15.245 3.486C16.087 2.457 16.66.91 16.49 0c-1.297.053-2.87.864-3.8 1.953-.834.965-1.564 2.502-1.368 3.978 1.447.112 2.923-.736 3.923-2.445z"
              fill="#fff"
              transform="scale(0.8)"
            />
          </g>
          {/* Text */}
          <text
            x="40"
            y="14"
            fill="#fff"
            fontSize="7.5"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Download on the
          </text>
          <text
            x="40"
            y="29"
            fill="#fff"
            fontSize="13"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="600"
          >
            App Store
          </text>
        </svg>
      </a>

      {/* Google Play */}
      <a
        href={APP_LINKS.googlePlay}
        aria-label="Get it on Google Play"
        className="transition-opacity hover:opacity-80"
      >
        <svg
          width={badgeHeight * 3.375}
          height={badgeHeight}
          viewBox="0 0 135 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="135" height="40" rx="5" fill="#000" />
          <rect
            x="0.5"
            y="0.5"
            width="134"
            height="39"
            rx="4.5"
            stroke="#A6A6A6"
            strokeWidth="1"
            fill="none"
          />
          {/* Play triangle */}
          <g transform="translate(10, 5)">
            <defs>
              <linearGradient
                id="playGrad"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#00C3FF" />
                <stop offset="25%" stopColor="#00E07B" />
                <stop offset="50%" stopColor="#FFBC00" />
                <stop offset="100%" stopColor="#FF3A44" />
              </linearGradient>
            </defs>
            <path
              d="M3 2.5C3 1.67 3.93 1.17 4.63 1.63L21.37 13.63C22.01 14.04 22.01 14.96 21.37 15.37L4.63 27.37C3.93 27.83 3 27.33 3 26.5V2.5Z"
              fill="url(#playGrad)"
              transform="scale(0.65) translate(2, 2)"
            />
          </g>
          {/* Text */}
          <text
            x="33"
            y="14"
            fill="#fff"
            fontSize="7"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.5"
          >
            GET IT ON
          </text>
          <text
            x="33"
            y="29"
            fill="#fff"
            fontSize="12.5"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="600"
          >
            Google Play
          </text>
        </svg>
      </a>
    </div>
  );
}
