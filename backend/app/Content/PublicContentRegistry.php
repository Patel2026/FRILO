<?php

namespace App\Content;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Validator;
use InvalidArgumentException;

class PublicContentRegistry
{
    /**
     * @return array<string, array<string, mixed>>
     */
    public function pages(): array
    {
        return config('public-content.pages', []);
    }

    /**
     * @return array<string, mixed>
     */
    public function page(string $key): array
    {
        $page = $this->pages()[$key] ?? null;

        if (! is_array($page)) {
            throw new InvalidArgumentException("Unknown public page key [{$key}].");
        }

        return $page;
    }

    /**
     * @return array<string, mixed>
     */
    public function section(string $key): array
    {
        $section = config('public-content.sections', [])[$key] ?? null;

        if (! is_array($section)) {
            throw new InvalidArgumentException("Unknown public section key [{$key}].");
        }

        return $section;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public function sectionsForPage(string $pageKey): array
    {
        $this->page($pageKey);

        $sections = array_filter(
            config('public-content.sections', []),
            static fn (mixed $section): bool => is_array($section)
                && ($section['page'] ?? null) === $pageKey,
        );

        uasort(
            $sections,
            static fn (array $left, array $right): int => $left['position'] <=> $right['position'],
        );

        return $sections;
    }

    public function assertValidConfiguration(): void
    {
        $pages = $this->pages();

        foreach ($pages as $pageKey => $definition) {
            if (! is_array($definition) || ! isset($definition['route_pattern'], $definition['name'])) {
                throw new InvalidArgumentException("Invalid public page definition [{$pageKey}].");
            }
        }

        foreach (config('public-content.sections', []) as $sectionKey => $definition) {
            if (! is_array($definition) || ! isset($definition['page'], $definition['defaults'])) {
                throw new InvalidArgumentException("Invalid public section definition [{$sectionKey}].");
            }

            if (! array_key_exists($definition['page'], $pages)) {
                throw new InvalidArgumentException(
                    "Public section [{$sectionKey}] references unknown page [{$definition['page']}].",
                );
            }

            $this->validateSectionContent($sectionKey, $definition['defaults']);
        }
    }

    /**
     * @param  array<string, mixed>  $content
     * @return array<string, mixed>
     */
    public function validateSectionContent(string $sectionKey, array $content): array
    {
        $definition = $this->section($sectionKey);
        $allowedFields = array_keys($definition['defaults']);
        $rules = [
            'content' => ['required', 'array:'.implode(',', $allowedFields)],
        ];

        foreach ($definition['rules'] as $field => $fieldRules) {
            $rules["content.{$field}"] = array_map(
                static fn (mixed $rule): mixed => is_string($rule)
                    && is_subclass_of($rule, ValidationRule::class)
                        ? app($rule)
                        : $rule,
                $fieldRules,
            );
        }

        $validated = Validator::make(['content' => $content], $rules)->validate();

        return $validated['content'];
    }
}
