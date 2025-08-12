import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Route {
  id: number;
  name: string;
  distance: number;
}

const initialRoutes: Route[] = [
  { id: 1, name: "Central Loop", distance: 12 },
  { id: 2, name: "North Express", distance: 25 },
];

const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [newName, setNewName] = useState("");
  const [newDistance, setNewDistance] = useState(0);

  const addRoute = () => {
    if (!newName || newDistance <= 0) return;
    setRoutes([
      ...routes,
      { id: Date.now(), name: newName, distance: newDistance }
    ]);
    setNewName("");
    setNewDistance(0);
  };

  const removeRoute = (id: number) => {
    setRoutes(routes.filter(r => r.id !== id));
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
        <Button onClick={addRoute}>Add</Button>
      </div>
      <table className="w-full border rounded">
        <thead>
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Distance (km)</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routes.map(route => (
            <tr key={route.id}>
              <td className="p-2">{route.name}</td>
              <td className="p-2">{route.distance}</td>
              <td className="p-2">
                <Button variant="outline" onClick={() => removeRoute(route.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default Routes;