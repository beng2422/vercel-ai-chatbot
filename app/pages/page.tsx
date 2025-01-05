export default function HomePage() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center py-10">
      <div className="w-full max-w-2xl px-4">
        <div className="rounded-lg border bg-background p-8">
          <h1 className="mb-2 text-3xl font-bold text-center">Daily Report</h1>
          <p className="text-center text-muted-foreground">
            Welcome to your daily reporting dashboard
          </p>
        </div>
      </div>
    </div>
  )
} 