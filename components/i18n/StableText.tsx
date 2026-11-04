export function StableText({
  text,
  reserve,
  block = false,
  align,
}: {
  text: string;
  reserve: string;
  block?: boolean;
  align?: "start" | "center" | "end";
}) {
  const placement = align ?? (block ? "stretch" : "center");
  const className = [
    "stable-text",
    block ? "is-block" : "",
    placement === "start" ? "is-start" : "",
    placement === "end" ? "is-end" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={className}>
      <span>{text}</span>
      {reserve !== text ? (
        <span className="stable-text-reserve" aria-hidden="true">
          {reserve}
        </span>
      ) : null}
    </span>
  );
}
