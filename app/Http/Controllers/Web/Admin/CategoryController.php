<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\PublicDiskUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    private function rules(?Category $category = null): array
    {
        $categoryId = $category?->id ?? 'NULL';

        return [
            'name' => 'required|string|max:100|unique:categories,name,'.$categoryId,
            'image' => ['nullable', 'file', 'extensions:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $imageUrl = $request->file('image')
            ? PublicDiskUpload::store($request->file('image'), 'categories')
            : null;

        Category::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'image_url' => $imageUrl,
            'is_active' => true,
        ]);

        return redirect()->route('admin.items.index')->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate($this->rules($category));

        $data = [
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ];

        if ($request->file('image')) {
            if ($category->image_url) {
                PublicDiskUpload::deleteFromPublicUrl($category->image_url);
            }

            $data['image_url'] = PublicDiskUpload::store(
                $request->file('image'),
                'categories',
            );
        }

        $category->update($data);

        return redirect()->route('admin.items.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->image_url) {
            PublicDiskUpload::deleteFromPublicUrl($category->image_url);
        }

        $category->delete();

        return redirect()->route('admin.items.index')->with('success', 'Category deleted successfully.');
    }
}
