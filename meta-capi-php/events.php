<?php
declare(strict_types=1);

require __DIR__ . '/config.php';
require __DIR__ . '/lib/meta.php';
require __DIR__ . '/lib/supabase.php';

$cfg = get_config();

function norm_email($v) {
    return strtolower(trim((string)$v));
}
function norm_phone($v) {
    $s = preg_replace('/\D+/', '', (string)$v);
    return $s;
}
function norm_str($v) {
    return strtolower(trim((string)$v));
}
function norm_zip($v) {
    return trim((string)$v);
}
function sha256($v) {
    return hash('sha256', (string)$v);
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $cfg['ALLOWED_ORIGINS'];
if (in_array('*', $allowed, true)) {
    header('Access-Control-Allow-Origin: *');
} elseif ($origin && in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['health'])) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok', 'time' => time()]);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'invalid_json']);
    exit;
}

$required = ['event_name', 'event_id', 'event_source_url', 'custom_data'];
$missing = [];
foreach ($required as $k) {
    if (!array_key_exists($k, $data) || $data[$k] === null || $data[$k] === '') {
        $missing[] = $k;
    }
}
if (!isset($data['event_time'])) {
    $data['event_time'] = time();
} else {
    $et = $data['event_time'];
    if (!is_numeric($et)) {
        $et = time();
    } else {
        $et = (int)$et;
        if ($et > 2000000000) {
            $et = (int)floor($et / 1000);
        }
        if ($et <= 0) {
            $et = time();
        }
    }
    $data['event_time'] = $et;
}
$cd = $data['custom_data'] ?? [];
if (!is_array($cd) || !isset($cd['currency']) || !isset($cd['value'])) {
    $missing[] = 'custom_data.currency,value';
}

if ($missing) {
    header('Content-Type: application/json');
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'missing_fields', 'fields' => $missing]);
    exit;
}

$ua = $data['user_agent'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? '');
$ip = $data['ip_address'] ?? ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '');
if (strpos($ip, ',') !== false) {
    $ip = trim(explode(',', $ip)[0]);
}

$event = [
    'event_name' => (string)$data['event_name'],
    'event_time' => (int)$data['event_time'],
    'event_source_url' => (string)$data['event_source_url'],
    'event_id' => (string)$data['event_id'],
    'action_source' => 'website',
    'user_data' => [
        'client_ip_address' => (string)$ip,
        'client_user_agent' => (string)$ua,
    ],
    'custom_data' => [
        'currency' => (string)$cd['currency'],
        'value' => (float)$cd['value'],
    ],
];

if (isset($data['fbp']) && $data['fbp'] !== '') {
    $event['user_data']['fbp'] = (string)$data['fbp'];
}
if (isset($data['fbc']) && $data['fbc'] !== '') {
    $event['user_data']['fbc'] = (string)$data['fbc'];
}

$udIn = (isset($data['user_data']) && is_array($data['user_data'])) ? $data['user_data'] : [];
$rawEmail = $data['email'] ?? ($udIn['email'] ?? ($udIn['em'] ?? null));
if ($rawEmail) {
    $event['user_data']['em'] = sha256(norm_email($rawEmail));
}
$rawPhone = $data['phone'] ?? ($udIn['phone'] ?? ($udIn['ph'] ?? null));
if ($rawPhone) {
    $event['user_data']['ph'] = sha256(norm_phone($rawPhone));
}
$rawFn = $data['first_name'] ?? ($udIn['first_name'] ?? ($udIn['fn'] ?? null));
if ($rawFn) {
    $event['user_data']['fn'] = sha256(norm_str($rawFn));
}
$rawLn = $data['last_name'] ?? ($udIn['last_name'] ?? ($udIn['ln'] ?? null));
if ($rawLn) {
    $event['user_data']['ln'] = sha256(norm_str($rawLn));
}
$rawCt = $data['city'] ?? ($udIn['city'] ?? ($udIn['ct'] ?? null));
if ($rawCt) {
    $event['user_data']['ct'] = sha256(norm_str($rawCt));
}
$rawSt = $data['state'] ?? ($udIn['state'] ?? ($udIn['st'] ?? null));
if ($rawSt) {
    $event['user_data']['st'] = sha256(norm_str($rawSt));
}
$rawZp = $data['zip'] ?? ($udIn['zip'] ?? ($udIn['zp'] ?? null));
if ($rawZp) {
    $event['user_data']['zp'] = sha256(norm_zip($rawZp));
}
$rawCountry = $data['country'] ?? ($udIn['country'] ?? null);
if ($rawCountry) {
    $event['user_data']['country'] = sha256(norm_str($rawCountry));
}
$rawExternal = $data['external_id'] ?? ($udIn['external_id'] ?? null);
if ($rawExternal) {
    $event['user_data']['external_id'] = sha256(norm_str($rawExternal));
}

$extraKeys = ['contents', 'content_ids', 'content_type', 'order_id', 'num_items', 'delivery_category'];
foreach ($extraKeys as $ek) {
    if (isset($cd[$ek])) {
        $event['custom_data'][$ek] = $cd[$ek];
    }
}

header('Content-Type: application/json');
$ack = ['ok' => true, 'event_id' => $event['event_id'], 'received_at' => time()];
if (function_exists('fastcgi_finish_request')) {
    echo json_encode($ack);
    fastcgi_finish_request();
} else {
    ignore_user_abort(true);
    ob_start();
    echo json_encode($ack);
    header('Connection: close');
    header('Content-Length: ' . ob_get_length());
    ob_end_flush();
    flush();
}

$metaRes = send_to_meta($cfg, $event);

$logRec = [
    'created_at' => date('c'),
    'event_id' => $event['event_id'],
    'event_name' => $event['event_name'],
    'currency' => $event['custom_data']['currency'],
    'value' => $event['custom_data']['value'],
    'client_ip' => $ip,
    'client_ua' => $ua,
    'meta_code' => $metaRes['code'],
    'meta_ok' => $metaRes['ok'],
];
if ($metaRes['body']) {
    $logRec['meta_body'] = $metaRes['body'];
}
log_to_supabase($cfg, $logRec);

$rawRec = [
    'created_at' => date('c'),
    'event_id' => $event['event_id'],
    'event_name' => $event['event_name'],
    'client_ip' => $ip,
    'client_ua' => $ua,
    'payload' => $data,
];
log_raw_to_supabase($cfg, $rawRec);

exit;
