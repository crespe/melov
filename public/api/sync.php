<?php
/**
 * 내 점수·통계를 서버에 업서트한다.
 * {userId, token, nickname?, avatar?, score, plantCount, speciesCount, entries}
 * 응답: {ok:true, rank, total}  (현재 내 순위와 전체 유저 수)
 */

require __DIR__ . '/db.php';

$body = readJsonBody();
$u = requireUser($body);

$score   = clampInt($body['score'] ?? 0, 0, 100000000);
$plants  = clampInt($body['plantCount'] ?? 0, 0, 100000);
$species = clampInt($body['speciesCount'] ?? 0, 0, 100000);
$entries = clampInt($body['entries'] ?? 0, 0, 1000000);
$nickname = isset($body['nickname']) ? cleanNickname((string)$body['nickname']) : $u['nickname'];
$avatar   = isset($body['avatar']) ? cleanAvatar((string)$body['avatar']) : $u['avatar'];

$up = db()->prepare(
    'UPDATE users SET nickname = ?, avatar = ?, score = ?, plant_count = ?, species_count = ?, entries = ? WHERE id = ?'
);
$up->execute([$nickname, $avatar, $score, $plants, $species, $entries, $u['id']]);

// 내 순위 = 나보다 점수 높은 유저 수 + 1
$rk = db()->prepare('SELECT COUNT(*) FROM users WHERE score > ?');
$rk->execute([$score]);
$rank = (int)$rk->fetchColumn() + 1;
$total = (int)db()->query('SELECT COUNT(*) FROM users')->fetchColumn();

jexit(200, ['ok' => true, 'rank' => $rank, 'total' => $total]);
