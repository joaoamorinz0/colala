export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="space-y-4 text-center">
        <div className="border-muted border-t-primary inline-block h-12 w-12 animate-spin rounded-full border-4" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
