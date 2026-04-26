<?php

namespace App\Services\Firebase;

use App\Models\User;
use Google\Auth\Credentials\ServiceAccountCredentials;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class FcmService
{
    private function credentialsPath(): ?string
    {
        $configured = (string) config('services.firebase.credentials');

        if ($configured === '') {
            return null;
        }

        if (str_starts_with($configured, '/') || preg_match('/^[A-Za-z]:[\\\\\\/]/', $configured) === 1) {
            return $configured;
        }

        return base_path($configured);
    }

    private function projectId(): ?string
    {
        $projectId = (string) config('services.firebase.project_id');

        return $projectId !== '' ? $projectId : null;
    }

    private function accessToken(string $credentialsPath): string
    {
        $scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
        $credentials = new ServiceAccountCredentials($scopes, $credentialsPath);
        $token = $credentials->fetchAuthToken();

        if (! isset($token['access_token'])) {
            throw new RuntimeException('Unable to obtain Firebase access token.');
        }

        return $token['access_token'];
    }

    private function shouldClearStoredToken(Response $response): bool
    {
        if ($response->status() === 404) {
            return true;
        }

        $json = $response->json();
        if (! is_array($json)) {
            return false;
        }

        $error = $json['error'] ?? null;
        if (! is_array($error)) {
            return false;
        }

        $status = $error['status'] ?? '';
        if ($status === 'NOT_FOUND') {
            return true;
        }

        $message = (string) ($error['message'] ?? '');

        if (str_contains($message, 'not a valid FCM registration token')) {
            return true;
        }

        if (str_contains($message, 'UNREGISTERED')) {
            return true;
        }

        return false;
    }

    private function clearUserPushToken(User $user): void
    {
        $user->forceFill([
            'fcm_token' => null,
            'fcm_platform' => null,
            'fcm_updated_at' => now(),
        ])->save();
    }

    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $credentialsPath = $this->credentialsPath();
        $projectId = $this->projectId();

        if ($credentialsPath === null || $projectId === null || ! is_file($credentialsPath)) {
            return;
        }

        $token = $user->fcm_token;
        if ($token === null || $token === '') {
            return;
        }

        $stringData = [];
        foreach ($data as $key => $value) {
            $stringData[(string) $key] = (string) $value;
        }

        $url = 'https://fcm.googleapis.com/v1/projects/'.$projectId.'/messages:send';

        try {
            $accessToken = $this->accessToken($credentialsPath);
        } catch (RuntimeException) {
            return;
        }

        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->timeout(20)
            ->post($url, [
                'message' => [
                    'token' => $token,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => $stringData,
                ],
            ]);

        if ($response->successful()) {
            return;
        }

        if ($this->shouldClearStoredToken($response)) {
            $this->clearUserPushToken($user);
        }
    }
}
