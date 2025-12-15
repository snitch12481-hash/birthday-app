import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="glass-card p-10 text-center max-w-md animate-scale-in">
        <div className="text-8xl font-serif text-primary mb-4 animate-glow-pulse">404</div>
        <h1 className="text-2xl font-serif mb-4">Страница не найдена</h1>
        <p className="text-muted-foreground mb-8">
          К сожалению, запрашиваемая страница не существует
        </p>
        <Link to="/">
          <Button variant="outline">
            <Home className="w-4 h-4" />
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
