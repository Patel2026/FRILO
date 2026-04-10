<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class FedapayClient
{
    public function __construct(
        private readonly PlatformSettingsService $platformSettingsService,
        private readonly ?string $secretKey = null,
        private readonly ?string $baseUrl = null,
    ) {}

    public function createCustomer(array $payload): array
    {
        return $this->post('/customers', $payload);
    }

    public function createTransaction(array $payload): array
    {
        return $this->post('/transactions', $payload);
    }

    public function createTransactionToken(int $transactionId): array
    {
        return $this->post("/transactions/{$transactionId}/token", []);
    }

    public function sendPayment(string $mode, array $payload): array
    {
        return $this->post("/transactions/{$mode}", $payload);
    }

    public function getTransaction(int $transactionId): array
    {
        return $this->get("/transactions/{$transactionId}");
    }

    private function post(string $path, array $payload): array
    {
        $response = $this->client()->post($path, $payload);

        return $this->decode($response->status(), $response->body());
    }

    private function get(string $path): array
    {
        $response = $this->client()->get($path);

        return $this->decode($response->status(), $response->body());
    }

    private function decode(int $status, string $body): array
    {
        $data = json_decode($body, true);
        $decoded = is_array($data) ? $data : [];

        if ($status >= 200 && $status < 300) {
            return $decoded;
        }

        $message = $decoded['message'] ?? 'Erreur API FedaPay.';
        throw new RuntimeException($message, $status);
    }

    private function client(): PendingRequest
    {
        $paymentConfig = $this->platformSettingsService->getRuntimePaymentConfiguration();

        $enabled = (bool) ($paymentConfig['enabled'] ?? true);
        if (! $enabled) {
            throw new RuntimeException('Le paiement FedaPay est désactivé dans les paramètres publiés.');
        }

        $secret = $this->secretKey ?? ($paymentConfig['secret_key'] ?? null);
        $baseUrl = $this->baseUrl ?? ($paymentConfig['base_url'] ?? null);

        if (! $secret || ! $baseUrl) {
            throw new RuntimeException('Configuration FedaPay incomplète. Vérifiez les paramètres publiés (secret/base URL).');
        }

        return Http::baseUrl((string) $baseUrl)
            ->withToken((string) $secret)
            ->acceptJson()
            ->asJson()
            ->timeout(20);
    }
}
