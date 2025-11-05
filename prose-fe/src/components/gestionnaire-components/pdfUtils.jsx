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
