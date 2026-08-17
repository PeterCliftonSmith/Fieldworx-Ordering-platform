# Fieldworx Ordering Platform (LAMP)

PHP + MySQL + Apache ordering site for South African restaurants and suppliers. Built for **Xneelo shared hosting**.

## Stack

- PHP 8.1+ (tested on 8.3)
- MySQL / MariaDB
- Apache with `mod_rewrite`
- No Node.js build step

## Local / remote MySQL setup

The web server and MySQL server can be different machines. In `config.php`:

```php
'db' => [
    'host' => 'sqlXX.your-host.example', // MySQL hostname from the control panel
    'port' => 3306,
    'name' => 'your_db_name',
    'user' => 'your_db_user',
    'pass' => 'your_db_password',
    'charset' => 'utf8mb4',
    'socket' => '', // must be empty when DB is remote
],
```

1. Copy config:
   ```bash
   cp config.example.php config.php
   ```
2. Set the **remote** MySQL host, database name, user, and password. Leave `socket` as `''`.
3. Import schema + sample catalogue (run this from a machine that can reach that MySQL host, with PHP + the `pdo_mysql` extension):
   ```bash
   php sql/seed.php
   ```
4. Run the site (PHP still runs on your web/dev machine):
   ```bash
   php -S localhost:8080 router.php
   ```
5. Open http://localhost:8080  
   Admin: http://localhost:8080/admin/login (password from `config.php`, default `fieldworx-admin`)

If seeding fails with a connection error, confirm the MySQL host allows connections from your web/dev IP (some hosts only allow their own web servers).
## Deploy on Xneelo

1. Create a **MySQL database** and user in the Xneelo control panel.
2. Upload the project files into your hosting package document root (`public_html`), or into a subfolder.
3. Copy `config.example.php` → `config.php` on the **web** server and set:
   - `db.host` → MySQL hostname from the Xneelo panel (often **not** `localhost` if DB is separate)
   - `db.name`, `db.user`, `db.pass` from the panel
   - `db.socket` → `''` when MySQL is on a different server
   - `base_url` → `''` for domain root, or `'/your-subfolder'` if not at the root
   - `admin_password` → a strong password4. Ensure Apache rewrite is on (Xneelo enables this for `.htaccess`).
5. Seed the database over SSH or a temporary runner:
   ```bash
   php sql/seed.php
   ```
   Or import `sql/schema.sql` in phpMyAdmin, then run the seeder for sample suppliers.
6. Keep `config.php` off the public internet (blocked by `.htaccess`).

### Security checklist

- Change the default admin password before go-live
- Prefer HTTPS (Xneelo certificates)
- `app/`, `sql/`, `data/`, `storage/`, and `config.php` are blocked from direct web access

## Features

- Customer registration with admin approval
- Trade prices hidden until an approved customer signs in
- Supplier catalogues with optional product varieties (for example loaf vs grated)
- Browser draft cart; submitted orders stored in MySQL
- Admin CRUD for suppliers/products/varieties and registration approve/reject

## Project layout

```
index.php           Front controller
.htaccess           Rewrites + access rules
router.php          Local PHP built-in server helper
config.example.php  Config template
app/                PHP application code (not web-accessible)
assets/             CSS + JS
sql/                Schema + seed script
data/catalog.json   Source catalogue used by the seeder
```

## Notes

This replaces the earlier Next.js prototype with a classic LAMP app so it can run on Xneelo shared hosting without a Node process.
