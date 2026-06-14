<?php

namespace App\Services;

use App\Models\ContentBlock;
use App\Models\ContentRevision;
use App\Models\PublicPage;
use App\Models\PublicSection;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ContentRevisionService
{
    public function snapshot(Model $revisionable, string $event, User $actor): ContentRevision
    {
        if (! method_exists($revisionable, 'revisions')) {
            throw new InvalidArgumentException('This resource does not support content revisions.');
        }

        return $revisionable->revisions()->create([
            'event' => $event,
            'snapshot' => [
                'class' => $revisionable::class,
                'id' => $revisionable->getKey(),
                'attributes' => $this->snapshotAttributes($revisionable),
            ],
            'created_by' => $actor->id,
        ]);
    }

    public function restore(ContentRevision $revision, User $actor): Model
    {
        return DB::transaction(function () use ($revision, $actor): Model {
            $snapshot = $revision->snapshot;
            $class = $snapshot['class'] ?? $revision->revisionable_type;
            $id = $snapshot['id'] ?? $revision->revisionable_id;

            if (! is_string($class) || ! is_a($class, Model::class, true) || $id === null) {
                throw new InvalidArgumentException('Invalid content revision snapshot.');
            }

            $model = $class::query()->findOrFail($id);
            $this->snapshot($model, $this->eventName($model, 'restored'), $actor);

            $model->forceFill($this->restorableAttributes($model, $snapshot['attributes'] ?? []));
            $model->save();
            $this->forgetPageCache($model);

            return $model->fresh();
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function snapshotAttributes(Model $model): array
    {
        return collect($model->attributesToArray())
            ->except(['created_at', 'updated_at'])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    private function restorableAttributes(Model $model, array $attributes): array
    {
        $allowed = match ($model::class) {
            PublicPage::class => ['route_pattern', 'name', 'seo_title', 'seo_description', 'is_indexable'],
            PublicSection::class => ['public_page_id', 'key', 'name', 'position', 'is_visible', 'content'],
            ContentBlock::class => ['public_page_id', 'anchor_section_key', 'position', 'layout', 'content', 'settings', 'is_visible'],
            default => throw new InvalidArgumentException('Unsupported content revision resource.'),
        };

        $restored = collect($attributes)->only($allowed)->all();

        foreach (['content', 'settings'] as $jsonField) {
            if (isset($restored[$jsonField]) && is_string($restored[$jsonField])) {
                $decoded = json_decode($restored[$jsonField], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $restored[$jsonField] = $decoded;
                }
            }
        }

        return $restored;
    }

    private function eventName(Model $model, string $action): string
    {
        return Str::of(class_basename($model))->snake()->append(".{$action}")->toString();
    }

    private function forgetPageCache(Model $model): void
    {
        $page = match ($model::class) {
            PublicPage::class => $model,
            PublicSection::class, ContentBlock::class => $model->loadMissing('page')->page,
            default => null,
        };

        if ($page instanceof PublicPage) {
            Cache::forget("public_content.page.{$page->key}");
        }
    }
}
