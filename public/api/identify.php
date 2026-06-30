<?php
/**
 * 풀리피아 식별 프록시 — 사진(base64)을 Gemini 2.5 Flash 비전에 보내
 * 식물 종을 식별하고 한국어 재배정보를 구조화해 돌려준다.
 * API 키는 서버 전용 config.php 에만 두고 브라우저엔 절대 노출하지 않는다.
 *
 * 응답 형식(프론트 IdentifyResult 와 일치):
 *   { "top": {species, confidence}, "alternatives": [{species, confidence}, ...] }
 *   species = src/types.ts 의 Species (단, id 는 학명 슬러그)
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function fail(int $code, string $msg): void {
    http_response_code($code);
    echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    fail(405, 'POST 만 허용됩니다.');
}

$cfgPath = __DIR__ . '/config.php';
if (!is_file($cfgPath)) {
    fail(500, '서버 설정(config.php)이 없습니다.');
}
$cfg = require $cfgPath;
$apiKey = $cfg['gemini_api_key'] ?? '';
$model  = $cfg['gemini_model'] ?? 'gemini-2.5-flash';
if ($apiKey === '' || $apiKey === 'PUT_KEY_HERE') {
    fail(500, 'Gemini API 키가 설정되지 않았습니다.');
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if (!is_array($body) || empty($body['image'])) {
    fail(400, 'image 필드(base64 dataURL)가 필요합니다.');
}

// dataURL("data:image/jpeg;base64,....") 또는 순수 base64 모두 허용
$image = $body['image'];
$mime = 'image/jpeg';
if (preg_match('#^data:([\w/.+-]+);base64,(.*)$#s', $image, $m)) {
    $mime = $m[1];
    $b64 = $m[2];
} else {
    $b64 = $image;
}
$b64 = trim($b64);
if (strlen($b64) > 8 * 1024 * 1024) { // ~6MB 이미지 상한
    fail(413, '이미지가 너무 큽니다.');
}

// Gemini 구조화 출력 스키마 — Species 필드와 1:1
$schema = [
    'type' => 'OBJECT',
    'properties' => [
        'isPlant' => ['type' => 'BOOLEAN'],
        'candidates' => [
            'type' => 'ARRAY',
            'items' => [
                'type' => 'OBJECT',
                'properties' => [
                    'confidence'     => ['type' => 'NUMBER'],
                    'commonName'     => ['type' => 'STRING'],
                    'scientificName' => ['type' => 'STRING'],
                    'family'         => ['type' => 'STRING'],
                    'emoji'          => ['type' => 'STRING'],
                    'origin'         => ['type' => 'STRING'],
                    'light'          => ['type' => 'STRING'],
                    'waterDays'      => ['type' => 'INTEGER'],
                    'humidity'       => ['type' => 'STRING'],
                    'toxicity'       => ['type' => 'STRING'],
                    'difficulty'     => ['type' => 'STRING', 'enum' => ['easy', 'medium', 'hard']],
                    'rarity'         => ['type' => 'STRING', 'enum' => ['common', 'uncommon', 'rare', 'legendary']],
                    'repotMonths'    => ['type' => 'INTEGER'],
                    'description'    => ['type' => 'STRING'],
                    'tips'           => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
                ],
                'required' => [
                    'confidence', 'commonName', 'scientificName', 'family', 'emoji',
                    'origin', 'light', 'waterDays', 'humidity', 'toxicity',
                    'difficulty', 'rarity', 'repotMonths', 'description', 'tips',
                ],
            ],
        ],
    ],
    'required' => ['isPlant', 'candidates'],
];

$prompt = <<<PROMPT
이 사진에 있는 식물을 식별하세요. 가능성이 높은 순서로 최대 4개의 후보 종을 제시합니다.
각 후보마다 다음을 한국어로 채우세요(학명 scientificName 은 라틴 학명 그대로):
- confidence: 0~1 사이 신뢰도(후보 전체 합이 대략 1이 되도록)
- commonName: 한국에서 통용되는 일반명
- emoji: 그 식물을 대표하는 이모지 1개
- light/humidity/toxicity/origin: 실내 재배 기준의 간결한 정보
- waterDays: 권장 물주기 간격(일), repotMonths: 권장 분갈이 주기(개월)
- difficulty: 재배 난이도, rarity: 수집 희귀도(흔할수록 common)
- description: 1~2문장 특징, tips: 재배 팁 2~3개(짧게)
사진에 식물이 없거나 식별 불가하면 isPlant=false, candidates=[] 로 응답하세요.
PROMPT;

$payload = [
    'contents' => [[
        'parts' => [
            ['inline_data' => ['mime_type' => $mime, 'data' => $b64]],
            ['text' => $prompt],
        ],
    ]],
    'generationConfig' => [
        'temperature' => 0.2,
        'responseMimeType' => 'application/json',
        'responseSchema' => $schema,
    ],
];

$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 45,
]);
$resp = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($resp === false) {
    fail(502, 'Gemini 호출 실패: ' . $curlErr);
}
if ($httpCode < 200 || $httpCode >= 300) {
    fail(502, 'Gemini 오류(' . $httpCode . ')');
}

$json = json_decode($resp, true);
$text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
$parsed = json_decode($text, true);
if (!is_array($parsed)) {
    fail(502, '식별 결과 파싱 실패.');
}
if (empty($parsed['isPlant']) || empty($parsed['candidates'])) {
    fail(422, '사진에서 식물을 식별하지 못했습니다.');
}

$allowedDiff = ['easy', 'medium', 'hard'];
$allowedRarity = ['common', 'uncommon', 'rare', 'legendary'];

function slugify(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-') ?: 'sp-' . substr(md5($s), 0, 6);
}

$out = [];
foreach ($parsed['candidates'] as $c) {
    $sci = (string)($c['scientificName'] ?? '');
    if ($sci === '') continue;
    $species = [
        'id'             => slugify($sci),
        'commonName'     => (string)($c['commonName'] ?? $sci),
        'scientificName' => $sci,
        'family'         => (string)($c['family'] ?? ''),
        'emoji'          => (string)($c['emoji'] ?? '🌿'),
        'origin'         => (string)($c['origin'] ?? ''),
        'light'          => (string)($c['light'] ?? ''),
        'waterDays'      => max(1, (int)($c['waterDays'] ?? 7)),
        'humidity'       => (string)($c['humidity'] ?? ''),
        'toxicity'       => (string)($c['toxicity'] ?? '정보 없음'),
        'difficulty'     => in_array($c['difficulty'] ?? '', $allowedDiff, true) ? $c['difficulty'] : 'medium',
        'rarity'         => in_array($c['rarity'] ?? '', $allowedRarity, true) ? $c['rarity'] : 'common',
        'repotMonths'    => max(1, (int)($c['repotMonths'] ?? 18)),
        'description'    => (string)($c['description'] ?? ''),
        'tips'           => array_values(array_filter(array_map('strval', (array)($c['tips'] ?? [])))),
    ];
    $conf = (float)($c['confidence'] ?? 0);
    $out[] = ['species' => $species, 'confidence' => $conf];
}

if (!$out) {
    fail(422, '유효한 후보가 없습니다.');
}

usort($out, fn($a, $b) => $b['confidence'] <=> $a['confidence']);

echo json_encode([
    'top' => $out[0],
    'alternatives' => array_slice($out, 1),
], JSON_UNESCAPED_UNICODE);
