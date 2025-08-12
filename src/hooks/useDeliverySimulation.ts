import { useMemo } from "react";

export type SimConfig = {
  drivers: number;
  shiftHours: number;
  hourlyOrders: number; // base demand per hour
  avgSpeedKmh: number;
  evShare: number; // 0-1
  basePricePerDelivery: number;
  wagePerHour: number;
  overtimeMultiplier: number; // e.g. 1.5
  fuelCostPerLitre: number;
  evEnergyCostPerKwh: number;
  kmPerDelivery: number; // avg distance per delivery
  iceKmPerLitre: number;
  evKwhPerKm: number;
  co2KgPerLitre: number;
  congestionFactor: number; // >1 slower during peak
  onTimeThresholdMinutes: number;
  maintenanceCostPerKm: number;
  seed: number;
};

export type TimePoint = {
  hour: number;
  demand: number;
  capacity: number;
  deliveries: number;
  onTimeRate: number; // 0-1
  utilization: number; // 0-1
  km: number;
  evDeliveries: number;
};

export type SimResult = {
  points: TimePoint[];
  totals: {
    deliveries: number;
    onTimeRate: number; // weighted
    km: number;
    revenue: number;
    wages: number;
    energyCost: number;
    maintenance: number;
    profit: number;
    co2SavedKg: number;
    avgUtilization: number;
  };
};

function createRng(seed: number) {
  // xorshift32
  let x = seed || 123456789;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1_000_000) / 1_000_000;
  };
}

export const defaultSimConfig: SimConfig = {
  drivers: 25,
  shiftHours: 10,
  hourlyOrders: 200,
  avgSpeedKmh: 22,
  evShare: 0.6,
  basePricePerDelivery: 7.5,
  wagePerHour: 20,
  overtimeMultiplier: 1.5,
  fuelCostPerLitre: 1.8,
  evEnergyCostPerKwh: 0.22,
  kmPerDelivery: 3.2,
  iceKmPerLitre: 14,
  evKwhPerKm: 0.14,
  co2KgPerLitre: 2.31,
  congestionFactor: 1.25,
  onTimeThresholdMinutes: 45,
  maintenanceCostPerKm: 0.06,
  seed: 42,
};

export function simulate(config: SimConfig): SimResult {
  const rng = createRng(Math.floor(config.seed));

  const handlingMinutes = 5; // pickup/dropoff overhead
  const baseMinutesPerDelivery = (config.kmPerDelivery / config.avgSpeedKmh) * 60 + handlingMinutes;
  const capPerDriverPerHour = Math.max(1, 60 / baseMinutesPerDelivery);

  const hours = Array.from({ length: config.shiftHours }, (_, i) => i);

  const points: TimePoint[] = hours.map((h) => {
    // Demand with daily shape: peak around midday
    const peak = Math.exp(-Math.pow((h - config.shiftHours / 2) / 2.2, 2));
    const noise = (rng() - 0.5) * 0.2; // +/-20%
    const demand = Math.max(0, Math.round(config.hourlyOrders * (0.7 + 0.6 * peak) * (1 + noise)));

    // Congestion reduces effective speed in mid-day window
    const isPeak = h >= Math.floor(config.shiftHours * 0.35) && h <= Math.ceil(config.shiftHours * 0.7);
    const effectiveMinutes = baseMinutesPerDelivery * (isPeak ? config.congestionFactor : 1);
    const effectiveCap = Math.max(1, 60 / effectiveMinutes);

    const capacity = Math.floor(config.drivers * effectiveCap);
    const deliveries = Math.min(demand, capacity);
    const utilization = Math.min(1, deliveries / Math.max(1, capacity));

    // On-time rate: degrades if utilization > 90% or during peak
    const pressure = utilization > 0.9 ? (utilization - 0.9) * 5 : 0; // up to ~0.5
    const onTimeBase = 0.98 - pressure - (isPeak ? 0.05 : 0);
    const onTimeRate = Math.max(0.6, Math.min(1, onTimeBase));

    const km = deliveries * config.kmPerDelivery;
    const evDeliveries = Math.round(deliveries * config.evShare);

    return { hour: h, demand, capacity, deliveries, onTimeRate, utilization, km, evDeliveries };
  });

  const totalsDeliveries = points.reduce((s, p) => s + p.deliveries, 0);
  const weightedOnTime = points.reduce((s, p) => s + p.onTimeRate * p.deliveries, 0) / Math.max(1, totalsDeliveries);
  const totalKm = points.reduce((s, p) => s + p.km, 0);
  const avgUtil = points.reduce((s, p) => s + p.utilization, 0) / Math.max(1, points.length);

  // Time required to complete delivered volume
  const timeRequiredHours = totalsDeliveries / (config.drivers * capPerDriverPerHour);
  const baseHours = config.shiftHours;
  const extraHours = Math.max(0, timeRequiredHours - baseHours);

  const baseWages = config.drivers * baseHours * config.wagePerHour;
  const overtimeWages = config.drivers * extraHours * config.wagePerHour * config.overtimeMultiplier;
  const wages = baseWages + overtimeWages;

  const evKm = totalKm * config.evShare;
  const iceKm = totalKm - evKm;

  const fuelLitres = iceKm / config.iceKmPerLitre;
  const fuelCost = fuelLitres * config.fuelCostPerLitre;

  const evKwh = evKm * config.evKwhPerKm;
  const evEnergyCost = evKwh * config.evEnergyCostPerKwh;

  const maintenance = totalKm * config.maintenanceCostPerKm;

  const energyCost = fuelCost + evEnergyCost;
  const revenue = totalsDeliveries * config.basePricePerDelivery;
  const profit = revenue - wages - energyCost - maintenance;

  const iceCo2PerKm = config.co2KgPerLitre / config.iceKmPerLitre;
  const co2SavedKg = evKm * iceCo2PerKm; // EV assumed 0 tailpipe

  return {
    points,
    totals: {
      deliveries: totalsDeliveries,
      onTimeRate: Number.isFinite(weightedOnTime) ? weightedOnTime : 0,
      km: totalKm,
      revenue,
      wages,
      energyCost,
      maintenance,
      profit,
      co2SavedKg,
      avgUtilization: avgUtil,
    },
  };
}

export function useDeliverySimulation(config: SimConfig) {
  const result = useMemo(() => simulate(config), [JSON.stringify(config)]);
  return result;
}
