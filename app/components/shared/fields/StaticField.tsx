"use client";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ReactNode, useState } from "react";
import { FiCopy } from "react-icons/fi";

interface StaticFieldProps {
  label: string;
  value: string | number | null;
  secondaryValue?: string | null;
  className?: string;
  icon?: ReactNode;
  badge?: string | ReactNode;
  link?: string;
}

const StaticField: React.FC<StaticFieldProps> = ({
  label,
  value,
  secondaryValue,
  className,
  icon,
  badge,
  link,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (link) {
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <div className={"relative w-full border-b px-4 py-3 " + (className || "")}>
      {badge && (
        <div className="absolute top-2 right-3">
          {typeof badge === "string" ? (
            <Badge variant="default">{badge}</Badge>
          ) : (
            badge
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {icon && <div className="text-grayText">{icon}</div>}
        <Label className="font-normal text-grayText">{label}</Label>
      </div>

      <div className="mt-0.5 flex items-center gap-2">
        {link ? (
          <>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg  underline truncate overflow-hidden whitespace-nowrap block"
              title={typeof value === "string" ? value : undefined}
            >
              {value}
            </a>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="text-gray-400 hover:text-white transition"
                aria-label="Copy link"
              >
                <FiCopy className="text-xl" />
              </button>
              {copied && (
                <span className="text-xs text-green-500 animate-fade-in">
                  Copied!
                </span>
              )}
            </div>
          </>
        ) : (
          <p
            className="text-lg font-medium truncate overflow-hidden whitespace-nowrap"
            title={typeof value === "string" ? value : undefined}
          >
            {value !== null && value !== undefined && value !== ""
              ? value
              : "Not Set"}
          </p>
        )}
      </div>

      {secondaryValue && (
        <p className="text-sm text-green-600">{secondaryValue}</p>
      )}
    </div>
  );
};

export default StaticField;
