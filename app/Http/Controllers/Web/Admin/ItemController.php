<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    private function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:255',
            'stock_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }

    private function messages(): array
    {
        return [
            'image.file' => 'Please upload a valid file.',
            'image.mimes' => 'Item image must be a JPG, JPEG, PNG, or WEBP file.',
            'image.max' => 'Item image size must not be greater than 2MB.',
        ];
    }

    public function index(): Response
    {
        $items = Item::latest()->get()->map(fn (Item $item) => [
            'id' => $item->id,
            'name' => $item->name,
            'category' => $item->category,
            'description' => $item->description,
            'image_url' => $item->image_url,
            'stock_quantity' => $item->stock_quantity,
            'low_stock_threshold' => $item->low_stock_threshold,
            'is_active' => $item->is_active,
        ]);

        return Inertia::render('admin/items', [
            'items' => $items,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate($this->rules(), $this->messages());

        $imageUrl = $request->file('image')
            ? '/storage/' . $request->file('image')->store('items', 'public')
            : null;

        Item::create([
            'name' => $request->name,
            'category' => $request->category,
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
        $request->validate($this->rules(), $this->messages());

        $data = [
            'name' => $request->name,
            'category' => $request->category,
            'description' => $request->description,
            'stock_quantity' => $request->integer('stock_quantity'),
            'low_stock_threshold' => $request->integer('low_stock_threshold'),
        ];

        if ($request->file('image')) {
            if ($item->image_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $item->image_url));
            }

            $data['image_url'] = '/storage/' . $request->file('image')->store('items', 'public');
        }

        $item->update($data);

        return redirect()->route('admin.items.index')->with('success', 'Item updated successfully.');
    }

    public function destroy(Item $item): RedirectResponse
    {
        $item->update(['is_active' => false]);

        return redirect()->route('admin.items.index')->with('success', 'Item deactivated successfully.');
    }
}
