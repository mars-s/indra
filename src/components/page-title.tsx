// Serif page title. Spec cap height is 43 to 47 source px, so about 22 CSS px,
// which Instrument Serif reaches at 32 px.
export function PageTitle({
  as: Tag = "h1",
  id,
  children,
}: {
  as?: "h1" | "h2";
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag id={id} className="font-serif text-[32px] leading-none font-normal tracking-[-0.005em] text-fg">
      {children}
    </Tag>
  );
}
