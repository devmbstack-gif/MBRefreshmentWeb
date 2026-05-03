<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    private function buildAssetUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return url($path);
    }

    private function mapItemForEmployeeApi(Item $item): array
    {
        $imageUrl = $this->buildAssetUrl($item->image_url);

        return [
            'id' => $item->id,
            'item_name' => $item->name,
            'item_category' => $item->category,
            'item_description' => $item->description,
            'item_image_url' => $imageUrl,
            'plan_title' => null,
            'plan_description' => null,
            'plan_period_type' => null,
            'plan_ends_at' => null,
            'total_qty' => 0,
            'used_qty' => 0,
            'remaining_qty' => 0,
            'status' => null,
            'percentage_used' => 0,
        ];
    }

    private function mapCategoryForEmployeeApi(Category $category): array
    {
        $imageUrl = $this->buildAssetUrl($category->image_url);

        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'image_url' => $imageUrl,
            'category_id' => $category->id,
            'category_name' => $category->name,
            'category_slug' => $category->slug,
            'category_image_url' => $imageUrl,
            'is_active' => (bool) $category->is_active,
            'category_is_active' => (bool) $category->is_active,
            'created_at' => $category->created_at?->toIso8601String(),
            'updated_at' => $category->updated_at?->toIso8601String(),
        ];
    }

    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => $this->mapCategoryForEmployeeApi($category));

        return response()->json([
            'status' => true,
            'message' => 'Category list',
            'categories' => $categories,
        ]);
    }

    public function items(Request $request): JsonResponse
    {
        $request->validate([
            'category' => ['nullable', 'string', 'max:120'],
        ]);

        $query = Item::query()->where('is_active', true);
        $categoryFilter = $request->string('category')->trim()->toString();

        if ($categoryFilter !== '') {
            $query->where(function ($builder) use ($categoryFilter) {
                $builder
                    ->whereRaw('LOWER(category) = ?', [mb_strtolower($categoryFilter)])
                    ->orWhereIn('category', function ($subQuery) use ($categoryFilter) {
                        $subQuery->select('name')
                            ->from('categories')
                            ->whereRaw('LOWER(slug) = ?', [mb_strtolower($categoryFilter)])
                            ->orWhereRaw('LOWER(name) = ?', [mb_strtolower($categoryFilter)]);
                    });
            });
        }

        $items = $query
            ->orderBy('name')
            ->get()
            ->map(fn (Item $item) => $this->mapItemForEmployeeApi($item));

        return response()->json([
            'status' => true,
            'message' => 'Items list',
            'items' => $items,
            'filters' => [
                'category' => $categoryFilter !== '' ? $categoryFilter : null,
            ],
        ]);
    }

    public function itemsForCategory(Category $category): JsonResponse
    {
        if (! $category->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Category not found.',
            ], 404);
        }

        $items = Item::query()
            ->where('is_active', true)
            ->where('category_id', $category->id)
            ->orderBy('name')
            ->get()
            ->map(fn (Item $item) => $this->mapItemForEmployeeApi($item));

        return response()->json([
            'status' => true,
            'message' => 'Items for category',
            'category' => $this->mapCategoryForEmployeeApi($category),
            'items' => $items,
        ]);
    }
}
