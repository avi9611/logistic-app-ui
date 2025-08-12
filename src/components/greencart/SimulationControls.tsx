import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SimConfig } from "@/hooks/useDeliverySimulation";
import { useState } from "react";

export default function SimulationControls({
  value,
  onChange,
  onRun,
  onReset,
}: {
  value: SimConfig;
  onChange: (cfg: SimConfig) => void;
  onRun: () => void;
  onReset: () => void;
}) {
  const [local, setLocal] = useState<SimConfig>(value);

  const set = (k: keyof SimConfig, v: number) => {
    const next = { ...local, [k]: v } as SimConfig;
    setLocal(next);
    onChange(next);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Simulation Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="drivers">Drivers: {local.drivers}</Label>
            <Slider id="drivers" min={5} max={200} step={1} value={[local.drivers]} onValueChange={([v]) => set("drivers", v)} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="shift">Shift Hours: {local.shiftHours}h</Label>
            <Slider id="shift" min={6} max={16} step={1} value={[local.shiftHours]} onValueChange={([v]) => set("shiftHours", v)} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="orders">Base Orders/hour: {local.hourlyOrders}</Label>
            <Slider id="orders" min={50} max={600} step={10} value={[local.hourlyOrders]} onValueChange={([v]) => set("hourlyOrders", v)} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="speed">Avg Speed: {local.avgSpeedKmh} km/h</Label>
            <Slider id="speed" min={10} max={40} step={1} value={[local.avgSpeedKmh]} onValueChange={([v]) => set("avgSpeedKmh", v)} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="ev">EV Fleet Share: {Math.round(local.evShare * 100)}%</Label>
            <Slider id="ev" min={0} max={1} step={0.05} value={[local.evShare]} onValueChange={([v]) => set("evShare", v)} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="price">Price per Delivery ($)</Label>
            <Input id="price" type="number" inputMode="decimal" value={local.basePricePerDelivery}
              onChange={(e) => set("basePricePerDelivery", parseFloat(e.target.value) || 0)} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="wage">Wage per Hour ($)</Label>
            <Input id="wage" type="number" inputMode="decimal" value={local.wagePerHour}
              onChange={(e) => set("wagePerHour", parseFloat(e.target.value) || 0)} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="km">Km per Delivery</Label>
            <Input id="km" type="number" inputMode="decimal" value={local.kmPerDelivery}
              onChange={(e) => set("kmPerDelivery", parseFloat(e.target.value) || 0)} />
          </div>

          <div className="space-y-3">
            <Label htmlFor="cong">Peak Congestion</Label>
            <div className="flex items-center gap-3">
              <Switch id="cong" checked={local.congestionFactor > 1} onCheckedChange={(c) => set("congestionFactor", c ? 1.25 : 1)} />
              <span className="text-sm text-muted-foreground">{local.congestionFactor.toFixed(2)}x</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="seed">Random Seed</Label>
            <Input id="seed" type="number" value={local.seed}
              onChange={(e) => set("seed", parseInt(e.target.value || "0", 10))} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={onRun}>Run Simulation</Button>
          <Button variant="secondary" onClick={onReset}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}
