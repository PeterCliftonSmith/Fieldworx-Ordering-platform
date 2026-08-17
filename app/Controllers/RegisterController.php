<?php

declare(strict_types=1);

final class RegisterController
{
    public static function form(): void
    {
        render('auth/register', [
            'title' => 'Register',
            'error' => null,
            'old' => [],
            'days' => self::days(),
        ]);
    }

    public static function submit(): void
    {
        verify_csrf();
        $old = $_POST;
        unset($old['password'], $old['password_confirm'], $old['_csrf']);

        try {
            if ((string) post('password') !== (string) post('password_confirm')) {
                throw new InvalidArgumentException('Passwords do not match.');
            }

            $tradingTimes = [];
            foreach (self::days() as $key => $label) {
                $closed = !empty($_POST['day_closed'][$key]);
                $tradingTimes[] = [
                    'day' => $key,
                    'label' => $label,
                    'closed' => $closed,
                    'open' => $closed ? null : ($_POST['day_open'][$key] ?? null),
                    'close' => $closed ? null : ($_POST['day_close'][$key] ?? null),
                ];
            }

            Registration::create([
                'username' => post('username'),
                'password' => post('password'),
                'registered_business_name' => post('registered_business_name'),
                'trading_name' => post('trading_name'),
                'vat_number' => post('vat_number'),
                'registration_number' => post('registration_number'),
                'landline_number' => post('landline_number'),
                'buyer_name' => post('buyer_name'),
                'buyer_phone' => post('buyer_phone'),
                'buyer_email' => post('buyer_email'),
                'accounts_name' => post('accounts_name'),
                'accounts_phone' => post('accounts_phone'),
                'accounts_email' => post('accounts_email'),
                'address_line1' => post('address_line1'),
                'address_line2' => post('address_line2'),
                'city' => post('city'),
                'province' => post('province'),
                'postal_code' => post('postal_code'),
                'trading_times' => $tradingTimes,
                'trading_times_notes' => post('trading_times_notes'),
            ]);

            flash_set('success', 'Registration received. You can sign in after Fieldworx approves your account.');
            redirect('/login');
        } catch (Throwable $e) {
            render('auth/register', [
                'title' => 'Register',
                'error' => $e->getMessage(),
                'old' => $old,
                'days' => self::days(),
            ]);
        }
    }

    private static function days(): array
    {
        return [
            'mon' => 'Monday',
            'tue' => 'Tuesday',
            'wed' => 'Wednesday',
            'thu' => 'Thursday',
            'fri' => 'Friday',
            'sat' => 'Saturday',
            'sun' => 'Sunday',
        ];
    }
}
