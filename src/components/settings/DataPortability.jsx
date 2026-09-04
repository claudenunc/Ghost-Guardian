import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Database,
  ShieldCheck,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { Button, Chip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { validateWorkspaceImportPayload } from '../../domain/settings/workspaceContracts';

export default function DataPortability() {
  const { exportData, importWorkspace, showToast } = useGuardian();

  const fileInputRef = useRef(null);
  const [importState, setImportState] = useState({
    file: null,
    valid: false,
    error: null,
    preview: null,
    rehydratedState: null,
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const validation = validateWorkspaceImportPayload(text);

        if (!validation.valid) {
          setImportState({
            file: null,
            valid: false,
            error: validation.error || 'Invalid backup structure.',
            preview: null,
            rehydratedState: null,
          });
          showToast(validation.error || 'Invalid backup file.', 'error');
          return;
        }

        setImportState({
          file,
          valid: true,
          error: null,
          preview: validation.preview,
          rehydratedState: validation.rehydratedState,
        });
        setShowPreviewModal(true);
      } catch (err) {
        setImportState({
          file: null,
          valid: false,
          error: 'Failed to read file.',
          preview: null,
          rehydratedState: null,
        });
        showToast('Error parsing file.', 'error');
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = () => {
    if (!importState.rehydratedState) return;
    importWorkspace(importState.rehydratedState);
    setShowPreviewModal(false);
    setImportState({ file: null, valid: false, error: null, preview: null, rehydratedState: null });
  };

  const handleExportBackupFirst = () => {
    exportData();
    showToast('Current workspace exported as safety backup.', 'success');
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <h3 className="font-display text-lg text-white font-bold">
            Data Portability & Workspace Storage
          </h3>
          <p className="text-xs text-[#8f97b0] mt-0.5">
            Your data belongs to you. Export complete deterministic JSON backups or restore previous workspaces.
          </p>
        </div>
        <Chip variant="positive">Full Portability</Chip>
      </div>

      {/* Storage Architecture Explanation */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0f17]/60 p-5 space-y-3 text-xs text-[#8f97b0] leading-relaxed">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Database size={16} className="text-[#4de1dc]" />
          <span>Local Workspace Storage Standard</span>
        </div>
        <p>
          Ghost Guardian is architected with a strict separation between <strong>Workspace Configuration</strong> (your voice calibrations, approved knowledge, boundary policies, and decision audit logs) and <strong>Platform Data</strong> (public comments).
        </p>
        <p>
          All workspace configurations are cleanly portable in standardized JSON. Backups exclude sensitive API keys, passwords, and tokens by design.
        </p>
      </div>

      {/* Action Cards: Export and Import */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Export Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17]/60 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="size-10 rounded-xl bg-[#4de1dc]/15 text-[#4de1dc] flex items-center justify-center">
              <Download size={20} />
            </div>
            <h4 className="font-display text-base text-white font-bold">Export Workspace Backup</h4>
            <p className="text-xs text-[#8f97b0] leading-relaxed">
              Download your complete workspace including voice calibrations, custom policies, knowledge items, and moderation decisions as a portable JSON file.
            </p>
          </div>

          <div className="pt-2">
            <Button size="sm" onClick={exportData}>
              <FileJson size={14} /> Download JSON Backup
            </Button>
          </div>
        </div>

        {/* Import Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0f17]/60 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="size-10 rounded-xl bg-[#818cf8]/15 text-[#818cf8] flex items-center justify-center">
              <Upload size={20} />
            </div>
            <h4 className="font-display text-base text-white font-bold">Restore From Backup</h4>
            <p className="text-xs text-[#8f97b0] leading-relaxed">
              Restore a previously exported Ghost Guardian JSON file. File integrity and schema compatibility are validated before any data is replaced.
            </p>
          </div>

          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              aria-label="Upload Backup JSON File"
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} /> Select Backup File
            </Button>
          </div>
        </div>
      </div>

      {/* Restore Preview & Confirmation Modal */}
      {showPreviewModal && importState.preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#4de1dc]/40 bg-[#131726] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[#4de1dc]/15 text-[#4de1dc] flex items-center justify-center">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 className="font-display text-lg text-white font-bold">
                  Valid Workspace Backup Found
                </h4>
                <p className="text-xs text-[#8f97b0]">
                  Review the backup contents before restoring.
                </p>
              </div>
            </div>

            {/* Preview Breakdown */}
            <div className="rounded-xl border border-white/10 bg-[#0d0f17] p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-white">
                <span className="text-[#8f97b0]">Creator / Channel:</span>
                <span className="font-semibold">{importState.preview.creatorName} ({importState.preview.channelName})</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="text-[#8f97b0]">Backup Date:</span>
                <span className="font-mono">{new Date(importState.preview.exportedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="text-[#8f97b0]">Voice Profile & Rules:</span>
                <span className="text-[#34d399] font-medium">Included & Validated</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="text-[#8f97b0]">Activity Records:</span>
                <span>{importState.preview.activityCount} logged actions</span>
              </div>
              <div className="flex justify-between text-white">
                <span className="text-[#8f97b0]">Content Opportunities:</span>
                <span>{importState.preview.opportunitiesCount} items</span>
              </div>
            </div>

            {/* Safety Warning & Safety Net */}
            <div className="rounded-xl border border-[#fbbf24]/30 bg-[#1a1712] p-3.5 space-y-2 text-xs text-[#e4e7f1]">
              <div className="flex items-center gap-2 text-[#fbbf24] font-bold">
                <AlertTriangle size={14} />
                <span>Replacement Safety Notice</span>
              </div>
              <p>
                Restoring this backup will replace your current workspace configuration. Would you like to export your current state first?
              </p>
              <button
                type="button"
                onClick={handleExportBackupFirst}
                className="text-[11px] text-[#4de1dc] hover:underline font-semibold cursor-pointer"
              >
                📥 Export current workspace before replacing
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowPreviewModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirmImport}>
                <RotateCcw size={14} /> Confirm & Restore Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
