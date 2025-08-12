import { useState, useEffect } from 'react';

export interface SimConfig {
  drivers: number;
  shiftHours: number;
  maxDeliveriesPerRoute: number;
  deliveryTimeWindow: number;
  evRatio: number;
  routeOptimization: number;
}

export const defaultSimConfig: SimConfig = {
  drivers: 15,
  shiftHours: 8,
  maxDeliveriesPerRoute: 12,
  deliveryTimeWindow: 60,
  evRatio: 50,
  routeOptimization: 2, // 1: Time, 2: Balanced, 3: Eco
};

interface SimulationPoint {
  timestamp: string;
  deliveries: number;
  onTimeRate: number;
  revenue: number;
  energyCost: number;
}

interface SimulationTotals {
  deliveries: number;
  onTimeRate: number;
  revenue: number;
  wages: number;
  energyCost: number;
  profit: number;
  co2SavedKg: number;
}

const HOURLY_WAGE = 25;
const DELIVERY_FEE = 15;
const EV_ENERGY_COST = 0.05; // per km
const GAS_ENERGY_COST = 0.15; // per km
const AVG_ROUTE_LENGTH = 50; // km
const CO2_PER_GAS_KM = 0.2; // kg

export function useDeliverySimulation(config: SimConfig) {
  const [points, setPoints] = useState<SimulationPoint[]>([]);
  const [totals, setTotals] = useState<SimulationTotals>({
    deliveries: 0,
    onTimeRate: 0,
    revenue: 0,
    wages: 0,
    energyCost: 0,
    profit: 0,
    co2SavedKg: 0,
  });

  useEffect(() => {
    // Simulate delivery operations
    const timeWindow = 12; // hours to simulate
    const newPoints: SimulationPoint[] = [];
    let totalDeliveries = 0;
    let totalOnTime = 0;

    for (let hour = 0; hour < timeWindow; hour++) {
      // Calculate deliveries based on drivers and route optimization
      const baseDeliveries = config.drivers * (config.maxDeliveriesPerRoute / config.shiftHours);
      const routeEfficiency = 1 + (3 - config.routeOptimization) * 0.1;
      const hourlyDeliveries = Math.round(baseDeliveries * routeEfficiency);

      // Calculate on-time rate based on time window and route optimization
      const baseOnTimeRate = 0.8;
      const timeWindowFactor = config.deliveryTimeWindow / 60;
      const onTimeRate = Math.min(
        0.98,
        baseOnTimeRate + timeWindowFactor * 0.1 + (3 - config.routeOptimization) * 0.05
      );

      totalDeliveries += hourlyDeliveries;
      totalOnTime += hourlyDeliveries * onTimeRate;

      const timestamp = new Date(2025, 0, 1, 8 + hour).toISOString();
      newPoints.push({
        timestamp,
        deliveries: hourlyDeliveries,
        onTimeRate: onTimeRate,
        revenue: hourlyDeliveries * DELIVERY_FEE,
        energyCost: calculateEnergyCost(hourlyDeliveries, config.evRatio),
      });
    }

    const revenue = totalDeliveries * DELIVERY_FEE;
    const wages = config.drivers * config.shiftHours * HOURLY_WAGE;
    const totalEnergyCost = calculateEnergyCost(totalDeliveries, config.evRatio);
    const co2Saved = calculateCO2Savings(totalDeliveries, config.evRatio);

    setPoints(newPoints);
    setTotals({
      deliveries: totalDeliveries,
      onTimeRate: totalOnTime / totalDeliveries,
      revenue: revenue,
      wages: wages,
      energyCost: totalEnergyCost,
      profit: revenue - wages - totalEnergyCost,
      co2SavedKg: co2Saved,
    });
  }, [config]);

  return { points, totals };
}

function calculateEnergyCost(deliveries: number, evRatio: number): number {
  const totalDistance = deliveries * AVG_ROUTE_LENGTH;
  const evDistance = totalDistance * (evRatio / 100);
  const gasDistance = totalDistance * (1 - evRatio / 100);
  
  return evDistance * EV_ENERGY_COST + gasDistance * GAS_ENERGY_COST;
}

function calculateCO2Savings(deliveries: number, evRatio: number): number {
  const totalDistance = deliveries * AVG_ROUTE_LENGTH;
  const gasDistance = totalDistance * (1 - evRatio / 100);
  const standardCO2 = totalDistance * CO2_PER_GAS_KM;
  const actualCO2 = gasDistance * CO2_PER_GAS_KM;
  
  return standardCO2 - actualCO2;
}
