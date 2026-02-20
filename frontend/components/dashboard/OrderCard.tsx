"use client"

import { Button } from "@/components/ui/Button";


interface OrderCardProps {
    order: any;
}

export function OrderCard({ order }: OrderCardProps) {
    const statusColors: any = {
        pending: "bg-yellow-100 text-yellow-800",
        processing: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
    };

    const statusLabels: any = {
        pending: "En attente",
        processing: "En cours",
        completed: "Livré",
        cancelled: "Annulé",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">
                        {order.instructions[0]?.enterprise_name || "Projet Sans Nom"}
                    </h3>
                    <p className="text-sm text-gray-500">Commande #{order.id} • {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                    {statusLabels[order.status] || order.status}
                </span>
            </div>

            <div className="flex gap-4 mb-4">
                {order.template?.sector?.name && (
                    <div className="px-3 py-1 bg-gray-50 rounded text-xs text-gray-600">
                        Secteur : {order.template.sector.name}
                    </div>
                )}
                {order.template?.name && (
                    <div className="px-3 py-1 bg-gray-50 rounded text-xs text-gray-600">
                        Template : {order.template.name}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center border-t pt-4">
                <span className="font-bold text-lg">{order.price} €</span>
                <Button variant="outline" size="sm">Détails</Button>
            </div>
        </div>
    );
}
