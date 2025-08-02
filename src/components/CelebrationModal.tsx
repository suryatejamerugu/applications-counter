import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles, Target } from 'lucide-react';
import { getCurrentLocalDate } from '@/lib/dateUtils';

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  todayCount: number;
  dailyGoal: number;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  open,
  onClose,
  todayCount,
  dailyGoal
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const getMotivationalMessage = () => {
    const messages = [
      "You crushed it today! Keep the streak alive! 💪",
      "Outstanding progress! You're building an incredible habit! 🚀",
      "Goal achieved! Your consistency is paying off! ⭐",
      "Amazing work! Every application brings you closer to success! 🎯"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            🎉 Congratulations!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Achievement Stats */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Daily Goal Achieved!</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {todayCount} / {dailyGoal}
            </p>
            <p className="text-sm text-muted-foreground">applications completed</p>
          </div>

          {/* Motivational Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-lg font-medium text-foreground">
              {getMotivationalMessage()}
            </p>
          </div>

          {/* Confetti Animation */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="animate-bounce absolute top-4 left-4">🎊</div>
              <div className="animate-bounce absolute top-6 right-6" style={{ animationDelay: '0.2s' }}>🎉</div>
              <div className="animate-bounce absolute top-12 left-1/3" style={{ animationDelay: '0.4s' }}>✨</div>
              <div className="animate-bounce absolute top-8 right-1/3" style={{ animationDelay: '0.6s' }}>🌟</div>
              <div className="animate-bounce absolute top-16 left-1/2" style={{ animationDelay: '0.8s' }}>💫</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
          <Button onClick={onClose} className="flex-1">
            Keep Applying! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CelebrationModal;