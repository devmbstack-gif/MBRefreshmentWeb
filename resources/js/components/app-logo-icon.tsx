import type { HTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    ...props
}: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/common/iconBackground.jpeg"
            alt="Bs Refreshment"
            className={className}
            {...props}
        />
    );
}
