<?php
/**
 * 기기 기반 간편 신원 등록/갱신.
 * 신규: {nickname, avatar} → 서버가 userId·token 발급.
 * 기존: {userId, token, nickname?, avatar?} → 프로필 갱신.
 * 응답: {userId, token}  (token 은 신규 발급 시에만 의미, 기존이면 그대로 echo)
 */

require __DIR__ . '/db.php';

$body = readJsonBody();
$nickname = cleanNickname((string)($body['nickname'] ?? ''));
$avatar = cleanAvatar((string)($body['avatar'] ?? ''));

$id = trim((string)($body['userId'] ?? ''));
$token = (string)($body['token'] ?? '');

if ($id !== '' && $token !== '') {
    // 기존 사용자: 인증 후 프로필 갱신
    $st = db()->prepare('SELECT * FROM users WHERE id = ?');
    $st->execute([$id]);
    $u = $st->fetch();
    if ($u && hash_equals($u['token_hash'], tokenHash($token))) {
        $up = db()->prepare('UPDATE users SET nickname = ?, avatar = ? WHERE id = ?');
        $up->execute([$nickname, $avatar, $id]);
        jexit(200, ['userId' => $id, 'token' => $token]);
    }
    // 인증 실패 시 신규로 진행(폴백)
}

// 신규 사용자 생성
$newId = bin2hex(random_bytes(12));        // 24 hex chars
$newToken = bin2hex(random_bytes(24));     // 48 hex chars (클라이언트 보관)
$ins = db()->prepare(
    'INSERT INTO users (id, token_hash, nickname, avatar) VALUES (?, ?, ?, ?)'
);
$ins->execute([$newId, tokenHash($newToken), $nickname, $avatar]);

jexit(200, ['userId' => $newId, 'token' => $newToken]);
