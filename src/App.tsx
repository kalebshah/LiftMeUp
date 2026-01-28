import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { WorkoutSelection } from './pages/WorkoutSelection';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { WorkoutComplete } from './pages/WorkoutComplete';
import { WorkoutHistory } from './pages/WorkoutHistory';
import { Progress } from './pages/Progress';
import { ProfileSelector } from './pages/ProfileSelector';
import * as storage from './utils/storage';

function App() {
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's a current profile
    const profileId = storage.getCurrentProfileId();
    if (profileId) {
      setCurrentProfileId(profileId);
    }
    setIsLoading(false);
  }, []);

  const handleProfileSelect = (profileId: string) => {
    storage.setCurrentProfileId(profileId);
    setCurrentProfileId(profileId);
  };

  if (isLoading) {
    return null;
  }

  if (!currentProfileId) {
    return <ProfileSelector onProfileSelect={handleProfileSelect} />;
  }

  return (
    <AppProvider key={currentProfileId} onProfileSwitch={() => setCurrentProfileId(null)}>
      <BrowserRouter>
        <div className="min-h-screen bg-dark-950">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workout/select" element={<WorkoutSelection />} />
              <Route path="/workout/active" element={<ActiveWorkout />} />
              <Route path="/workout/complete" element={<WorkoutComplete />} />
              <Route path="/workout-history" element={<WorkoutHistory />} />
              <Route path="/progress" element={<Progress />} />
            </Routes>
          </AnimatePresence>
          <Navigation />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
