import { useCallback, useMemo, useState } from "react";
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSaveScenario = () => {
    const name = prompt("Enter a name for this scenario:");
    if (name) {
      const scenarios = { ...savedScenarios, [name]: config };
      setSavedScenarios(scenarios);
      localStorage.setItem("scenarios", JSON.stringify(scenarios));
    }
  };

  const handleLoadScenario = () => {
    const scenarios = JSON.parse(localStorage.getItem("scenarios") || "{}");
    const name = Object.keys(scenarios)[0];
    if (name) {
      setConfig(scenarios[name]);
    }
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
                  children: [
                    new TextRun(`${key}: ${JSON.stringify(value)}`),
                  ],
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
        label: "Net Profit",
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
    // Save current scenario state
    const scenarios = JSON.parse(localStorage.getItem("scenarios") || "{}");
    localStorage.setItem(
      "scenarios",
      JSON.stringify({
        ...scenarios,
        "Last Run": config,
      })
    );
  }, [config]);

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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSaveScenario}
                    className="bg-white shadow hover:bg-green-50"
                  >
                    <Save className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save current scenario</TooltipContent>
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLoadScenario}
                    className="bg-white shadow hover:bg-green-50"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Load saved scenario</TooltipContent>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-bold mb-4 text-green-700">
                Key Performance Indicators
              </h3>
              <KPIGrid kpis={kpis} />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Dialog open={openSimModal} onOpenChange={setOpenSimModal}>
                <DialogTrigger asChild>
                  <Button variant="default" size="lg" className="w-full mb-4">
                    Adjust Simulation
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
          </div>
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
              <h3 className="text-lg font-bold mb-4 text-green-700">
                Performance Charts
              </h3>
              <ChartsPanel data={points} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
