import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Filter, Ghost, AlertTriangle, Check, X, RefreshCw, Eye, EyeOff, Flag, ChevronUp, Edit3, Save, MessageSquare, Shield, Clock, ThumbsUp, ThumbsDown, Bookmark, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../services/ai/classifier';
import { demoVideos } from '../data/demoVideos';

const categoryColors = {
  PRAISE: 'var(--emerald-400)', QUESTION: 'var(--sky-400)', CONSTRUCTIVE_CRITICISM: 'var(--amber-400)',
  DISAGREEMENT: 'var(--orange-400)', GENERAL_COMMENT: 'var(--text-tertiary)', HUMOR: 'var(--primary-300)',
  TROLLING: 'var(--orange-500)', HARASSMENT: 'var(--rose-400)', HATE: 'var(--rose-500)',
  SPAM: 'var(--text-muted)', SCAM: 'var(--text-muted)', THREAT: 'var(--rose-500)',
  SENSITIVE: 'var(--amber-300)', UNKNOWN: 'var(--text-muted)',
};

const riskColors = { low: 'var(--emerald-400)', medium: 'var(--amber-400)', high: 'var(--orange-500)', critical: 'var(--rose-500)' };

export default function CommentInbox() {
  const { state, approveComment, editComment, rejectComment, ignoreComment, escalateComment, regenerateResponse, saveAsExample } = useApp();
  const [filter, setFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('risk');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    let comments = [...state.processedComments];

    // Filter
    if (filter === 'pending') comments = comments.filter(c => c.status === 'pending');
    else if (filter === 'approved') comments = comments.filter(c => c.status === 'approved');
    else if (filter === 'escalated') comments = comments.filter(c => c.status === 'escalated' || c.strategy?.requiresHumanReview);
    else if (filter === 'rejected') comments = comments.filter(c => c.status === 'rejected');
    else if (filter !== 'all') comments = comments.filter(c => c.classification?.category === filter);

    // Risk filter
    if (riskFilter !== 'all') comments = comments.filter(c => c.classification?.risk === riskFilter);

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      comments = comments.filter(c =>
        c.comment.text?.toLowerCase().includes(term) ||
        c.comment.author?.toLowerCase().includes(term) ||
        c.response?.text?.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy === 'risk') {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      comments.sort((a, b) => (riskOrder[a.classification?.risk] || 3) - (riskOrder[b.classification?.risk] || 3));
    } else if (sortBy === 'time') {
      comments.sort((a, b) => new Date(b.comment.timestamp) - new Date(a.comment.timestamp));
    } else if (sortBy === 'engagement') {
      comments.sort((a, b) => (b.comment.likes || 0) - (a.comment.likes || 0));
    }

    return comments;
  }, [state.processedComments, filter, riskFilter, searchTerm, sortBy]);

  const getVideo = (videoId) => demoVideos.find(v => v.id === videoId) || state.videos.find(v => v.id === videoId);

  const startEdit = (pc) => {
    setEditingId(pc.comment.id);
    setEditText(pc.creatorEdit || pc.response?.text || '');
  };

  const submitEdit = (commentId) => {
    editComment(commentId, editText);
    setEditingId(null);
    setEditText('');
  };

  const timeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const statusCounts = {
    all: state.processedComments.length,
    pending: state.processedComments.filter(c => c.status === 'pending').length,
    approved: state.processedComments.filter(c => c.status === 'approved').length,
    escalated: state.processedComments.filter(c => c.status === 'escalated' || c.strategy?.requiresHumanReview).length,
  };

  return (
    <div className="page-content" style={{ maxWidth: 900 }}>
      <h1 className="page-title">Comment Inbox</h1>
      <p className="page-subtitle">{filtered.length} comments · {statusCounts.pending} pending</p>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input placeholder="Search comments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="select input-sm" value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: 140 }}>
          <option value="all">All ({statusCounts.all})</option>
          <option value="pending">Pending ({statusCounts.pending})</option>
          <option value="approved">Approved ({statusCounts.approved})</option>
          <option value="escalated">Escalated ({statusCounts.escalated})</option>
          <option value="rejected">Rejected</option>
          <optgroup label="By Category">
            {Object.keys(CATEGORIES).map(c => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </optgroup>
        </select>
        <select className="select input-sm" value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ minWidth: 100 }}>
          <option value="all">All Risk</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="select input-sm" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ minWidth: 120 }}>
          <option value="risk">Sort: Risk</option>
          <option value="time">Sort: Latest</option>
          <option value="engagement">Sort: Engagement</option>
        </select>
      </div>

      {/* Comment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtered.map(pc => {
          const video = getVideo(pc.comment.videoId);
          const isEditing = editingId === pc.comment.id;
          const isExpanded = expandedId === pc.comment.id;
          const isCritical = pc.classification?.risk === 'critical';
          const isHighRisk = pc.classification?.risk === 'high' || isCritical;

          return (
            <div key={pc.comment.id} className={`comment-card ${isCritical ? 'risk-critical' : isHighRisk ? 'risk-high' : ''}`} style={{ flexDirection: 'column' }}>
              {/* Critical banner */}
              {isCritical && (
                <div className="escalation-banner" style={{ margin: '0 0 var(--space-3) 0' }}>
                  <div className="escalation-banner-icon"><AlertTriangle size={16} /></div>
                  <div className="escalation-banner-content">
                    <div className="escalation-banner-title">HUMAN ATTENTION REQUIRED</div>
                    <div className="escalation-banner-text">{pc.strategy?.reason}</div>
                  </div>
                </div>
              )}

              {/* Comment header */}
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <div className="comment-card-avatar">{pc.comment.author?.[0]?.toUpperCase() || '?'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="comment-card-header">
                    <span className="comment-card-author">{pc.comment.author}</span>
                    <span className="comment-card-meta">{timeAgo(pc.comment.timestamp)}</span>
                    {pc.comment.likes > 0 && <span className="comment-card-meta">· 👍 {pc.comment.likes}</span>}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: (categoryColors[pc.classification?.category] || 'var(--text-muted)') + '20', color: categoryColors[pc.classification?.category] || 'var(--text-muted)' }}>
                        {pc.classification?.category?.replace(/_/g, ' ')}
                      </span>
                      <span className="badge" style={{ background: (riskColors[pc.classification?.risk] || 'var(--text-muted)') + '15', color: riskColors[pc.classification?.risk] || 'var(--text-muted)' }}>
                        <span className="risk-dot" style={{ width: 6, height: 6, background: riskColors[pc.classification?.risk] }} /> {pc.classification?.risk}
                      </span>
                      {pc.status !== 'pending' && (
                        <span className={`badge ${pc.status === 'approved' ? 'badge-success' : pc.status === 'rejected' ? 'badge-danger' : pc.status === 'escalated' ? 'badge-warning' : 'badge-neutral'}`}>
                          {pc.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Video context */}
                  {video && (
                    <div className="comment-card-context">
                      <MessageSquare size={12} />
                      on "{video.title}"
                    </div>
                  )}

                  {/* Comment text */}
                  <p className="comment-card-text">{pc.comment.text}</p>

                  {/* Strategy info (expandable) */}
                  <button onClick={() => setExpandedId(isExpanded ? null : pc.comment.id)} className="btn btn-ghost btn-sm" style={{ gap: 4, marginBottom: 'var(--space-2)' }}>
                    <Shield size={12} /> Strategy: {pc.strategy?.strategy?.replace(/_/g, ' ')} · Confidence: {Math.round((pc.classification?.confidence || 0) * 100)}%
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {isExpanded && (
                    <div style={{ padding: 'var(--space-3)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      <div><strong>Category:</strong> {pc.classification?.category}</div>
                      <div><strong>Sentiment:</strong> {pc.classification?.sentiment}</div>
                      <div><strong>Intent:</strong> {pc.classification?.intent}</div>
                      <div><strong>Strategy:</strong> {pc.strategy?.strategy} — {pc.strategy?.reason}</div>
                      <div><strong>Confidence:</strong> {pc.classification?.confidence}</div>
                      {pc.duplicateWarning && <div style={{ color: 'var(--amber-400)' }}><strong>⚠️ {pc.duplicateWarning}</strong></div>}
                      {pc.quality?.checks?.filter(c => c.status !== 'pass').map((c, i) => (
                        <div key={i} style={{ color: c.status === 'fail' ? 'var(--rose-400)' : 'var(--amber-400)' }}>
                          <strong>{c.name}:</strong> {c.note}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Response */}
                  {pc.response?.text && pc.response?.shouldDisplay !== false && (
                    <div className="comment-card-response">
                      <div className="comment-card-response-label">
                        <Ghost size={12} /> Ghost Guardian {pc.creatorEdit ? '(Edited by creator)' : 'Draft'}
                      </div>
                      {isEditing ? (
                        <div>
                          <textarea className="input input-sm" value={editText} onChange={e => setEditText(e.target.value)} rows={3} style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }} />
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button onClick={() => submitEdit(pc.comment.id)} className="btn btn-primary btn-sm"><Save size={12} /> Save & Publish</button>
                            <button onClick={() => setEditingId(null)} className="btn btn-ghost btn-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className="comment-card-response-text">{pc.creatorEdit || pc.response.text}</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {pc.status === 'pending' && (
                    <div className="comment-card-actions">
                      {pc.response?.text && pc.response?.shouldDisplay !== false && (
                        <>
                          <button onClick={() => approveComment(pc.comment.id)} className="btn btn-success btn-sm"><Check size={12} /> Approve</button>
                          <button onClick={() => startEdit(pc)} className="btn btn-secondary btn-sm"><Edit3 size={12} /> Edit</button>
                          <button onClick={() => regenerateResponse(pc.comment.id)} className="btn btn-secondary btn-sm"><RefreshCw size={12} /> Regenerate</button>
                          <button onClick={() => rejectComment(pc.comment.id)} className="btn btn-ghost btn-sm"><X size={12} /> Reject</button>
                        </>
                      )}
                      <button onClick={() => ignoreComment(pc.comment.id)} className="btn btn-ghost btn-sm"><EyeOff size={12} /> Ignore</button>
                      <button onClick={() => escalateComment(pc.comment.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--amber-400)' }}><Flag size={12} /> Escalate</button>
                      {pc.response?.text && (
                        <button onClick={() => saveAsExample(pc.comment.id)} className="btn btn-ghost btn-sm"><Bookmark size={12} /> Save Example</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><MessageSquare size={28} /></div>
            <div className="empty-state-title">No comments match your filters</div>
            <div className="empty-state-text">Try adjusting your search or filter criteria.</div>
          </div>
        )}
      </div>
    </div>
  );
}
