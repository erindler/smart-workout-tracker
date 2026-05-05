interface AuthCardProps {
  title?: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary tracking-tight">
          Smart Workout Tracker
        </h1>
        {title && (
          <h2 className="mt-1 text-lg font-semibold text-text">{title}</h2>
        )}
      </div>
      {children}
    </div>
  );
}
