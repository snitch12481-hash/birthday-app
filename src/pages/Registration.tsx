import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import FloatingParticles from "@/components/FloatingParticles";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const fn = firstName.trim();
      const ln = lastName.trim();

      if (!fn || !ln) {
        toast.error("Пожалуйста, заполните все поля");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ firstName: fn, lastName: ln }),
        });

        if (!res.ok) {
          let msg = "Ошибка регистрации. Попробуйте ещё раз.";
          try {
            const data = await res.json();
            if (data?.error) msg = data.error;
          } catch {}
          toast.error(msg);
          return;
        }

        const data: { guestId: number } = await res.json();
        localStorage.setItem("guestId", String(data.guestId));
        localStorage.setItem("guestName", `${fn} ${ln}`);
        navigate("/preferences");
      } catch (err) {
        console.error(err);
        toast.error("Ошибка сети. Попробуйте ещё раз.");
      } finally {
        setIsLoading(false);
      }
    };


  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Main card */}
          <div className="glass-card p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-10 space-y-4">
              {/* Animated 18 without box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                <motion.span
                  className="text-7xl md:text-8xl font-serif text-primary inline-block"
                  animate={{
                    textShadow: [
                      "0 0 20px hsl(350 80% 45% / 0.3)",
                      "0 0 40px hsl(350 80% 45% / 0.5)",
                      "0 0 20px hsl(350 80% 45% / 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  18
                </motion.span>
                {/* Decorative sparkles */}
                <motion.div
                  className="absolute -top-2 -right-2 w-3 h-3 bg-primary rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute top-1/2 -left-4 w-2 h-2 bg-accent rounded-full"
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </motion.div>
              
              <motion.h1
                className="text-3xl md:text-4xl font-serif text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                День Рождения
              </motion.h1>
              
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Добро пожаловать! Пожалуйста, представьтесь
              </motion.p>
            </div>

            {/* Event info */}
            <motion.div
              className="flex items-center justify-center gap-6 mb-8 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-primary">📅</span>
                <span className="text-muted-foreground">16.01.26</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-primary">🕐</span>
                <span className="text-muted-foreground">19:00</span>
              </div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  Имя <span className="text-primary">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Введите ваше имя"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Фамилия <span className="text-primary">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Введите вашу фамилию"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
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
                      Загрузка...
                    </span>
                  ) : (
                    "Продолжить"
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Dress code reminder */}
            <motion.div
              className="mt-8 pt-6 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <p className="text-center text-xs text-muted-foreground uppercase tracking-wider">
                Dress Code: <span className="text-primary font-medium">Total Black</span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegistrationPage;
