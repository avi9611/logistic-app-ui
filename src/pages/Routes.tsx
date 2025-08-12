import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Route {
  id: number;
  routeId?: number;
  name: string;
  distance: number;
  traffic?: string;
  baseTime?: number;
}

const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [newName, setNewName] = useState("");
  const [newDistance, setNewDistance] = useState(0);
  const [newTraffic, setNewTraffic] = useState("Low");
  const [newBaseTime, setNewBaseTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/routes")
      .then(res => res.json())
      .then(data => {
        setRoutes(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load routes");
        setLoading(false);
      });
  }, []);

  const addRoute = async () => {
    if (!newName || newDistance <= 0 || newBaseTime <= 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: Date.now(),
          name: newName,
          distance: newDistance,
          traffic: newTraffic,
          baseTime: newBaseTime,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoutes([...routes, data]);
        setNewName("");
        setNewDistance(0);
        setNewTraffic("Low");
        setNewBaseTime(0);
      } else {
        setError(data.error || "Failed to add route");
      }
    } catch {
      setError("Failed to add route");
    }
    setLoading(false);
  };

  const removeRoute = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/routes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setRoutes(routes.filter(r => r.id !== id));
      } else {
        setError(data.error || "Failed to delete route");
      }
    } catch {
      setError("Failed to delete route");
    }
    setLoading(false);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-semibold mb-4">Routes Management</h2>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Route Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Distance (km)"
          value={newDistance}
          onChange={e => setNewDistance(Number(e.target.value))}
        />
        <select
          value={newTraffic}
          onChange={e => setNewTraffic(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <Input
          type="number"
          placeholder="Base Time (min)"
          value={newBaseTime}
          onChange={e => setNewBaseTime(Number(e.target.value))}
        />
        <Button onClick={addRoute} disabled={loading}>Add</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <table className="w-full border rounded">
        <thead>
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Distance (km)</th>
            <th className="text-left p-2">Traffic</th>
            <th className="text-left p-2">Base Time</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map(route => (
            <tr key={route.id}>
              <td className="p-2">{route.name}</td>
              <td className="p-2">{route.distance}</td>
              <td className="p-2">{route.traffic}</td>
              <td className="p-2">{route.baseTime}</td>
              <td className="p-2">
                <Button variant="outline" onClick={() => removeRoute(route.id)} disabled={loading}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <div className="mt-2 text-gray-500">Loading...</div>}
    </Card>
  );
};

export default Routes;