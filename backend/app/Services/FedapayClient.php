<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class FedapayClient
{
    public function __construct(
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
        $secret = $this->secretKey ?? config('services.fedapay.secret_key');
        $baseUrl = $this->baseUrl ?? config('services.fedapay.base_url');

        if (! $secret || ! $baseUrl) {
            throw new RuntimeException('Configuration FedaPay incomplète. Vérifiez FEDAPAY_SECRET_KEY et FEDAPAY_BASE_URL.');
        }

        return Http::baseUrl((string) $baseUrl)
            ->withToken((string) $secret)
            ->acceptJson()
            ->asJson()
            ->timeout(20);
    }
}
