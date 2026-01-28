import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Flame,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Confetti } from '../components/Confetti';
import { XPBar } from '../components/XPBar';
import { WORKOUTS, XP_REWARDS, MOTIVATIONAL_QUOTES } from '../data/workouts';
import type { CheckIn } from '../types';
import { formatDuration, formatVolume, getRandomItem, playSound, vibrate } from '../utils/helpers';

type CheckInStep = 'celebration' | 'fatigue' | 'difficulty' | 'recovery' | 'sleep' | 'motivation' | 'pain' | 'notes' | 'complete';

const PAIN_OPTIONS = ['none', 'knee', 'shoulder', 'back', 'other'] as const;

export const WorkoutComplete: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, getLastWorkoutOfType } = useApp();
  const { activeWorkout, user } = state;
  
  const [step, setStep] = useState<CheckInStep>('celebration');
  const [showConfetti, setShowConfetti] = useState(false);
  const [checkIn, setCheckIn] = useState<CheckIn>({
    fatigue: 3,
    difficulty: 3,
    recovery: 3,
    sleepQuality: 3,
    motivation: 3,
    pain: 'none',
    notes: '',
  });
  
  const workout = activeWorkout 
    ? WORKOUTS.find(w => w.id === activeWorkout.workoutLog.workoutTypeId)!
    : null;
  
  const workoutLog = activeWorkout?.workoutLog;
  
  // Calculate earned XP
  const baseXP = XP_REWARDS.find(r => r.action === 'complete_workout')!.xp;
  
  // Get last workout of same type to compare
  const previousWorkout = workout ? getLastWorkoutOfType(workout.id) : null;
  const volumeImprovement = previousWorkout && workoutLog
    ? workoutLog.totalVolume - previousWorkout.totalVolume
    : 0;
  const beatPrevious = volumeImprovement > 0;
  
  const totalXPEarned = baseXP + (beatPrevious ? XP_REWARDS.find(r => r.action === 'beat_last_volume')!.xp : 0);
  
  useEffect(() => {
    // Trigger celebration after mount
    setTimeout(() => {
      setShowConfetti(true);
      playSound('complete');
      vibrate([100, 50, 100, 50, 100]);
    }, 300);
    
    // Award XP
    dispatch({ type: 'EARN_XP', payload: totalXPEarned });
  }, []);
  
  const handleNext = () => {
    const steps: CheckInStep[] = ['celebration', 'fatigue', 'difficulty', 'recovery', 'sleep', 'motivation', 'pain', 'notes', 'complete'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };
  
  const handleComplete = () => {
    dispatch({
      type: 'COMPLETE_WORKOUT',
      payload: { checkIn, notes: checkIn.notes },
    });
    navigate('/');
  };
  
  const handleSkipSurvey = () => {
    dispatch({
      type: 'COMPLETE_WORKOUT',
      payload: { checkIn: null, notes: '' },
    });
    navigate('/');
  };
  
  if (!workoutLog || !workout || !user) {
    navigate('/');
    return null;
  }
  
  const endTime = new Date();
  const startTime = new Date(workoutLog.startTime);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
  
  // Rating component
  const RatingButtons = ({
    value,
    onChange
  }: {
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((num) => (
        <motion.button
          key={num}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(num)}
          className={`w-14 h-14 rounded-xl font-bold text-lg transition-all ${
            value === num
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
              : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
          }`}
        >
          {num}
        </motion.button>
      ))}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-dark-950 bg-mesh">
      <Confetti isActive={showConfetti} />
      
      <AnimatePresence mode="wait">
        {/* Celebration Screen */}
        {step === 'celebration' && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-6 shadow-2xl shadow-primary-500/30"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2 text-center"
            >
              Workout Complete! 🎉
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-dark-300 text-center mb-8"
            >
              {getRandomItem(MOTIVATIONAL_QUOTES.postWorkout)}
            </motion.p>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-sm"
            >
              <Card variant="elevated" className="mb-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary-400 mb-1">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-white">{formatDuration(duration)}</p>
                    <p className="text-xs text-dark-400">Duration</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-success-400 mb-1">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-white">{workoutLog.setLogs.length}</p>
                    <p className="text-xs text-dark-400">Sets</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-accent-400 mb-1">
                      <Flame className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-white">{formatVolume(workoutLog.totalVolume)}</p>
                    <p className="text-xs text-dark-400">Volume</p>
                  </div>
                </div>
                
                {beatPrevious && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-dark-700"
                  >
                    <div className="flex items-center justify-center gap-2 text-success-400">
                      <Star className="w-5 h-5" fill="currentColor" />
                      <span className="font-semibold">
                        +{formatVolume(volumeImprovement)} vs last time!
                      </span>
                    </div>
                  </motion.div>
                )}
              </Card>
              
              {/* XP Earned */}
              <Card variant="glass" className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-dark-400 text-sm">XP Earned</span>
                  <div className="flex items-center gap-1 text-accent-400">
                    <Zap className="w-5 h-5" fill="currentColor" />
                    <span className="text-xl font-bold">+{totalXPEarned}</span>
                  </div>
                </div>
                <XPBar xp={user.xp} />
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-full max-w-sm space-y-3"
            >
              <Button
                variant="primary"
                size="xl"
                className="w-full"
                onClick={handleNext}
                rightIcon={<ChevronRight className="w-5 h-5" />}
              >
                How are you feeling?
              </Button>
              <button
                onClick={handleSkipSurvey}
                className="w-full text-sm text-dark-400 hover:text-dark-300 py-2"
              >
                Skip survey
              </button>
            </motion.div>
          </motion.div>
        )}
        
        {/* Survey Steps */}
        {step === 'fatigue' && (
          <SurveyStep
            key="fatigue"
            title="Fatigue Level"
            description="How tired do you feel right now?"
            onNext={handleNext}
          >
            <RatingButtons value={checkIn.fatigue} onChange={(v) => setCheckIn({ ...checkIn, fatigue: v })} />
            <div className="flex justify-between text-xs text-dark-400 mt-2 px-2">
              <span>Fresh</span>
              <span>Exhausted</span>
            </div>
          </SurveyStep>
        )}
        
        {step === 'difficulty' && (
          <SurveyStep
            key="difficulty"
            title="Workout Difficulty"
            description="How hard was this workout?"
            onNext={handleNext}
          >
            <RatingButtons value={checkIn.difficulty} onChange={(v) => setCheckIn({ ...checkIn, difficulty: v })} />
            <div className="flex justify-between text-xs text-dark-400 mt-2 px-2">
              <span>Easy</span>
              <span>Very Hard</span>
            </div>
          </SurveyStep>
        )}
        
        {step === 'recovery' && (
          <SurveyStep
            key="recovery"
            title="Recovery Status"
            description="How well recovered did you feel going in?"
            onNext={handleNext}
          >
            <RatingButtons value={checkIn.recovery} onChange={(v) => setCheckIn({ ...checkIn, recovery: v })} />
            <div className="flex justify-between text-xs text-dark-400 mt-2 px-2">
              <span>Not recovered</span>
              <span>Fully recovered</span>
            </div>
          </SurveyStep>
        )}
        
        {step === 'sleep' && (
          <SurveyStep
            key="sleep"
            title="Sleep Quality"
            description="How was your sleep last night?"
            onNext={handleNext}
          >
            <RatingButtons value={checkIn.sleepQuality} onChange={(v) => setCheckIn({ ...checkIn, sleepQuality: v })} />
            <div className="flex justify-between text-xs text-dark-400 mt-2 px-2">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </SurveyStep>
        )}
        
        {step === 'motivation' && (
          <SurveyStep
            key="motivation"
            title="Motivation"
            description="How motivated were you today?"
            onNext={handleNext}
          >
            <RatingButtons value={checkIn.motivation} onChange={(v) => setCheckIn({ ...checkIn, motivation: v })} />
            <div className="flex justify-between text-xs text-dark-400 mt-2 px-2">
              <span>Low</span>
              <span>High</span>
            </div>
          </SurveyStep>
        )}
        
        {step === 'pain' && (
          <SurveyStep
            key="pain"
            title="Any Pain?"
            description="Did you experience any discomfort?"
            onNext={handleNext}
          >
            <div className="flex flex-wrap justify-center gap-2">
              {PAIN_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setCheckIn({ ...checkIn, pain: option })}
                  className={`px-4 py-2 rounded-xl font-medium capitalize transition-all ${
                    checkIn.pain === option
                      ? option === 'none'
                        ? 'bg-success-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                  }`}
                >
                  {option === 'none' ? '✓ None' : option}
                </button>
              ))}
            </div>
          </SurveyStep>
        )}
        
        {step === 'notes' && (
          <SurveyStep
            key="notes"
            title="Notes"
            description="Anything else you want to remember?"
            onNext={handleComplete}
            buttonText="Complete"
          >
            <textarea
              value={checkIn.notes}
              onChange={(e) => setCheckIn({ ...checkIn, notes: e.target.value })}
              placeholder="How did the workout go? Any thoughts..."
              className="w-full h-32 bg-dark-700 rounded-xl p-4 text-white placeholder-dark-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </SurveyStep>
        )}
      </AnimatePresence>
    </div>
  );
};

// Survey step wrapper component
const SurveyStep: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
  onNext: () => void;
  buttonText?: string;
}> = ({ title, description, children, onNext, buttonText = 'Next' }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
  >
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">{title}</h2>
      <p className="text-dark-400 text-center mb-8">{description}</p>
      
      <div className="mb-8">
        {children}
      </div>
      
      <Button
        variant="primary"
        size="xl"
        className="w-full"
        onClick={onNext}
        rightIcon={<ChevronRight className="w-5 h-5" />}
      >
        {buttonText}
      </Button>
    </div>
  </motion.div>
);

