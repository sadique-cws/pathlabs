<?php

use Inertia\Testing\AssertableInertia as Assert;

it('shows panel quick login credentials on login page', function () {
    $response = $this->get(route('login'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->has('panelQuickLogins', 5)
            ->where('panelQuickLogins.0.email', 'admin@pathlabs.test')
            ->where('panelQuickLogins.1.email', 'lab@pathlabs.test')
            ->where('panelQuickLogins.2.email', 'cc@pathlabs.test')
            ->where('panelQuickLogins.3.email', 'doctor@pathlabs.test')
            ->where('panelQuickLogins.4.email', 'frontdesk@pathlabs.test'));
});
