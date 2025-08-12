import { useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KPIGrid from "@/components/greencart/KPIGrid";
import SimulationControls from "@/components/greencart/SimulationControls";
import ChartsPanel from "@/components/greencart/ChartsPanel";
import {
  defaultSimConfig,
  SimConfig,
  useDeliverySimulation,
} from "@/hooks/useDeliverySimulation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Save, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Index = () => {
  const navigate = useNavigate();
  const [openSimModal, setOpenSimModal] = useState(false);
  const [config, setConfig] = useState<SimConfig>(defaultSimConfig);
  const [simConfig, setSimConfig] = useState<SimConfig>(defaultSimConfig);
  const { points, totals } = useDeliverySimulation(simConfig);
  const [savedScenarios, setSavedScenarios] = useState<{
    [key: string]: SimConfig;
  }>({});

  const [simulationHistory, setSimulationHistory] = useState<
    Array<{
      timestamp: string;
      config: SimConfig;
      kpis: typeof kpis;
      totals: typeof totals;
    }>
  >([]);

  // Decode userId from JWT token
  function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  }
  const userId = getUserIdFromToken();

  // Fetch simulation history from backend
  // Helper to get correct API base URL (strip trailing /api)
  const API_BASE = import.meta.env.VITE_API_URL.replace(/\/api$/, "");

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE}/simulation-history?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSimulationHistory(data);
      });
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Generate report content
  const getReportContent = () => {
    let report = "GreenCart Logistics - Scenario Report\n\n";
    report += "Configuration:\n";
    Object.entries(config).forEach(([key, value]) => {
      report += `${key}: ${JSON.stringify(value)}\n`;
    });
    report += "\nKPIs:\n";
    kpis.forEach((kpi) => {
      report += `${kpi.label}: ${kpi.value}\n`;
      if (kpi.description) report += `  ${kpi.description}\n`;
      if (kpi.sub) report += `  ${kpi.sub}\n`;
    });
    return report;
  };

  // PDF export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(getReportContent(), 10, 10);
    doc.save("scenario-report.pdf");
  };

  // Word export
  const handleExportWord = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun("GreenCart Logistics - Scenario Report")],
            }),
            ...Object.entries(config).map(
              ([key, value]) =>
                new Paragraph({
                  children: [new TextRun(`${key}: ${JSON.stringify(value)}`)],
                })
            ),
            new Paragraph({ children: [new TextRun("")] }),
            ...kpis.map(
              (kpi) =>
                new Paragraph({
                  children: [
                    new TextRun(`${kpi.label}: ${kpi.value}`),
                    kpi.description
                      ? new TextRun(` (${kpi.description})`)
                      : undefined,
                    kpi.sub ? new TextRun(` (${kpi.sub})`) : undefined,
                  ].filter(Boolean),
                })
            ),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scenario-report.docx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const kpis = useMemo(
    () => [
      {
        label: "Deliveries",
        value: totals.deliveries.toLocaleString(),
        description: "Total number of completed deliveries",
      },
      {
        label: "Efficiency Score",
        value:
          config.drivers && config.shiftHours
            ? (
                totals.deliveries /
                (config.drivers * config.shiftHours)
              ).toFixed(2)
            : "N/A",
        description: "Deliveries per driver per hour",
      },
      {
        label: "On-time Rate",
        value: `${Math.round(totals.onTimeRate * 100)}%`,
        description: "Percentage of deliveries completed within target time",
      },
      {
        label: "Revenue",
        value: `$${Math.round(totals.revenue).toLocaleString()}`,
        description: "Total earnings from completed deliveries",
      },
      {
        label: "Wages",
        value: `$${Math.round(totals.wages).toLocaleString()}`,
        description: "Total cost of delivery staff wages",
      },
      {
        label: "Total Profit",
        value: `$${Math.round(totals.profit).toLocaleString()}`,
        sub: `Energy Cost: $${Math.round(totals.energyCost)}`,
        description: "Revenue minus wages and energy costs",
      },
    ],
    [totals]
  );

  const onRun = useCallback(() => {
    setSimConfig(config);
    setOpenSimModal(false);
    const entry = {
      timestamp: new Date().toLocaleString(),
      config,
      kpis,
      totals,
    };
    if (userId) {
      fetch(`${API_BASE}/simulation-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, userId }),
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to save simulation history");
          return res.json();
        })
        .then(saved => {
          setSimulationHistory(prev => [saved, ...prev]);
        })
        .catch(err => {
          // Optionally show error to user
          console.error("Simulation history save error:", err);
        });
    } else {
      setSimulationHistory(prev => [entry, ...prev]);
    }
    // Removed scenario save logic
  }, [config, kpis, totals, userId]);

  const onReset = useCallback(() => {
    if (window.confirm("Reset to default configuration?")) {
      setConfig(defaultSimConfig);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full bg-gradient-to-r from-green-100 via-green-50 to-transparent shadow-sm">
        <div className="container py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-green-900 drop-shadow">
              GreenCart Logistics
            </h1>
            <p className="mt-2 text-muted-foreground max-w-2xl text-lg">
              Optimize delivery operations with our eco-friendly simulation tool
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                </TooltipTrigger>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleExportPDF}
                    className="bg-white shadow hover:bg-green-50"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PDF report</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleExportWord}
                    className="bg-white shadow hover:bg-green-50"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download Word report</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white shadow hover:bg-green-50"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main role="main" className="container py-10 space-y-10">
        <div className="prose max-w-none mb-6">
          <h2 className="text-2xl font-semibold text-green-800">
            Delivery Operations Simulator
          </h2>
          <p className="text-base text-muted-foreground">
            Use this tool to experiment with different operational parameters
            and see their impact on key performance indicators. Adjust staffing
            levels, delivery schedules, and route allocations to optimize for
            both profitability and environmental impact.
          </p>
        </div>

        <div className="mb-8">
          <Dialog open={openSimModal} onOpenChange={setOpenSimModal}>
            <DialogTrigger asChild>
              <Button variant="default" size="lg" className="w-full mb-4">
                Run Simulation
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-h-[90vh] max-w-2xl w-full overflow-y-auto scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              <DialogHeader>
                <DialogTitle>Simulation Controls</DialogTitle>
              </DialogHeader>
              <SimulationControls
                value={config}
                onChange={setConfig}
                onRun={onRun}
                onReset={onReset}
              />
              <DialogClose asChild>
                <Button variant="outline" className="mt-4 w-full">
                  Cancel
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-stretch">
          <div className="md:col-span-2 h-full">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
              <h3 className="text-lg font-bold mb-4 text-green-700">
                Key Performance Indicators
              </h3>
              <KPIGrid kpis={kpis} />
            </div>
          </div>
          <div className="md:col-span-2 h-full">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
              <h3 className="text-lg font-bold mb-4 text-green-700">
                Performance Charts
              </h3>
              <ChartsPanel data={points} />
            </div>
          </div>
        </div>
      </main>
      <div className="container pb-10">
        <h2 className="text-xl font-semibold text-green-800 mb-4">
          Simulation History
        </h2>
        {simulationHistory.length === 0 ? (
          <p className="text-muted-foreground">No simulations run yet.</p>
        ) : (
          <div className="space-y-8">
            {simulationHistory.map((entry, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow p-6 border border-green-100"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-green-700 text-lg">
                    Run #{idx + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.timestamp}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="font-semibold text-green-800 block mb-2">
                    Configuration
                  </span>
                  <table className="w-full text-sm border border-gray-200 rounded overflow-hidden mb-2">
                    <tbody>
                      {Object.entries(entry.config).map(([key, value]) => (
                        <tr key={key} className="border-b last:border-b-0">
                          <td className="py-1 px-2 font-medium text-green-900 bg-green-50 w-1/3">
                            {key}
                          </td>
                          <td className="py-1 px-2">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <span className="font-semibold text-green-800 block mb-2">
                    KPIs
                  </span>
                  <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
                    <tbody>
                      {entry.kpis.map((kpi: any, kpiIdx: number) => (
                        <tr key={kpiIdx} className="border-b last:border-b-0">
                          <td className="py-1 px-2 font-medium text-green-900 bg-green-50 w-1/3">
                            {kpi.label}
                          </td>
                          <td className="py-1 px-2">{kpi.value}</td>
                          <td className="py-1 px-2 text-muted-foreground">
                            {kpi.description}
                            {kpi.sub && (
                              <span className="ml-2 text-xs text-green-700">
                                ({kpi.sub})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
