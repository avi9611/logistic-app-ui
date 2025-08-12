import { useCallback, useMemo, useState } from "react";
import KPIGrid from "@/components/greencart/KPIGrid";
import SimulationControls from "@/components/greencart/SimulationControls";
import ChartsPanel from "@/components/greencart/ChartsPanel";
import { defaultSimConfig, SimConfig, useDeliverySimulation } from "@/hooks/useDeliverySimulation";

const Index = () => {
  const [config, setConfig] = useState<SimConfig>(defaultSimConfig);
  const { points, totals } = useDeliverySimulation(config);

  const kpis = useMemo(() => [
    { label: "Deliveries", value: totals.deliveries.toLocaleString() },
    { label: "On-time", value: `${Math.round(totals.onTimeRate * 100)}%` },
    { label: "Revenue", value: `$${Math.round(totals.revenue).toLocaleString()}` },
    { label: "Wages", value: `$${Math.round(totals.wages).toLocaleString()}` },
    { label: "Profit", value: `$${Math.round(totals.profit).toLocaleString()}`, sub: `Energy: $${Math.round(totals.energyCost)}` },
    { label: "CO₂ Saved", value: `${Math.round(totals.co2SavedKg).toLocaleString()} kg` },
  ], [totals]);

  const onRun = useCallback(() => {
    // No-op: simulation runs reactively; this button provides UX affordance
    // Could be used later to persist a scenario
  }, []);

  const onReset = useCallback(() => {
    setConfig(defaultSimConfig);
  }, []);

  // Signature moment: pointer-reactive ambient gradient
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
  };

  return (
    <div onMouseMove={onMouseMove} className="min-h-screen bg-background hero-ambient">
      <header className="container py-10">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            GreenCart Logistics – Delivery Simulation & KPI Dashboard
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Simulate staffing, delivery schedules, and route allocations to understand their impact on profitability and efficiency.
          </p>
        </div>
      </header>

      <main role="main" className="container pb-16 space-y-8">
        <KPIGrid kpis={kpis} />

        <section className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 sticky top-4">
            <SimulationControls value={config} onChange={setConfig} onRun={onRun} onReset={onReset} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <ChartsPanel data={points} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
