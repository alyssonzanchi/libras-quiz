export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}
