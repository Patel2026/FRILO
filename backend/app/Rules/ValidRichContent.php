<?php

namespace App\Rules;

use App\Content\RichContentSanitizer;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use InvalidArgumentException;

/**
 * Validates the rich-content shape. Services must still persist the sanitized
 * document returned by RichContentSanitizer::sanitize().
 */
class ValidRichContent implements ValidationRule
{
    public function __construct(private readonly RichContentSanitizer $sanitizer = new RichContentSanitizer) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            $fail('The :attribute field must be a valid structured rich content document.');

            return;
        }

        try {
            $this->sanitizer->sanitize($value);
        } catch (InvalidArgumentException) {
            $fail('The :attribute field contains invalid or unsafe rich content.');
        }
    }
}
