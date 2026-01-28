import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface PasswordPromptProps {
  isOpen: boolean;
  profileName: string;
  onSubmit: (password: string) => void;
  onClose: () => void;
  error?: string;
}

export const PasswordPrompt: React.FC<PasswordPromptProps> = ({
  isOpen,
  profileName,
  onSubmit,
  onClose,
  error,
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Welcome back, ${profileName}!`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-dark-400 mb-2 block flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Enter your password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={!password.trim()}
          >
            Unlock
          </Button>
        </div>
      </form>
    </Modal>
  );
};
