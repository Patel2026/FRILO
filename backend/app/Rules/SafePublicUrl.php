<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SafePublicUrl implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)
            || mb_strlen($value) > 255
            || preg_match('#^/(?!/)[^\x00-\x1F\x7F\\\\]*$#u', $value) !== 1
        ) {
            $fail('The :attribute field must be a safe internal URL.');
        }
    }
}
