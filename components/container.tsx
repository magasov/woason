export const containerClass = "mx-auto w-full max-w-[1120px] px-4 md:px-6";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${containerClass} ${className}`}>{children}</div>;
}
