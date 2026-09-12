import React, { useEffect, useState, useCallback } from 'react';
import {
  Video,
  Shield,
  Clock,
  Loader2,
} from 'lucide-react';
import { Chip, Button } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import {
  startYouTubeConnect,
  getYouTubeConnection,
  disconnectYouTube,
} from '../../lib/youtubeConnect';

export default function PlatformConnections() {
  const { creator, videos, showToast } = useGuardian();

  const [conn, setConn] = useState({ connected: false, channelTitle: null });
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setChecking(true);
    const result = await getYouTubeConnection();
    setConn(result);
    setChecking(false);
  }, []);

  useEffect(() => {
    refresh();
    // Surface the result of the OAuth round-trip if we just came back from Google.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('youtube');
      if (status === 'connected') {
        showToast?.('YouTube channel connected. You can now publish replies.', 'success');
      } else if (status === 'error') {
        showToast?.('YouTube connection did not complete. Please try again.', 'error');
      }
      if (status) {
        params.delete('youtube');
        const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
        window.history.replaceState({}, '', clean);
      }
    }
  }, [refresh, showToast]);

  const handleConnect = async () => {
    setBusy(true);
    try {
      await startYouTubeConnect(); // redirects the browser
    } catch (err) {
      showToast?.(err.message || 'Could not start the connection.', 'error');
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    const ok = await disconnectYouTube();
    if (ok) {
      setConn({ connected: false, channelTitle: null });
      showToast?.('YouTube channel disconnected.', 'info');
    } else {
      showToast?.('Could not disconnect. Try again.', 'error');
    }
    setBusy(false);
  };

  return (
    <section className="ghost-panel p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <h3 className="font-display text-lg text-white font-bold tracking-wide uppercase">
            Platform Connections
          </h3>
          <p className="text-xs text-[#a0a0a0] mt-0.5">
            Connect your channel to import comments and publish approved replies.
          </p>
        </div>
        <Chip variant="outline" className="border-white/10 text-white font-mono">
          Multi-Platform Architecture
        </Chip>
      </div>

      {/* 1. Public video ingestion (always available via API key) */}
      <div className="rounded-xl border border-[#00FF66]/30 bg-[#000000] p-5 sm:p-6 space-y-5 shadow-[0_0_24px_rgba(0,255,102,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[#FF1400]/15 text-[#FF1400] flex items-center justify-center shrink-0 border border-[#FF1400]/30 shadow-[0_0_15px_rgba(255,20,0,0.2)]">
              <Video size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display text-base text-white font-bold tracking-wider">
                  YouTube Public Access
                </h4>
                <Chip variant="positive" className="bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30">
                  <span className="pulse-dot bg-[#00FF66] mr-1" /> Active
                </Chip>
              </div>
              <p className="text-xs text-[#a0a0a0] mt-1 font-mono">
                Import comments from any public video by URL or ID.
              </p>
            </div>
          </div>

          <Chip variant="outline" className="text-xs border-white/10 font-mono text-[#a0a0a0]">
            {videos?.length || 0} Videos Tracked
          </Chip>
        </div>
      </div>

      {/* 2. Channel OAuth — real connect / disconnect for direct publishing */}
      <div
        className={`rounded-xl border p-5 sm:p-6 space-y-4 ${
          conn.connected
            ? 'border-[#0200F1]/40 bg-[#000000] shadow-[0_0_24px_rgba(2,0,241,0.08)]'
            : 'border-white/10 bg-[#050505]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`size-12 rounded-xl flex items-center justify-center shrink-0 border ${
                conn.connected
                  ? 'bg-[#0200F1]/15 text-[#0200F1] border-[#0200F1]/30'
                  : 'bg-white/5 text-[#a0a0a0] border-white/10'
              }`}
            >
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display text-base text-white font-bold tracking-wider">
                  Direct Channel Connection
                </h4>
                {checking ? (
                  <Chip variant="outline" className="text-[#a0a0a0] border-white/10">Checking…</Chip>
                ) : conn.connected ? (
                  <Chip variant="positive" className="bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30">
                    <span className="pulse-dot bg-[#00FF66] mr-1" /> Connected
                  </Chip>
                ) : (
                  <Chip variant="outline" className="text-[#a0a0a0] border-white/10">Not connected</Chip>
                )}
              </div>
              <p className="text-xs text-[#a0a0a0] mt-1">
                {conn.connected
                  ? <>Publishing as <strong className="text-white">{conn.channelTitle || creator?.channelName || 'your channel'}</strong>. Approved replies post straight to the thread.</>
                  : 'Connect your channel so approved replies post directly to YouTube.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {conn.connected ? (
              <Button variant="outline" onClick={handleDisconnect} disabled={busy} className="text-xs">
                {busy ? <Loader2 size={14} className="animate-spin" /> : 'Disconnect'}
              </Button>
            ) : (
              <Button onClick={handleConnect} disabled={busy || checking} className="text-xs">
                {busy ? <Loader2 size={14} className="animate-spin" /> : 'Connect YouTube'}
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-[#000000] p-3.5 flex items-start gap-3 text-xs text-[#a0a0a0]">
          <Clock size={16} className="text-[#0200F1] shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-white">Nothing posts without your approval.</strong> Ghost Guardian only publishes a reply when you press Approve on a draft you've reviewed. Your channel tokens are stored securely on the server and never in your browser.
          </span>
        </div>
      </div>

      {/* Planned platforms */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#a0a0a0] block font-mono">
          Upcoming Platform Integrations
        </span>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Instagram Threads & Comments', desc: 'Direct creator DM & post ingestion' },
            { name: 'TikTok Creator Hub', desc: 'High-velocity short-form triage' },
            { name: 'X / Twitter Mentions', desc: 'Provocation filtering and quote analysis' },
            { name: 'Reddit Community Threads', desc: 'Subreddit moderation and question mining' },
            { name: 'Discord Server Channels', desc: 'Community sentiment and helper responses' },
            { name: 'Substack Notes & Comments', desc: 'Longform newsletter discussions' },
          ].map((item) => (
            <div key={item.name} className="p-3.5 rounded-lg bg-[#050505] border border-white/[0.08] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">{item.name}</span>
                <span className="text-[10px] text-[#a0a0a0] font-mono">Planned</span>
              </div>
              <p className="text-[11px] text-[#a0a0a0]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
