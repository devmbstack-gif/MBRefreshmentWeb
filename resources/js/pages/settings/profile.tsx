import { Form, Head, Link, useForm, usePage } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const avatarForm = useForm({ avatar: null as File | null });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    function clearAvatarSelection() {
        setAvatarPreview((prev) => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }

            return null;
        });
        avatarForm.setData('avatar', null);
    }

    function handleAvatarFileChange(file: File | null) {
        clearAvatarSelection();

        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            avatarForm.setData('avatar', file);
        }
    }

    function submitAvatar(e: React.FormEvent) {
        e.preventDefault();

        if (!avatarForm.data.avatar) {
            return;
        }

        avatarForm.post('/settings/profile/avatar', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                clearAvatarSelection();
                avatarForm.reset();
            },
        });
    }

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <div className="space-y-4">
                    <Heading
                        variant="small"
                        title="Profile photo"
                        description="Upload a picture shown in the app and on admin views"
                    />
                    <form
                        onSubmit={submitAvatar}
                        className="flex flex-col gap-4 sm:flex-row sm:items-end"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 rounded-2xl border">
                                {avatarPreview || auth.user.avatar ? (
                                    <AvatarImage
                                        src={
                                            avatarPreview ??
                                            (auth.user.avatar as string) ??
                                            undefined
                                        }
                                        alt=""
                                        className="object-cover"
                                    />
                                ) : null}
                                <AvatarFallback className="rounded-2xl text-lg">
                                    {getInitials(auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="profile-avatar"
                                    className="sr-only"
                                >
                                    Profile image
                                </Label>
                                <div className="flex flex-wrap items-center gap-2">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs transition hover:bg-muted/50">
                                        <Upload className="h-4 w-4" />
                                        Choose image
                                        <input
                                            id="profile-avatar"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/jpg"
                                            className="sr-only"
                                            onChange={(e) =>
                                                handleAvatarFileChange(
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                        />
                                    </label>
                                    {avatarPreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearAvatarSelection}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                <InputError
                                    message={avatarForm.errors.avatar}
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={
                                !avatarForm.data.avatar || avatarForm.processing
                            }
                            data-test="update-avatar-button"
                        >
                            {avatarForm.processing
                                ? 'Uploading...'
                                : 'Save photo'}
                        </Button>
                    </form>
                </div>

                <Heading
                    variant="small"
                    title="Profile information"
                    description="Update your name and email address"
                />

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                Click here to resend the
                                                verification email.
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                A new verification link has been
                                                sent to your email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
