import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Link2, Video, Camera, AtSign, MessageCircle, Hash, Check, Clock, ArrowRight } from 'lucide-react';

export default function PlatformConnections() {
  const { state, addToast } = useApp();

  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: Video, connected: state.isDemo, status: state.isDemo ? 'Connected' : 'Not Connected', color: '#ff0000', desc: 'Connect your YouTube channel to manage comments across all your videos.', stats: state.isDemo ? { videos: 247, comments: '5.3K', lastSync: '2 minutes ago' } : null },
    { id: 'instagram', name: 'Instagram', icon: Camera, connected: false, status: 'Coming Soon', color: '#E4405F', desc: 'Manage Instagram comments and DMs.', coming: true },
    { id: 'tiktok', name: 'TikTok', icon: MessageCircle, connected: false, status: 'Coming Soon', color: '#00f2ea', desc: 'Monitor and respond to TikTok comments.', coming: true },
    { id: 'x', name: 'X (Twitter)', icon: AtSign, connected: false, status: 'Coming Soon', color: '#1DA1F2', desc: 'Manage replies and mentions on X.', coming: true },
    { id: 'reddit', name: 'Reddit', icon: Hash, connected: false, status: 'Coming Soon', color: '#FF4500', desc: 'Monitor subreddit discussions and mentions.', coming: true },
  ];

  const handleConnect = (platform) => {
    if (platform.coming) {
      addToast('info', `${platform.name} integration coming soon.`);
      return;
    }
    if (state.isDemo) {
      addToast('info', 'YouTube is connected in demo mode. Live connection requires YouTube API authorization.');
    } else {
      addToast('info', 'Live platform connection requires API authorization. This feature connects to the YouTube Data API.');
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: 800 }}>
      <h1 className="page-title">Platform Connections</h1>
      <p className="page-subtitle">Connect your social platforms to enable Ghost Guardian across your content.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {platforms.map(p => (
          <div key={p.id} className="card" style={{ opacity: p.coming ? 0.6 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: p.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color, flexShrink: 0 }}>
                <p.icon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  <span className={`badge ${p.connected ? 'badge-success' : p.coming ? 'badge-neutral' : 'badge-warning'}`}>
                    {p.connected && <Check size={10} />} {p.status}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{p.desc}</p>
                {p.stats && (
                  <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>📹 {p.stats.videos} videos</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>💬 {p.stats.comments} comments</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>🔄 {p.stats.lastSync}</span>
                  </div>
                )}
              </div>
              <button onClick={() => handleConnect(p)} className={`btn btn-sm ${p.connected ? 'btn-secondary' : p.coming ? 'btn-ghost' : 'btn-primary'}`} style={{ flexShrink: 0 }}>
                {p.connected ? 'Manage' : p.coming ? 'Notify Me' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)', borderStyle: 'dashed', textAlign: 'center', padding: 'var(--space-8)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
          Platform architecture: Comment → Ghost Guardian Intelligence → Response → Platform
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Additional platforms will plug into the same intelligence pipeline.
        </p>
      </div>
    </div>
  );
}
