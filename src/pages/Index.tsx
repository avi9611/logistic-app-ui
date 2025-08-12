import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import KPIGrid from "@/components/greencart/KPIGrid";
import SimulationControls from "@/components/greencart/SimulationControls";
import ChartsPanel from "@/components/greencart/ChartsPanel";
import { defaultSimConfig, SimConfig, useDeliverySimulation } from "@/hooks/useDeliverySimulation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Save, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Index = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SimConfig>(defaultSimConfig);
  const { points, totals } = useDeliverySimulation(config);
  const [savedScenarios, setSavedScenarios] = useState<{[key: string]: SimConfig}>({});

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSaveScenario = () => {
    const name = prompt("Enter a name for this scenario:");
    if (name) {
      const scenarios = { ...savedScenarios, [name]: config };
      setSavedScenarios(scenarios);
      localStorage.setItem('scenarios', JSON.stringify(scenarios));
    }
  };

  const handleLoadScenario = () => {
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '{}');
    const name = Object.keys(scenarios)[0];
    if (name) {
      setConfig(scenarios[name]);
    }
  };

  const kpis = useMemo(() => [
    {
      label: "Deliveries",
      value: totals.deliveries.toLocaleString(),
      description: "Total number of completed deliveries"
    },
    {
      label: "Efficiency Score",
      value: config.drivers && config.shiftHours ? (totals.deliveries / (config.drivers * config.shiftHours)).toFixed(2) : "N/A",
      description: "Deliveries per driver per hour"
    },
    {
      label: "On-time Rate",
      value: `${Math.round(totals.onTimeRate * 100)}%`,
      description: "Percentage of deliveries completed within target time"
    },
    {
      label: "Revenue",
      value: `$${Math.round(totals.revenue).toLocaleString()}`,
      description: "Total earnings from completed deliveries"
    },
    {
      label: "Wages",
      value: `$${Math.round(totals.wages).toLocaleString()}`,
      description: "Total cost of delivery staff wages"
    },
    {
      label: "Net Profit",
      value: `$${Math.round(totals.profit).toLocaleString()}`,
      sub: `Energy Cost: $${Math.round(totals.energyCost)}`,
      description: "Revenue minus wages and energy costs"
    },
    {
      label: "CO₂ Saved",
      value: `${Math.round(totals.co2SavedKg).toLocaleString()} kg`,
      description: "Estimated CO₂ emissions saved vs traditional delivery"
    },
  ], [totals]);

  const onRun = useCallback(() => {
    // Save current scenario state
    const scenarios = JSON.parse(localStorage.getItem('scenarios') || '{}');
    localStorage.setItem('scenarios', JSON.stringify({
      ...scenarios,
      'Last Run': config
    }));
  }, [config]);

  const onReset = useCallback(() => {
    if (window.confirm('Reset to default configuration?')) {
      setConfig(defaultSimConfig);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="container py-6 flex justify-between items-center border-b">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            GreenCart Logistics
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Optimize delivery operations with our eco-friendly simulation tool
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleSaveScenario}>
                  <Save className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save current scenario</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleLoadScenario}>
                  <Download className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Load saved scenario</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Management Console</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                View Reports
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Simulation Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main role="main" className="container py-8 space-y-8">
        <div className="prose max-w-none">
          <h2>Delivery Operations Simulator</h2>
          <p>
            Use this tool to experiment with different operational parameters and see their impact
            on key performance indicators. Adjust staffing levels, delivery schedules, and route
            allocations to optimize for both profitability and environmental impact.
          </p>
        </div>

        <KPIGrid kpis={kpis} />

        <section className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 sticky top-4">
            <SimulationControls 
              value={config} 
              onChange={setConfig} 
              onRun={onRun} 
              onReset={onReset}
            />
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
