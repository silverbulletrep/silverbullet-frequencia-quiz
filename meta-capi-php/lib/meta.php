<?php
declare(strict_types=1);

function send_to_meta(array $config, array $event): array
{
    if (!$config['PIXEL_ID'] || !$config['META_ACCESS_TOKEN']) {
        return ['ok' => false, 'error' => 'missing_credentials', 'code' => 0, 'body' => null];
    }
    $apiVersion = isset($config['META_API_VERSION']) ? (string)$config['META_API_VERSION'] : 'v18.0';
    $apiVersion = ltrim($apiVersion, '/');
    if ($apiVersion !== '' && $apiVersion[0] !== 'v') {
        $apiVersion = 'v' . $apiVersion;
    }
    $url = 'https://graph.facebook.com/' . rawurlencode($apiVersion) . '/' . rawurlencode($config['PIXEL_ID']) . '/events';
    $payload = ['data' => [$event]];
    if ($config['TEST_EVENT_CODE']) {
        $payload['test_event_code'] = $config['TEST_EVENT_CODE'];
    }
    $qs = '?access_token=' . rawurlencode($config['META_ACCESS_TOKEN']);
    $body = json_encode($payload);
    if (function_exists('curl_init')) {
        $ch = curl_init($url . $qs);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 20,
        ]);
        $res = curl_exec($ch);
        $err = $res === false ? curl_error($ch) : null;
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ['ok' => ($code >= 200 && $code < 300), 'error' => $err, 'code' => $code, 'body' => $res];
    }
    $target = $url . $qs;
    $parts = parse_url($target);
    if (!$parts || !isset($parts['host'])) {
        return ['ok' => false, 'error' => 'invalid_url', 'code' => 0, 'body' => null];
    }
    $scheme = $parts['scheme'] ?? 'https';
    $host = $parts['host'];
    $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);
    $path = ($parts['path'] ?? '/') . (isset($parts['query']) ? '?' . $parts['query'] : '');
    $transport = $scheme === 'https' ? 'ssl://' : 'tcp://';
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);
    $fp = @stream_socket_client($transport . $host . ':' . $port, $errno, $errstr, 20, STREAM_CLIENT_CONNECT, $context);
    if (!$fp) {
        return ['ok' => false, 'error' => $errstr ?: 'socket_connect_failed', 'code' => 0, 'body' => null];
    }
    $req = "POST {$path} HTTP/1.1\r\n" .
        "Host: {$host}\r\n" .
        "Content-Type: application/json\r\n" .
        'Content-Length: ' . strlen($body) . "\r\n" .
        "Connection: close\r\n\r\n" .
        $body;
    fwrite($fp, $req);
    $response = stream_get_contents($fp);
    fclose($fp);
    $code = 0;
    $bodyRes = $response;
    if (is_string($response) && strpos($response, "\r\n\r\n") !== false) {
        [$headersRaw, $bodyRes] = explode("\r\n\r\n", $response, 2);
        $lines = explode("\r\n", $headersRaw);
        if (isset($lines[0]) && preg_match('/^HTTP\/(\d\.\d)\s+(\d+)/i', $lines[0], $m)) {
            $code = (int)$m[2];
        }
    }
    return ['ok' => ($code >= 200 && $code < 300), 'error' => null, 'code' => $code, 'body' => $bodyRes];
}
