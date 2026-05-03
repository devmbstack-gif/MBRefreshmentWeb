<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
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

        $root = storage_path('app/public');
        $fullPath = $root.'/'.$relative;
        $dir = dirname($fullPath);
        if (! is_dir($dir)) {
            if (! mkdir($dir, 0755, true) && ! is_dir($dir)) {
                throw new \RuntimeException('Unable to create upload directory.');
            }
        }

        if (file_put_contents($fullPath, $contents) === false) {
            throw new \RuntimeException('Unable to write uploaded file.');
        }

        return '/storage/'.$relative;
    }

    public static function deleteFromPublicUrl(?string $url): void
    {
        if ($url === null || $url === '') {
            return;
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (! is_string($path) || $path === '') {
            $path = str_starts_with($url, '/storage/')
                ? $url
                : null;
        }

        if ($path === null || ! str_starts_with($path, '/storage/')) {
            return;
        }

        $relative = ltrim(str_replace('\\', '/', substr($path, strlen('/storage/'))), '/');
        if ($relative === '') {
            return;
        }

        $fullPath = storage_path('app/public/'.$relative);
        if (is_file($fullPath)) {
            @unlink($fullPath);
        }
    }
}
