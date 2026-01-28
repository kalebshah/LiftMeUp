import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  GripVertical
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { NumberInput } from '../components/ui/NumberInput';
import * as supabaseStorage from '../utils/supabaseStorage';

interface ExerciseForm {
  name: string;
  sets: number;
  repRangeMin: number;
  repRangeMax: number;
  weightRangeMin: number;
  weightRangeMax: number;
  unit: string;
}

const ICON_OPTIONS = ['💪', '🏋️', '🔥', '⚡', '🎯', '🚀', '🦾', '⭐'];
const COLOR_OPTIONS = [
  { name: 'Primary', value: 'from-primary-500 to-primary-600' },
  { name: 'Accent', value: 'from-accent-500 to-accent-600' },
  { name: 'Purple', value: 'from-purple-500 to-purple-600' },
  { name: 'Blue', value: 'from-blue-500 to-blue-600' },
  { name: 'Green', value: 'from-green-500 to-green-600' },
  { name: 'Red', value: 'from-red-500 to-red-600' },
];

export const CustomWorkoutBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [workoutIcon, setWorkoutIcon] = useState(ICON_OPTIONS[0]);
  const [workoutColor, setWorkoutColor] = useState(COLOR_OPTIONS[0].value);
  const [exercises, setExercises] = useState<ExerciseForm[]>([
    {
      name: '',
      sets: 3,
      repRangeMin: 8,
      repRangeMax: 12,
      weightRangeMin: 50,
      weightRangeMax: 100,
      unit: 'lbs',
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        sets: 3,
        repRangeMin: 8,
        repRangeMax: 12,
        weightRangeMin: 50,
        weightRangeMax: 100,
        unit: 'lbs',
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof ExerciseForm, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSave = async () => {
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    setIsSaving(true);

    const profileId = localStorage.getItem('liftmeup_current_profile_id');
    if (!profileId) {
      alert('No profile selected');
      setIsSaving(false);
      return;
    }

    const workout = await supabaseStorage.createCustomWorkout(profileId, {
      name: workoutName,
      description: workoutDescription,
      icon: workoutIcon,
      color: workoutColor,
      exercises: validExercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        repRange: [ex.repRangeMin, ex.repRangeMax] as [number, number],
        weightRange: [ex.weightRangeMin, ex.weightRangeMax] as [number, number],
        unit: ex.unit,
      })),
    });

    setIsSaving(false);

    if (workout) {
      navigate('/workout/select');
    } else {
      alert('Failed to create workout. Please try again.');
    }
  };

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
          <div>
            <h1 className="text-lg font-bold text-white">Create Custom Workout</h1>
            <p className="text-xs text-dark-400">Build your own routine</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Workout Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-bold text-white mb-4">Workout Details</h2>

            {/* Name */}
            <div className="mb-4">
              <label className="text-sm text-dark-400 mb-2 block">Workout Name</label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g., Upper Body Strength"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                maxLength={50}
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-sm text-dark-400 mb-2 block">Description (optional)</label>
              <textarea
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
                placeholder="e.g., Focus on chest, shoulders, and arms"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                rows={2}
                maxLength={200}
              />
            </div>

            {/* Icon */}
            <div className="mb-4">
              <label className="text-sm text-dark-400 mb-2 block">Icon</label>
              <div className="flex gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setWorkoutIcon(icon)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                      workoutIcon === icon
                        ? 'bg-primary-500 scale-110 ring-2 ring-primary-400'
                        : 'bg-dark-800 hover:bg-dark-700'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-sm text-dark-400 mb-2 block">Color Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setWorkoutColor(color.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all bg-gradient-to-r ${color.value} ${
                      workoutColor === color.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-950 scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Exercises */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Exercises</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={addExercise}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Exercise
            </Button>
          </div>

          <AnimatePresence mode="popLayout">
            {exercises.map((exercise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <Card variant="default" padding="lg">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical className="w-5 h-5 text-dark-500" />
                      <span className="text-sm font-semibold text-dark-400">
                        Exercise {index + 1}
                      </span>
                    </div>
                    {exercises.length > 1 && (
                      <button
                        onClick={() => removeExercise(index)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>

                  {/* Exercise Name */}
                  <div className="mb-4">
                    <label className="text-sm text-dark-400 mb-2 block">Exercise Name</label>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      placeholder="e.g., Bench Press"
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  {/* Sets */}
                  <div className="mb-4">
                    <label className="text-sm text-dark-400 mb-2 block">Number of Sets</label>
                    <NumberInput
                      value={exercise.sets}
                      onChange={(val) => updateExercise(index, 'sets', val)}
                      min={1}
                      max={10}
                      step={1}
                      size="md"
                    />
                  </div>

                  {/* Rep Range */}
                  <div className="mb-4">
                    <label className="text-sm text-dark-400 mb-2 block">Rep Range</label>
                    <div className="flex items-center gap-3">
                      <NumberInput
                        value={exercise.repRangeMin}
                        onChange={(val) => updateExercise(index, 'repRangeMin', val)}
                        min={1}
                        max={50}
                        step={1}
                        size="md"
                      />
                      <span className="text-dark-400">to</span>
                      <NumberInput
                        value={exercise.repRangeMax}
                        onChange={(val) => updateExercise(index, 'repRangeMax', val)}
                        min={1}
                        max={50}
                        step={1}
                        size="md"
                      />
                    </div>
                  </div>

                  {/* Weight Range */}
                  <div className="mb-4">
                    <label className="text-sm text-dark-400 mb-2 block">Weight Range</label>
                    <div className="flex items-center gap-3">
                      <NumberInput
                        value={exercise.weightRangeMin}
                        onChange={(val) => updateExercise(index, 'weightRangeMin', val)}
                        min={0}
                        max={500}
                        step={5}
                        size="md"
                      />
                      <span className="text-dark-400">to</span>
                      <NumberInput
                        value={exercise.weightRangeMax}
                        onChange={(val) => updateExercise(index, 'weightRangeMax', val)}
                        min={0}
                        max={500}
                        step={5}
                        size="md"
                      />
                      <select
                        value={exercise.unit}
                        onChange={(e) => updateExercise(index, 'unit', e.target.value)}
                        className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="lbs">lbs</option>
                        <option value="lbs/side">lbs/side</option>
                        <option value="lbs total">lbs total</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Save Button */}
        <Button
          variant="success"
          size="xl"
          className="w-full"
          onClick={handleSave}
          leftIcon={<Save className="w-5 h-5" />}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Custom Workout'}
        </Button>
      </main>
    </div>
  );
};
