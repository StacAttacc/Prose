export default function ErrorBanner({ message }) {
    return (
        <div className="mb-4 rounded-lg border border-rose-600 bg-rose-900/15 p-3 text-rose-800">
            {message}
        </div>
    )
}