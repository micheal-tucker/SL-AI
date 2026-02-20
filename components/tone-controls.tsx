import { cn } from "@/lib/utils";

export function ToneControls({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-8 min-w-[6.5rem] shrink-0 rounded-md border border-border bg-secondary/60 px-2 text-xs",
        "text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
      )}
      aria-label="Select tone"
    >
      <option value="professional">Professional</option>
      <option value="friendly">Friendly</option>
      <option value="formal">Formal</option>
    </select>
  );
}
