<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

final class PublicDiskUpload
{
    private static function publicUploadPrefixes(): array
    {
        return [
            'banners',
            'categories',
            'items',
            'avatars',
            'feedback-attachments',
        ];
    }

    public static function store(UploadedFile $file, string $directory): string
    {
        $directory = trim($directory, '/');
        if (! in_array($directory, self::publicUploadPrefixes(), true)) {
            throw new \InvalidArgumentException('Unsupported upload directory.');
        }

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

        $fullPath = public_path($relative);
        $dir = dirname($fullPath);
        if (! is_dir($dir)) {
            if (! mkdir($dir, 0755, true) && ! is_dir($dir)) {
                throw new \RuntimeException('Unable to create upload directory.');
            }
        }

        if (file_put_contents($fullPath, $contents) === false) {
            throw new \RuntimeException('Unable to write uploaded file.');
        }

        return '/'.$relative;
    }

    public static function deleteFromPublicUrl(?string $url): void
    {
        if ($url === null || $url === '') {
            return;
        }

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            $path = parse_url($url, PHP_URL_PATH);
        } else {
            $path = $url;
        }

        if (! is_string($path) || $path === '') {
            return;
        }

        $norm = str_replace('\\', '/', $path);

        $fullPath = null;
        if (str_starts_with($norm, '/storage/')) {
            $rel = ltrim(substr($norm, strlen('/storage/')), '/');
            if ($rel !== '') {
                $fullPath = storage_path('app/public/'.$rel);
            }
        } elseif (self::pathStartsWithAllowedPublic($norm)) {
            $fullPath = public_path(ltrim($norm, '/'));
        }

        if ($fullPath !== null && is_file($fullPath)) {
            @unlink($fullPath);
        }
    }

    private static function pathStartsWithAllowedPublic(string $path): bool
    {
        foreach (self::publicUploadPrefixes() as $prefix) {
            if (str_starts_with($path, '/'.$prefix.'/')) {
                return true;
            }
        }

        return false;
    }
}
