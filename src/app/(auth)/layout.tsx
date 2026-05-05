export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text px-4">
      <div className="w-full sm:max-w-sm sm:border sm:border-secondary/30 sm:rounded-2xl sm:shadow-lg sm:bg-background/80 sm:backdrop-blur-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
