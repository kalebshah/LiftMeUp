import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Trash2, Lock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PasswordPrompt } from '../components/PasswordPrompt';
import type { Profile } from '../types';
import * as supabaseStorage from '../utils/supabaseStorage';

interface ProfileSelectorProps {
  onProfileSelect: (profileId: string) => void;
}

const AVATAR_OPTIONS = ['💪', '🏋️', '🔥', '⚡', '🎯', '🚀', '🦾', '👑', '⭐', '🏆', '🎮', '🎸', '🎨', '🌟', '💎'];

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onProfileSelect }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfilePassword, setNewProfilePassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    const data = await supabaseStorage.getProfiles();
    setProfiles(data);
    setIsLoading(false);
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim() || !newProfilePassword.trim()) return;

    const profile = await supabaseStorage.createProfile(
      newProfileName.trim(),
      selectedAvatar,
      newProfilePassword
    );

    if (profile) {
      setProfiles([...profiles, profile]);
      setShowCreateModal(false);
      setNewProfileName('');
      setNewProfilePassword('');
      setSelectedAvatar(AVATAR_OPTIONS[0]);
      onProfileSelect(profile.id);
    }
  };

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowPasswordPrompt(true);
    setPasswordError('');
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedProfile) return;

    const isValid = await supabaseStorage.verifyPassword(selectedProfile.id, password);

    if (isValid) {
      await supabaseStorage.updateProfileAccess(selectedProfile.id);
      setShowPasswordPrompt(false);
      onProfileSelect(selectedProfile.id);
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return;

    const success = await supabaseStorage.deleteProfile(profileToDelete.id);
    if (success) {
      setProfiles(profiles.filter(p => p.id !== profileToDelete.id));
    }
    setProfileToDelete(null);
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 bg-mesh flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Dumbbell className="w-12 h-12 text-primary-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">LiftMeUp</h1>
          <p className="text-dark-400">Choose your profile</p>
        </motion.div>

        {/* Profile List */}
        <div className="space-y-3 mb-4">
          <AnimatePresence mode="popLayout">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant="elevated"
                  padding="sm"
                  className="group relative overflow-hidden"
                >
                  <button
                    onClick={() => handleSelectProfile(profile)}
                    className="w-full flex items-center gap-4 text-left"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                      {profile.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">
                        {profile.name}
                      </h3>
                      <p className="text-xs text-dark-400">
                        Last active: {new Date(profile.lastAccessedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileToDelete(profile);
                      setShowDeleteModal(true);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-lg hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Create New Profile Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: profiles.length * 0.1 + 0.2 }}
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Create New Profile
          </Button>
        </motion.div>
      </div>

      {/* Create Profile Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewProfileName('');
          setSelectedAvatar(AVATAR_OPTIONS[0]);
        }}
        title="Create New Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-dark-400 mb-2 block">Profile Name</label>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
              autoFocus
              maxLength={20}
            />
          </div>

          <div>
            <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              type="password"
              value={newProfilePassword}
              onChange={(e) => setNewProfilePassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
              maxLength={50}
            />
            <p className="text-xs text-dark-500 mt-1">
              This will protect your profile from unauthorized access
            </p>
          </div>

          <div>
            <label className="text-sm text-dark-400 mb-2 block">Choose Avatar</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-primary-500 scale-110 ring-2 ring-primary-400 ring-offset-2 ring-offset-dark-950'
                      : 'bg-dark-800 hover:bg-dark-700'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowCreateModal(false);
                setNewProfileName('');
                setNewProfilePassword('');
                setSelectedAvatar(AVATAR_OPTIONS[0]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreateProfile}
              disabled={!newProfileName.trim() || !newProfilePassword.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProfileToDelete(null);
        }}
        title="Delete Profile?"
      >
        <p className="text-dark-300 mb-4">
          Are you sure you want to delete <span className="text-white font-semibold">{profileToDelete?.name}'s</span> profile?
        </p>
        <p className="text-yellow-400 text-sm mb-4">
          All workout data, progress, and achievements will be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setShowDeleteModal(false);
              setProfileToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleDeleteProfile}
          >
            Delete
          </Button>
        </div>
      </Modal>

      {/* Password Prompt */}
      <PasswordPrompt
        isOpen={showPasswordPrompt}
        profileName={selectedProfile?.name || ''}
        onSubmit={handlePasswordSubmit}
        onClose={() => {
          setShowPasswordPrompt(false);
          setSelectedProfile(null);
          setPasswordError('');
        }}
        error={passwordError}
      />
    </div>
  );
};
