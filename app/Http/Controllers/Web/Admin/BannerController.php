<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Support\PublicDiskUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    private function rules(): array
    {
        return [
            'title' => 'required|string|max:150',
            'description' => 'nullable|string|max:2000',
            'image' => 'nullable|file|extensions:jpg,jpeg,png,webp|max:2048',
            'sort_order' => 'required|integer|min:0|max:65535',
            'is_active' => 'sometimes|boolean',
        ];
    }

    public function index(): Response
    {
        $banners = Banner::query()
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Banner $b) => [
                'id' => $b->id,
                'title' => $b->title,
                'description' => $b->description,
                'image_url' => $b->image_url,
                'sort_order' => $b->sort_order,
                'is_active' => $b->is_active,
            ]);

        return Inertia::render('admin/banners', [
            'banners' => $banners,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $imageUrl = $request->file('image')
            ? PublicDiskUpload::store($request->file('image'), 'banners')
            : null;

        Banner::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'image_url' => $imageUrl,
            'sort_order' => (int) $validated['sort_order'],
            'is_active' => $request->has('is_active')
                ? $request->boolean('is_active')
                : true,
        ]);

        return redirect()->route('admin.banners.index')->with('success', 'Banner created successfully.');
    }

    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $data = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'sort_order' => (int) $validated['sort_order'],
            'is_active' => $request->has('is_active')
                ? $request->boolean('is_active')
                : $banner->is_active,
        ];

        if ($request->file('image')) {
            if ($banner->image_url) {
                PublicDiskUpload::deleteFromPublicUrl($banner->image_url);
            }
            $data['image_url'] = PublicDiskUpload::store(
                $request->file('image'),
                'banners',
            );
        }

        $banner->update($data);

        return redirect()->route('admin.banners.index')->with('success', 'Banner updated successfully.');
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        if ($banner->image_url) {
            PublicDiskUpload::deleteFromPublicUrl($banner->image_url);
        }
        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner deleted successfully.');
    }

    public function toggleStatus(Banner $banner): RedirectResponse
    {
        $banner->update(['is_active' => ! $banner->is_active]);

        $status = $banner->is_active ? 'activated' : 'deactivated';

        return redirect()->route('admin.banners.index')->with('success', "Banner {$status} successfully.");
    }
}
