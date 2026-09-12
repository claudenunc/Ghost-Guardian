import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Trash2,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { Button, Chip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

export default function DangerZone() {
  const { signOut, showToast, dispatch } = useGuardian();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!showClearConfirm && !showDeleteConfirm) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowClearConfirm(false);
        setShowDeleteConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showClearConfirm, showDeleteConfirm]);

  const handleClearLocalStorage = () => {
    try {
      localStorage.clear();
      showToast('Local browser cache cleared.', 'info');
      setShowClearConfirm(false);
      window.location.reload();
    } catch {
      showToast('Failed to clear local cache.', 'error');
    }
  };

  const handleDeleteWorkspaceData = async () => {
    setIsDeleting(true);
    try {
      // Clear localStorage cache
      localStorage.clear();
      // Dispatch reset to clean empty production workspace
      dispatch?.({
        type: 'RESET_WORKSPACE',
        payload: {
          creator: {},
          videos: [],
          comments: [],
          commenters: [],
          commentStates: {},
          voice: { warmth: 75, directness: 65, humor: 40, formality: 40 },
          settings: { mode: 'balanced', paused: false },
          policy: {},
          knowledge: [],
          learning: [],
          activity: [],
          contentOpportunities: [],
          communityHealth: {},
          weeklyDigest: {},
          sentimentTrend: [],
          questionClusters: [],
          topics: [],
        },
      });
      setShowDeleteConfirm(false);
      showToast('All workspace data deleted.', 'info');
    } catch (err) {
      showToast('Failed to delete workspace data.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6 border-[#FF1400]/25 bg-gradient-to-r from-[#1a1215]/80 via-[#141217]/90 to-[#121422]/90">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-[#FF1400]">
          <AlertTriangle size={18} />
          <h3 className="font-display text-lg text-white font-bold">Danger Zone</h3>
        </div>
        <Chip variant="critical">Irreversible Actions</Chip>
      </div>

      <div className="divide-y divide-white/5">
        {/* Clear Local Cache */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">
              Clear Local Browser Cache
            </h4>
            <p className="text-xs text-[#8f97b0] mt-0.5 leading-relaxed">
              Purges local cache and offline snapshots stored in your browser.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowClearConfirm(true)}
          >
            <Trash2 size={14} /> Clear Local Cache
          </Button>
        </div>

        {/* Delete Workspace Data */}
        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-[#FF1400]">
              Delete My Workspace Data
            </h4>
            <p className="text-xs text-[#8f97b0] mt-0.5 leading-relaxed">
              Permanently purges all your comments, voice examples, and policy rules from your workspace.
            </p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <AlertTriangle size={14} /> Delete Workspace Data
          </Button>
        </div>

        {/* Sign Out */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-white">
              Sign Out of Session
            </h4>
            <p className="text-xs text-[#8f97b0] mt-0.5 leading-relaxed">
              Disconnects your current session and returns to the authentication screen.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={signOut}>
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
      </div>

      {/* Confirmation Modal: Clear Local Cache */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-cache-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-[#0a0a0a] p-6 space-y-4 shadow-2xl">
            <h4 id="clear-cache-title" className="font-display text-base font-bold text-white">
              Clear local browser cache?
            </h4>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              This will remove cached workspace snapshots from your browser and reload fresh state.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="default" onClick={handleClearLocalStorage}>
                Confirm & Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Workspace Data */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-workspace-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#FF1400]/40 bg-[#0a0a0a] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#FF1400]">
              <ShieldAlert size={20} />
              <h4 id="delete-workspace-title" className="font-display text-base font-bold text-white">
                Delete all workspace data?
              </h4>
            </div>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              This action cannot be undone. All imported comments, comment states, and voice configurations associated with your creator account will be permanently cleared.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDeleteWorkspaceData}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
