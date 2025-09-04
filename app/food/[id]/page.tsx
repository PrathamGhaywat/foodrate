// Static export compatibility: don't pre-render any dynamic paths
export async function generateStaticParams() {
  return [] as { id: string }[];
}

export default function DeprecatedFoodDetailPage() {
  return (
    <div className="p-8 text-sm text-muted-foreground">
      This route is deprecated. Use <code>/food?id=...</code> instead.
    </div>
  );
}
