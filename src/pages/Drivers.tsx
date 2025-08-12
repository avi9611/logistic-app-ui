import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Driver {
  id: number;
  name: string;
  shiftHours?: number;
  workHours7d?: number[];
}

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [newName, setNewName] = useState("");
  const [newShiftHours, setNewShiftHours] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch drivers from backend
  useEffect(() => {
    setLoading(true);
    fetch("/drivers")
      .then(res => res.json())
      .then(data => {
        setDrivers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load drivers");
        setLoading(false);
      });
  }, []);

  const addDriver = async () => {
    if (!newName) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, shiftHours: newShiftHours, workHours7d: [6,8,7,7,7,6,10] }),
      });
      const data = await res.json();
      if (res.ok) {
        setDrivers([...drivers, data]);
        setNewName("");
        setNewShiftHours(6);
      } else {
        setError(data.error || "Failed to add driver");
      }
    } catch {
      setError("Failed to add driver");
    }
    setLoading(false);
  };

  const removeDriver = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/drivers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setDrivers(drivers.filter(d => d.id !== id));
      } else {
        setError(data.error || "Failed to delete driver");
      }
    } catch {
      setError("Failed to delete driver");
    }
    setLoading(false);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-semibold mb-4">Drivers Management</h2>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Driver Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Shift Hours"
          value={newShiftHours}
          onChange={e => setNewShiftHours(Number(e.target.value))}
        />
        <Button onClick={addDriver} disabled={loading}>Add</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <table className="w-full border rounded">
        <thead>
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Shift Hours</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map(driver => (
            <tr key={driver.id}>
              <td className="p-2">{driver.name}</td>
              <td className="p-2">{driver.shiftHours}</td>
              <td className="p-2">
                <Button variant="outline" onClick={() => removeDriver(driver.id)} disabled={loading}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <div className="mt-2 text-gray-500">Loading...</div>}
    </Card>
  );
};

export default Drivers;