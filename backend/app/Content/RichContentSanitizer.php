<?php

namespace App\Content;

use InvalidArgumentException;

class RichContentSanitizer
{
    private const MAX_DEPTH = 16;

    private const MAX_NODES = 1000;

    private const MAX_CHILDREN_PER_NODE = 200;

    private const MAX_MARKS_PER_TEXT = 4;

    private const MAX_TEXT_LENGTH = 10000;

    private const MAX_TOTAL_TEXT_LENGTH = 50000;

    private const MAX_HREF_LENGTH = 2048;

    private const BLOCK_NODES = ['paragraph', 'heading', 'bullet_list', 'ordered_list', 'table'];

    private const LIST_NODES = ['bullet_list', 'ordered_list'];

    public function sanitize(array $document): array
    {
        $limits = ['nodes' => 0, 'text_length' => 0];

        return $this->sanitizeNode($document, ['doc'], 'document', 0, $limits);
    }

    private function sanitizeNode(array $node, array $allowedTypes, string $path, int $depth, array &$limits): array
    {
        $this->guardDepth($depth, $path);
        $this->guardNodeCount($limits, $path);

        $type = $node['type'] ?? null;

        if (! is_string($type) || ! in_array($type, $allowedTypes, true)) {
            throw new InvalidArgumentException("Invalid rich content node at {$path}.");
        }

        return match ($type) {
            'doc' => $this->sanitizeContainer($node, ['type', 'content'], self::BLOCK_NODES, $path, $depth, $limits),
            'paragraph' => $this->sanitizeContainer($node, ['type', 'content'], ['text'], $path, $depth, $limits),
            'heading' => $this->sanitizeHeading($node, $path, $depth, $limits),
            'text' => $this->sanitizeText($node, $path, $limits),
            'bullet_list', 'ordered_list' => $this->sanitizeContainer($node, ['type', 'content'], ['list_item'], $path, $depth, $limits),
            'list_item' => $this->sanitizeContainer($node, ['type', 'content'], ['paragraph', ...self::LIST_NODES], $path, $depth, $limits),
            'table' => $this->sanitizeContainer($node, ['type', 'content'], ['table_row'], $path, $depth, $limits),
            'table_row' => $this->sanitizeContainer($node, ['type', 'content'], ['table_cell'], $path, $depth, $limits),
            'table_cell' => $this->sanitizeContainer($node, ['type', 'content'], ['paragraph'], $path, $depth, $limits),
            default => throw new InvalidArgumentException("Unknown rich content node at {$path}."),
        };
    }

    private function sanitizeContainer(array $node, array $allowedKeys, array $allowedChildren, string $path, int $depth, array &$limits): array
    {
        $this->assertExactKeys($node, $allowedKeys, $path);
        $content = $this->assertArray($node['content'], "{$path}.content");
        $this->guardChildrenCount($content, "{$path}.content");

        $sanitizedContent = [];

        foreach (array_values($content) as $index => $child) {
            $sanitizedContent[] = $this->sanitizeNode($child, $allowedChildren, "{$path}.content.{$index}", $depth + 1, $limits);
        }

        return [
            'type' => $node['type'],
            'content' => $sanitizedContent,
        ];
    }

    private function sanitizeHeading(array $node, string $path, int $depth, array &$limits): array
    {
        $this->assertExactKeys($node, ['type', 'attrs', 'content'], $path);
        $attrs = $this->assertObject($node['attrs'], "{$path}.attrs");
        $this->assertExactKeys($attrs, ['level'], "{$path}.attrs");

        if (! in_array($attrs['level'], [2, 3, 4], true)) {
            throw new InvalidArgumentException("Invalid heading level at {$path}.");
        }

        $sanitized = $this->sanitizeContainer(
            ['type' => $node['type'], 'content' => $node['content']],
            ['type', 'content'],
            ['text'],
            $path,
            $depth,
            $limits,
        );

        return ['type' => 'heading', 'attrs' => ['level' => $attrs['level']], 'content' => $sanitized['content']];
    }

    private function sanitizeText(array $node, string $path, array &$limits): array
    {
        $allowedKeys = isset($node['marks']) ? ['type', 'text', 'marks'] : ['type', 'text'];
        $this->assertExactKeys($node, $allowedKeys, $path);

        if (! is_string($node['text']) || strlen($node['text']) > self::MAX_TEXT_LENGTH || str_contains($node['text'], '<') || str_contains($node['text'], '>')) {
            throw new InvalidArgumentException("Invalid text content at {$path}.");
        }

        $limits['text_length'] += strlen($node['text']);
        if ($limits['text_length'] > self::MAX_TOTAL_TEXT_LENGTH) {
            throw new InvalidArgumentException("Rich content text is too large at {$path}.");
        }

        $sanitized = ['type' => 'text', 'text' => $node['text']];

        if (isset($node['marks'])) {
            $marks = $this->assertArray($node['marks'], "{$path}.marks");
            if (count($marks) > self::MAX_MARKS_PER_TEXT) {
                throw new InvalidArgumentException("Too many rich content marks at {$path}.");
            }

            $sanitized['marks'] = array_map(
                fn (array $mark, int $index): array => $this->sanitizeMark($mark, "{$path}.marks.{$index}"),
                array_values($marks),
                array_keys(array_values($marks)),
            );
        }

        return $sanitized;
    }

    private function sanitizeMark(array $mark, string $path): array
    {
        $type = $mark['type'] ?? null;

        if ($type === 'bold' || $type === 'italic') {
            $this->assertExactKeys($mark, ['type'], $path);

            return ['type' => $type];
        }

        if ($type !== 'link') {
            throw new InvalidArgumentException("Invalid rich content mark at {$path}.");
        }

        $this->assertExactKeys($mark, ['type', 'attrs'], $path);
        $attrs = $this->assertObject($mark['attrs'], "{$path}.attrs");
        $this->assertExactKeys($attrs, ['href'], "{$path}.attrs");

        if (! is_string($attrs['href']) || strlen($attrs['href']) > self::MAX_HREF_LENGTH || ! $this->isSafeHref($attrs['href'])) {
            throw new InvalidArgumentException("Unsafe link at {$path}.");
        }

        return ['type' => 'link', 'attrs' => ['href' => $attrs['href']]];
    }

    private function isSafeHref(string $href): bool
    {
        if ($href === '' || preg_match('/[\x00-\x20\x7F\\\\]/', $href) === 1) {
            return false;
        }

        if (str_starts_with($href, '/')) {
            return ! str_starts_with($href, '//');
        }

        return preg_match('/^(https?:\/\/|mailto:)/i', $href) === 1;
    }

    private function assertExactKeys(array $value, array $allowedKeys, string $path): void
    {
        $keys = array_keys($value);
        sort($keys);
        sort($allowedKeys);

        if ($keys !== $allowedKeys) {
            throw new InvalidArgumentException("Unexpected or missing fields at {$path}.");
        }
    }

    private function assertArray(mixed $value, string $path): array
    {
        if (! is_array($value) || array_filter(array_keys($value), 'is_string') !== []) {
            throw new InvalidArgumentException("Expected a content array at {$path}.");
        }

        foreach ($value as $item) {
            if (! is_array($item)) {
                throw new InvalidArgumentException("Expected an object at {$path}.");
            }
        }

        return $value;
    }

    private function assertObject(mixed $value, string $path): array
    {
        if (! is_array($value) || $value === [] || array_filter(array_keys($value), 'is_string') === []) {
            throw new InvalidArgumentException("Expected an object at {$path}.");
        }

        return $value;
    }

    private function guardDepth(int $depth, string $path): void
    {
        if ($depth > self::MAX_DEPTH) {
            throw new InvalidArgumentException("Rich content is too deeply nested at {$path}.");
        }
    }

    private function guardNodeCount(array &$limits, string $path): void
    {
        $limits['nodes']++;

        if ($limits['nodes'] > self::MAX_NODES) {
            throw new InvalidArgumentException("Rich content has too many nodes at {$path}.");
        }
    }

    private function guardChildrenCount(array $content, string $path): void
    {
        if (count($content) > self::MAX_CHILDREN_PER_NODE) {
            throw new InvalidArgumentException("Rich content has too many children at {$path}.");
        }
    }
}
