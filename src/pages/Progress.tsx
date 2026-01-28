import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Trophy,
  TrendingUp,
  Zap,
  Award,
  Target,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subWeeks } from 'date-fns';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { StreakFlame } from '../components/StreakFlame';
import { XPBar } from '../components/XPBar';
import { ProgressRing } from '../components/ui/ProgressRing';
import { formatVolume, formatDate, getLevelInfo } from '../utils/helpers';

export const Progress: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch, getWeeklyStats, getTotalSets } = useApp();
  const { user, workoutLogs, badges, quests, personalRecords } = state;
  const [showResetModal, setShowResetModal] = useState(false);
  
  const weeklyStats = getWeeklyStats();
  const totalSets = getTotalSets();
  const levelInfo = user ? getLevelInfo(user.xp) : null;

  const handleResetAllData = () => {
    dispatch({ type: 'RESET_ALL_DATA' });
    setShowResetModal(false);
    navigate('/');
  };
  
  // Weekly workout data for chart
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      const weekLogs = workoutLogs.filter(log => {
        const logDate = new Date(log.date);
        return log.isComplete && logDate >= weekStart && logDate <= weekEnd;
      });
      
      weeks.push({
        week: format(weekStart, 'MMM d'),
        workouts: weekLogs.length,
        volume: weekLogs.reduce((sum, log) => sum + log.totalVolume, 0),
        sets: weekLogs.reduce((sum, log) => sum + log.setLogs.length, 0),
      });
    }
    return weeks;
  }, [workoutLogs]);
  
  // This week's calendar
  const thisWeekDays = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, []);
  
  const earnedBadges = badges.filter(b => b.earnedAt);
  const activeQuests = quests.filter(q => !q.isComplete);
  
  // Recent PRs
  const recentPRs = personalRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-dark-950 bg-mesh pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800/50">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-dark-300" />
          </button>
          <h1 className="text-lg font-bold text-white">Progress</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6">
        {/* Level & XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <ProgressRing
                  progress={levelInfo?.progress || 0}
                  size={80}
                  strokeWidth={6}
                  color="#a855f7"
                >
                  <span className="text-2xl font-bold text-white">
                    {levelInfo?.level}
                  </span>
                </ProgressRing>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">{levelInfo?.title}</h2>
                  <Badge variant="accent" size="sm">Level {levelInfo?.level}</Badge>
                </div>
                <XPBar xp={user.xp} showDetails />
              </div>
            </div>
            
            <div className="flex items-center justify-around pt-4 border-t border-dark-700">
              <div className="text-center">
                <StreakFlame streak={user.currentStreak} size="lg" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{workoutLogs.filter(l => l.isComplete).length}</p>
                <p className="text-xs text-dark-400">Total Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{totalSets}</p>
                <p className="text-xs text-dark-400">Total Sets</p>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* This Week Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold text-dark-400 uppercase mb-3">This Week</h3>
          <Card variant="default">
            <div className="flex justify-between mb-4">
              {thisWeekDays.map((day) => {
                const hasWorkout = workoutLogs.some(
                  log => log.isComplete && isSameDay(new Date(log.date), day)
                );
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div key={day.toISOString()} className="flex flex-col items-center">
                    <span className="text-xs text-dark-400 mb-1">
                      {format(day, 'EEE')}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        hasWorkout
                          ? 'bg-success-500 text-white'
                          : isToday
                          ? 'bg-primary-500/20 text-primary-400 ring-2 ring-primary-500/50'
                          : 'bg-dark-700 text-dark-400'
                      }`}
                    >
                      {hasWorkout ? '✓' : format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-dark-700">
              <div>
                <p className="text-sm text-dark-400">Weekly Goal</p>
                <p className="text-lg font-bold text-white">{weeklyStats.workouts}/3 workouts</p>
              </div>
              <ProgressRing
                progress={(weeklyStats.workouts / 3) * 100}
                size={50}
                strokeWidth={4}
                color={weeklyStats.workouts >= 3 ? '#10b981' : '#f97316'}
              >
                <span className="text-xs font-bold text-white">
                  {Math.round((weeklyStats.workouts / 3) * 100)}%
                </span>
              </ProgressRing>
            </div>
          </Card>
        </motion.div>
        
        {/* Volume Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-dark-400 uppercase mb-3">Weekly Volume</h3>
          <Card variant="default" className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: '#64748b', fontSize: 10 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10 }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(value: number | undefined) => [formatVolume(value || 0), 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        
        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="text-sm font-semibold text-dark-400 uppercase mb-3">
              <Target className="w-4 h-4 inline mr-1" />
              Weekly Quests
            </h3>
            <div className="space-y-2">
              {activeQuests.map((quest) => (
                <Card key={quest.id} variant="default" padding="sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{quest.name}</p>
                      <p className="text-xs text-dark-400">{quest.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-400">
                        {quest.current}/{quest.target}
                      </p>
                      <p className="text-xs text-dark-500">+{quest.xpReward} XP</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Personal Records */}
        {recentPRs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-dark-400 uppercase mb-3">
              <Trophy className="w-4 h-4 inline mr-1" />
              Personal Records
            </h3>
            <div className="space-y-2">
              {recentPRs.map((pr) => (
                <Card key={pr.exerciseId} variant="default" padding="sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{pr.exerciseName}</p>
                      <p className="text-xs text-dark-400">{formatDate(pr.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success-400">
                        {pr.weight} lbs × {pr.reps}
                      </p>
                      <p className="text-xs text-dark-500">
                        Est. 1RM: {Math.round(pr.estimated1RM)} lbs
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-dark-400 uppercase">
              <Award className="w-4 h-4 inline mr-1" />
              Badges ({earnedBadges.length}/{badges.length})
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {badges.slice(0, 8).map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 ${
                  badge.earnedAt
                    ? 'bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30'
                    : 'bg-dark-800/50 border border-dark-700/50 opacity-40'
                }`}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-[10px] text-center text-dark-300 leading-tight">
                  {badge.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-dark-400 uppercase mb-3">Lifetime Stats</h3>
          <Card variant="default">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <Zap className="w-5 h-5 text-accent-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{user.xp.toLocaleString()}</p>
                <p className="text-xs text-dark-400">Total XP</p>
              </div>
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{user.longestStreak}</p>
                <p className="text-xs text-dark-400">Best Streak</p>
              </div>
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-success-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">
                  {formatVolume(workoutLogs.reduce((sum, log) => sum + log.totalVolume, 0))}
                </p>
                <p className="text-xs text-dark-400">Total Volume</p>
              </div>
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{personalRecords.length}</p>
                <p className="text-xs text-dark-400">PRs Set</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Reset All Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card variant="default" className="border-2 border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h3>
                <p className="text-xs text-dark-400 mb-3">
                  Reset all your data including workouts, XP, badges, and personal records.
                  This action cannot be undone.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowResetModal(true)}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Reset All Data
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Data?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-semibold text-sm mb-1">Warning: This action is permanent!</p>
              <p className="text-dark-300 text-sm">
                All your progress will be lost forever.
              </p>
            </div>
          </div>

          <p className="text-dark-300">This will delete:</p>
          <ul className="text-dark-300 text-sm space-y-2 list-disc list-inside">
            <li>All {workoutLogs.filter(l => l.isComplete).length} workout logs</li>
            <li>Your {user?.xp.toLocaleString()} XP and Level {levelInfo?.level}</li>
            <li>All {personalRecords.length} personal records</li>
            <li>Your {user?.currentStreak} day streak</li>
            <li>All earned badges ({badges.filter(b => b.earnedAt).length}/{badges.length})</li>
            <li>Weekly quests and progress</li>
          </ul>

          <p className="text-yellow-400 text-sm font-medium">
            You'll start fresh as if you just installed the app.
          </p>

          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowResetModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleResetAllData}
            >
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

