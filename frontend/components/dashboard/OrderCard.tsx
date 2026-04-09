"use client"

import { Order } from '@/services/business.service';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
}

const statusConfig = {
  pending:    { label: 'En attente',    classes: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-400' },
  processing: { label: 'En cours',      classes: 'bg-blue-50 text-blue-700',      dot: 'bg-blue-400' },
  completed:  { label: 'Livré',         classes: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
  cancelled:  { label: 'Annulé',        classes: 'bg-red-50 text-red-700',        dot: 'bg-red-400' },
};

export function OrderCard({ order }: OrderCardProps) {
  const cfg = statusConfig[order.status] || { label: order.status, classes: 'bg-gray-50 text-gray-600', dot: 'bg-gray-400' };
  const name = order.instruction?.enterprise_name || order.instructions?.[0]?.enterprise_name || 'Projet sans nom';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-semibold text-black">{name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            #{String(order.id).padStart(4, '0')}
            {order.template?.name && ` · ${order.template.name}`}
          </p>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0", cfg.classes)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      {(order.template?.sector?.name || order.template?.name) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {order.template.sector?.name && (
            <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{order.template.sector.name}</span>
          )}
          {order.template.name && (
            <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{order.template.name}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm font-black text-black">{order.price.toLocaleString('fr-FR')} FCFA</span>
        <span className="text-xs text-gray-400">
          {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
