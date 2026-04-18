<?php
declare(strict_types=1);

function supabase_insert(array $config, string $table, array $record): array
{
    if (!$config['SUPABASE_URL'] || !$config['SUPABASE_SERVICE_ROLE_KEY']) {
        return ['ok' => false, 'reason' => 'missing_credentials'];
    }
    $url = rtrim($config['SUPABASE_URL'], '/') . '/rest/v1/' . $table;
    $ch = curl_init($url);
    $headers = [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $config['SUPABASE_SERVICE_ROLE_KEY'],
        'apikey: ' . $config['SUPABASE_SERVICE_ROLE_KEY'],
        'Prefer: return=representation',
    ];
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($record),
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 15,
    ]);
    $res = curl_exec($ch);
    $err = $res === false ? curl_error($ch) : null;
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['ok' => ($code >= 200 && $code < 300), 'error' => $err, 'code' => $code, 'body' => $res];
}

function log_to_supabase(array $config, array $record): array
{
    return supabase_insert($config, 'capi_events', $record);
}

function log_raw_to_supabase(array $config, array $record): array
{
    return supabase_insert($config, 'capi_events_raw', $record);
}
