import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type KPI = {
  label: string;
  value: string;
  sub?: string;
};

const StatCard = ({ kpi }: { kpi: KPI }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow" aria-live="polite">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold tracking-tight">{kpi.value}</div>
      {kpi.sub && <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>}
    </CardContent>
  </Card>
);

export default function KPIGrid({ kpis }: { kpis: KPI[] }) {
  return (
    <section aria-label="Key Performance Indicators" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((k, i) => (
        <StatCard kpi={k} key={i} />
      ))}
    </section>
  );
}
