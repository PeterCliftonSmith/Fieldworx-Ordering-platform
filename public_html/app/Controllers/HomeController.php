<?php

declare(strict_types=1);

final class HomeController
{
    public static function index(): void
    {
        $suppliers = array_slice(Supplier::listSummary(), 0, 3);
        render('home', [
            'title' => 'Restaurant ordering from suppliers',
            'suppliers' => $suppliers,
        ]);
    }

    public static function howItWorks(): void
    {
        render('how-it-works', [
            'title' => 'How it works',
        ]);
    }
}
