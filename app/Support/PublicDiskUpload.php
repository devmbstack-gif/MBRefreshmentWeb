<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class PublicDiskUpload
{
    public static function store(UploadedFile $file, string $directory): string
    {
        $directory = trim($directory, '/');
        $ext = strtolower($file->getClientOriginalExtension());
        if ($ext === '') {
            $ext = 'bin';
        }

        $name = Str::random(40).'.'.$ext;
        $relative = $directory.'/'.$name;

        $contents = file_get_contents($file->getPathname());
        if ($contents === false) {
            throw new \RuntimeException('Unable to read uploaded file.');
        }

        Storage::disk('public')->put($relative, $contents);

        return '/storage/'.$relative;
    }
}
