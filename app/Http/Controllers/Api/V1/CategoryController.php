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

    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image_url' => $this->buildAssetUrl($category->image_url),
            ]);

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
            ->map(fn (Item $item) => [
                'id' => $item->id,
                'item_name' => $item->name,
                'category' => $item->category,
                'description' => $item->description,
                'image_url' => $this->buildAssetUrl($item->image_url),
                'stock_quantity' => $item->stock_quantity,
            ]);

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
            ->map(fn (Item $item) => [
                'id' => $item->id,
                'item_name' => $item->name,
                'category' => $item->category,
                'category_id' => $item->category_id,
                'description' => $item->description,
                'image_url' => $this->buildAssetUrl($item->image_url),
                'stock_quantity' => $item->stock_quantity,
            ]);

        return response()->json([
            'status' => true,
            'message' => 'Items for category',
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image_url' => $this->buildAssetUrl($category->image_url),
            ],
            'items' => $items,
        ]);
    }
}
