<?php

namespace App\Http\Requests\Admin;

use App\Content\PublicContentRegistry;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class UpdatePublicSectionRequest extends FormRequest
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

        if (array_key_exists('content_json', $data)) {
            $decoded = json_decode((string) $data['content_json'], true);
            unset($data['content_json']);

            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $data['content'] = $decoded;
            } else {
                $data['content'] = null;
                $this->jsonErrors['content_json'] = 'Le JSON du contenu est invalide.';
            }

            $this->replace($data);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'position' => ['sometimes', 'integer', 'min:0', 'max:9999'],
            'is_visible' => ['sometimes', 'boolean'],
            'content' => ['sometimes', 'required', 'array'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            foreach ($this->jsonErrors as $field => $message) {
                $validator->errors()->add($field, $message);
            }

            $unknownKeys = array_diff(
                array_keys($this->except(['_token', '_method'])),
                array_keys($this->rules()),
            );

            if ($unknownKeys !== []) {
                $validator->errors()->add('payload', 'Champs non autorises: '.implode(', ', $unknownKeys));
            }

            if ($validator->errors()->isNotEmpty() || ! $this->has('content')) {
                return;
            }

            $section = $this->route('publicSection');
            if (! $section || ! is_array($this->input('content'))) {
                return;
            }

            try {
                app(PublicContentRegistry::class)->validateSectionContent($section->key, $this->input('content'));
            } catch (ValidationException|InvalidArgumentException $exception) {
                $validator->errors()->add('content', $exception->getMessage());
            }
        });
    }
}
