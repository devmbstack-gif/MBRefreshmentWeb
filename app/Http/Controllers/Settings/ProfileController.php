<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Support\PublicDiskUpload;
use App\Support\PublicDiskUpload;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => 'required|file|extensions:jpg,jpeg,png,webp|max:2048',
        ], [
            'avatar.required' => 'Please choose an image file.',
            'avatar.file' => 'Please upload a valid file.',
            'avatar.extensions' => 'Profile image must be a JPG, JPEG, PNG, or WEBP file.',
            'avatar.max' => 'Profile image size must not be greater than 2MB.',
        ]);

        $user = $request->user();

        if ($user->avatar) {
            PublicDiskUpload::deleteFromPublicUrl($user->avatar);
        }

        $user->avatar = PublicDiskUpload::store($request->file('avatar'), 'avatars');
        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile image updated.')]);

        return back();
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
