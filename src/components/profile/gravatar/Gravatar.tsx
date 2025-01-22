import gravatarUrl from "gravatar-url";

interface GravatarProps {
    userEmail?: string | undefined;
    height?: number;
    width?: number;
}

export function Gravatar({
    userEmail = "admin@opsfolio.com",
    height = 40,
    width = 40,
}: GravatarProps) {
    const email = userEmail ?? "admin@opsfolio.com";
    const gravatar = gravatarUrl(email, {
        size: 140, // Set size to the maximum of height and width
        default: "mm",
    });
    const avatarUrl = gravatar;

    return (
        <img
            className={`h-${height} w-${width} rounded-full`}
            src={avatarUrl}
            alt=""
        />
    );
}
