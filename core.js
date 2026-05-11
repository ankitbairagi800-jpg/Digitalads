/**
 * SpeakGuru AI - Core JavaScript Utilities
 * Shared across all pages
 */

// ============================================
// CONSTANTS
// ============================================
const SG = {
  APP_NAME: 'SpeakGuru AI',
  VERSION: '1.0.0',
  API_BASE: 'tables',
  TABLES: {
    USERS: 'users',
    SESSIONS: 'sessions',
    ASSESSMENTS: 'assessments',
    PLANS: 'learning_plans'
  },
  LEVELS: ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced'],
  GOALS: ['Job Interview', 'Workplace Communication', 'IELTS/TOEFL', 'Daily Conversation', 'Public Speaking', 'Business English'],
  LANGUAGES: ['Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Other'],
  XP_PER_SESSION: 100,
  XP_PER_LEVEL: 1000
};

// ============================================
// LOCAL STATE (mirrors DB for demo speed)
// ============================================
const AppState = {
  currentUser: null,
  sessions: [],
  assessments: [],
  learningPlan: null,

  get isLoggedIn() { return !!this.currentUser; },

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem('sg_user_id', user.id);
    localStorage.setItem('sg_user_cache', JSON.stringify(user));
  },

  clearUser() {
    this.currentUser = null;
    localStorage.removeItem('sg_user_id');
    localStorage.removeItem('sg_user_cache');
  },

  loadFromCache() {
    const cache = localStorage.getItem('sg_user_cache');
    if (cache) {
      try { this.currentUser = JSON.parse(cache); } catch(e) {}
    }
    return this.currentUser;
  }
};

// ============================================
// API HELPERS
// ============================================
const API = {
  async get(table, params = {}) {
    const q = new URLSearchParams(params).toString();
    const url = `${SG.API_BASE}/${table}${q ? '?' + q : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${table} failed: ${res.status}`);
    return res.json();
  },

  async getOne(table, id) {
    const res = await fetch(`${SG.API_BASE}/${table}/${id}`);
    if (!res.ok) throw new Error(`GET ${table}/${id} failed`);
    return res.json();
  },

  async post(table, data) {
    const res = await fetch(`${SG.API_BASE}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`POST ${table} failed`);
    return res.json();
  },

  async put(table, id, data) {
    const res = await fetch(`${SG.API_BASE}/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`PUT ${table}/${id} failed`);
    return res.json();
  },

  async patch(table, id, data) {
    const res = await fetch(`${SG.API_BASE}/${table}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`PATCH ${table}/${id} failed`);
    return res.json();
  },

  async delete(table, id) {
    const res = await fetch(`${SG.API_BASE}/${table}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`DELETE ${table}/${id} failed`);
    return true;
  }
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(title, message = '', type = 'info', duration = 4000) {
    this.init();
    const icons = { success: '✅', error: '❌', info: '💬', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || '💬'}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <span class="toast-close" onclick="this.parentElement.remove()">×</span>
    `;
    this.container.appendChild(toast);
    if (duration > 0) {
      setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
    return toast;
  },

  success(title, msg) { return this.show(title, msg, 'success'); },
  error(title, msg)   { return this.show(title, msg, 'error'); },
  info(title, msg)    { return this.show(title, msg, 'info'); },
  warning(title, msg) { return this.show(title, msg, 'warning'); }
};

// ============================================
// LOADING OVERLAY
// ============================================
const Loader = {
  overlay: null,

  show(text = 'Loading...') {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'loading-overlay';
      this.overlay.innerHTML = `
        <div class="spinner"></div>
        <div class="loading-text" id="loader-text">${text}</div>
      `;
      document.body.appendChild(this.overlay);
    } else {
      document.getElementById('loader-text').textContent = text;
      this.overlay.style.display = 'flex';
    }
  },

  hide() {
    if (this.overlay) this.overlay.style.display = 'none';
  },

  setText(text) {
    const el = document.getElementById('loader-text');
    if (el) el.textContent = text;
  }
};

// ============================================
// MODAL HELPER
// ============================================
const Modal = {
  open(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
  },
  close(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
};

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) Modal.closeAll();
});

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
  // Generate unique ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // Format date
  formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(typeof ts === 'number' ? ts : Date.parse(ts));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  // Format relative time
  timeAgo(ts) {
    const now = Date.now();
    const t = typeof ts === 'number' ? ts : Date.parse(ts);
    const diff = now - t;
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return Utils.formatDate(ts);
  },

  // Debounce
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  },

  // Clamp number
  clamp(val, min, max) { return Math.min(Math.max(val, min), max); },

  // Capitalize
  capitalize(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; },

  // Get initials
  initials(name) {
    if (!name) return '?';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  },

  // Level color
  levelColor(level) {
    const colors = {
      'Beginner': '#F59E0B',
      'Elementary': '#F97316',
      'Intermediate': '#3B82F6',
      'Upper-Intermediate': '#8B5CF6',
      'Advanced': '#22C55E'
    };
    return colors[level] || '#6C3EF4';
  },

  // Score to grade
  scoreToGrade(score) {
    if (score >= 90) return { grade: 'A+', label: 'Excellent' };
    if (score >= 80) return { grade: 'A', label: 'Very Good' };
    if (score >= 70) return { grade: 'B+', label: 'Good' };
    if (score >= 60) return { grade: 'B', label: 'Above Average' };
    if (score >= 50) return { grade: 'C', label: 'Average' };
    return { grade: 'D', label: 'Needs Work' };
  },

  // Animate number count up
  countUp(el, target, duration = 1200, suffix = '') {
    const start = parseInt(el.textContent) || 0;
    const range = target - start;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + range * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  // Draw SVG circle progress
  drawCircleProgress(svgEl, percent, size = 100, strokeWidth = 8) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    svgEl.innerHTML = `
      <circle cx="${size/2}" cy="${size/2}" r="${radius}"
        fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${strokeWidth}" />
      <circle cx="${size/2}" cy="${size/2}" r="${radius}"
        fill="none" stroke="url(#grad_${svgEl.id})" stroke-width="${strokeWidth}"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        stroke-linecap="round" />
      <defs>
        <linearGradient id="grad_${svgEl.id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6C3EF4"/>
          <stop offset="100%" stop-color="#3B82F6"/>
        </linearGradient>
      </defs>
    `;
  },

  // Scroll animate on visibility
  observeAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  },

  // Smooth scroll
  scrollTo(selector, offset = 80) {
    const el = document.querySelector(selector);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  },

  // Format duration
  formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes/60)}h ${minutes%60}m`;
  },

  // XP to level
  xpToLevel(xp) {
    const level = Math.floor(xp / SG.XP_PER_LEVEL) + 1;
    const levelXp = xp % SG.XP_PER_LEVEL;
    const progress = (levelXp / SG.XP_PER_LEVEL) * 100;
    return { level, levelXp, progress, nextLevelXp: SG.XP_PER_LEVEL };
  }
};

// ============================================
// AUTH HELPER
// ============================================
const Auth = {
  async login(email) {
    try {
      const result = await API.get(SG.TABLES.USERS, { search: email, limit: 5 });
      const users = result.data || [];
      const user = users.find(u => u.email === email);
      if (user) {
        AppState.setUser(user);
        return { success: true, user };
      }
      return { success: false, message: 'No account found with this email.' };
    } catch(e) {
      return { success: false, message: e.message };
    }
  },

  async register(data) {
    try {
      const userData = {
        id: Utils.uid(),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        city: data.city || '',
        native_language: data.native_language || 'Hindi',
        english_level: data.english_level || 'Beginner',
        learning_goal: data.learning_goal || 'Daily Conversation',
        assessment_score: 0,
        streak_days: 0,
        total_sessions: 0,
        xp_points: 0,
        plan_day: 0,
        avatar: data.avatar || '🎯',
        is_premium: false
      };
      const user = await API.post(SG.TABLES.USERS, userData);
      AppState.setUser(user);
      return { success: true, user };
    } catch(e) {
      return { success: false, message: e.message };
    }
  },

  logout() {
    AppState.clearUser();
    window.location.href = 'index.html';
  },

  requireAuth() {
    if (!AppState.loadFromCache()) {
      window.location.href = 'onboarding.html';
      return false;
    }
    return true;
  }
};

// ============================================
// NAVBAR BEHAVIOR
// ============================================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // Mobile toggle
  const toggle = navbar.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => navbar.classList.toggle('nav-open'));
  }

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) navbar.classList.remove('nav-open');
  });
}

// ============================================
// SIDEBAR BEHAVIOR (APP PAGES)
// ============================================
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (!sidebar) return;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // Highlight active link
  const currentPage = window.location.pathname.split('/').pop();
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href === currentPage) link.classList.add('active');
  });

  // Load user in sidebar
  const user = AppState.loadFromCache();
  if (user) {
    const nameEl = sidebar.querySelector('.sidebar-user-name');
    const levelEl = sidebar.querySelector('.sidebar-user-level');
    const avatarEl = sidebar.querySelector('.sidebar-avatar');
    if (nameEl) nameEl.textContent = user.name;
    if (levelEl) levelEl.textContent = user.english_level;
    if (avatarEl) avatarEl.textContent = user.avatar || Utils.initials(user.name);
  }
}

// ============================================
// PLAN GENERATOR
// ============================================
const PlanGenerator = {
  sessionTypes: {
    'Beginner': ['Pronunciation', 'Vocabulary', 'Grammar', 'Conversation'],
    'Elementary': ['Pronunciation', 'Vocabulary', 'Grammar', 'Conversation', 'Storytelling'],
    'Intermediate': ['Pronunciation', 'Grammar', 'Conversation', 'Storytelling', 'Interview Prep'],
    'Upper-Intermediate': ['Conversation', 'Storytelling', 'Interview Prep', 'Debate', 'Vocabulary'],
    'Advanced': ['Conversation', 'Interview Prep', 'Debate', 'Storytelling', 'Vocabulary']
  },

  topicsByGoal: {
    'Job Interview': [
      'Self Introduction', 'Strengths & Weaknesses', 'Tell Me About Yourself',
      'Why This Company?', 'Salary Negotiation', 'STAR Method Answers',
      'Handling Tough Questions', 'Questions to Ask Interviewer', 'Mock Interview 1',
      'Mock Interview 2 - Final Prep'
    ],
    'Workplace Communication': [
      'Email Writing', 'Meeting Phrases', 'Presenting Ideas',
      'Giving Feedback', 'Handling Conflicts', 'Phone Calls',
      'Negotiation Language', 'Team Collaboration', 'Report Writing',
      'Leadership Communication'
    ],
    'Daily Conversation': [
      'Greetings & Introductions', 'Shopping & Markets', 'Asking Directions',
      'At the Restaurant', 'Making Friends', 'Talking About Hobbies',
      'Discussing Current Events', 'Making Plans', 'Expressing Opinions',
      'Storytelling & Narratives'
    ],
    'Business English': [
      'Business Vocabulary', 'Formal vs Informal', 'Business Meetings',
      'Presentations', 'Networking', 'Negotiations',
      'Financial Language', 'Marketing & Sales', 'Management Communication',
      'Cross-Cultural Communication'
    ],
    'Public Speaking': [
      'Overcoming Stage Fright', 'Voice Modulation', 'Body Language',
      'Structuring a Speech', 'Opening Hooks', 'Storytelling in Speeches',
      'Handling Q&A', 'Persuasive Speaking', 'Impromptu Speaking',
      'The Big Speech - Practice'
    ],
    'IELTS/TOEFL': [
      'Speaking Part 1 - Introduction', 'Speaking Part 2 - Long Turn',
      'Speaking Part 3 - Discussion', 'Listening Skills', 'Reading Speed',
      'Essay Writing', 'Paraphrasing', 'Academic Vocabulary',
      'Mock Test 1', 'Mock Test 2 - Final Prep'
    ]
  },

  generate(level, goal) {
    const types = this.sessionTypes[level] || this.sessionTypes['Intermediate'];
    const topics = this.topicsByGoal[goal] || this.topicsByGoal['Daily Conversation'];
    const days = [];
    const weekThemes = [
      'Foundation Building',
      'Core Skills Development',
      'Applied Practice',
      'Advanced Techniques'
    ];

    for (let i = 1; i <= 30; i++) {
      const week = Math.floor((i - 1) / 7);
      const type = types[i % types.length];
      const topicBase = topics[Math.floor((i - 1) / 3) % topics.length];
      const isReview = i % 7 === 0;
      const isAssessment = i === 15 || i === 30;

      days.push({
        day: i,
        week: week + 1,
        theme: weekThemes[week] || 'Mastery',
        type: isAssessment ? 'Assessment' : isReview ? 'Review' : type,
        topic: isAssessment ? `Mid-${i === 15 ? 'Course' : 'Final'} Assessment` :
               isReview ? `Week ${week + 1} Review & Practice` :
               `${topicBase} - Part ${(i % 3) + 1}`,
        duration: isAssessment ? 30 : isReview ? 20 : 15,
        xp: isAssessment ? 300 : isReview ? 150 : 100,
        tips: this.getTip(type, level),
        completed: false,
        score: null
      });
    }
    return days;
  },

  getTip(type, level) {
    const tips = {
      'Pronunciation': 'Focus on mouth position. Watch yourself in a mirror while speaking.',
      'Vocabulary': 'Use new words in 3 different sentences to remember them better.',
      'Grammar': 'Don\'t memorize rules — understand patterns through examples.',
      'Conversation': 'It\'s okay to pause and think. Native speakers do it too!',
      'Storytelling': 'Use the past tense confidently. Set the scene first.',
      'Interview Prep': 'Prepare 5 STAR stories about your achievements.',
      'Debate': 'Start with your main point, then give 2-3 supporting reasons.',
      'Review': 'Revisit your weakest area from this week and practice it again.',
      'Assessment': 'Relax and speak naturally. This measures your growth, not perfection.'
    };
    return tips[type] || 'Practice a little every day for big results!';
  }
};

// ============================================
// AI FEEDBACK SIMULATOR
// ============================================
const AIFeedback = {
  pronunciationTips: [
    "Your 'v' sounds are coming out as 'w' — this is very common for Hindi speakers. Try biting your lower lip lightly.",
    "Great effort! Watch your 'th' sounds — put your tongue between your teeth, not behind them.",
    "Your word stress is improving! Remember: in English, the stressed syllable is louder AND longer.",
    "Excellent rhythm! Try to reduce the schwa sound (uh) in unstressed syllables like 'the', 'a', 'of'.",
    "Good flow! Focus on not adding an 'a' sound after words ending in consonants — this is common in Indian English."
  ],
  fluencyTips: [
    "You're speaking too fast when nervous. Take a breath between ideas — pausing makes you sound more confident.",
    "Great use of fillers like 'well' and 'you know'! Just reduce them to 1-2 per minute.",
    "Your sentence linking is improving. Try using 'Moreover', 'On the other hand' for more variety.",
    "Speak a bit slower and louder. It shows confidence and makes you easier to understand.",
    "Excellent! Your speaking pace is near native level. Keep practicing complex ideas."
  ],
  grammarTips: [
    "Watch your subject-verb agreement: 'He go' should be 'He goes'. This affects your credibility significantly.",
    "Great vocabulary! Remember to use articles (a/an/the) — Indian languages don't have them, so it takes practice.",
    "You used 'since' correctly with present perfect — that's advanced grammar! Keep it up.",
    "Try to avoid direct translation from your native language. Think in English if possible.",
    "Your tense consistency is 70% accurate — focus on not mixing past and present in the same story."
  ],

  generate(score, sessionType) {
    const level = score < 50 ? 'beginner' : score < 70 ? 'intermediate' : 'advanced';
    const tips = [];
    tips.push(this.pronunciationTips[Math.floor(Math.random() * this.pronunciationTips.length)]);
    tips.push(this.fluencyTips[Math.floor(Math.random() * this.fluencyTips.length)]);
    if (score > 60) tips.push(this.grammarTips[Math.floor(Math.random() * this.grammarTips.length)]);

    const overall = score >= 75 ? 'Excellent work today! You\'re making real progress.' :
                    score >= 60 ? 'Good session! You\'re on the right track.' :
                    'Nice effort! Every practice session makes you better.';

    return {
      overall,
      tips,
      encouragement: this.getEncouragement(score),
      nextStep: this.getNextStep(sessionType, level)
    };
  },

  getEncouragement(score) {
    if (score >= 80) return "🌟 Outstanding! You're in the top 10% of learners at your level!";
    if (score >= 70) return "🎯 Great job! Your consistency is paying off!";
    if (score >= 60) return "💪 You're making solid progress! Keep going!";
    return "🌱 Every expert was once a beginner. You're growing!";
  },

  getNextStep(type, level) {
    const steps = {
      Pronunciation: 'Record yourself saying 5 sentences and listen back — you\'ll spot improvements!',
      Vocabulary: 'Write 3 new sentences using today\'s vocabulary in a real context.',
      Grammar: 'Practice the structure you learned in 3 original sentences.',
      Conversation: 'Find a conversation partner or practice with a mirror for 5 minutes.',
      default: 'Review today\'s session notes and try one more practice round tomorrow!'
    };
    return steps[type] || steps.default;
  }
};

// ============================================
// VOICE RECORDER (Browser API Wrapper)
// ============================================
const VoiceRecorder = {
  mediaRecorder: null,
  audioChunks: [],
  stream: null,
  isRecording: false,
  startTime: null,

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      this.isRecording = true;
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.start(100);
      return { success: true };
    } catch(e) {
      return { success: false, error: e.message };
    }
  },

  stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        this.isRecording = false;
        if (this.stream) {
          this.stream.getTracks().forEach(t => t.stop());
          this.stream = null;
        }
        resolve({ blob, url, duration });
      };
      this.mediaRecorder.stop();
    });
  },

  getDuration() {
    if (!this.isRecording || !this.startTime) return 0;
    return Math.round((Date.now() - this.startTime) / 1000);
  }
};

// ============================================
// INIT ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSidebar();
  Utils.observeAnimations();

  // Add smooth hover to all cards
  document.querySelectorAll('.card, .stat-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.25s ease';
    });
  });
});
