<?php

declare(strict_types=1);

final class RegistrationAdminController
{
    public static function index(): void
    {
        Auth::requireAdmin();
        render('admin/registrations', [
            'title' => 'Registrations',
            'registrations' => Registration::all(),
        ], 'admin-layout');
    }

    public static function show(string $id): void
    {
        Auth::requireAdmin();
        $registration = Registration::find($id);
        if (!$registration) {
            http_response_code(404);
            render('errors/404', ['title' => 'Not found'], 'admin-layout');
            return;
        }
        render('admin/registration-show', [
            'title' => $registration['trading_name'],
            'registration' => $registration,
            'tradingTimes' => Registration::tradingTimes($registration),
        ], 'admin-layout');
    }

    public static function decide(string $id): void
    {
        Auth::requireAdmin();
        verify_csrf();
        $action = (string) post('action');
        if (!in_array($action, ['approve', 'reject'], true)) {
            flash_set('error', 'Unknown action.');
            redirect('/admin/registrations/' . rawurlencode($id));
        }
        Registration::setStatus($id, $action === 'approve' ? 'approved' : 'rejected');
        flash_set('success', 'Registration ' . $action . 'd.');
        redirect('/admin/registrations/' . rawurlencode($id));
    }
}
