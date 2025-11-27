export function blobFromUnknownData(data, mime = "application/pdf") {
    if (!data) return null;

    if (Array.isArray(data)) {
        const bytes = new Uint8Array(data);
        return new Blob([bytes], { type: mime });
    }

    if (typeof data === "string") {
        try {
            const bin = atob(data);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            return new Blob([bytes], { type: mime });
        } catch {
            return null;
        }
    }

    return null;
}

export function base64ToPdfUrl(base64) {
    if (!base64) return null;
    try {
        const bin = atob(base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const blob = new Blob([bytes], { type: "application/pdf" });
        return URL.createObjectURL(blob);
    } catch {
        return null;
    }
}
