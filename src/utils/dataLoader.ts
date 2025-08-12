import { Driver, Order, Route } from '@/types/data';

export async function loadDrivers(): Promise<Driver[]> {
  try {
    const response = await fetch('/data/drivers.csv');
    const text = await response.text();
    const lines = text.split('\n').slice(1); // Skip header

    return lines
      .filter(line => line.trim())
      .map(line => {
        const [name, shiftHours, pastWeekHoursStr] = line.split(',');
        const pastWeekHours = pastWeekHoursStr.split('|').map(Number);
        
        return {
          name,
          shiftHours: Number(shiftHours),
          pastWeekHours
        };
      });
  } catch (error) {
    console.error('Error loading drivers:', error);
    return [];
  }
}

export async function loadOrders(): Promise<Order[]> {
  try {
    const response = await fetch('/data/orders.csv');
    const text = await response.text();
    const lines = text.split('\n').slice(1); // Skip header

    return lines
      .filter(line => line.trim())
      .map(line => {
        const [orderId, valueRs, routeId, deliveryTime] = line.split(',');
        
        return {
          orderId: Number(orderId),
          valueRs: Number(valueRs),
          routeId: Number(routeId),
          deliveryTime
        };
      });
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
}

export async function loadRoutes(): Promise<Route[]> {
  try {
    const response = await fetch('/data/routes.csv');
    const text = await response.text();
    const lines = text.split('\n').slice(1); // Skip header

    return lines
      .filter(line => line.trim())
      .map(line => {
        const [routeId, distanceKm, trafficLevel, baseTimeMin] = line.split(',');
        
        return {
          routeId: Number(routeId),
          distanceKm: Number(distanceKm),
          trafficLevel: trafficLevel as 'Low' | 'Medium' | 'High',
          baseTimeMin: Number(baseTimeMin)
        };
      });
  } catch (error) {
    console.error('Error loading routes:', error);
    return [];
  }
}

export function calculateDeliveryMetrics(
  orders: Order[],
  routes: Route[],
  drivers: Driver[]
) {
  // Calculate various metrics
  const totalDeliveries = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.valueRs, 0);
  
  // Map routes to their details for quick lookup
  const routeMap = new Map(routes.map(route => [route.routeId, route]));
  
  // Calculate total distance and delivery times
  const totalDistance = orders.reduce((sum, order) => {
    const route = routeMap.get(order.routeId);
    return sum + (route?.distanceKm || 0);
  }, 0);

  // Calculate on-time deliveries (assuming 90 minutes is the threshold)
  const onTimeDeliveries = orders.filter(order => {
    const [hours, minutes] = order.deliveryTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes <= 90;
  }).length;

  // Calculate average delivery time
  const avgDeliveryTime = orders.reduce((sum, order) => {
    const [hours, minutes] = order.deliveryTime.split(':').map(Number);
    return sum + (hours * 60 + minutes);
  }, 0) / orders.length;

  return {
    totalDeliveries,
    onTimeDeliveries,
    totalValue,
    totalDistance,
    avgDeliveryTime,
    onTimePercentage: (onTimeDeliveries / totalDeliveries) * 100
  };
}

// Calculate performance metrics for each driver
export function calculateDriverPerformance(
  orders: Order[],
  routes: Route[],
  drivers: Driver[]
): Record<string, {
  deliveriesCompleted: number;
  onTimePercentage: number;
  avgDeliveryTime: number;
  totalDistance: number;
  totalValue: number;
}> {
  const driverMetrics: Record<string, any> = {};

  // Initialize metrics for each driver
  drivers.forEach(driver => {
    driverMetrics[driver.name] = {
      deliveriesCompleted: 0,
      onTimeDeliveries: 0,
      totalDeliveryTime: 0,
      totalDistance: 0,
      totalValue: 0
    };
  });

  // Map routes to their details
  const routeMap = new Map(routes.map(route => [route.routeId, route]));

  // Distribute orders among drivers (simple round-robin for demonstration)
  orders.forEach((order, index) => {
    const driverName = drivers[index % drivers.length].name;
    const driverStats = driverMetrics[driverName];
    const route = routeMap.get(order.routeId);

    if (route) {
      driverStats.deliveriesCompleted++;
      driverStats.totalDistance += route.distanceKm;
      driverStats.totalValue += order.valueRs;

      const [hours, minutes] = order.deliveryTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      driverStats.totalDeliveryTime += totalMinutes;

      if (totalMinutes <= 90) {
        driverStats.onTimeDeliveries++;
      }
    }
  });

  // Calculate final metrics for each driver
  Object.keys(driverMetrics).forEach(driverName => {
    const stats = driverMetrics[driverName];
    const finalStats = {
      deliveriesCompleted: stats.deliveriesCompleted,
      onTimePercentage: (stats.onTimeDeliveries / stats.deliveriesCompleted) * 100,
      avgDeliveryTime: stats.totalDeliveryTime / stats.deliveriesCompleted,
      totalDistance: stats.totalDistance,
      totalValue: stats.totalValue
    };
    driverMetrics[driverName] = finalStats;
  });

  return driverMetrics;
}