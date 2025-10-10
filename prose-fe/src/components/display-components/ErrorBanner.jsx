export default function ErrorBanner({ message }) {
    return (
        <div className="mb-4 rounded-lg border border-rose-600 bg-rose-900/30 p-3 text-black">
            {message}
        </div>
    )
}