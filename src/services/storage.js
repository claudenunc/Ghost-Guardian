/* Storage Service - Abstraction layer over localStorage
   Can be swapped for a real backend API later */

const PREFIX = 'ghost_guardian_';

const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  },

  // Convenience methods
  getCreator() { return this.get('creator'); },
  setCreator(data) { return this.set('creator', data); },

  getComments() { return this.get('comments') || []; },
  setComments(data) { return this.set('comments', data); },

  getActivity() { return this.get('activity') || []; },
  addActivity(entry) {
    const log = this.getActivity();
    log.unshift({ ...entry, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), timestamp: new Date().toISOString() });
    if (log.length > 500) log.length = 500;
    this.set('activity', log);
    return log;
  },

  getAnalytics() { return this.get('analytics') || defaultAnalytics(); },
  setAnalytics(data) { return this.set('analytics', data); },
  incrementAnalytic(key, amount = 1) {
    const a = this.getAnalytics();
    if (typeof a[key] === 'number') a[key] += amount;
    this.setAnalytics(a);
    return a;
  },

  getSettings() { return this.get('settings') || defaultSettings(); },
  setSettings(data) { return this.set('settings', data); },

  getVoiceExamples() { return this.get('voice_examples') || []; },
  addVoiceExample(example) {
    const examples = this.getVoiceExamples();
    examples.push({ ...example, id: Date.now().toString(36), savedAt: new Date().toISOString() });
    this.set('voice_examples', examples);
    return examples;
  },

  getRecentResponses() { return this.get('recent_responses') || []; },
  addRecentResponse(text) {
    const recent = this.getRecentResponses();
    recent.push(text);
    if (recent.length > 50) recent.shift();
    this.set('recent_responses', recent);
  },

  getKnowledge() { return this.get('knowledge') || []; },
  setKnowledge(data) { return this.set('knowledge', data); },

  getCommunityMembers() { return this.get('community_members') || {}; },
  updateCommunityMember(id, data) {
    const members = this.getCommunityMembers();
    members[id] = { ...members[id], ...data, lastSeen: new Date().toISOString() };
    this.set('community_members', members);
    return members;
  },

  getGuardianMode() { return this.get('guardian_mode') || 'copilot'; },
  setGuardianMode(mode) { return this.set('guardian_mode', mode); },

  isGuardianPaused() { return this.get('guardian_paused') || false; },
  setGuardianPaused(paused) { return this.set('guardian_paused', paused); },

  isOnboarded() { return this.get('onboarded') || false; },
  setOnboarded(val) { return this.set('onboarded', val); },

  isDemoMode() { return this.get('demo_mode') || false; },
  setDemoMode(val) { return this.set('demo_mode', val); },

  isLoggedIn() { return this.get('logged_in') || false; },
  setLoggedIn(val) { return this.set('logged_in', val); },
};

function defaultAnalytics() {
  return {
    commentsProcessed: 0,
    commentsClassified: 0,
    repliesGenerated: 0,
    repliesApproved: 0,
    repliesEdited: 0,
    repliesRejected: 0,
    commentsIgnored: 0,
    commentsEscalated: 0,
    avgResponseTime: 0,
    timeSavedMinutes: 0,
  };
}

function defaultSettings() {
  return {
    notifications: {
      highRisk: true,
      threats: true,
      negativitySpikes: true,
      importantQuestions: true,
      emergingTopics: false,
      weeklyReport: true,
    },
    guardianWit: false,
    autoApprove: {
      praise: false,
      faqs: false,
      acknowledgments: false,
    },
  };
}

export default storage;
