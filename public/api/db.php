<?php
/** 공용 부트스트랩 — PDO 연결, JSON 입출력, 토큰 인증 헬퍼. */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function jexit(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
function jfail(int $code, string $msg): void {
    jexit($code, ['error' => $msg]);
}

function config(): array {
    static $cfg = null;
    if ($cfg === null) {
        $p = __DIR__ . '/config.php';
        if (!is_file($p)) jfail(500, '서버 설정이 없습니다.');
        $cfg = require $p;
    }
    return $cfg;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $d = config()['db'] ?? null;
        if (!$d) jfail(500, 'DB 설정이 없습니다.');
        try {
            $pdo = new PDO(
                "mysql:host={$d['host']};dbname={$d['name']};charset=utf8mb4",
                $d['user'],
                $d['pass'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (Throwable $e) {
            jfail(500, 'DB 연결 실패.');
        }
    }
    return $pdo;
}

/** POST JSON 본문을 배열로 반환(POST 강제). */
function readJsonBody(): array {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        jfail(405, 'POST 만 허용됩니다.');
    }
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true);
    if (!is_array($body)) jfail(400, '잘못된 요청 본문.');
    return $body;
}

function tokenHash(string $token): string {
    return hash('sha256', $token);
}

/** userId + token 검증 → 사용자 행 반환, 실패 시 401. */
function requireUser(array $body): array {
    $id = trim((string)($body['userId'] ?? ''));
    $token = (string)($body['token'] ?? '');
    if ($id === '' || $token === '') jfail(401, '인증 정보가 없습니다.');
    $st = db()->prepare('SELECT * FROM users WHERE id = ?');
    $st->execute([$id]);
    $u = $st->fetch();
    if (!$u || !hash_equals($u['token_hash'], tokenHash($token))) {
        jfail(401, '인증 실패.');
    }
    return $u;
}

/** 닉네임 정규화(길이 제한·제어문자 제거). */
function cleanNickname(string $s): string {
    $s = trim(preg_replace('/[\x00-\x1F\x7F]/u', '', $s));
    if ($s === '') $s = '정원사';
    return mb_substr($s, 0, 20, 'UTF-8');
}
function cleanAvatar(string $s): string {
    $s = trim($s);
    return $s === '' ? '🪴' : mb_substr($s, 0, 8, 'UTF-8');
}
function clampInt($v, int $min, int $max): int {
    $n = (int)$v;
    return max($min, min($max, $n));
}
