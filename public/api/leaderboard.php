<?php
/**
 * 상위 유저 리더보드. GET ?limit=50 (기본 50, 최대 200).
 * 응답: {rows:[{userId, nickname, avatar, score, plantCount, speciesCount}], total}
 */

require __DIR__ . '/db.php';

$limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 50;

$st = db()->prepare(
    'SELECT id, nickname, avatar, score, plant_count, species_count
     FROM users ORDER BY score DESC, updated_at ASC LIMIT ?'
);
$st->bindValue(1, $limit, PDO::PARAM_INT);
$st->execute();

$rows = [];
foreach ($st->fetchAll() as $r) {
    $rows[] = [
        'userId'       => $r['id'],
        'nickname'     => $r['nickname'],
        'avatar'       => $r['avatar'],
        'score'        => (int)$r['score'],
        'plantCount'   => (int)$r['plant_count'],
        'speciesCount' => (int)$r['species_count'],
    ];
}
$total = (int)db()->query('SELECT COUNT(*) FROM users')->fetchColumn();

jexit(200, ['rows' => $rows, 'total' => $total]);
