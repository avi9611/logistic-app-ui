import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import ChartsPanel from "@/components/greencart/ChartsPanel";

interface KPIResult {
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  totalDeliveries: number;
  error?: string;
}

const Dashboard: React.FC = () => {
  const [kpi, setKpi] = useState<KPIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch("/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        drivers: 5,
        startTime: "08:00",
        maxHoursPerDay: 8,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setKpi(data);
          setChartData([
            {
              timestamp: "08:00",
              deliveries: data.totalDeliveries,
              onTimeRate: data.efficiencyScore / 100,
              revenue: data.totalProfit,
              energyCost: 0, 
            },
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch KPIs");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto my-8 px-2">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Card className="mb-6 p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Total Profit</div>
            <div className="text-lg font-semibold">
              ₹{kpi?.totalProfit?.toLocaleString() ?? "--"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Efficiency Score</div>
            <div className="text-lg font-semibold">
              {kpi?.efficiencyScore?.toFixed(1) ?? "--"}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">On-time Deliveries</div>
            <div className="text-lg font-semibold">
              {kpi?.onTimeDeliveries ?? "--"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Deliveries</div>
            <div className="text-lg font-semibold">
              {kpi?.totalDeliveries ?? "--"}
            </div>
          </div>
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {loading && <div className="text-gray-500">Loading...</div>}
      </Card>
      <ChartsPanel data={chartData} />
    </div>
  );
};

export default Dashboard;