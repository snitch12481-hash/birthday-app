import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  LogOut,
  Users,
  UtensilsCrossed,
  Wine,
  Plus,
  Trash2,
} from "lucide-react";

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  foods: string[] | null;
  drinks: string[] | null;
  comments?: string | null;
}

interface Item {
  id: number;
  name: string;
}

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [foods, setFoods] = useState<Item[]>([]);
  const [drinks, setDrinks] = useState<Item[]>([]);

  const [newFood, setNewFood] = useState("");
  const [newDrink, setNewDrink] = useState("");

  /* ================= API ================= */

  const loadGuests = async () => {
    const res = await fetch("/api/admin/guests", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load guests");
    setGuests(await res.json());
  };

  const loadOptions = async () => {
    const res = await fetch("/api/options", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load options");
    const data = await res.json();
    setFoods(data.foods || []);
    setDrinks(data.drinks || []);
  };

  const deleteGuest = async (id: number) => {
    if (!window.confirm("Удалить этого гостя?")) return;

    try {
      const res = await fetch(`/api/admin/guests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Гость удалён");
      await loadGuests();
    } catch {
      toast.error("Не удалось удалить гостя");
    }
  };

  const addFood = async () => {
    const name = newFood.trim();
    if (!name) return;

    try {
      const res = await fetch("/api/admin/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      setNewFood("");
      toast.success("Блюдо добавлено");
      await loadOptions();
    } catch {
      toast.error("Не удалось добавить блюдо");
    }
  };

  const addDrink = async () => {
    const name = newDrink.trim();
    if (!name) return;

    try {
      const res = await fetch("/api/admin/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      setNewDrink("");
      toast.success("Напиток добавлен");
      await loadOptions();
    } catch {
      toast.error("Не удалось добавить напиток");
    }
  };

  const removeFood = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/foods/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Блюдо удалено");
      await loadOptions();
    } catch {
      toast.error("Не удалось удалить блюдо");
    }
  };

  const removeDrink = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/drinks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Напиток удалён");
      await loadOptions();
    } catch {
      toast.error("Не удалось удалить напиток");
    }
  };

  /* ================= AUTH ================= */

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/check", {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.isAdmin) {
          setIsAuthenticated(true);
          await Promise.all([loadGuests(), loadOptions()]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        toast.error("Неверный пароль");
        return;
      }

      setIsAuthenticated(true);
      toast.success("Добро пожаловать!");
      await Promise.all([loadGuests(), loadOptions()]);
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setIsAuthenticated(false);
    setPassword("");
    setGuests([]);
    setFoods([]);
    setDrinks([]);
  };

  /* ================= LOGIN SCREEN ================= */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-md">
          <h1 className="text-2xl font-serif text-center mb-6">
            🔐 Вход администратора
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  /* ================= ADMIN PANEL ================= */

  return (
    <div className="min-h-screen animated-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-serif flex items-center gap-2">
            ⚙️ Панель администратора
          </h1>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Выход
          </Button>
        </div>

        {/* Guests */}
        <section className="glass-card p-6 mb-6">
          <h2 className="section-title text-primary mb-4">
            <Users className="w-5 h-5" />
            <span>Гости</span>
          </h2>

          {guests.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Нет зарегистрированных гостей
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left">Имя</th>
                    <th className="px-3 py-2 text-left">Фамилия</th>
                    <th className="px-3 py-2 text-left">Блюда</th>
                    <th className="px-3 py-2 text-left">Напитки</th>
                    <th className="px-3 py-2 text-left">Комментарий</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g) => (
                    <tr key={g.id} className="border-b">
                      <td className="px-3 py-2">{g.first_name}</td>
                      <td className="px-3 py-2">{g.last_name}</td>
                      <td className="px-3 py-2">
                        {(g.foods ?? []).join(", ") || "-"}
                      </td>
                      <td className="px-3 py-2">
                        {(g.drinks ?? []).join(", ") || "-"}
                      </td>
                      <td className="px-3 py-2">
                        {g.comments || "-"}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => deleteGuest(g.id)}
                          className="text-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Foods */}
        <section className="glass-card p-6 mb-6">
          <h2 className="section-title text-primary mb-4">
            <UtensilsCrossed className="w-5 h-5" />
            <span>Еда</span>
          </h2>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Название блюда"
              value={newFood}
              onChange={(e) => setNewFood(e.target.value)}
            />
            <Button onClick={addFood}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {foods.map((f) => (
              <div
                key={f.id}
                className="flex justify-between items-center border rounded p-2"
              >
                <span>{f.name}</span>
                <button onClick={() => removeFood(f.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Drinks */}
        <section className="glass-card p-6">
          <h2 className="section-title text-primary mb-4">
            <Wine className="w-5 h-5" />
            <span>Напитки</span>
          </h2>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Название напитка"
              value={newDrink}
              onChange={(e) => setNewDrink(e.target.value)}
            />
            <Button onClick={addDrink}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {drinks.map((d) => (
              <div
                key={d.id}
                className="flex justify-between items-center border rounded p-2"
              >
                <span>{d.name}</span>
                <button onClick={() => removeDrink(d.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
