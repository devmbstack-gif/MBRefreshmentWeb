<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Item;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    private function categoryIdRule(): array
    {
        return [
            'required',
            'integer',
            Rule::exists('categories', 'id')->where('is_active', true),
        ];
    }

    private function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'category_id' => $this->categoryIdRule(),
            'description' => 'nullable|string|max:255',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'image' => 'required|file|extensions:jpg,jpeg,png,webp|max:2048',
        ];
    }

    private function messages(): array
    {
        return [
            'image.file' => 'Please upload a valid file.',
            'image.extensions' => 'Item image must be a JPG, JPEG, PNG, or WEBP file.',
            'image.max' => 'Item image size must not be greater than 2MB.',
            'image.required' => 'Item image is required.',
        ];
    }

    public function index(): Response
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image_url' => $category->image_url,
            ]);

        $items = Item::latest()->get()->map(function (Item $item) {
            $resolvedCategoryId = $item->category_id ?? Category::query()
                ->whereRaw('LOWER(name) = ?', [mb_strtolower(trim((string) $item->category))])
                ->value('id');

            return [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'category_id' => $resolvedCategoryId,
                'description' => $item->description,
                'image_url' => $item->image_url,
                'stock_quantity' => $item->stock_quantity,
                'low_stock_threshold' => $item->low_stock_threshold,
                'is_active' => $item->is_active,
            ];
        });

        return Inertia::render('admin/items', [
            'items' => $items,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate($this->rules(), $this->messages());

        $category = Category::query()
            ->whereKey($request->integer('category_id'))
            ->where('is_active', true)
            ->firstOrFail();

        $imageUrl = $request->file('image')
            ? '/storage/'.$request->file('image')->store('items', 'public')
            : null;

        Item::create([
            'name' => $request->name,
            'category' => $category->name,
            'category_id' => $category->id,
            'description' => $request->description,
            'image_url' => $imageUrl,
            'stock_quantity' => $request->integer('stock_quantity'),
            'low_stock_threshold' => $request->integer('low_stock_threshold'),
            'is_active' => true,
        ]);

        return redirect()->route('admin.items.index')->with('success', 'Item created successfully.');
    }

    public function update(Request $request, Item $item): RedirectResponse
    {
        $rules = $this->rules();
        $rules['image'] = 'nullable|file|extensions:jpg,jpeg,png,webp|max:2048';
        $request->validate($rules, $this->messages());

        $category = Category::query()
            ->whereKey($request->integer('category_id'))
            ->where('is_active', true)
            ->firstOrFail();

        if (! $item->image_url && ! $request->file('image')) {
            return redirect()
                ->back()
                ->withErrors(['image' => 'Item image is required.'])
                ->withInput();
        }

        $data = [
            'name' => $request->name,
            'category' => $category->name,
            'category_id' => $category->id,
            'description' => $request->description,
            'stock_quantity' => $request->integer('stock_quantity'),
            'low_stock_threshold' => $request->integer('low_stock_threshold'),
        ];

        if ($request->file('image')) {
            if ($item->image_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $item->image_url));
            }

            $data['image_url'] = '/storage/'.$request->file('image')->store('items', 'public');
        }

        $item->update($data);

        return redirect()->route('admin.items.index')->with('success', 'Item updated successfully.');
    }

    public function destroy(Item $item): RedirectResponse
    {
        $hasPlanRelations = DB::table('quota_plan_items')
            ->where('item_id', $item->id)
            ->exists();

        $hasQuotaRelations = DB::table('employee_quotas')
            ->where('item_id', $item->id)
            ->exists();

        $hasUsageRelations = DB::table('quota_usages')
            ->where('item_id', $item->id)
            ->exists();
        $hasMealOrderRelations = DB::table('meal_order_requests')
            ->where('item_id', $item->id)
            ->exists();

        if ($hasPlanRelations || $hasQuotaRelations || $hasUsageRelations || $hasMealOrderRelations) {
            return redirect()
                ->route('admin.items.index')
                ->with('error', 'This item cannot be deleted because it is linked to plan/quota usage history. Keep it deactivated instead.');
        }

        if ($item->image_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $item->image_url));
        }

        $item->delete();

        return redirect()->route('admin.items.index')->with('success', 'Item deleted successfully.');
    }

    public function toggleStatus(Item $item): RedirectResponse
    {
        $item->update(['is_active' => ! $item->is_active]);

        $status = $item->is_active ? 'activated' : 'deactivated';

        return redirect()->route('admin.items.index')->with('success', "Item {$status} successfully.");
    }
}
