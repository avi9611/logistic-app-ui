import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { SimConfig } from "@/hooks/useDeliverySimulation";

type ExtendedSimConfig = SimConfig & { startHour?: number };
import { PlayCircle, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SimulationControlsProps {
  value: ExtendedSimConfig;
  onChange: (config: ExtendedSimConfig) => void;
  onRun: () => void;
  onReset: () => void;
}

const SimulationControls = ({
  value,
  onChange,
  onRun,
  onReset,
}: SimulationControlsProps) => {
  const handleChange = (key: keyof ExtendedSimConfig, newValue: number | string) => {
    onChange({ ...value, [key]: Number(newValue) });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Simulation Parameters</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Adjust these parameters to simulate different operational scenarios
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="staffing">
          <AccordionItem value="staffing">
            <AccordionTrigger>Staffing & Shifts</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="drivers">Number of Drivers</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="drivers"
                    min={1}
                    max={50}
                    step={1}
                    value={[value.drivers]}
                    onValueChange={(v) => handleChange("drivers", v[0])}
                  />
                  <span className="w-12 text-right">{value.drivers}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 15-30 drivers for optimal coverage
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startHour">Simulation Start Time</Label>
                <Select
                  value={value.startHour?.toString() ?? "8"}
                  onValueChange={(v) => handleChange("startHour", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6:00 AM</SelectItem>
                    <SelectItem value="7">7:00 AM</SelectItem>
                    <SelectItem value="8">8:00 AM</SelectItem>
                    <SelectItem value="9">9:00 AM</SelectItem>
                    <SelectItem value="10">10:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Shift Duration (hours)</Label>
                <Select
                  value={value.shiftHours.toString()}
                  onValueChange={(v) => handleChange("shiftHours", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="8">8 hours (standard)</SelectItem>
                    <SelectItem value="10">10 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="delivery">
            <AccordionTrigger>Delivery Parameters</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxDeliveries">Max Deliveries per Route</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="maxDeliveries"
                    min={5}
                    max={30}
                    step={1}
                    value={[value.maxDeliveriesPerRoute]}
                    onValueChange={(v) => handleChange("maxDeliveriesPerRoute", v[0])}
                  />
                  <span className="w-12 text-right">{value.maxDeliveriesPerRoute}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance between efficiency and delivery times
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeWindow">Delivery Time Window (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="timeWindow"
                    min={30}
                    max={180}
                    step={15}
                    value={[value.deliveryTimeWindow]}
                    onValueChange={(v) => handleChange("deliveryTimeWindow", v[0])}
                  />
                  <span className="w-12 text-right">{value.deliveryTimeWindow}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="eco">
            <AccordionTrigger>Eco-Friendly Settings</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="evRatio">Electric Vehicle Ratio (%)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="evRatio"
                    min={0}
                    max={100}
                    step={10}
                    value={[value.evRatio]}
                    onValueChange={(v) => handleChange("evRatio", v[0])}
                  />
                  <span className="w-12 text-right">{value.evRatio}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Higher EV ratio reduces emissions but affects upfront costs
                </p>
              </div>

              <div className="space-y-2">
                <Label>Route Optimization Priority</Label>
                <Select
                  value={value.routeOptimization.toString()}
                  onValueChange={(v) => handleChange("routeOptimization", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Time Efficiency</SelectItem>
                    <SelectItem value="2">Balanced</SelectItem>
                    <SelectItem value="3">Eco-Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-2">
          <Button onClick={onRun} className="flex-1">
            <PlayCircle className="w-4 h-4 mr-2" />
            Run Simulation
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SimulationControls;
