import React, { useState, useEffect } from 'react';
import {
  Video,
  Link2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Shield,
  Unlink,
  ExternalLink,
  KeyRound,
  X,
} from 'lucide-react';
import { Button, Chip } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';

export default function PlatformConnections() {
  const { creator, showToast } = useGuardian();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('demo'); // 'demo' | 'connected' | 'unlinked'
  const [lastSync, setLastSync] = useState('Today at 4:12 PM');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configModalMessage, setConfigModalMessage] = useState('');

  // Check URL query parameters for OAuth redirect callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth') === 'success') {
      setConnectionStatus('connected');
      setLastSync('Just now via OAuth 2.0');
      showToast('YouTube channel successfully connected via OAuth 2.0!', 'success');
    }
  }, [showToast]);

  const handleConnectOAuth = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch('/api/integrations/youtube/connect');
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.authUrl) {
        // Redirect creator to Google's real OAuth 2.0 authorization screen
        window.location.href = data.authUrl;
        return;
      }

      // If server returned 503 or error explaining missing env credentials
      const errMsg = data.error || 'Google OAuth 2.0 credentials not detected on the server.';
      setConfigModalMessage(errMsg);
      setShowConfigModal(true);
    } catch (err) {
      setConfigModalMessage(`Connection attempt encountered an error: ${err.message}. Ensure the Ghost Guardian server is active on port 3001.`);
      setShowConfigModal(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync('Just now');
      showToast('YouTube comments synchronized successfully.', 'success');
    }, 600);
  };

  const handleDisconnect = () => {
    setConnectionStatus('unlinked');
    showToast('YouTube channel connection disengaged.', 'info');
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <h3 className="font-display text-lg text-white font-bold tracking-wide uppercase">Platform Connections</h3>
          <p className="text-xs text-[#a0a0a0] mt-0.5">
            Connect your public content platforms to feed the Guardian attention protection engine.
          </p>
        </div>
        <Chip variant="outline" className="border-white/10 text-white font-mono">
          Multi-Platform Architecture
        </Chip>
      </div>

      {/* Primary YouTube Connection Card */}
      <div className="rounded-xl border border-[#FF1400]/30 bg-[#000000] p-5 sm:p-6 space-y-5 shadow-[0_0_24px_rgba(255,20,0,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[#FF1400]/15 text-[#FF2A00] flex items-center justify-center shrink-0 border border-[#FF1400]/30 shadow-[0_0_15px_rgba(255,20,0,0.25)]">
              <Video size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display text-base text-white font-bold tracking-wider">YouTube Channel</h4>
                {connectionStatus === 'connected' ? (
                  <Chip variant="positive" className="bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30">
                    <span className="pulse-dot bg-[#00FF66] mr-1" />
                    Connected (OAuth 2.0)
                  </Chip>
                ) : connectionStatus === 'demo' ? (
                  <Chip variant="guardian" className="bg-[#0A00FF]/10 text-[#0A00FF] border-[#0A00FF]/30">
                    Active Demo Mode
                  </Chip>
                ) : (
                  <Chip variant="outline" className="text-[#a0a0a0]">
                    Disconnected
                  </Chip>
                )}
              </div>
              <p className="text-xs text-[#a0a0a0] mt-1 font-mono">
                Channel: <strong className="text-white">{creator?.channelName || 'The Long Signal'}</strong> ({creator?.handle || '@alexchen'})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              size="sm"
              variant="default"
              onClick={handleConnectOAuth}
              disabled={isConnecting}
              className="gap-1.5"
            >
              <KeyRound size={13} className={isConnecting ? 'animate-pulse' : ''} />
              <span>{isConnecting ? 'Authorizing...' : 'Connect YouTube (OAuth)'}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleSimulateSync}
              disabled={isSyncing}
              className="gap-1.5"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Comments'}</span>
            </Button>

            {connectionStatus !== 'unlinked' && (
              <Button size="sm" variant="ghost" onClick={handleDisconnect} title="Disconnect platform">
                <Unlink size={13} />
              </Button>
            )}
          </div>
        </div>

        {/* Status & Scope Detail */}
        <div className="grid gap-3 pt-4 border-t border-white/[0.08] sm:grid-cols-2 text-xs text-[#a0a0a0]">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a0a0a0] block font-mono">
              Last Sync Timestamp
            </span>
            <span className="text-white font-medium mt-0.5 block">{lastSync}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a0a0a0] block font-mono">
              Authorized Scopes
            </span>
            <span className="text-[#00FF66] font-medium mt-0.5 block">
              youtube.readonly · youtube.force-ssl
            </span>
          </div>
        </div>

        {/* Security & Production Architecture Note */}
        <div className="rounded-lg border border-white/[0.08] bg-[#0a0a0a] p-3.5 flex items-start gap-3 text-xs text-[#a0a0a0]">
          <Shield size={16} className="text-[#0A00FF] shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-white">Cryptographic Security Protocol:</strong> Live YouTube OAuth tokens are encrypted using AES-256-GCM server-side. Ghost Guardian strictly operates on deterministic safety precedence and never leaks tokens or creator keys into browser local storage.
          </span>
        </div>
      </div>

      {/* Planned Platforms Suite */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#a0a0a0] block font-mono">
          Upcoming Platform Integrations
        </span>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Instagram Threads & Comments', desc: 'Direct Creator DM & Post ingestion' },
            { name: 'TikTok Creator Hub', desc: 'High-velocity short form triage' },
            { name: 'X / Twitter Mentions', desc: 'Provocation filtering and quote analysis' },
            { name: 'Reddit Community Threads', desc: 'Subreddit moderation and question mining' },
            { name: 'Discord Server Channels', desc: 'Community sentiment and helper responses' },
            { name: 'Substack Notes & Comments', desc: 'Longform newsletter discussions' },
          ].map((item) => (
            <div key={item.name} className="p-3.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">{item.name}</span>
                <span className="text-[10px] text-[#a0a0a0] font-mono">Planned</span>
              </div>
              <p className="text-[11px] text-[#a0a0a0]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* OAuth Configuration Help Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-lg rounded-xl border border-white/20 bg-[#0a0a0a] p-6 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-white font-display font-bold text-base">
                <KeyRound size={18} className="text-[#0A00FF]" />
                <span>YouTube OAuth 2.0 Setup</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-[#a0a0a0] hover:text-white p-1 rounded-md"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#a0a0a0] leading-relaxed">
              <p className="text-white">
                {configModalMessage}
              </p>
              <div className="p-3 rounded-lg bg-black border border-white/10 font-mono text-[11px] space-y-1">
                <div className="text-white font-semibold">Required Environment Variables in .env:</div>
                <div className="text-[#00FF66]">YOUTUBE_CLIENT_ID=your_client_id.apps.googleusercontent.com</div>
                <div className="text-[#00FF66]">YOUTUBE_CLIENT_SECRET=your_client_secret</div>
                <div className="text-[#a0a0a0]">YOUTUBE_REDIRECT_URI=http://localhost:3001/api/integrations/youtube/callback</div>
              </div>
              <p>
                To immediately test pulling real comments from any public YouTube video without configuring OAuth client credentials, head to the <strong className="text-white">Inbox</strong> page and use the <strong className="text-[#0A00FF]">Load Real Comments</strong> tool.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <Button size="sm" variant="outline" onClick={() => setShowConfigModal(false)}>
                Dismiss
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  setShowConfigModal(false);
                  setConnectionStatus('connected');
                  showToast('Demo YouTube OAuth simulation linked for session.', 'success');
                }}
              >
                Simulate OAuth Linked
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
