<?php

namespace App\Http\Requests\Admin;

use App\Content\RichContentSanitizer;
use App\Models\ContentBlock;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use InvalidArgumentException;

class StoreContentBlockRequest extends FormRequest
{
    /**
     * @var array<string, string>
     */
    private array $jsonErrors = [];

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $data = $this->all();

        foreach (['content_json' => 'content', 'settings_json' => 'settings'] as $jsonField => $targetField) {
            if (! array_key_exists($jsonField, $data)) {
                continue;
            }

            $raw = trim((string) $data[$jsonField]);
            unset($data[$jsonField]);

            if ($raw === '' && $targetField === 'settings') {
                $data[$targetField] = null;
                continue;
            }

            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $data[$targetField] = $decoded;
            } else {
                $data[$targetField] = null;
                $this->jsonErrors[$jsonField] = 'Le JSON est invalide.';
            }
        }

        $this->replace($data);
    }

    public function rules(): array
    {
        return [
            'layout' => ['required', Rule::in(ContentBlock::LAYOUTS)],
            'anchor_section_key' => ['nullable', 'string', 'max:120'],
            'position' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_visible' => ['nullable', 'boolean'],
            'content' => ['required', 'array'],
            'settings' => ['nullable', 'array'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            foreach ($this->jsonErrors as $field => $message) {
                $validator->errors()->add($field, $message);
            }

            $this->validateAllowedKeys($validator);

            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $this->validateContentShape($validator, (string) $this->input('layout'), (array) $this->input('content', []));
        });
    }

    protected function validateAllowedKeys($validator): void
    {
        $unknownKeys = array_diff(
            array_keys($this->except(['_token', '_method'])),
            array_keys($this->rules()),
        );

        if ($unknownKeys !== []) {
            $validator->errors()->add('payload', 'Champs non autorises: '.implode(', ', $unknownKeys));
        }
    }

    protected function validateContentShape($validator, string $layout, array $content): void
    {
        $allowedKeys = match ($layout) {
            ContentBlock::LAYOUT_FULL_WIDTH => ['body'],
            ContentBlock::LAYOUT_TWO_COLUMNS => ['left', 'right'],
            ContentBlock::LAYOUT_MEDIA_TEXT => array_key_exists('media_label', $content)
                ? ['body', 'media_label']
                : ['body'],
            default => [],
        };

        if ($allowedKeys === [] || $this->sortedStrings(array_keys($content)) !== $this->sortedStrings($allowedKeys)) {
            $validator->errors()->add('content', 'Structure de contenu invalide pour ce bloc.');

            return;
        }

        foreach ($allowedKeys as $key) {
            if ($key === 'media_label') {
                if (! is_string($content[$key]) || mb_strlen($content[$key]) > 120 || str_contains($content[$key], '<') || str_contains($content[$key], '>')) {
                    $validator->errors()->add('content.media_label', 'Libelle media invalide.');
                }

                continue;
            }

            if (! is_array($content[$key])) {
                $validator->errors()->add("content.{$key}", 'Contenu riche invalide.');

                continue;
            }

            try {
                app(RichContentSanitizer::class)->sanitize($content[$key]);
            } catch (InvalidArgumentException $exception) {
                $validator->errors()->add("content.{$key}", $exception->getMessage());
            }
        }
    }

    private function sortedStrings(array $value): array
    {
        sort($value);

        return $value;
    }
}
