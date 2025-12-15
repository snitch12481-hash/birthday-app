import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check } from "lucide-react";
import FloatingParticles from "@/components/FloatingParticles";

interface Option {
  id: string;
  name: string;
}

const PreferencesPage = () => {
  const navigate = useNavigate();
  const [guestName, setGuestName] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const foods: Option[] = [
    { id: "1", name: "Пицца" },
    { id: "2", name: "Суши" },
    { id: "3", name: "Бургеры" },
    { id: "4", name: "Салаты" },
    { id: "5", name: "Мясные блюда" },
    { id: "6", name: "Закуски" },
  ];

  const drinks: Option[] = [
    { id: "1", name: "Вода" },
    { id: "2", name: "Соки" },
    { id: "3", name: "Газировка" },
    { id: "4", name: "Чай" },
    { id: "5", name: "Кофе" },
    { id: "6", name: "Коктейли" },
  ];

  useEffect(() => {
    const guestId = localStorage.getItem("guestId");
    const name = localStorage.getItem("guestName");
    
    if (!guestId) {
      navigate("/");
      return;
    }
    
    if (name) setGuestName(name);
  }, [navigate]);

  const toggleFood = (id: string) => {
    setSelectedFoods(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleDrink = (id: string) => {
    setSelectedDrinks(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success("Спасибо! Ваши предпочтения сохранены");
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <FloatingParticles />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            className="glass-card p-10 max-w-md text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            >
              <Check className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <motion.h1
              className="text-3xl font-serif mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Спасибо!
            </motion.h1>
            <motion.p
              className="text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Ваши предпочтения успешно сохранены. Ждём вас на празднике!
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button onClick={() => navigate("/")} variant="outline">
                Вернуться на главную
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="fixed top-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 py-8 px-4">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-card p-6 md:p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.h1
                className="text-3xl md:text-4xl font-serif mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                🍽️ Ваши предпочтения
              </motion.h1>
              {guestName && (
                <motion.p
                  className="text-primary font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {guestName}
                </motion.p>
              )}
              <motion.p
                className="text-muted-foreground text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Выберите, что вам нравится
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Foods Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="section-title">
                  <span className="text-2xl">🍕</span>
                  <span>Еда</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {foods.map((food, index) => (
                    <motion.button
                      key={food.id}
                      type="button"
                      onClick={() => toggleFood(food.id)}
                      className={`checkbox-luxury ${selectedFoods.includes(food.id) ? 'selected' : ''}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                          selectedFoods.includes(food.id) 
                            ? 'bg-primary border-primary' 
                            : 'border-muted-foreground/50'
                        }`}
                        animate={selectedFoods.includes(food.id) ? { scale: [1, 1.2, 1] } : {}}
                      >
                        {selectedFoods.includes(food.id) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </motion.div>
                      <span className="text-sm">{food.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Drinks Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="section-title">
                  <span className="text-2xl">🥤</span>
                  <span>Напитки</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {drinks.map((drink, index) => (
                    <motion.button
                      key={drink.id}
                      type="button"
                      onClick={() => toggleDrink(drink.id)}
                      className={`checkbox-luxury ${selectedDrinks.includes(drink.id) ? 'selected' : ''}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                          selectedDrinks.includes(drink.id) 
                            ? 'bg-primary border-primary' 
                            : 'border-muted-foreground/50'
                        }`}
                        animate={selectedDrinks.includes(drink.id) ? { scale: [1, 1.2, 1] } : {}}
                      >
                        {selectedDrinks.includes(drink.id) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </motion.div>
                      <span className="text-sm">{drink.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Label htmlFor="comments" className="text-sm font-medium mb-2 block">
                  Свои предпочтения (опционально)
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Напишите любые ваши пожелания, диетические ограничения или особые требования..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                      />
                      Сохранение...
                    </span>
                  ) : (
                    "Отправить"
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PreferencesPage;
