<?php

declare(strict_types=1);

final class Registration
{
    public static function all(): array
    {
        return Database::pdo()
            ->query('SELECT * FROM registrations ORDER BY created_at DESC')
            ->fetchAll();
    }

    public static function find(string $id): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM registrations WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findByUsername(string $username): ?array
    {
        $stmt = Database::pdo()->prepare('SELECT * FROM registrations WHERE username = ? LIMIT 1');
        $stmt->execute([strtolower(trim($username))]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(array $input): array
    {
        $username = strtolower(trim((string) $input['username']));
        if (!preg_match('/^[a-z0-9._-]{3,32}$/', $username)) {
            throw new InvalidArgumentException('Username must be 3–32 characters: letters, numbers, . _ -');
        }
        if (self::findByUsername($username)) {
            throw new InvalidArgumentException('That username is already taken.');
        }
        $password = (string) $input['password'];
        if (strlen($password) < 8) {
            throw new InvalidArgumentException('Password must be at least 8 characters.');
        }

        $id = new_id('reg');
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $tradingTimes = $input['trading_times'] ?? [];

        $stmt = Database::pdo()->prepare(
            'INSERT INTO registrations (
              id, created_at, status, reviewed_at, username, password_hash,
              registered_business_name, trading_name, vat_number, registration_number, landline_number,
              buyer_name, buyer_phone, buyer_email,
              accounts_name, accounts_phone, accounts_email,
              address_line1, address_line2, city, province, postal_code,
              trading_times_json, trading_times_notes
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $id,
            date('Y-m-d H:i:s'),
            'pending',
            null,
            $username,
            $hash,
            trim((string) $input['registered_business_name']),
            trim((string) $input['trading_name']),
            trim((string) ($input['vat_number'] ?? '')),
            trim((string) ($input['registration_number'] ?? '')),
            trim((string) ($input['landline_number'] ?? '')),
            trim((string) $input['buyer_name']),
            trim((string) $input['buyer_phone']),
            trim((string) $input['buyer_email']),
            trim((string) $input['accounts_name']),
            trim((string) $input['accounts_phone']),
            trim((string) $input['accounts_email']),
            trim((string) $input['address_line1']),
            trim((string) ($input['address_line2'] ?? '')),
            trim((string) $input['city']),
            trim((string) $input['province']),
            trim((string) $input['postal_code']),
            json_encode($tradingTimes, JSON_UNESCAPED_SLASHES),
            trim((string) ($input['trading_times_notes'] ?? '')),
        ]);

        return self::find($id) ?? ['id' => $id];
    }

    public static function setStatus(string $id, string $status): ?array
    {
        if (!in_array($status, ['approved', 'rejected', 'pending'], true)) {
            throw new InvalidArgumentException('Invalid status.');
        }
        $stmt = Database::pdo()->prepare(
            'UPDATE registrations SET status = ?, reviewed_at = ? WHERE id = ?'
        );
        $stmt->execute([$status, date('Y-m-d H:i:s'), $id]);
        return self::find($id);
    }

    public static function verifyPassword(array $registration, string $password): bool
    {
        return password_verify($password, $registration['password_hash']);
    }

    public static function tradingTimes(array $registration): array
    {
        $decoded = json_decode((string) $registration['trading_times_json'], true);
        return is_array($decoded) ? $decoded : [];
    }
}
