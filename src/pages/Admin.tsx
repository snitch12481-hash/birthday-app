import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogOut, Users, UtensilsCrossed, Wine, Plus, Trash2 } from "lucide-react";

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  foods: string[];
  drinks: string[];
  comments?: string;
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
  const loadGuests = async () => {
  const res = await fetch("/api/admin/guests", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load guests");
  const data = await res.json();
  setGuests(data);
};

const loadOptions = async () => {
  const res = await fetch("/api/options", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load options");
  const data = await res.json();
  setFoods(data.foods || []);
  setDrinks(data.drinks || []);
};

const deleteGuest = async (id: number) => {
  const ok = window.confirm("Удалить этого гостя?");
  if (!ok) return;

  try {
    const res = await fetch(`/api/admin/guests/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error();
    toast.success("Гость удалён");
    await loadGuests();
  } catch (e) {
    console.error(e);
    toast.error("Не удалось удалить гостя");
  }
};

useEffect(() => {
  (async () => {
    try {
      const check = await fetch("/api/admin/check", { credentials: "include" });
      const data = await check.json();

      if (data?.isAdmin) {
        setIsAuthenticated(true);
        await Promise.all([loadGuests(), loadOptions()]);
      }
    } catch (e) {
      console.error(e);
    }
  })();
}, []);

  const [newDrink, setNewDrink] = useState("");

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
  } catch (e) {
    console.error(e);
    toast.error("Ошибка сети. Попробуйте ещё раз.");
  } finally {
    setIsLoading(false);
  }
};


const handleLogout = async () => {
  try {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
  } catch {}
  setIsAuthenticated(false);
  setPassword("");
  setGuests([]);
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


  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="glass-card p-8 md:p-10 w-full max-w-md animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif">Вход администратора</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center"
            />
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Демо пароль: admin123
          </p>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen animated-bg p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-serif flex items-center gap-3">
            <span>⚙️</span>
            Панель администратора
          </h1>
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Выход
          </Button>
        </div>

        {/* Guests Section */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in-up">
          <h2 className="section-title text-primary">
            <Users className="w-6 h-6" />
            <span>Зарегистрированные гости</span>
          </h2>

          {guests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Нет зарегистрированных гостей</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-primary font-medium">Имя</th>
                    <th className="text-left py-3 px-4 text-primary font-medium">Фамилия</th>
                    <th className="text-left py-3 px-4 text-primary font-medium">Блюда</th>
                    <th className="text-left py-3 px-4 text-primary font-medium">Напитки</th>
                    <th className="text-left py-3 px-4 text-primary font-medium">Комментарии</th>
                    <th className="text-left py-3 px-4 text-primary font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-4 px-4">{guest.first_name}</td>
                      <td className="py-4 px-4">{guest.last_name}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {guest.foods.map((food, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-secondary border border-primary/30 rounded text-primary">
                              {food}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {guest.drinks.map((drink, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-secondary border border-primary/30 rounded text-primary">
                              {drink}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        {guest.comments || "-"}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => deleteGuest(guest.id)}
                          className="p-2 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          title="Удалить гостя"
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

        {/* Foods Section */}
        <section className="glass-card p-6 md:p-8 mb-6 animate-fade-in-up delay-200">
          <h2 className="section-title text-primary">
            <UtensilsCrossed className="w-6 h-6" />
            <span>Управление едой</span>
          </h2>

          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Название блюда"
              value={newFood}
              onChange={(e) => setNewFood(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addFood()}
            />
            <Button onClick={addFood}>
              <Plus className="w-4 h-4" />
              Добавить
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {foods.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border hover:border-primary/30 transition-all group"
              >
                <span className="text-sm">{food.name}</span>
                <button
                  onClick={() => removeFood(food.id)}
                  className="p-1.5 rounded bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Drinks Section */}
        <section className="glass-card p-6 md:p-8 animate-fade-in-up delay-400">
          <h2 className="section-title text-primary">
            <Wine className="w-6 h-6" />
            <span>Управление напитками</span>
          </h2>

          <div className="flex gap-3 mb-6">
            <Input
              placeholder="Название напитка"
              value={newDrink}
              onChange={(e) => setNewDrink(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addDrink()}
            />
            <Button onClick={addDrink}>
              <Plus className="w-4 h-4" />
              Добавить
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {drinks.map((drink) => (
              <div
                key={drink.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border hover:border-primary/30 transition-all group"
              >
                <span className="text-sm">{drink.name}</span>
                <button
                  onClick={() => removeDrink(drink.id)}
                  className="p-1.5 rounded bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
