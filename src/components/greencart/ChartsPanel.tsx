import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

interface SimulationPoint {
  timestamp: string;
  deliveries: number;
  onTimeRate: number;
  revenue: number;
  energyCost: number;
}

interface ChartsPanelProps {
  data: SimulationPoint[];
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatCurrency = (value: number) => {
  return `$${value.toLocaleString()}`;
};

const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

const ChartsPanel = ({ data }: ChartsPanelProps) => {
  const chartHeight = 300;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
      
      <Tabs defaultValue="deliveries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="ontime">On-time Rate</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="mt-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Number of deliveries completed per hour
            </p>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTime}
                    interval="preserveStartEnd"
                  >
                    <Label value="Time of Day" offset={-5} position="insideBottom" />
                  </XAxis>
                  <YAxis>
                    <Label value="Deliveries" angle={-90} position="insideLeft" />
                  </YAxis>
                  <Tooltip 
                    formatter={(value: number) => [value, "Deliveries"]}
                    labelFormatter={formatTime}
                  />
                  <Line
                    type="monotone"
                    dataKey="deliveries"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ontime" className="mt-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Percentage of deliveries completed within target time window
            </p>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTime}
                    interval="preserveStartEnd"
                  >
                    <Label value="Time of Day" offset={-5} position="insideBottom" />
                  </XAxis>
                  <YAxis 
                    tickFormatter={formatPercentage}
                    domain={[0.6, 1]}
                  >
                    <Label value="On-time Rate" angle={-90} position="insideLeft" />
                  </YAxis>
                  <Tooltip 
                    formatter={(value: number) => [formatPercentage(value), "On-time Rate"]}
                    labelFormatter={formatTime}
                  />
                  <Line
                    type="monotone"
                    dataKey="onTimeRate"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Revenue and energy costs per hour
            </p>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTime}
                    interval="preserveStartEnd"
                  >
                    <Label value="Time of Day" offset={-5} position="insideBottom" />
                  </XAxis>
                  <YAxis
                    tickFormatter={formatCurrency}
                  >
                    <Label value="Amount ($)" angle={-90} position="insideLeft" />
                  </YAxis>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Amount"]}
                    labelFormatter={formatTime}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="energyCost"
                    name="Energy Cost"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded" />
                <span className="text-sm">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded" />
                <span className="text-sm">Energy Cost</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChartsPanel;
