import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-svh bg-muted px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-lg flex-col items-center justify-center text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">404</h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          Oops! Page not found
        </p>

        <p className="mt-2 text-sm sm:text-base text-muted-foreground break-words">
          {location.pathname}
        </p>

        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/">Return to Home</Link>
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
