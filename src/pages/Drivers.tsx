import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Driver {
  id: number;
  name: string;
  status: string;
}

const initialDrivers: Driver[] = [
  { id: 1, name: "John Doe", status: "Active" },
  { id: 2, name: "Jane Smith", status: "Inactive" },
];

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("Active");

  const addDriver = () => {
    if (!newName) return;
    setDrivers([
      ...drivers,
      { id: Date.now(), name: newName, status: newStatus }
    ]);
    setNewName("");
    setNewStatus("Active");
  };

  const removeDriver = (id: number) => {
    setDrivers(drivers.filter(d => d.id !== id));
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
        <select
          value={newStatus}
          onChange={e => setNewStatus(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <Button onClick={addDriver}>Add</Button>
      </div>
      <table className="w-full border rounded">
        <thead>
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map(driver => (
            <tr key={driver.id}>
              <td className="p-2">{driver.name}</td>
              <td className="p-2">{driver.status}</td>
              <td className="p-2">
                <Button variant="outline" onClick={() => removeDriver(driver.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default Drivers;