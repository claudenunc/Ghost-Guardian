import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Ghost, ShieldCheck } from 'lucide-react';
import { Button, GhostMark } from '../components/guardian/atoms';
import { useGuardian } from '../lib/store';

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, runtime, startDemo } = useGuardian();
  const next = params.get('next') || '/app';

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, navigate, next]);

  const openDemo = () => {
    startDemo();
    navigate(next, { replace: true });
  };

  return (
    <main className="public-page min-h-screen ghost-aurora text-[#f4f6fb]">
      <section className="public-card ghost-panel">
        <div className="flex items-center gap-3">
          <GhostMark />
          <div>
            <p className="text-xs uppercase tracking-widest text-[#4de1dc]">Access boundary</p>
            <h1 className="font-display text-2xl text-white">Ghost Guardian</h1>
          </div>
        </div>

        {runtime.isDemo ? (
          <>
            <p className="text-sm text-[#8f97b0] leading-relaxed">
              This build provides a controlled demo environment with fixture creators, comments, and simulated platform actions. It is not production sign-in and it never connects to YouTube.
            </p>
            <Button onClick={openDemo} className="w-full">
              <Eye size={16} /> Open Demo Workspace
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-[#8f97b0] leading-relaxed">
              Production authentication is not configured. A provider-backed authentication service and server-side platform integration are required before this workspace can be opened.
            </p>
            <div className="app-state app-state-unavailable">
              <ShieldCheck size={18} aria-hidden="true" /> Production access is intentionally unavailable.
            </div>
          </>
        )}

        <Link className="button button-secondary text-center" to="/">Return to home</Link>
      </section>
    </main>
  );
}
