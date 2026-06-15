<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_example_root_redirects_to_private_admin_entry(): void
    {
        config(['frilo.admin_entry_path' => 'frilo-console']);

        $this->get('/')
            ->assertRedirect('/frilo-console');
    }
}
