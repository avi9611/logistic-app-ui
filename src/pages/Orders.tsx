import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Order {
  id: number;
  orderId?: number;
  valueRs?: number;
  routeId?: number;
  deliveryTimestamp?: string;
  assignedDriverId?: number;
  status: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [newValueRs, setNewValueRs] = useState(0);
  const [newRouteId, setNewRouteId] = useState(1);
  const [newDeliveryTimestamp, setNewDeliveryTimestamp] = useState("");
  const [newStatus, setNewStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders");
        setLoading(false);
      });
  }, []);

  const addOrder = async () => {
    if (newValueRs <= 0 || !newDeliveryTimestamp) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: Date.now(),
          valueRs: newValueRs,
          routeId: newRouteId,
          deliveryTimestamp: newDeliveryTimestamp,
          assignedDriverId: null,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders([...orders, data]);
        setNewValueRs(0);
        setNewRouteId(1);
        setNewDeliveryTimestamp("");
        setNewStatus("Pending");
      } else {
        setError(data.error || "Failed to add order");
      }
    } catch {
      setError("Failed to add order");
    }
    setLoading(false);
  };

  const removeOrder = async (id: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/orders/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
      } else {
        setError(data.error || "Failed to delete order");
      }
    } catch {
      setError("Failed to delete order");
    }
    setLoading(false);
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-xl font-semibold mb-4">Orders Management</h2>
      <div className="mb-4 flex gap-2">
        <Input
          type="number"
          placeholder="Order Value (₹)"
          value={newValueRs}
          onChange={e => setNewValueRs(Number(e.target.value))}
        />
        <Input
          type="number"
          placeholder="Route ID"
          value={newRouteId}
          onChange={e => setNewRouteId(Number(e.target.value))}
        />
        <Input
          type="time"
          placeholder="Delivery Time"
          value={newDeliveryTimestamp}
          onChange={e => setNewDeliveryTimestamp(e.target.value)}
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
        <Button onClick={addOrder} disabled={loading}>Add</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <table className="w-full border rounded">
        <thead>
          <tr>
            <th className="text-left p-2">Order Value (₹)</th>
            <th className="text-left p-2">Route ID</th>
            <th className="text-left p-2">Delivery Time</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td className="p-2">{order.valueRs}</td>
              <td className="p-2">{order.routeId}</td>
              <td className="p-2">{order.deliveryTimestamp}</td>
              <td className="p-2">{order.status}</td>
              <td className="p-2">
                <Button variant="outline" onClick={() => removeOrder(order.id)} disabled={loading}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <div className="mt-2 text-gray-500">Loading...</div>}
    </Card>
  );
};

export default Orders;