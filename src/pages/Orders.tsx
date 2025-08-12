import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Order {
  id: number;
  customer: string;
  route: string;
  status: string;
}

const initialOrders: Order[] = [
  { id: 1, customer: "Acme Corp", route: "Central Loop", status: "Pending" },
  { id: 2, customer: "Beta Ltd", route: "North Express", status: "Delivered" },
];

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [newCustomer, setNewCustomer] = useState("");
  const [newRoute, setNewRoute] = useState("");
  const [newStatus, setNewStatus] = useState("Pending");

  const addOrder = () => {
    if (!newCustomer || !newRoute) return;
    setOrders([
      ...orders,
      { id: Date.now(), customer: newCustomer, route: newRoute, status: newStatus }
    ]);
    setNewCustomer("");
    setNewRoute("");
    setNewStatus("Pending");
  };

  const removeOrder = (id: number) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-semibold mb-4">Orders Management</h2>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Customer Name"
          value={newCustomer}
          onChange={e => setNewCustomer(e.target.value)}
        />
        <Input
          placeholder="Route"
          value={newRoute}
          onChange={e => setNewRoute(e.target.value)}
        />
        <select
          value={newStatus}
          onChange={e => setNewStatus(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <Button onClick={addOrder}>Add</Button>
      </div>
      <table className="w-full border rounded">
        <thead>
          <tr>
            <th className="text-left p-2">Customer</th>
            <th className="text-left p-2">Route</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td className="p-2">{order.customer}</td>
              <td className="p-2">{order.route}</td>
              <td className="p-2">{order.status}</td>
              <td className="p-2">
                <Button variant="outline" onClick={() => removeOrder(order.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default Orders;