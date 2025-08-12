import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface KPI {
  label: string;
  value: string;
  sub?: string;
  description?: string;
}

interface KPIGridProps {
  kpis: KPI[];
}

const KPIGrid = ({ kpis }: KPIGridProps) => {
  // Define color classes based on KPI type
  const getKPIColor = (label: string, value: string) => {
    switch (label) {
      case "On-time Rate":
        const rate = parseFloat(value);
        return rate >= 90 ? "text-green-600" : rate >= 75 ? "text-yellow-600" : "text-red-600";
      case "Net Profit":
        return value.includes("-") ? "text-red-600" : "text-green-600";
      case "CO₂ Saved":
        return "text-green-600";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="p-6 hover:shadow-md transition-shadow cursor-help">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      {kpi.label}
                      <Info className="h-4 w-4 text-gray-400" />
                    </h3>
                    <div className={`text-2xl font-bold ${getKPIColor(kpi.label, kpi.value)}`}>
                      {kpi.value}
                    </div>
                    {kpi.sub && (
                      <div className="text-sm text-gray-500">
                        {kpi.sub}
                      </div>
                    )}
                  </div>

                  {/* Visual indicator for trends (placeholder) */}
                  <div className="text-sm font-medium">
                    {kpi.label === "On-time Rate" && parseFloat(kpi.value) >= 90 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Target Met
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs p-4">
              <p className="text-sm">{kpi.description}</p>
              {kpi.label === "Net Profit" && (
                <div className="mt-2 text-xs text-gray-500">
                  This metric accounts for operational costs including wages and energy consumption.
                  Positive values indicate sustainable operations.
                </div>
              )}
              {kpi.label === "CO₂ Saved" && (
                <div className="mt-2 text-xs text-gray-500">
                  Calculated based on eco-friendly vehicle usage vs traditional delivery methods.
                  Higher values indicate better environmental impact.
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default KPIGrid;
