export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg border p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-5 w-5 bg-gray-200 rounded" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  );
} 