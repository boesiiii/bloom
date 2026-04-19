export default function Card({ children, className = "", as: Component = "section", ...props }) {
  return (
    <Component className={`rounded-lg border border-stone-200 bg-white/88 p-4 shadow-soft ${className}`} {...props}>
      {children}
    </Component>
  );
}
