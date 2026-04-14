import { memo } from "react";

export type SearchHighlightProps = {
  text: string;
  keyword: string;
};

export const SearchHighlight = memo(function SearchHighlight({
  text,
  keyword,
}: SearchHighlightProps) {
  if (!keyword.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
});
