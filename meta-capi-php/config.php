<?php
declare(strict_types=1);

function env(string $key, string $default = ''): string
{
    $v = getenv($key);
    if ($v !== false && $v !== '') {
        return $v;
    }
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return (string)$_SERVER[$key];
    }
    return $default;
}

function load_local_credentials(): array
{
    $paths = [__DIR__ . '/credentials.php', __DIR__ . '/secrets.php'];
    foreach ($paths as $p) {
        if (!is_file($p)) {
            continue;
        }
        $data = include $p;
        return is_array($data) ? $data : [];
    }
    return [];
}

function get_config(): array
{
    $local = load_local_credentials();

    $origins = env('ALLOWED_ORIGINS', '*');
    $arr = $origins === '*' ? ['*'] : array_values(array_filter(array_map('trim', explode(',', $origins))));
    if (isset($local['ALLOWED_ORIGINS'])) {
        $o = $local['ALLOWED_ORIGINS'];
        if (is_array($o)) {
            $arr = array_values(array_filter(array_map('trim', array_map('strval', $o))));
        } elseif (is_string($o)) {
            $o = trim($o);
            $arr = $o === '*' ? ['*'] : array_values(array_filter(array_map('trim', explode(',', $o))));
        }
    }

    $pixelId = env('PIXEL_ID', '');
    if ($pixelId === '') {
        $pixelId = env('DATASET_ID', env('META_PIXEL_ID', env('META_DATASET_ID', '')));
    }
    if (isset($local['PIXEL_ID']) && is_string($local['PIXEL_ID']) && trim($local['PIXEL_ID']) !== '') {
        $pixelId = trim($local['PIXEL_ID']);
    }

    $token = env('META_ACCESS_TOKEN', '');
    if ($token === '') {
        $token = env('META_CAPI_ACCESS_TOKEN', env('CAPI_ACCESS_TOKEN', env('ACCESS_TOKEN', '')));
    }
    if (isset($local['META_ACCESS_TOKEN']) && is_string($local['META_ACCESS_TOKEN']) && trim($local['META_ACCESS_TOKEN']) !== '') {
        $token = trim($local['META_ACCESS_TOKEN']);
    }

    $apiVersion = env('META_API_VERSION', env('API_VERSION', 'v18.0'));
    if (isset($local['META_API_VERSION']) && is_string($local['META_API_VERSION']) && trim($local['META_API_VERSION']) !== '') {
        $apiVersion = trim($local['META_API_VERSION']);
    }

    $testEventCode = env('TEST_EVENT_CODE', '');
    if (isset($local['TEST_EVENT_CODE']) && is_string($local['TEST_EVENT_CODE']) && trim($local['TEST_EVENT_CODE']) !== '') {
        $testEventCode = trim($local['TEST_EVENT_CODE']);
    }

    $supabaseUrl = env('SUPABASE_URL', '');
    if (isset($local['SUPABASE_URL']) && is_string($local['SUPABASE_URL']) && trim($local['SUPABASE_URL']) !== '') {
        $supabaseUrl = trim($local['SUPABASE_URL']);
    }

    $supabaseKey = env('SUPABASE_SERVICE_ROLE_KEY', '');
    if (isset($local['SUPABASE_SERVICE_ROLE_KEY']) && is_string($local['SUPABASE_SERVICE_ROLE_KEY']) && trim($local['SUPABASE_SERVICE_ROLE_KEY']) !== '') {
        $supabaseKey = trim($local['SUPABASE_SERVICE_ROLE_KEY']);
    }

    return [
        'PIXEL_ID' => $pixelId,
        'META_ACCESS_TOKEN' => $token,
        'META_API_VERSION' => $apiVersion,
        'TEST_EVENT_CODE' => $testEventCode,
        'ALLOWED_ORIGINS' => $arr,
        'SUPABASE_URL' => $supabaseUrl,
        'SUPABASE_SERVICE_ROLE_KEY' => $supabaseKey,
    ];
}
