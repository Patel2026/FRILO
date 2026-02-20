"use client"

import { useEffect, useState } from "react";
import { businessService } from "@/services/business.service";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await businessService.getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-frilo-blue" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore de commande.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
