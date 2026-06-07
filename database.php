<?php

function getAuthDatabase(): PDO
{
    $db = new PDO('sqlite:' . __DIR__ . '/database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $db->exec(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )"
    );

    $db->exec(
        "CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )"
    );

    $db->exec(
        "CREATE TABLE IF NOT EXISTS rate_limiting (
            rate_key TEXT PRIMARY KEY,
            attempts INTEGER DEFAULT 0,
            last_attempt INTEGER DEFAULT 0
        )"
    );

    return $db;
}

function getIPAddress(): string
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // X-Forwarded-For can contain multiple IPs, the first one is the client
        $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($ips[0]);
    } else {
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
}

function enforceRateLimit(PDO $db, string $key, int $maxAttempts, int $windowSeconds): bool
{
    $now = time();
    $expired = $now - $windowSeconds;

    // 1. Clean up expired attempts
    $stmt = $db->prepare("DELETE FROM rate_limiting WHERE rate_key = :key AND last_attempt <= :expired");
    $stmt->execute([':key' => $key, ':expired' => $expired]);

    // 2. Increment atomically
    $stmt = $db->prepare("
        INSERT INTO rate_limiting (rate_key, attempts, last_attempt) 
        VALUES (:key, 1, :now)
        ON CONFLICT(rate_key) DO UPDATE SET 
            attempts = attempts + 1,
            last_attempt = :now
    ");
    $stmt->execute([':key' => $key, ':now' => $now]);

    // 3. Read back the new atomic value
    $stmt = $db->prepare("SELECT attempts FROM rate_limiting WHERE rate_key = :key");
    $stmt->execute([':key' => $key]);
    $row = $stmt->fetch();

    return ($row && $row['attempts'] <= $maxAttempts);
}

function resetAttempts(PDO $db, string $key): void
{
    $stmt = $db->prepare("DELETE FROM rate_limiting WHERE rate_key = :key");
    $stmt->execute([':key' => $key]);
}
