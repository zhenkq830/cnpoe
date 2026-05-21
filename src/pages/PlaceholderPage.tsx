interface Props { title: string; icon: string; desc: string; }

export default function PlaceholderPage({ title, icon, desc }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl mb-6">{icon}</span>
      <h1 className="text-2xl font-bold text-poe-text mb-3">{title}</h1>
      <p className="text-poe-muted text-sm max-w-md">{desc}</p>
      <p className="text-poe-muted text-xs mt-6 px-4 py-2 rounded-lg bg-poe-card border border-poe-border">
        该模块正在开发中，敬请期待...
      </p>
    </div>
  );
}
