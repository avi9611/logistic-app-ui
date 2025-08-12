import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TimePoint } from "@/hooks/useDeliverySimulation";

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"];

export default function ChartsPanel({ data }: { data: TimePoint[] }) {
  const pieData = [
    { name: "EV km", value: data.reduce((s, p) => s + p.km * (p.evDeliveries / Math.max(1, p.deliveries || 1)), 0) },
    { name: "ICE km", value: data.reduce((s, p) => s + p.km * (1 - p.evDeliveries / Math.max(1, p.deliveries || 1)), 0) },
  ];

  return (
    <section className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Deliveries vs Capacity</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <XAxis dataKey="hour" tickMargin={8} />
              <YAxis allowDecimals={false} tickMargin={8} />
              <Tooltip cursor={{ stroke: "hsl(var(--border))" }} />
              <Line type="monotone" dataKey="deliveries" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Deliveries" />
              <Line type="monotone" dataKey="capacity" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} name="Capacity" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilization by Hour</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <XAxis dataKey="hour" tickMargin={8} />
              <YAxis domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} tickMargin={8} />
              <Tooltip formatter={(v: any) => `${Math.round((v as number) * 100)}%`} />
              <Bar dataKey="utilization" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Fleet Energy Mix (km)</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                {pieData.map((_, i) => (
                  <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
