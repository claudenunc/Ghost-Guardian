import React, { useEffect, useState } from 'react';
import { Video, ShieldCheck, ListVideo, MessageSquare, Loader2, LogOut } from 'lucide-react';
import { GhostMark, Button } from '../guardian/atoms';
import { useGuardian } from '../../lib/store';
import { startYouTubeConnect } from '../../lib/youtubeConnect';

/**
 * Required step after sign-up: the creator must connect and authorize their
 * YouTube channel before entering the workspace. Shown by RequireYouTube when
 * no connection exists.
 */
export default function ConnectGate() {
  const { signOut, showToast } = useGuardian();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('youtube') === 'error') {
      showToast?.('The connection did not complete. Please try again.', 'error');
      params.delete('youtube');
      const clean = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', clean);
    }
  }, [showToast]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await startYouTubeConnect(); // redirects to Google, returns to /app/inbox
    } catch (err) {
      showToast?.(err.message || 'Could not start the connection.', 'error');
      setConnecting(false);
    }
  };

  const steps = [
    { icon: ShieldCheck, title: 'Authorize your channel', desc: 'Securely connect via Google. Tokens stay on our server, never in your browser.' },
    { icon: ListVideo, title: 'We load your videos', desc: 'Every video on your channel appears so you can choose what to protect.' },
    { icon: MessageSquare, title: 'Import & draft', desc: 'Pick a video and Ghost Guardian sorts the comments and drafts replies in your voice.' },
  ];

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <header className="p-6 sm:p-8 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <GhostMark />
          <div>
            <span className="font-display text-sm tracking-[0.25em] uppercase text-white font-black block">
              Ghost Guardian
            </span>
            <span className="text-[9px] font-mono tracking-[0.3em] text-[#a0a0a0] block uppercase">
              One step to go
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut?.()}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#a0a0a0] hover:text-white transition-colors cursor-pointer"
        >
          <LogOut size={13} /> Sign out
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-lg ghost-panel p-8 sm:p-10 border border-white/10 bg-[#050505] shadow-[0_0_50px_rgba(2,0,241,0.15)] space-y-7">
          <div className="space-y-2 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-[#0200F1]/15 text-[#0200F1] border border-[#0200F1]/30 shadow-[0_0_20px_rgba(2,0,241,0.25)]">
              <Video size={28} />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-white font-black tracking-tight">
              Connect your YouTube channel
            </h1>
            <p className="text-sm text-[#a0a0a0] leading-relaxed">
              Ghost Guardian works on your channel. Connect and authorize it to load your
              videos and publish approved replies — nothing posts without your approval.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-[#000000] p-3.5">
                <div className="size-9 rounded-lg bg-[#0200F1]/10 text-[#0200F1] flex items-center justify-center shrink-0 border border-[#0200F1]/20">
                  <s.icon size={16} />
                </div>
                <div>
                  <p className="text-sm text-white font-semibold">
                    <span className="text-[#0200F1] font-mono mr-1.5">{i + 1}.</span>{s.title}
                  </p>
                  <p className="text-xs text-[#a0a0a0] mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleConnect}
            disabled={connecting}
            size="lg"
            className="w-full justify-center gap-2 shadow-[0_0_20px_rgba(2,0,241,0.35)]"
          >
            {connecting ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
            <span>{connecting ? 'Opening Google…' : 'Connect YouTube Channel'}</span>
          </Button>

          <p className="text-center text-[11px] font-mono text-[#a0a0a0]">
            You'll see a Google "unverified app" notice during our beta — choose Advanced → Continue.
          </p>
        </div>
      </div>
    </main>
  );
}
