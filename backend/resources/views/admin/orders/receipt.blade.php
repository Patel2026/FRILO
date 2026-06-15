<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reçu FRILO - Commande #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</title>
    <style>
        body { color: #111827; font-family: Arial, sans-serif; margin: 32px; }
        .header { align-items: flex-start; display: flex; justify-content: space-between; margin-bottom: 32px; }
        .brand { font-size: 28px; font-weight: 700; }
        .muted { color: #6b7280; }
        table { border-collapse: collapse; margin-top: 24px; width: 100%; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 12px 0; text-align: left; }
        th:last-child, td:last-child { text-align: right; }
        .total { font-size: 20px; font-weight: 700; }
        .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
        @media print { button { display: none; } body { margin: 20mm; } }
    </style>
</head>
<body>
    @php
        $optionsTotal = (int) $order->options->sum(fn($option) => (int) $option->pivot->price_snapshot);
        $basePrice = max(0, (int) $order->price - $optionsTotal);
        $paidTotal = (int) $order->payments->whereIn('status', ['approved', 'paid', 'completed'])->sum('amount');
    @endphp

    <button onclick="window.print()">Imprimer</button>

    <div class="header">
        <div>
            <div class="brand">Reçu FRILO</div>
            <p class="muted">Commande #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</p>
        </div>
        <div class="box">
            <strong>Date :</strong> {{ now()->format('d/m/Y') }}<br>
            <strong>Statut paiement :</strong> {{ $order->payment_status->label() }}<br>
            <strong>Référence :</strong> {{ $order->latestPayment?->fedapay_reference ?? '—' }}
        </div>
    </div>

    <div class="box">
        <strong>Client</strong><br>
        {{ $order->user?->name ?? '—' }}<br>
        <span class="muted">{{ $order->user?->email ?? '—' }}</span>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Montant</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Site FRILO - {{ $order->template?->name ?? 'Template' }}</td>
                <td>{{ number_format($basePrice, 0, ',', ' ') }} FCFA</td>
            </tr>
            @foreach($order->options as $option)
                <tr>
                    <td>Option - {{ $option->pivot->name_snapshot }}</td>
                    <td>{{ number_format((int) $option->pivot->price_snapshot, 0, ',', ' ') }} FCFA</td>
                </tr>
            @endforeach
            <tr>
                <td class="total">Total commande</td>
                <td class="total">{{ number_format($order->price, 0, ',', ' ') }} FCFA</td>
            </tr>
            <tr>
                <td>Total payé</td>
                <td>{{ number_format($paidTotal, 0, ',', ' ') }} FCFA</td>
            </tr>
            <tr>
                <td>Reste à payer</td>
                <td>{{ number_format(max(0, (int) $order->price - $paidTotal), 0, ',', ' ') }} FCFA</td>
            </tr>
        </tbody>
    </table>
</body>
</html>
