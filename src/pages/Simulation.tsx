import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChartsPanel from "@/components/greencart/ChartsPanel";

interface KPIResult {
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  totalDeliveries: number;
  error?: string;
}

const Simulation: React.FC = () => {
  const [drivers, setDrivers] = useState(5);
  const [startTime, setStartTime] = useState("08:00");
  const [maxHoursPerDay, setMaxHoursPerDay] = useState(8);
  const [result, setResult] = useState<KPIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  const runSimulation = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drivers, startTime, maxHoursPerDay }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setResult(data);
        setChartData([
          {
            timestamp: startTime,
            deliveries: data.totalDeliveries,
            onTimeRate: data.efficiencyScore / 100,
            revenue: data.totalProfit,
            energyCost: 0, // Placeholder
          },
        ]);
      } else {
        setError(data.error || "Simulation failed");
      }
    } catch {
      setError("Simulation failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto my-8 px-2">
      <h1 className="text-2xl font-bold mb-6">Simulation</h1>
      <Card className="mb-6 p-6 flex flex-col gap-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            runSimulation();
          }}
        >
          <div className="flex gap-2 flex-wrap">
            <Input
              type="number"
              min={1}
              placeholder="Drivers"
              value={drivers}
              onChange={e => setDrivers(Number(e.target.value))}
              className="w-32"
            />
            <Input
              type="time"
              placeholder="Start Time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-32"
            />
            <Input
              type="number"
              min={1}
              max={24}
              placeholder="Max Hours/Day"
              value={maxHoursPerDay}
              onChange={e => setMaxHoursPerDay(Number(e.target.value))}
              className="w-32"
            />
            <Button type="submit" disabled={loading}>
              Run Simulation
            </Button>
          </div>
        </form>
        {error && <div className="text-red-500">{error}</div>}
        {loading && <div className="text-gray-500">Running simulation...</div>}
        {result && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <div className="text-xs text-muted-foreground">Total Profit</div>
              <div className="text-lg font-semibold">
                ₹{result.totalProfit?.toLocaleString() ?? "--"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Efficiency Score</div>
              <div className="text-lg font-semibold">
                {result.efficiencyScore?.toFixed(1) ?? "--"}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">On-time Deliveries</div>
              <div className="text-lg font-semibold">
                {result.onTimeDeliveries ?? "--"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Deliveries</div>
              <div className="text-lg font-semibold">
                {result.totalDeliveries ?? "--"}
              </div>
            </div>
          </div>
        )}
      </Card>
      {result && <ChartsPanel data={chartData} />}
    </div>
  );
};

export default Simulation;