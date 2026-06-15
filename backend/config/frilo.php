<?php

return [
    'admin_entry_path' => trim((string) env('FRILO_ADMIN_ENTRY_PATH', 'frilo-console'), '/') ?: 'frilo-console',
];
