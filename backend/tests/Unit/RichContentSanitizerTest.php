<?php

namespace Tests\Unit;

use App\Content\RichContentSanitizer;
use App\Rules\ValidRichContent;
use Illuminate\Support\Facades\Validator;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RichContentSanitizerTest extends TestCase
{
    public function test_it_accepts_and_normalizes_a_complete_safe_document(): void
    {
        $document = [
            'type' => 'doc',
            'content' => [
                2 => ['type' => 'heading', 'attrs' => ['level' => 2], 'content' => [
                    ['type' => 'text', 'text' => 'Titre', 'marks' => [['type' => 'bold']]],
                ]],
                5 => ['type' => 'paragraph', 'content' => [
                    ['type' => 'text', 'text' => 'Voir ', 'marks' => [['type' => 'italic']]],
                    ['type' => 'text', 'text' => 'la page', 'marks' => [
                        ['type' => 'link', 'attrs' => ['href' => '/interne']],
                    ]],
                ]],
                8 => ['type' => 'bullet_list', 'content' => [
                    ['type' => 'list_item', 'content' => [
                        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Item']]],
                        ['type' => 'ordered_list', 'content' => [
                            ['type' => 'list_item', 'content' => [
                                ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Sous-item']]],
                            ]],
                        ]],
                    ]],
                ]],
                10 => ['type' => 'table', 'content' => [
                    ['type' => 'table_row', 'content' => [
                        ['type' => 'table_cell', 'content' => [
                            ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Cellule']]],
                        ]],
                    ]],
                ]],
            ],
        ];

        $sanitized = (new RichContentSanitizer)->sanitize($document);

        $this->assertSame($document['type'], $sanitized['type']);
        $this->assertSame([0, 1, 2, 3], array_keys($sanitized['content']));
        $this->assertSame('/interne', $sanitized['content'][1]['content'][1]['marks'][0]['attrs']['href']);
    }

    #[DataProvider('invalidDocumentProvider')]
    public function test_it_rejects_invalid_or_dangerous_documents(array $document): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new RichContentSanitizer)->sanitize($document);
    }

    public static function invalidDocumentProvider(): array
    {
        $text = ['type' => 'text', 'text' => 'Safe'];
        $paragraph = ['type' => 'paragraph', 'content' => [$text]];
        $doc = static fn (array $node): array => ['type' => 'doc', 'content' => [$node]];

        return [
            'raw HTML text field' => [$doc(['type' => 'text', 'text' => '<script>alert(1)</script>'])],
            'script node' => [$doc(['type' => 'script', 'content' => []])],
            'unknown node' => [$doc(['type' => 'blockquote', 'content' => [$paragraph]])],
            'unknown attribute' => [$doc(['type' => 'paragraph', 'class' => 'bad', 'content' => []])],
            'inline style' => [$doc(['type' => 'paragraph', 'attrs' => ['style' => 'color:red'], 'content' => []])],
            'iframe node' => [$doc(['type' => 'iframe', 'attrs' => ['src' => 'https://evil.test']])],
            'embed node' => [$doc(['type' => 'embed', 'attrs' => []])],
            'invalid heading level' => [$doc(['type' => 'heading', 'attrs' => ['level' => 1], 'content' => [$text]])],
            'unknown mark' => [$doc(['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'x', 'marks' => [['type' => 'underline']]]]])],
            'mark extra field' => [$doc(['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'x', 'marks' => [['type' => 'bold', 'class' => 'bad']]]]])],
            'javascript link' => [$doc(self::linkedParagraph('javascript:alert(1)'))],
            'data link' => [$doc(self::linkedParagraph('data:text/html,bad'))],
            'protocol-relative link' => [$doc(self::linkedParagraph('//evil.test'))],
            'invalid child' => [$doc(['type' => 'paragraph', 'content' => [['type' => 'heading', 'attrs' => ['level' => 2], 'content' => []]]])],
            'invalid list child' => [$doc(['type' => 'bullet_list', 'content' => [$paragraph]])],
            'invalid list item child' => [$doc(['type' => 'list_item', 'content' => [$text]])],
            'invalid table child' => [$doc(['type' => 'table', 'content' => [$paragraph]])],
            'invalid row child' => [$doc(['type' => 'table_row', 'content' => [$paragraph]])],
            'invalid cell child' => [$doc(['type' => 'table_cell', 'content' => [['type' => 'heading', 'attrs' => ['level' => 2], 'content' => []]]])],
            'extra top-level field' => [['type' => 'doc', 'content' => [$paragraph], 'html' => '<b>bad</b>']],
            'non doc root' => [['type' => 'paragraph', 'content' => []]],
        ];
    }

    #[DataProvider('safeUrlProvider')]
    public function test_it_accepts_allowed_link_protocols(string $href): void
    {
        $document = ['type' => 'doc', 'content' => [self::linkedParagraph($href)]];

        $this->assertSame($href, (new RichContentSanitizer)->sanitize($document)['content'][0]['content'][0]['marks'][0]['attrs']['href']);
    }

    public static function safeUrlProvider(): array
    {
        return [['/page'], ['http://example.test/path'], ['https://example.test'], ['mailto:hello@example.test']];
    }

    public function test_valid_rich_content_rule_integrates_with_laravel_validator(): void
    {
        $valid = ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => []]]];
        $invalid = ['type' => 'doc', 'content' => [self::linkedParagraph('javascript:alert(1)')]];

        $this->assertFalse(Validator::make(['body' => $valid], ['body' => [new ValidRichContent]])->fails());

        $validator = Validator::make(['body' => $invalid], ['body' => [new ValidRichContent]]);
        $this->assertTrue($validator->fails());
        $this->assertNotEmpty($validator->errors()->first('body'));
    }

    public function test_it_rejects_documents_that_are_too_deep(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new RichContentSanitizer)->sanitize([
            'type' => 'doc',
            'content' => [['type' => 'bullet_list', 'content' => [self::nestedList(20)]]],
        ]);
    }

    public function test_it_rejects_nodes_with_too_many_children(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new RichContentSanitizer)->sanitize([
            'type' => 'doc',
            'content' => array_fill(0, 201, [
                'type' => 'paragraph',
                'content' => [],
            ]),
        ]);
    }

    public function test_it_rejects_documents_with_too_many_nodes(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new RichContentSanitizer)->sanitize([
            'type' => 'doc',
            'content' => array_fill(0, 200, [
                'type' => 'paragraph',
                'content' => array_fill(0, 5, ['type' => 'text', 'text' => 'x']),
            ]),
        ]);
    }

    public function test_it_rejects_text_nodes_that_are_too_long(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new RichContentSanitizer)->sanitize([
            'type' => 'doc',
            'content' => [[
                'type' => 'paragraph',
                'content' => [['type' => 'text', 'text' => str_repeat('a', 10001)]],
            ]],
        ]);
    }

    public function test_it_rejects_documents_with_too_much_total_text(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new RichContentSanitizer)->sanitize([
            'type' => 'doc',
            'content' => array_fill(0, 6, [
                'type' => 'paragraph',
                'content' => [['type' => 'text', 'text' => str_repeat('a', 9000)]],
            ]),
        ]);
    }

    public function test_it_rejects_too_many_marks_on_a_text_node(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new RichContentSanitizer)->sanitize([
            'type' => 'doc',
            'content' => [[
                'type' => 'paragraph',
                'content' => [[
                    'type' => 'text',
                    'text' => 'Marked',
                    'marks' => array_fill(0, 5, ['type' => 'bold']),
                ]],
            ]],
        ]);
    }

    public function test_it_rejects_links_that_are_too_long(): void
    {
        $this->expectException(InvalidArgumentException::class);

        (new RichContentSanitizer)->sanitize([
            'type' => 'doc',
            'content' => [self::linkedParagraph('https://example.test/'.str_repeat('a', 2048))],
        ]);
    }

    private static function linkedParagraph(string $href): array
    {
        return ['type' => 'paragraph', 'content' => [
            ['type' => 'text', 'text' => 'Link', 'marks' => [['type' => 'link', 'attrs' => ['href' => $href]]]],
        ]];
    }

    private static function nestedList(int $levels): array
    {
        $itemContent = [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Item']]]];

        if ($levels > 0) {
            $itemContent[] = [
                'type' => 'bullet_list',
                'content' => [self::nestedList($levels - 1)],
            ];
        }

        return [
            'type' => 'list_item',
            'content' => $itemContent,
        ];
    }
}
