// ==================== STATE & STORAGE MANAGEMENT ====================
const STORAGE_KEYS = {
  USERS: 'dayflow_users_v1',
  SESSION: 'dayflow_session_v1',
  DATA_PREFIX: 'dayflow_data_v1_'
};

let currentUser = null;
let appData = null;
let currentRoutineFilter = 'All';
let currentSummaryPeriod = 'weekly';
let currentNoteFolder = 'All';
let currentNoteViewMode = 'grid';
let currentBinFilter = 'all';
let isSidebarCollapsed = false;

let activeAlarmTask = null;
let activeAlarmIsTimer = false;
let alarmAudioInterval = null;
let triggeredMinuteLog = {};

// Timer State
let timerState = {
  initialSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  running: false,
  label: 'Focus Session',
  sound: 'chime',
  intervalId: null
};

const SOUND_LABELS = {
  chime: '🎵 Gentle Chime',
  digital: '⏰ Classic Alarm',
  pulse: '⚡ Focus Pulse',
  bell: '🔔 Zen Bell'
};

const DEFAULT_NOTE_FOLDERS = [
  { id: 'Study', name: 'Study', icon: '📚', color: 'blue' },
  { id: 'Projects', name: 'Projects', icon: '💼', color: 'violet' },
  { id: 'Personal', name: 'Personal', icon: '📝', color: 'emerald' },
  { id: 'Lists', name: 'Lists', icon: '🛒', color: 'amber' }
];

const DEFAULT_TIMER_PRESETS = [
  { id: 'tp1', name: 'Pomodoro Study', icon: '🍅', seconds: 25 * 60, sound: 'chime' },
  { id: 'tp2', name: 'Short Break', icon: '☕', seconds: 5 * 60, sound: 'bell' },
  { id: 'tp3', name: 'Deep Work Block', icon: '💻', seconds: 45 * 60, sound: 'pulse' },
  { id: 'tp4', name: 'Quick Stretch', icon: '🧘', seconds: 10 * 60, sound: 'chime' },
  { id: 'tp5', name: 'Workout Interval', icon: '🏋️', seconds: 30 * 60, sound: 'digital' },
  { id: 'tp6', name: 'Power Nap', icon: '😴', seconds: 20 * 60, sound: 'bell' }
];

const FOLDER_BADGE_STYLES = {
  blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border-blue-200/70 dark:border-blue-800/60',
  violet: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border-violet-200/70 dark:border-violet-800/60',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
  amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
  rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/60'
};

const FOLDER_CARD_ACCENTS = {
  blue: 'border-t-4 border-t-blue-600',
  violet: 'border-t-4 border-t-violet-500',
  emerald: 'border-t-4 border-t-emerald-500',
  amber: 'border-t-4 border-t-amber-500',
  rose: 'border-t-4 border-t-rose-500'
};

function getDefaultData() {
  return {
    tasks: [
      { id: 't1', title: 'Review lecture notes', time: '08:30', routine: 'Morning', completed: false, alarm: true, notes: 'Focus on HCI usability principles & heuristic evaluation.', snoozeUntil: null },
      { id: 't2', title: 'Submit project outline', time: '13:00', routine: 'Afternoon', completed: false, alarm: true, notes: 'Upload PDF to course portal before 1 PM.', snoozeUntil: null },
      { id: 't3', title: '30-minute workout', time: '18:00', routine: 'Evening', completed: false, alarm: true, notes: 'Cardio + light stretching.', snoozeUntil: null },
      { id: 't4', title: 'Prepare healthy snacks', time: '22:00', routine: 'Evening', completed: false, alarm: false, notes: 'Oats, berries, and yogurt for tomorrow.', snoozeUntil: null }
    ],
    habits: [
      { id: 'h1', title: 'Read 20 pages', current: 12, target: 20, streak: 12, icon: '📖' },
      { id: 'h2', title: 'Drink 8 glasses of water', current: 7, target: 8, streak: 6, icon: '💧' },
      { id: 'h3', title: 'Practice Spanish', current: 15, target: 15, streak: 21, icon: '💬' }
    ],
    noteFolders: JSON.parse(JSON.stringify(DEFAULT_NOTE_FOLDERS)),
    notes: [
      { id: 'n1', title: 'Midterm study plan', folder: 'Study', pinned: true, body: 'Review chapters 4–6, make flashcards, and schedule a practice quiz before Friday.', updatedAt: 'Today, 9:15 AM' },
      { id: 'n2', title: 'Grocery ideas', folder: 'Lists', pinned: false, body: 'Oats, berries, Greek yogurt, spinach, coffee beans, and almonds.', updatedAt: 'Yesterday, 6:40 PM' },
      { id: 'n3', title: 'Project feedback', folder: 'Projects', pinned: false, body: 'Clarify the research question and add one supporting HCI heuristic example.', updatedAt: 'Mon, 2:05 PM' },
      { id: 'n4', title: 'Weekend reflection', folder: 'Personal', pinned: false, body: 'Morning reading habit felt effortless this week. Keep phone in another room until 8 AM.', updatedAt: 'Sun, 8:20 PM' }
    ],
    timerPresets: JSON.parse(JSON.stringify(DEFAULT_TIMER_PRESETS)),
    bin: [],
    preferences: {
      theme: 'light',
      sound: 'chime',
      voice: true,
      defaultSnooze: 5,
      noteViewMode: 'grid',
      sidebarCollapsed: false
    }
  };
}

function getUsers() {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (raw) return JSON.parse(raw);
  const demoUsers = [
    {
      email: 'alex@example.com',
      password: 'dayflow123',
      name: 'Alex',
      role: 'Student',
      motto: 'Small wins add up every single day.',
      avatarColor: '#2563eb',
      avatarImage: null,
      avatarEmoji: null
    }
  ];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  return demoUsers;
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function loadUserData(email) {
  const raw = localStorage.getItem(STORAGE_KEYS.DATA_PREFIX + email);
  if (raw) {
    appData = JSON.parse(raw);
    if (!appData.noteFolders || appData.noteFolders.length === 0) {
      appData.noteFolders = JSON.parse(JSON.stringify(DEFAULT_NOTE_FOLDERS));
    }
    appData.notes.forEach(n => {
      if (!n.folder) n.folder = 'Personal';
    });
    if (!appData.timerPresets) {
      appData.timerPresets = JSON.parse(JSON.stringify(DEFAULT_TIMER_PRESETS));
    }
    if (!appData.bin) {
      appData.bin = [];
    }
    if (appData.preferences) {
      currentNoteViewMode = appData.preferences.noteViewMode || 'grid';
      isSidebarCollapsed = !!appData.preferences.sidebarCollapsed;
    }
  } else {
    appData = getDefaultData();
    saveUserData();
  }
}

function saveUserData() {
  if (!currentUser || !appData) return;
  localStorage.setItem(STORAGE_KEYS.DATA_PREFIX + currentUser.email, JSON.stringify(appData));
  updateNotificationBadges();
}

// ==================== INITIALIZATION & NAVIGATION ====================
window.addEventListener('DOMContentLoaded', () => {
  getUsers();
  initTimerDrumDrag();
  initPwaAndNotifications();
  const savedEmail = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (savedEmail) {
    const user = getUsers().find(u => u.email === savedEmail);
    if (user) {
      loginSuccess(user);
      return;
    }
  }
  showScreen('screen-welcome');
  startClockAndAlarmEngine();
});

function showScreen(screenId) {
  ['screen-welcome', 'screen-auth', 'screen-app'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
}

function switchAuthMode(mode) {
  const loginForm = document.getElementById('form-login');
  const regForm = document.getElementById('form-register');
  const loginBtn = document.getElementById('tab-login-btn');
  const regBtn = document.getElementById('tab-register-btn');
  document.getElementById('auth-error').classList.add('hidden');

  if (mode === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    loginBtn.className = 'py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slateDark-800 text-blue-600 dark:text-cyan-400 shadow-sm transition';
    regBtn.className = 'py-2 text-sm font-semibold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 transition';
  } else {
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    regBtn.className = 'py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slateDark-800 text-blue-600 dark:text-cyan-400 shadow-sm transition';
    loginBtn.className = 'py-2 text-sm font-semibold rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 transition';
  }
}

// ==================== COLLAPSIBLE SIDEBAR & NOTIFICATION BADGES ====================
function toggleSidebar() {
  isSidebarCollapsed = !isSidebarCollapsed;
  applySidebarState();
  if (appData && appData.preferences) {
    appData.preferences.sidebarCollapsed = isSidebarCollapsed;
    saveUserData();
  }
}

function applySidebarState() {
  const sidebar = document.getElementById('desktop-sidebar');
  const mainWrapper = document.getElementById('main-content-wrapper');
  const icon = document.getElementById('sidebar-collapse-icon');
  const labels = document.querySelectorAll('.sidebar-label');
  const header = document.getElementById('sidebar-header');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const navBtns = document.querySelectorAll('#desktop-sidebar .nav-btn');

  if (!sidebar || !mainWrapper) return;

  if (isSidebarCollapsed) {
    sidebar.classList.remove('md:w-64');
    sidebar.classList.add('md:w-20', 'sidebar-collapsed');
    mainWrapper.classList.remove('md:pl-64');
    mainWrapper.classList.add('md:pl-20');
    labels.forEach(el => el.classList.add('hidden'));
    navBtns.forEach(btn => btn.classList.add('justify-center'));
    if (header) header.classList.replace('justify-between', 'justify-center');
    if (icon) icon.style.transform = 'rotate(180deg)';
    if (collapseBtn) collapseBtn.title = 'Expand Sidebar';
  } else {
    sidebar.classList.remove('md:w-20', 'sidebar-collapsed');
    sidebar.classList.add('md:w-64');
    mainWrapper.classList.remove('md:pl-20');
    mainWrapper.classList.add('md:pl-64');
    labels.forEach(el => el.classList.remove('hidden'));
    navBtns.forEach(btn => btn.classList.remove('justify-center'));
    if (header) header.classList.replace('justify-center', 'justify-between');
    if (icon) icon.style.transform = 'rotate(0deg)';
    if (collapseBtn) collapseBtn.title = 'Collapse Sidebar';
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input || !btn) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  const eyeOpen = btn.querySelector('.eye-open');
  const eyeClosed = btn.querySelector('.eye-closed');
  if (eyeOpen && eyeClosed) {
    eyeOpen.classList.toggle('hidden', isPassword);
    eyeClosed.classList.toggle('hidden', !isPassword);
  }
  btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  btn.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
}

function updateNotificationBadges() {
  if (!appData) return;
  const pendingTasksCount = appData.tasks.filter(t => !t.completed).length;
  const binCount = (appData.bin || []).length;

  // Sidebar & Mobile Task Notification Count
  const sTaskBadge = document.getElementById('sidebar-task-badge');
  const mTaskBadge = document.getElementById('mobile-task-badge');
  const tasksPill = document.getElementById('tasks-pending-pill');

  if (sTaskBadge) {
    if (pendingTasksCount > 0) {
      sTaskBadge.textContent = pendingTasksCount;
      sTaskBadge.classList.remove('hidden');
    } else {
      sTaskBadge.classList.add('hidden');
    }
  }
  if (mTaskBadge) {
    if (pendingTasksCount > 0) {
      mTaskBadge.textContent = pendingTasksCount;
      mTaskBadge.classList.remove('hidden');
    } else {
      mTaskBadge.classList.add('hidden');
    }
  }
  if (tasksPill) {
    tasksPill.textContent = pendingTasksCount === 0
      ? 'All caught up ✓'
      : `${pendingTasksCount} pending task${pendingTasksCount === 1 ? '' : 's'}`;
  }

  // Bin Badges
  const sBinBadge = document.getElementById('sidebar-bin-badge');
  const mBinBadge = document.getElementById('mobile-bin-badge');
  if (sBinBadge) {
    if (binCount > 0) {
      sBinBadge.textContent = binCount;
      sBinBadge.classList.remove('hidden');
    } else {
      sBinBadge.classList.add('hidden');
    }
  }
  if (mBinBadge) {
    if (binCount > 0) {
      mBinBadge.textContent = binCount;
      mBinBadge.classList.remove('hidden');
    } else {
      mBinBadge.classList.add('hidden');
    }
  }
}

// ==================== AUTHENTICATION ====================
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const user = getUsers().find(u => u.email === email && u.password === password);

  if (!user) {
    const err = document.getElementById('auth-error');
    err.textContent = 'Invalid email or password. Try alex@example.com / dayflow123 or create an account.';
    err.classList.remove('hidden');
    return;
  }
  loginSuccess(user);
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  const users = getUsers();
  if (users.some(u => u.email === email)) {
    alert('An account with this email already exists. Please sign in.');
    switchAuthMode('login');
    return;
  }

  const newUser = {
    email,
    password,
    name,
    role,
    motto: 'Stay focused and build daily momentum.',
    avatarColor: '#2563eb',
    avatarImage: null,
    avatarEmoji: null
  };
  users.push(newUser);
  saveUsers(users);
  loginSuccess(newUser);
  showToast('Welcome to DayFlow, ' + name + '!');
}

function quickDemoLogin() {
  const demo = getUsers().find(u => u.email === 'alex@example.com') || getUsers()[0];
  loginSuccess(demo);
}

function loginSuccess(user) {
  currentUser = user;
  localStorage.setItem(STORAGE_KEYS.SESSION, user.email);
  loadUserData(user.email);
  applyTheme(appData.preferences.theme || 'light');
  applySidebarState();
  syncProfileUI();
  updateNotificationBadges();
  showScreen('screen-app');
  switchTab('home');
  startClockAndAlarmEngine();
}

function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  currentUser = null;
  appData = null;
  showScreen('screen-welcome');
  showToast('Logged out successfully.');
}

// ==================== PROFILE & DISPLAY PHOTO CUSTOMIZATION ====================
function renderAvatarElement(el, user) {
  if (!el || !user) return;
  const initial = (user.name || 'U').charAt(0).toUpperCase();
  const color = user.avatarColor || '#2563eb';

  if (user.avatarImage) {
    el.style.backgroundColor = 'transparent';
    el.innerHTML = `<img src="${user.avatarImage}" alt="${escapeHtml(user.name)}" class="w-full h-full object-cover" />`;
  } else if (user.avatarEmoji) {
    el.style.backgroundColor = color;
    el.innerHTML = `<span class="leading-none select-none">${user.avatarEmoji}</span>`;
  } else {
    el.style.backgroundColor = color;
    el.textContent = initial;
  }
}

function handleAvatarUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;

      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      currentUser.avatarImage = compressedDataUrl;
      currentUser.avatarEmoji = null;
      persistCurrentUser();
      syncProfileUI();
      showToast('Display photo updated!');
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function selectPresetAvatar(emoji) {
  if (!currentUser) return;
  currentUser.avatarEmoji = emoji;
  currentUser.avatarImage = null;
  persistCurrentUser();
  syncProfileUI();
  showToast('Avatar updated!');
}

function resetAvatarToInitials() {
  if (!currentUser) return;
  currentUser.avatarImage = null;
  currentUser.avatarEmoji = null;
  persistCurrentUser();
  syncProfileUI();
  showToast('Reverted to initials avatar.');
}

function persistCurrentUser() {
  if (!currentUser) return;
  const users = getUsers();
  const idx = users.findIndex(u => u.email === currentUser.email);
  if (idx !== -1) {
    users[idx] = currentUser;
    saveUsers(users);
  }
}

function syncProfileUI() {
  if (!currentUser) return;

  ['sidebar-avatar', 'mobile-avatar', 'profile-avatar-preview'].forEach(id => {
    renderAvatarElement(document.getElementById(id), currentUser);
  });

  const removeBtn = document.getElementById('btn-remove-photo');
  if (removeBtn) {
    if (currentUser.avatarImage || currentUser.avatarEmoji) {
      removeBtn.classList.remove('hidden');
    } else {
      removeBtn.classList.add('hidden');
    }
  }

  document.getElementById('sidebar-username').textContent = currentUser.name;
  document.getElementById('sidebar-email').textContent = currentUser.email;

  document.getElementById('profile-display-name').textContent = currentUser.name;
  document.getElementById('profile-display-email').textContent = currentUser.email;
  document.getElementById('profile-display-role').textContent = currentUser.role || 'Student';

  document.getElementById('edit-profile-name').value = currentUser.name;
  document.getElementById('edit-profile-role').value = currentUser.role || 'Student';
  document.getElementById('edit-profile-motto').value = currentUser.motto || '';

  document.getElementById('pref-sound').value = appData.preferences.sound || 'chime';
  document.getElementById('pref-voice').checked = !!appData.preferences.voice;
  document.getElementById('pref-snooze').value = String(appData.preferences.defaultSnooze || 5);

  updateGreetingHeader();
  updateOsNotificationStatusUI();
  updateAiModeBadge();
}

function setAvatarColor(hex) {
  if (!currentUser) return;
  currentUser.avatarColor = hex;
  currentUser.avatarImage = null;
  persistCurrentUser();
  syncProfileUI();
  showToast('Avatar color updated.');
}

function saveProfile(e) {
  e.preventDefault();
  currentUser.name = document.getElementById('edit-profile-name').value.trim();
  currentUser.role = document.getElementById('edit-profile-role').value;
  currentUser.motto = document.getElementById('edit-profile-motto').value.trim();

  persistCurrentUser();
  syncProfileUI();
  showToast('Profile saved!');
}

function savePreferences() {
  appData.preferences.sound = document.getElementById('pref-sound').value;
  appData.preferences.voice = document.getElementById('pref-voice').checked;
  appData.preferences.defaultSnooze = parseInt(document.getElementById('pref-snooze').value, 10);
  saveUserData();
  showToast('Preferences updated.');
}

// ==================== THEME MANAGEMENT ====================
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
}

function setTheme(theme) {
  applyTheme(theme);
  if (appData) {
    appData.preferences.theme = theme;
    saveUserData();
  }
}

function applyTheme(theme) {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  document.querySelectorAll('.theme-icon-label').forEach(el => {
    el.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  });
  const lightBtn = document.getElementById('theme-btn-light');
  const darkBtn = document.getElementById('theme-btn-dark');
  if (lightBtn && darkBtn) {
    lightBtn.className = theme === 'light'
      ? 'px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-blue-600 shadow-xs'
      : 'px-3 py-1.5 text-xs font-bold rounded-lg text-slate-400';
    darkBtn.className = theme === 'dark'
      ? 'px-3 py-1.5 text-xs font-bold rounded-lg bg-slateDark-800 text-cyan-400 shadow-xs'
      : 'px-3 py-1.5 text-xs font-bold rounded-lg text-slate-500';
  }
}

// ==================== TAB NAVIGATION ====================
function switchTab(tabName) {
  ['home', 'tasks', 'timer', 'habits', 'notes', 'summary', 'bin', 'profile'].forEach(t => {
    const el = document.getElementById('view-' + t);
    if (el) el.classList.add('hidden');
  });
  const target = document.getElementById('view-' + tabName);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    const active = btn.getAttribute('data-nav') === tabName;
    if (active) {
      btn.classList.add('bg-blue-50', 'dark:bg-blue-950/60', 'text-blue-600', 'dark:text-cyan-400');
      btn.classList.remove('text-slate-500', 'dark:text-slate-400');
    } else {
      btn.classList.remove('bg-blue-50', 'dark:bg-blue-950/60', 'text-blue-600', 'dark:text-cyan-400');
      btn.classList.add('text-slate-500', 'dark:text-slate-400');
    }
  });

  if (tabName === 'home') renderHome();
  if (tabName === 'tasks') renderTasks();
  if (tabName === 'timer') {
    updateTimerDisplay();
    renderSavedTimersGrid();
  }
  if (tabName === 'habits') renderHabits();
  if (tabName === 'notes') {
    updateNoteViewButtons();
    renderNoteFolders();
    renderNotes();
  }
  if (tabName === 'summary') renderSummary();
  if (tabName === 'bin') renderBin();
  if (tabName === 'profile') syncProfileUI();
}

function updateGreetingHeader() {
  if (!currentUser) return;
  const now = new Date();
  const hr = now.getHours();
  let greeting = 'Good morning';
  if (hr >= 12 && hr < 18) greeting = 'Good afternoon';
  else if (hr >= 18) greeting = 'Good evening';

  document.getElementById('greeting-text').textContent = `${greeting}, ${currentUser.name}`;
  document.getElementById('current-date-text').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });
}

// ==================== 0. HOME DASHBOARD OVERVIEW ====================
function renderHome() {
  if (!currentUser || !appData) return;
  updateNotificationBadges();

  const now = new Date();
  const hr = now.getHours();
  let greeting = 'Good morning';
  if (hr >= 12 && hr < 18) greeting = 'Good afternoon';
  else if (hr >= 18) greeting = 'Good evening';

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hGreet = document.getElementById('home-greeting-text');
  const hDate = document.getElementById('home-date-badge');
  const hMotto = document.getElementById('home-motto-text');
  if (hGreet) hGreet.textContent = `${greeting}, ${currentUser.name}!`;
  if (hDate) hDate.textContent = dateStr;
  if (hMotto) hMotto.textContent = currentUser.motto || 'Small wins add up every single day.';

  const pendingTasks = appData.tasks.filter(t => !t.completed);
  const completedTasks = appData.tasks.filter(t => t.completed);
  const habitsDone = appData.habits.filter(h => h.current >= h.target).length;
  const topStreak = appData.habits.reduce((m, h) => Math.max(m, h.streak), 0);

  document.getElementById('home-stat-pending').textContent = pendingTasks.length;
  document.getElementById('home-stat-completed-sub').textContent = `${completedTasks.length} completed today`;
  document.getElementById('home-stat-habits').textContent = `${habitsDone}/${appData.habits.length}`;
  document.getElementById('home-stat-streak-sub').textContent = `🔥 ${topStreak}d top streak`;
  document.getElementById('home-stat-notes').textContent = appData.notes.length;
  document.getElementById('home-stat-folders-sub').textContent = `${(appData.noteFolders || []).length} folders`;

  // Upcoming tasks preview (top 3 pending)
  const upcomingEl = document.getElementById('home-upcoming-tasks');
  const sortedPending = [...pendingTasks].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 3);
  if (sortedPending.length === 0) {
    upcomingEl.innerHTML = `<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slateDark-900/60 text-xs text-slate-400 text-center">All tasks completed for today! 🎉</div>`;
  } else {
    upcomingEl.innerHTML = sortedPending.map(t => `
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slateDark-900/70 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2.5">
        <div class="flex items-center gap-2.5 min-w-0">
          <button onclick="toggleTaskComplete('${t.id}'); renderHome();" class="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 shrink-0 transition" title="Mark Complete"></button>
          <div class="min-w-0">
            <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(t.title)}</p>
            <p class="text-[11px] text-blue-600 dark:text-cyan-400 font-medium">${t.routine} • ${formatTime12h(t.time)}</p>
          </div>
        </div>
        ${t.alarm ? '<span class="text-xs" title="Alarm On">⏰</span>' : ''}
      </div>
    `).join('');
  }

  // Habits snapshot (top 3)
  const habitsEl = document.getElementById('home-habits-list');
  if (appData.habits.length === 0) {
    habitsEl.innerHTML = `<div class="p-4 rounded-2xl bg-slate-50 dark:bg-slateDark-900/60 text-xs text-slate-400 text-center">No habits tracked yet.</div>`;
  } else {
    habitsEl.innerHTML = appData.habits.slice(0, 3).map(h => {
      const pct = Math.min(100, Math.round((h.current / h.target) * 100));
      const done = h.current >= h.target;
      return `
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slateDark-900/70 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800 dark:text-slate-100 truncate">${h.icon || '🎯'} ${escapeHtml(h.title)}</span>
            <span class="font-bold text-amber-600 dark:text-amber-300 shrink-0">🔥 ${h.streak}d</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slateDark-800 overflow-hidden">
              <div class="h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-blue-600'}" style="width: ${pct}%"></div>
            </div>
            <span class="text-[11px] font-bold text-slate-400 tabular-nums">${h.current}/${h.target}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Pinned / recent notes preview (top 2)
  const notesEl = document.getElementById('home-notes-preview');
  const sortedNotes = [...appData.notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).slice(0, 2);
  if (sortedNotes.length === 0) {
    notesEl.innerHTML = `<div class="col-span-full p-4 rounded-2xl bg-slate-50 dark:bg-slateDark-900/60 text-xs text-slate-400 text-center">No notes yet. Tap "Open Notes" to jot something down.</div>`;
  } else {
    notesEl.innerHTML = sortedNotes.map(n => `
      <div onclick="switchTab('notes'); openNoteModal('${n.id}')" class="cursor-pointer p-3.5 rounded-2xl bg-slate-50 dark:bg-slateDark-900/70 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-400 transition">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-[11px] font-bold text-blue-600 dark:text-cyan-400">${escapeHtml(n.folder || 'Personal')}</span>
          ${n.pinned ? '<span class="text-xs">📌</span>' : ''}
        </div>
        <p class="text-sm font-bold text-slate-900 dark:text-white truncate">${escapeHtml(n.title)}</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${escapeHtml(n.body)}</p>
      </div>
    `).join('');
  }
}

// ==================== 1. TASK MANAGER & ROUTINE PLANNER ====================
function setRoutineFilter(filter) {
  currentRoutineFilter = filter;
  document.querySelectorAll('.routine-pill').forEach(pill => {
    const isSelected = pill.getAttribute('data-filter') === filter;
    pill.className = isSelected
      ? 'routine-pill px-4 py-2 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm transition'
      : 'routine-pill px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-slateDark-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition';
  });
  renderTasks();
}

function formatTime12h(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

function renderTasks() {
  updateNotificationBadges();
  const container = document.getElementById('tasks-container');
  const snoozeBanner = document.getElementById('snooze-banner');
  const snoozedTasks = appData.tasks.filter(t => t.snoozeUntil && !t.completed);

  if (snoozedTasks.length > 0) {
    snoozeBanner.classList.remove('hidden');
    const next = snoozedTasks[0];
    const snoozeTime = new Date(next.snoozeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('snooze-banner-text').textContent = `"${next.title}" will ring again at ${snoozeTime}`;
  } else {
    snoozeBanner.classList.add('hidden');
  }

  const routines = currentRoutineFilter === 'All'
    ? ['Morning', 'Afternoon', 'Evening']
    : [currentRoutineFilter];

  const routineMeta = {
    Morning: { icon: '🌅', sub: '6:00 AM – 11:59 AM' },
    Afternoon: { icon: '☀️', sub: '12:00 PM – 5:59 PM' },
    Evening: { icon: '🌙', sub: '6:00 PM – 11:59 PM' }
  };

  let html = '';
  routines.forEach(routine => {
    const items = appData.tasks
      .filter(t => t.routine === routine)
      .sort((a, b) => a.time.localeCompare(b.time));

    html += `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <span>${routineMeta[routine].icon}</span>
            <h3 class="font-bold text-sm text-slate-700 dark:text-slate-200">${routine} Routine</h3>
          </div>
          <span class="text-[11px] font-medium text-slate-400">${items.length} task${items.length === 1 ? '' : 's'}</span>
        </div>
    `;

    if (items.length === 0) {
      html += `
        <div class="p-4 rounded-2xl bg-white/60 dark:bg-slateDark-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
          No ${routine.toLowerCase()} tasks scheduled yet.
        </div>
      `;
    } else {
      items.forEach(task => {
        const isSnoozed = task.snoozeUntil && !task.completed;
        html += `
          <div class="group p-4 rounded-2xl bg-white dark:bg-slateDark-800 border ${isSnoozed ? 'border-amber-400/70' : 'border-slate-200/70 dark:border-slate-700/70'} shadow-xs flex items-center justify-between gap-3 transition hover:shadow-md">
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <button onclick="toggleTaskComplete('${task.id}')" class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                task.completed
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
              }">
                ${task.completed ? '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>' : ''}
              </button>
              <div onclick="openTaskModal('${task.id}')" class="cursor-pointer min-w-0 flex-1">
                <p class="font-semibold text-sm sm:text-base truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}">
                  ${escapeHtml(task.title)}
                </p>
                <div class="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span class="font-medium text-blue-600 dark:text-cyan-400">${formatTime12h(task.time)}</span>
                  ${task.alarm ? '<span title="Smart Alarm Active">⏰</span>' : ''}
                  ${isSnoozed ? '<span class="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold text-[10px]">Snoozed</span>' : ''}
                  ${task.notes ? `<span class="truncate max-w-[180px]">• ${escapeHtml(task.notes)}</span>` : ''}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button onclick="openTaskModal('${task.id}')" class="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition" title="Edit Task">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
              <button onclick="moveTaskToBin('${task.id}')" class="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition" title="Move to Recycle Bin">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        `;
      });
    }
    html += `</div>`;
  });

  container.innerHTML = html;
}

function toggleTaskComplete(id) {
  const task = appData.tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  if (task.completed) task.snoozeUntil = null;
  saveUserData();
  renderTasks();
  if (task.completed) showToast('Task completed! 🎉');
}

function openTaskModal(taskId = null) {
  const modal = document.getElementById('modal-task');
  const delBtn = document.getElementById('btn-delete-task');

  if (taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    document.getElementById('modal-task-title').textContent = 'Edit Task';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-time').value = task.time;
    document.getElementById('task-routine').value = task.routine;
    document.getElementById('task-alarm-enabled').checked = !!task.alarm;
    document.getElementById('task-notes').value = task.notes || '';
    delBtn.classList.remove('hidden');
  } else {
    document.getElementById('modal-task-title').textContent = 'New Task';
    document.getElementById('task-id').value = '';
    document.getElementById('task-title').value = '';
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('task-time').value = `${hh}:${mm}`;
    document.getElementById('task-routine').value = now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening';
    document.getElementById('task-alarm-enabled').checked = true;
    document.getElementById('task-notes').value = '';
    delBtn.classList.add('hidden');
  }
  modal.classList.remove('hidden');
}

function saveTask(e) {
  e.preventDefault();
  const id = document.getElementById('task-id').value;
  const title = document.getElementById('task-title').value.trim();
  const time = document.getElementById('task-time').value;
  const routine = document.getElementById('task-routine').value;
  const alarm = document.getElementById('task-alarm-enabled').checked;
  const notes = document.getElementById('task-notes').value.trim();

  if (id) {
    const idx = appData.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      appData.tasks[idx] = { ...appData.tasks[idx], title, time, routine, alarm, notes, snoozeUntil: null };
    }
    showToast('Task updated.');
  } else {
    appData.tasks.push({
      id: 't_' + Date.now(),
      title,
      time,
      routine,
      completed: false,
      alarm,
      notes,
      snoozeUntil: null
    });
    showToast('Task added to ' + routine + ' routine.');
  }

  saveUserData();
  closeModal('modal-task');
  renderTasks();
  if (!document.getElementById('view-home').classList.contains('hidden')) renderHome();
}

function moveTaskToBin(id) {
  const idx = appData.tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  const [removed] = appData.tasks.splice(idx, 1);
  removed.snoozeUntil = null;
  appData.bin.unshift({
    binId: 'bin_' + Date.now(),
    type: 'task',
    deletedAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    item: removed
  });
  saveUserData();
  renderTasks();
  showToast('Task moved to Recycle Bin.');
}

function deleteTaskFromModal() {
  const id = document.getElementById('task-id').value;
  closeModal('modal-task');
  moveTaskToBin(id);
}

function clearAllSnoozes() {
  appData.tasks.forEach(t => t.snoozeUntil = null);
  saveUserData();
  renderTasks();
  showToast('All snoozed alarms cleared.');
}

// ==================== 2. FOCUS TIMER (DRAGGABLE DRUM + CUSTOMIZABLE GRID PRESETS) ====================
function initTimerDrumDrag() {
  const cols = document.querySelectorAll('.timer-drum-col');
  cols.forEach(col => {
    const unit = col.getAttribute('data-unit');
    let isDragging = false;
    let startY = 0;
    let accumulatedDelta = 0;
    const stepPixels = 22;

    col.addEventListener('pointerdown', (e) => {
      if (timerState.running) {
        showToast('Pause the timer before dragging digits.');
        return;
      }
      isDragging = true;
      startY = e.clientY;
      accumulatedDelta = 0;
      col.setPointerCapture(e.pointerId);
      col.classList.add('ring-2', 'ring-blue-500');
    });

    col.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dy = startY - e.clientY; // drag UP = increase number, drag DOWN = decrease number
      accumulatedDelta += dy;
      startY = e.clientY;

      while (Math.abs(accumulatedDelta) >= stepPixels) {
        const direction = accumulatedDelta > 0 ? 1 : -1;
        accumulatedDelta -= direction * stepPixels;
        const step = unit === 'seconds' ? 5 : 1;
        adjustTimerUnit(unit, direction * step);
      }
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      col.classList.remove('ring-2', 'ring-blue-500');
      try { col.releasePointerCapture(e.pointerId); } catch (err) {}
    };

    col.addEventListener('pointerup', endDrag);
    col.addEventListener('pointercancel', endDrag);

    // Mouse wheel support on desktop
    col.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (timerState.running) return;
      const direction = e.deltaY < 0 ? 1 : -1;
      const step = unit === 'seconds' ? 5 : 1;
      adjustTimerUnit(unit, direction * step);
    }, { passive: false });
  });
}

function adjustTimerUnit(unit, delta) {
  if (timerState.running) return;
  let h = Math.floor(timerState.remainingSeconds / 3600);
  let m = Math.floor((timerState.remainingSeconds % 3600) / 60);
  let s = timerState.remainingSeconds % 60;

  if (unit === 'hours') {
    h = (h + delta + 24) % 24;
  } else if (unit === 'minutes') {
    m = (m + delta + 60) % 60;
  } else if (unit === 'seconds') {
    s = (s + delta + 60) % 60;
  }

  const total = h * 3600 + m * 60 + s;
  timerState.remainingSeconds = total;
  timerState.initialSeconds = Math.max(1, total);
  updateTimerDisplay();
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatDurationCompact(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${pad2(m)}m${s > 0 ? ' ' + pad2(s) + 's' : ''}`;
  if (m > 0 && s > 0) return `${m}m ${pad2(s)}s`;
  if (m > 0) return `${m} min`;
  return `${s} sec`;
}

function updateTimerDisplay() {
  const total = timerState.remainingSeconds;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const hPrev = (h - 1 + 24) % 24;
  const hNext = (h + 1) % 24;
  const mPrev = (m - 1 + 60) % 60;
  const mNext = (m + 1) % 60;
  const sPrev = (s - 5 + 60) % 60;
  const sNext = (s + 5) % 60;

  const elH = document.getElementById('drum-hours-curr');
  if (elH) {
    document.getElementById('drum-hours-prev').textContent = pad2(hPrev);
    elH.textContent = pad2(h);
    document.getElementById('drum-hours-next').textContent = pad2(hNext);

    document.getElementById('drum-minutes-prev').textContent = pad2(mPrev);
    document.getElementById('drum-minutes-curr').textContent = pad2(m);
    document.getElementById('drum-minutes-next').textContent = pad2(mNext);

    document.getElementById('drum-seconds-prev').textContent = pad2(sPrev);
    document.getElementById('drum-seconds-curr').textContent = pad2(s);
    document.getElementById('drum-seconds-next').textContent = pad2(sNext);

    document.getElementById('timer-active-label').textContent = timerState.label;
    document.getElementById('timer-active-sound-badge').textContent = SOUND_LABELS[timerState.sound] || SOUND_LABELS.chime;

    const pct = timerState.initialSeconds > 0
      ? Math.max(0, Math.min(100, Math.round((timerState.remainingSeconds / timerState.initialSeconds) * 100)))
      : 0;
    document.getElementById('timer-progress-bar').style.width = `${pct}%`;

    const startText = document.getElementById('timer-start-text');
    const startIcon = document.getElementById('timer-start-icon');
    const startBtn = document.getElementById('btn-timer-start-pause');
    const hint = document.getElementById('timer-drag-hint');

    if (timerState.running) {
      startText.textContent = 'Pause';
      startIcon.textContent = '⏸';
      startBtn.className = 'px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/25 flex items-center gap-2 transition';
      hint.textContent = 'Timer running...';
    } else {
      startText.textContent = timerState.remainingSeconds < timerState.initialSeconds && timerState.remainingSeconds > 0 ? 'Resume' : 'Start Timer';
      startIcon.textContent = '▶';
      startBtn.className = 'px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/25 flex items-center gap-2 transition';
      hint.textContent = '↕ Drag numbers up/down (or scroll) to adjust';
    }
  }

  // Update mini indicator on sidebar
  const sidebarDot = document.getElementById('sidebar-timer-dot');
  if (timerState.running) {
    if (sidebarDot) sidebarDot.classList.remove('hidden');
  } else {
    if (sidebarDot) sidebarDot.classList.add('hidden');
  }
}

function toggleTimerStartPause() {
  if (timerState.running) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (timerState.remainingSeconds <= 0) {
    showToast('Drag the digits up to set a duration first.');
    return;
  }
  timerState.running = true;
  updateTimerDisplay();

  timerState.intervalId = setInterval(() => {
    if (timerState.remainingSeconds > 0) {
      timerState.remainingSeconds -= 1;
      updateTimerDisplay();
    }
    if (timerState.remainingSeconds <= 0) {
      pauseTimer();
      timerState.remainingSeconds = timerState.initialSeconds;
      updateTimerDisplay();
      triggerTimerCompleteAlarm();
    }
  }, 1000);
}

function pauseTimer() {
  timerState.running = false;
  if (timerState.intervalId) {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
  }
  updateTimerDisplay();
}

function resetTimer() {
  pauseTimer();
  timerState.remainingSeconds = timerState.initialSeconds;
  updateTimerDisplay();
  showToast('Timer reset.');
}

function triggerTimerCompleteAlarm() {
  activeAlarmIsTimer = true;
  activeAlarmTask = {
    title: timerState.label,
    time: formatDurationCompact(timerState.initialSeconds),
    routine: 'Focus Timer',
    sound: timerState.sound
  };

  document.getElementById('alarm-badge-label').textContent = 'Focus Timer Complete';
  document.getElementById('alarm-task-title').textContent = timerState.label;
  document.getElementById('alarm-task-time').textContent = `${formatDurationCompact(timerState.initialSeconds)} • ${SOUND_LABELS[timerState.sound] || 'Alarm'}`;
  document.getElementById('alarm-task-note').textContent = 'Time is up! Great focus session.';

  document.getElementById('alarm-snooze-section').classList.add('hidden');
  document.getElementById('alarm-actions-grid').className = 'grid grid-cols-1';
  document.getElementById('alarm-primary-btn').classList.add('hidden');

  document.getElementById('alarm-overlay').classList.remove('hidden');

  sendSystemNotification(`⏱️ Focus Timer Complete: ${timerState.label}`, 'Your focus session has finished!');
  playAlarmSound(timerState.sound);
  alarmAudioInterval = setInterval(() => playAlarmSound(timerState.sound), 2600);

  if (appData && appData.preferences && appData.preferences.voice && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Timer finished: ${timerState.label}`);
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
}

function openTimerAlarmSettings() {
  document.getElementById('active-timer-name-input').value = timerState.label;
  document.getElementById('active-timer-sound-input').value = timerState.sound;
  document.getElementById('modal-timer-settings').classList.remove('hidden');
}

function saveTimerAlarmSettings(e) {
  e.preventDefault();
  timerState.label = document.getElementById('active-timer-name-input').value.trim() || 'Focus Session';
  timerState.sound = document.getElementById('active-timer-sound-input').value;
  closeModal('modal-timer-settings');
  updateTimerDisplay();
  showToast('Timer name & alarm sound updated.');
}

function previewSelectedTimerSound(selectId) {
  const soundType = document.getElementById(selectId).value;
  playAlarmSound(soundType);
}

// Saved Quick Timer Presets Grid
function renderSavedTimersGrid() {
  const grid = document.getElementById('saved-timers-grid');
  if (!grid) return;

  const presets = appData.timerPresets || [];
  if (presets.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full p-6 text-center rounded-2xl bg-white dark:bg-slateDark-800 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400">
        No saved quick timers yet. Tap "+ Add Quick Timer" to create custom presets.
      </div>
    `;
    return;
  }

  grid.innerHTML = presets.map(p => `
    <div class="group relative p-4 rounded-2xl bg-white dark:bg-slateDark-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-blue-500/60 transition flex flex-col justify-between">
      <div class="flex items-start justify-between gap-2 mb-2">
        <button onclick="applyTimerPreset('${p.id}')" class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-xl shrink-0">
          ${p.icon || '⏱️'}
        </button>
        <div class="flex items-center gap-1">
          <button onclick="openPresetModal('${p.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition" title="Edit Timer">
            ✎
          </button>
          <button onclick="removeTimerPreset('${p.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition" title="Remove Timer">
            ✕
          </button>
        </div>
      </div>

      <div onclick="applyTimerPreset('${p.id}')" class="cursor-pointer">
        <p class="font-bold text-sm text-slate-900 dark:text-white truncate">${escapeHtml(p.name)}</p>
        <p class="text-lg font-extrabold text-blue-600 dark:text-cyan-400 tabular-nums mt-0.5">${formatDurationCompact(p.seconds)}</p>
        <p class="text-[11px] text-slate-400 mt-1 truncate">${SOUND_LABELS[p.sound] || SOUND_LABELS.chime}</p>
      </div>
    </div>
  `).join('');
}

function applyTimerPreset(presetId) {
  const preset = appData.timerPresets.find(p => p.id === presetId);
  if (!preset) return;
  pauseTimer();
  timerState.initialSeconds = preset.seconds;
  timerState.remainingSeconds = preset.seconds;
  timerState.label = preset.name;
  timerState.sound = preset.sound || 'chime';
  updateTimerDisplay();
  showToast(`Loaded "${preset.name}" (${formatDurationCompact(preset.seconds)})`);
}

function openSavePresetModal() {
  const h = Math.floor(timerState.remainingSeconds / 3600);
  const m = Math.floor((timerState.remainingSeconds % 3600) / 60);
  const s = timerState.remainingSeconds % 60;

  document.getElementById('modal-preset-title').textContent = 'Save Current Timer';
  document.getElementById('preset-id').value = '';
  document.getElementById('preset-icon').value = '⏱️';
  document.getElementById('preset-name').value = timerState.label || 'Custom Timer';
  document.getElementById('preset-hours').value = h;
  document.getElementById('preset-minutes').value = m;
  document.getElementById('preset-seconds').value = s;
  document.getElementById('preset-sound').value = timerState.sound || 'chime';
  document.getElementById('btn-delete-preset').classList.add('hidden');
  document.getElementById('modal-timer-preset').classList.remove('hidden');
}

function openPresetModal(presetId = null) {
  const delBtn = document.getElementById('btn-delete-preset');
  if (presetId) {
    const p = appData.timerPresets.find(item => item.id === presetId);
    if (!p) return;
    document.getElementById('modal-preset-title').textContent = 'Edit Quick Timer';
    document.getElementById('preset-id').value = p.id;
    document.getElementById('preset-icon').value = p.icon || '⏱️';
    document.getElementById('preset-name').value = p.name;
    document.getElementById('preset-hours').value = Math.floor(p.seconds / 3600);
    document.getElementById('preset-minutes').value = Math.floor((p.seconds % 3600) / 60);
    document.getElementById('preset-seconds').value = p.seconds % 60;
    document.getElementById('preset-sound').value = p.sound || 'chime';
    delBtn.classList.remove('hidden');
  } else {
    document.getElementById('modal-preset-title').textContent = 'New Quick Timer';
    document.getElementById('preset-id').value = '';
    document.getElementById('preset-icon').value = '🍅';
    document.getElementById('preset-name').value = '';
    document.getElementById('preset-hours').value = 0;
    document.getElementById('preset-minutes').value = 15;
    document.getElementById('preset-seconds').value = 0;
    document.getElementById('preset-sound').value = 'chime';
    delBtn.classList.add('hidden');
  }
  document.getElementById('modal-timer-preset').classList.remove('hidden');
}

function saveTimerPreset(e) {
  e.preventDefault();
  const id = document.getElementById('preset-id').value;
  const icon = document.getElementById('preset-icon').value;
  const name = document.getElementById('preset-name').value.trim();
  const h = Math.max(0, parseInt(document.getElementById('preset-hours').value, 10) || 0);
  const m = Math.max(0, parseInt(document.getElementById('preset-minutes').value, 10) || 0);
  const s = Math.max(0, parseInt(document.getElementById('preset-seconds').value, 10) || 0);
  const sound = document.getElementById('preset-sound').value;

  const totalSeconds = Math.max(5, h * 3600 + m * 60 + s);

  if (id) {
    const idx = appData.timerPresets.findIndex(p => p.id === id);
    if (idx !== -1) {
      appData.timerPresets[idx] = { ...appData.timerPresets[idx], icon, name, seconds: totalSeconds, sound };
    }
    showToast('Quick timer updated.');
  } else {
    appData.timerPresets.push({
      id: 'tp_' + Date.now(),
      icon,
      name,
      seconds: totalSeconds,
      sound
    });
    showToast(`Saved "${name}" to Quick Timers.`);
  }

  saveUserData();
  closeModal('modal-timer-preset');
  renderSavedTimersGrid();
}

function removeTimerPreset(presetId) {
  appData.timerPresets = appData.timerPresets.filter(p => p.id !== presetId);
  saveUserData();
  renderSavedTimersGrid();
  showToast('Quick timer removed.');
}

function deletePresetFromModal() {
  const id = document.getElementById('preset-id').value;
  closeModal('modal-timer-preset');
  removeTimerPreset(id);
}

// ==================== 3. STANDARD SMART ALARM & SNOOZE ENGINE ====================
function startClockAndAlarmEngine() {
  if (window._dayflowClockStarted) return;
  window._dayflowClockStarted = true;

  setInterval(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const currentHHMM = `${hh}:${mm}`;

    const dClock = document.getElementById('desktop-clock');
    const mClock = document.getElementById('mobile-clock');
    if (dClock) dClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (mClock) mClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!currentUser || !appData || activeAlarmTask) return;

    if (ss === '00') {
      const dueTask = appData.tasks.find(t =>
        t.alarm &&
        !t.completed &&
        t.time === currentHHMM &&
        triggeredMinuteLog[t.id] !== currentHHMM
      );
      if (dueTask) {
        triggeredMinuteLog[dueTask.id] = currentHHMM;
        triggerAlarmOverlay(dueTask);
        return;
      }
    }

    const snoozedDue = appData.tasks.find(t =>
      !t.completed &&
      t.snoozeUntil &&
      now.getTime() >= t.snoozeUntil
    );
    if (snoozedDue) {
      snoozedDue.snoozeUntil = null;
      saveUserData();
      renderTasks();
      triggerAlarmOverlay(snoozedDue);
    }
  }, 1000);
}

function triggerTestAlarm() {
  const sample = appData.tasks.find(t => !t.completed) || {
    id: 'demo_alarm',
    title: 'Review lecture notes',
    time: '08:30',
    routine: 'Morning',
    notes: 'Smart alarm test with 5, 15, 30, and 60 min snooze options.'
  };
  triggerAlarmOverlay(sample);
}

function triggerAlarmOverlay(task) {
  activeAlarmIsTimer = false;
  activeAlarmTask = task;

  document.getElementById('alarm-badge-label').textContent = 'DayFlow Smart Alarm';
  document.getElementById('alarm-task-title').textContent = task.title;
  document.getElementById('alarm-task-time').textContent = `${formatTime12h(task.time)} • ${task.routine} Routine`;
  document.getElementById('alarm-task-note').textContent = task.notes ? `"${task.notes}"` : '';

  document.getElementById('alarm-snooze-section').classList.remove('hidden');
  document.getElementById('alarm-actions-grid').className = 'grid grid-cols-2 gap-3';
  document.getElementById('alarm-primary-btn').classList.remove('hidden');

  document.getElementById('alarm-overlay').classList.remove('hidden');

  sendSystemNotification(`⏰ DayFlow Alarm: ${task.title}`, `${formatTime12h(task.time)} • ${task.routine} Routine`);
  playAlarmSound();
  alarmAudioInterval = setInterval(playAlarmSound, 2800);

  if (appData.preferences.voice && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`DayFlow Reminder. It is time for: ${task.title}`);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
}

function stopAlarmAudio() {
  if (alarmAudioInterval) {
    clearInterval(alarmAudioInterval);
    alarmAudioInterval = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function snoozeActiveAlarm(minutes) {
  stopAlarmAudio();
  if (activeAlarmTask && !activeAlarmIsTimer) {
    const taskInState = appData.tasks.find(t => t.id === activeAlarmTask.id);
    const targetTime = Date.now() + minutes * 60 * 1000;
    if (taskInState) {
      taskInState.snoozeUntil = targetTime;
      saveUserData();
      renderTasks();
    }
    showToast(`Alarm snoozed for ${minutes} minutes.`);
  }
  activeAlarmTask = null;
  activeAlarmIsTimer = false;
  document.getElementById('alarm-overlay').classList.add('hidden');
}

function dismissActiveAlarm(markComplete) {
  stopAlarmAudio();
  if (activeAlarmTask && !activeAlarmIsTimer && markComplete) {
    const taskInState = appData.tasks.find(t => t.id === activeAlarmTask.id);
    if (taskInState) {
      taskInState.completed = true;
      taskInState.snoozeUntil = null;
      saveUserData();
      renderTasks();
      showToast('Task marked as completed! ✓');
    }
  }
  activeAlarmTask = null;
  activeAlarmIsTimer = false;
  document.getElementById('alarm-overlay').classList.add('hidden');
}

function playAlarmSound(overrideType = null) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const type = overrideType || (appData && appData.preferences && appData.preferences.sound) || 'chime';
    const now = ctx.currentTime;

    let notes = [523.25, 659.25, 783.99, 1046.5];
    let wave = 'sine';

    if (type === 'digital') {
      notes = [880, 880, 880, 880];
      wave = 'square';
    } else if (type === 'pulse') {
      notes = [440, 554.37, 659.25, 880];
      wave = 'triangle';
    } else if (type === 'bell') {
      notes = [783.99, 1046.5, 1318.5];
      wave = 'sine';
    }

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now + i * 0.16);

      gain.gain.setValueAtTime(0.001, now + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.16 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.16);
      osc.stop(now + i * 0.16 + 0.45);
    });
  } catch (e) {}
}

// ==================== 4. HABIT TRACKER & STREAKS ====================
function renderHabits() {
  const container = document.getElementById('habits-container');
  const habits = appData.habits;

  const completedCount = habits.filter(h => h.current >= h.target).length;
  const totalCount = habits.length;
  const pct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  document.getElementById('habit-percent').textContent = `${pct}%`;
  document.getElementById('habit-fraction').textContent = `${completedCount} of ${totalCount} habits complete`;
  document.getElementById('habit-overall-bar').style.width = `${pct}%`;

  if (habits.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-sm text-slate-400 bg-white dark:bg-slateDark-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">No habits yet. Tap "+ New Habit" to start tracking!</div>`;
    return;
  }

  container.innerHTML = habits.map(h => {
    const done = h.current >= h.target;
    const progressPct = Math.min(100, Math.round((h.current / h.target) * 100));
    return `
      <div class="p-5 rounded-3xl bg-white dark:bg-slateDark-800 border border-slate-200/70 dark:border-slate-700/70 shadow-xs space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-2xl shrink-0">
              ${h.icon || '🎯'}
            </div>
            <div class="min-w-0">
              <h4 class="font-bold text-base text-slate-900 dark:text-white truncate">${escapeHtml(h.title)}</h4>
              <span class="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 text-xs font-bold">
                🔥 ${h.streak}-day streak
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button onclick="incrementHabit('${h.id}')" class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slateDark-900 hover:bg-blue-50 text-xs font-bold text-slate-700 dark:text-slate-200 transition" title="Log +1 Progress">
              +1
            </button>
            <button onclick="toggleHabitDone('${h.id}')" class="w-10 h-10 rounded-full flex items-center justify-center transition ${
              done
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'
            }" title="Mark Complete">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slateDark-900 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300 ${done ? 'bg-emerald-500' : 'bg-blue-600'}" style="width: ${progressPct}%"></div>
          </div>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">${h.current} / ${h.target}</span>
          <button onclick="deleteHabit('${h.id}')" class="text-xs text-slate-300 hover:text-rose-500 ml-1" title="Delete Habit">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function incrementHabit(id) {
  const h = appData.habits.find(item => item.id === id);
  if (!h) return;
  const wasDone = h.current >= h.target;
  h.current = Math.min(h.target, h.current + 1);
  if (!wasDone && h.current >= h.target) {
    h.streak += 1;
    showToast(`🔥 ${h.title} completed! Streak: ${h.streak} days`);
  }
  saveUserData();
  renderHabits();
}

function toggleHabitDone(id) {
  const h = appData.habits.find(item => item.id === id);
  if (!h) return;
  if (h.current >= h.target) {
    h.current = 0;
    h.streak = Math.max(0, h.streak - 1);
  } else {
    h.current = h.target;
    h.streak += 1;
    showToast(`🔥 Habit complete! ${h.streak}-day streak`);
  }
  saveUserData();
  renderHabits();
}

function openHabitModal() {
  document.getElementById('habit-title').value = '';
  document.getElementById('habit-target').value = 1;
  document.getElementById('modal-habit').classList.remove('hidden');
}

function saveHabit(e) {
  e.preventDefault();
  const title = document.getElementById('habit-title').value.trim();
  const target = parseInt(document.getElementById('habit-target').value, 10) || 1;
  const icon = document.getElementById('habit-icon').value;

  appData.habits.push({
    id: 'h_' + Date.now(),
    title,
    current: 0,
    target,
    streak: 1,
    icon
  });
  saveUserData();
  closeModal('modal-habit');
  renderHabits();
  showToast('Habit added!');
}

function deleteHabit(id) {
  appData.habits = appData.habits.filter(h => h.id !== id);
  saveUserData();
  renderHabits();
}

// ==================== 5. QUICK NOTES (VIEW SWITCHER + FOLDERS / TYPES) ====================
function setNoteViewMode(mode) {
  currentNoteViewMode = mode;
  if (appData && appData.preferences) {
    appData.preferences.noteViewMode = mode;
    saveUserData();
  }
  updateNoteViewButtons();
  renderNotes();
}

function updateNoteViewButtons() {
  document.querySelectorAll('.note-view-btn').forEach(btn => {
    const isActive = btn.getAttribute('data-note-view') === currentNoteViewMode;
    btn.className = isActive
      ? 'note-view-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-xs transition'
      : 'note-view-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition';
  });
}

function setNoteFolderFilter(folderId) {
  currentNoteFolder = folderId;
  const hint = document.getElementById('quick-capture-hint');
  if (hint) {
    hint.textContent = folderId === 'All'
      ? 'Tap to add a note in any folder...'
      : `Tap to add a note inside "${folderId}"...`;
  }
  renderNoteFolders();
  renderNotes();
}

function renderNoteFolders() {
  const bar = document.getElementById('note-folders-bar');
  if (!bar) return;

  const totalCount = appData.notes.length;
  const folders = appData.noteFolders || DEFAULT_NOTE_FOLDERS;

  let html = `
    <button onclick="setNoteFolderFilter('All')" class="px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition ${
      currentNoteFolder === 'All'
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-white dark:bg-slateDark-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
    }">
      <span>🗂️</span>
      <span>All Notes</span>
      <span class="px-1.5 py-0.2 rounded-full text-[10px] ${currentNoteFolder === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slateDark-900 text-slate-500'}">${totalCount}</span>
    </button>
  `;

  folders.forEach(folder => {
    const count = appData.notes.filter(n => n.folder === folder.id).length;
    const isActive = currentNoteFolder === folder.id;
    html += `
      <button onclick="setNoteFolderFilter('${escapeHtml(folder.id)}')" class="px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition ${
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-white dark:bg-slateDark-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
      }">
        <span>${folder.icon || '📁'}</span>
        <span>${escapeHtml(folder.name)}</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slateDark-900 text-slate-500'}">${count}</span>
      </button>
    `;
  });

  html += `
    <button onclick="openFolderModal()" class="px-3 py-2 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slateDark-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 dark:text-cyan-400 border border-dashed border-blue-300 dark:border-slate-600 flex items-center gap-1 shrink-0 transition" title="Create New Folder">
      <span>+ Folder</span>
    </button>
  `;

  bar.innerHTML = html;
}

function getFolderMeta(folderId) {
  const folders = appData.noteFolders || DEFAULT_NOTE_FOLDERS;
  return folders.find(f => f.id === folderId) || { id: folderId || 'Personal', name: folderId || 'Personal', icon: '📁', color: 'blue' };
}

function renderNotes() {
  const query = (document.getElementById('note-search').value || '').toLowerCase();
  const container = document.getElementById('notes-container');

  let filtered = appData.notes.filter(n => {
    const matchesFolder = currentNoteFolder === 'All' || n.folder === currentNoteFolder;
    const matchesSearch =
      n.title.toLowerCase().includes(query) ||
      n.body.toLowerCase().includes(query) ||
      (n.folder || '').toLowerCase().includes(query);
    return matchesFolder && matchesSearch;
  });

  filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  if (filtered.length === 0) {
    container.className = 'block';
    container.innerHTML = `
      <div class="p-8 text-center rounded-3xl bg-white/70 dark:bg-slateDark-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-400">
        No notes found${currentNoteFolder !== 'All' ? ` in "${escapeHtml(currentNoteFolder)}"` : ''}. Tap "+ New Note" to create one.
      </div>
    `;
    return;
  }

  if (currentNoteViewMode === 'list') {
    container.className = 'space-y-2.5';
    container.innerHTML = filtered.map(n => {
      const fMeta = getFolderMeta(n.folder);
      const badgeClass = FOLDER_BADGE_STYLES[fMeta.color] || FOLDER_BADGE_STYLES.blue;
      return `
        <div class="p-4 rounded-2xl bg-white dark:bg-slateDark-800 border border-slate-200/70 dark:border-slate-700/70 shadow-xs hover:shadow-md hover:border-blue-400/50 transition flex items-center justify-between gap-3">
          <div onclick="openNoteModal('${n.id}')" class="cursor-pointer flex items-center gap-3.5 min-w-0 flex-1">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${badgeClass}">
              ${fMeta.icon}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                ${n.pinned ? '<span class="text-xs" title="Pinned">📌</span>' : ''}
                <h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">${escapeHtml(n.title)}</h4>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${escapeHtml(n.body)}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass}">${escapeHtml(fMeta.name)}</span>
            <span class="text-[11px] text-slate-400 whitespace-nowrap">${escapeHtml(n.updatedAt)}</span>
            <button onclick="moveNoteToBin('${n.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition" title="Move to Bin">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');
    return;
  }

  if (currentNoteViewMode === 'card') {
    container.className = 'space-y-4';
    container.innerHTML = filtered.map(n => {
      const fMeta = getFolderMeta(n.folder);
      const badgeClass = FOLDER_BADGE_STYLES[fMeta.color] || FOLDER_BADGE_STYLES.blue;
      const topAccent = FOLDER_CARD_ACCENTS[fMeta.color] || FOLDER_CARD_ACCENTS.blue;
      return `
        <div class="p-6 rounded-3xl bg-white dark:bg-slateDark-800 border border-slate-200/70 dark:border-slate-700/70 ${topAccent} shadow-sm hover:shadow-lg transition space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}">
              <span>${fMeta.icon}</span>
              <span>${escapeHtml(fMeta.name)}</span>
            </span>
            <div class="flex items-center gap-2 text-xs text-slate-400">
              ${n.pinned ? '<span class="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 font-semibold">📌 Pinned</span>' : ''}
              <span>${escapeHtml(n.updatedAt)}</span>
              <button onclick="moveNoteToBin('${n.id}')" class="p-1 rounded-lg hover:text-rose-500 transition" title="Move to Bin">🗑️</button>
            </div>
          </div>
          <div onclick="openNoteModal('${n.id}')" class="cursor-pointer space-y-2">
            <h4 class="font-extrabold text-lg text-slate-900 dark:text-white">${escapeHtml(n.title)}</h4>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">${escapeHtml(n.body)}</p>
          </div>
        </div>
      `;
    }).join('');
    return;
  }

  container.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
  container.innerHTML = filtered.map(n => {
    const fMeta = getFolderMeta(n.folder);
    const badgeClass = FOLDER_BADGE_STYLES[fMeta.color] || FOLDER_BADGE_STYLES.blue;
    return `
      <div class="p-5 rounded-3xl bg-white dark:bg-slateDark-800 border border-slate-200/70 dark:border-slate-700/70 shadow-xs hover:shadow-md hover:border-blue-400/50 transition flex flex-col justify-between">
        <div onclick="openNoteModal('${n.id}')" class="cursor-pointer">
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass}">
              <span>${fMeta.icon}</span>
              <span>${escapeHtml(fMeta.name)}</span>
            </span>
            ${n.pinned ? '<span class="text-xs" title="Pinned">📌</span>' : ''}
          </div>
          <h4 class="font-bold text-base text-slate-900 dark:text-white mb-1.5">${escapeHtml(n.title)}</h4>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">${escapeHtml(n.body)}</p>
        </div>
        <div class="flex items-center justify-between mt-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <p class="text-[11px] font-medium text-slate-400">${escapeHtml(n.updatedAt)}</p>
          <button onclick="moveNoteToBin('${n.id}')" class="text-xs text-slate-400 hover:text-rose-500 transition" title="Move to Recycle Bin">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function populateNoteFolderSelect(selectedFolderId) {
  const select = document.getElementById('note-folder');
  const folders = appData.noteFolders || DEFAULT_NOTE_FOLDERS;
  select.innerHTML = folders.map(f =>
    `<option value="${escapeHtml(f.id)}" ${f.id === selectedFolderId ? 'selected' : ''}>${f.icon} ${escapeHtml(f.name)}</option>`
  ).join('');
}

function openNoteModal(noteId = null, startInEdit = false) {
  const modal = document.getElementById('modal-note');
  const viewContainer = document.getElementById('note-view-container');
  const editForm = document.getElementById('note-edit-form');
  const delBtn = document.getElementById('btn-delete-note');
  const cancelEditBtn = document.getElementById('btn-cancel-edit-note');

  if (noteId) {
    const note = appData.notes.find(n => n.id === noteId);
    if (!note) return;
    document.getElementById('note-id').value = note.id;
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-body').value = note.body;
    document.getElementById('note-pinned').checked = !!note.pinned;
    populateNoteFolderSelect(note.folder || 'Personal');

    const fMeta = getFolderMeta(note.folder);
    const badgeClass = FOLDER_BADGE_STYLES[fMeta.color] || FOLDER_BADGE_STYLES.blue;
    const folderBadge = document.getElementById('note-view-folder');
    folderBadge.className = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`;
    folderBadge.innerHTML = `<span>${fMeta.icon}</span><span>${escapeHtml(fMeta.name)}</span>`;

    const pinBadge = document.getElementById('note-view-pinned');
    if (note.pinned) {
      pinBadge.classList.remove('hidden');
    } else {
      pinBadge.classList.add('hidden');
    }

    document.getElementById('note-view-updated').textContent = note.updatedAt || '';
    document.getElementById('note-view-title').textContent = note.title;
    document.getElementById('note-view-body').textContent = note.body;

    if (startInEdit) {
      document.getElementById('modal-note-title').textContent = 'Edit Note';
      viewContainer.classList.add('hidden');
      editForm.classList.remove('hidden');
      delBtn.classList.remove('hidden');
      cancelEditBtn.classList.remove('hidden');
    } else {
      document.getElementById('modal-note-title').textContent = 'View Note';
      editForm.classList.add('hidden');
      viewContainer.classList.remove('hidden');
      delBtn.classList.add('hidden');
      cancelEditBtn.classList.add('hidden');
    }
  } else {
    document.getElementById('modal-note-title').textContent = 'New Quick Note';
    document.getElementById('note-id').value = '';
    document.getElementById('note-title').value = '';
    document.getElementById('note-body').value = '';
    document.getElementById('note-pinned').checked = false;
    const defaultFolder = currentNoteFolder !== 'All'
      ? currentNoteFolder
      : (appData.noteFolders[0] ? appData.noteFolders[0].id : 'Personal');
    populateNoteFolderSelect(defaultFolder);
    viewContainer.classList.add('hidden');
    editForm.classList.remove('hidden');
    delBtn.classList.add('hidden');
    cancelEditBtn.classList.add('hidden');
  }
  modal.classList.remove('hidden');
}

function switchNoteToEditMode() {
  const id = document.getElementById('note-id').value;
  if (!id) return;
  openNoteModal(id, true);
}

function cancelEditNote() {
  const id = document.getElementById('note-id').value;
  if (id) {
    openNoteModal(id, false);
  } else {
    closeModal('modal-note');
  }
}

function saveNote(e) {
  e.preventDefault();
  const id = document.getElementById('note-id').value;
  const title = document.getElementById('note-title').value.trim();
  const body = document.getElementById('note-body').value.trim();
  const folder = document.getElementById('note-folder').value;
  const pinned = document.getElementById('note-pinned').checked;
  const stamp = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (id) {
    const idx = appData.notes.findIndex(n => n.id === id);
    if (idx !== -1) {
      appData.notes[idx] = { ...appData.notes[idx], title, body, folder, pinned, updatedAt: stamp };
    }
    showToast('Note updated.');
  } else {
    appData.notes.unshift({
      id: 'n_' + Date.now(),
      title,
      body,
      folder,
      pinned,
      updatedAt: stamp
    });
    showToast(`Saved to ${folder}.`);
  }
  saveUserData();
  closeModal('modal-note');
  renderNoteFolders();
  renderNotes();
}

function moveNoteToBin(id) {
  const idx = appData.notes.findIndex(n => n.id === id);
  if (idx === -1) return;
  const [removed] = appData.notes.splice(idx, 1);
  appData.bin.unshift({
    binId: 'bin_' + Date.now(),
    type: 'note',
    deletedAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    item: removed
  });
  saveUserData();
  renderNoteFolders();
  renderNotes();
  showToast('Note moved to Recycle Bin.');
}

function deleteNoteFromModal() {
  const id = document.getElementById('note-id').value;
  closeModal('modal-note');
  moveNoteToBin(id);
}

function openFolderModal() {
  document.getElementById('folder-name-input').value = '';
  document.getElementById('modal-folder').classList.remove('hidden');
}

function saveNewFolder(e) {
  e.preventDefault();
  const name = document.getElementById('folder-name-input').value.trim();
  const icon = document.getElementById('folder-icon-input').value;
  const color = document.getElementById('folder-color-input').value;

  if (!name) return;
  if (appData.noteFolders.some(f => f.id.toLowerCase() === name.toLowerCase())) {
    showToast('A folder with that name already exists.');
    return;
  }

  appData.noteFolders.push({
    id: name,
    name: name,
    icon: icon,
    color: color
  });
  saveUserData();
  closeModal('modal-folder');
  setNoteFolderFilter(name);
  showToast(`Folder "${name}" created!`);
}

// ==================== 6. RECYCLE BIN (RESTORE OR PERMANENTLY DELETE) ====================
function setBinFilter(filter) {
  currentBinFilter = filter;
  document.querySelectorAll('.bin-pill').forEach(pill => {
    const active = pill.getAttribute('data-bin-filter') === filter;
    pill.className = active
      ? 'bin-pill px-4 py-2 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm transition'
      : 'bin-pill px-4 py-2 rounded-full text-xs font-semibold bg-white dark:bg-slateDark-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition';
  });
  renderBin();
}

function renderBin() {
  updateNotificationBadges();
  const container = document.getElementById('bin-container');
  const emptyBtn = document.getElementById('btn-empty-bin');
  const binItems = appData.bin || [];

  if (binItems.length > 0) {
    emptyBtn.classList.remove('hidden');
  } else {
    emptyBtn.classList.add('hidden');
  }

  const filtered = binItems.filter(entry => currentBinFilter === 'all' || entry.type === currentBinFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-10 text-center rounded-3xl bg-white/70 dark:bg-slateDark-800/60 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
        <div class="text-3xl">🗑️</div>
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">Recycle Bin is empty</p>
        <p class="text-xs text-slate-400">Deleted tasks and notes appear here so you can restore them anytime.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(entry => {
    const isTask = entry.type === 'task';
    const title = entry.item.title || 'Untitled';
    const subtitle = isTask
      ? `${entry.item.routine} Routine • ${formatTime12h(entry.item.time)}`
      : `Folder: ${entry.item.folder || 'Personal'} — ${(entry.item.body || '').slice(0, 65)}...`;

    return `
      <div class="p-4 rounded-2xl bg-white dark:bg-slateDark-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <span class="px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 ${
            isTask
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400'
              : 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300'
          }">
            ${isTask ? '✓ Task' : '📝 Note'}
          </span>
          <div class="min-w-0">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white truncate">${escapeHtml(title)}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${escapeHtml(subtitle)}</p>
            <p class="text-[11px] text-slate-400 mt-1">Deleted ${escapeHtml(entry.deletedAt)}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button onclick="restoreFromBin('${entry.binId}')" class="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200/70 dark:border-emerald-800/60 transition">
            ↺ Restore
          </button>
          <button onclick="permanentlyDeleteFromBin('${entry.binId}')" class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slateDark-900 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-xs font-semibold transition" title="Delete Forever">
            Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function restoreFromBin(binId) {
  const idx = appData.bin.findIndex(b => b.binId === binId);
  if (idx === -1) return;
  const [entry] = appData.bin.splice(idx, 1);

  if (entry.type === 'task') {
    appData.tasks.push(entry.item);
    showToast(`Restored task "${entry.item.title}"!`);
  } else if (entry.type === 'note') {
    appData.notes.unshift(entry.item);
    showToast(`Restored note "${entry.item.title}"!`);
  }

  saveUserData();
  renderBin();
}

function permanentlyDeleteFromBin(binId) {
  appData.bin = appData.bin.filter(b => b.binId !== binId);
  saveUserData();
  renderBin();
  showToast('Item permanently deleted.');
}

function emptyRecycleBin() {
  if (!confirm('Permanently delete all items in the Recycle Bin?')) return;
  appData.bin = [];
  saveUserData();
  renderBin();
  showToast('Recycle Bin emptied.');
}

// ==================== 7. PRODUCTIVITY SUMMARY ====================
function setSummaryPeriod(period) {
  currentSummaryPeriod = period;
  const wBtn = document.getElementById('summary-weekly-btn');
  const mBtn = document.getElementById('summary-monthly-btn');
  if (period === 'weekly') {
    wBtn.className = 'py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white shadow-sm transition';
    mBtn.className = 'py-1.5 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 transition';
  } else {
    mBtn.className = 'py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white shadow-sm transition';
    wBtn.className = 'py-1.5 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 transition';
  }
  renderSummary();
}

function renderSummary() {
  const completedToday = appData.tasks.filter(t => t.completed).length;
  const totalTasks = appData.tasks.length;
  const todayRate = totalTasks === 0 ? 75 : Math.max(45, Math.round((completedToday / totalTasks) * 100));

  const topStreak = appData.habits.reduce((max, h) => Math.max(max, h.streak), 0);
  document.getElementById('stat-top-streak').textContent = topStreak;

  if (currentSummaryPeriod === 'weekly') {
    document.getElementById('stat-tasks-done').textContent = 32 + completedToday;
    document.getElementById('stat-tasks-trend').textContent = '+12%';
    document.getElementById('chart-badge').textContent = 'This week';
    document.getElementById('stat-best-day').textContent = 'Wednesday';
    document.getElementById('stat-completion-avg').textContent = '82% avg';

    const bars = [
      { label: 'Mon', val: 65 },
      { label: 'Tue', val: 78 },
      { label: 'Wed', val: 94, best: true },
      { label: 'Thu', val: 72 },
      { label: 'Fri', val: 60 },
      { label: 'Sat', val: 52 },
      { label: 'Today', val: todayRate }
    ];
    renderBarChart(bars);
  } else {
    document.getElementById('stat-tasks-done').textContent = 128 + completedToday;
    document.getElementById('stat-tasks-trend').textContent = '+18%';
    document.getElementById('chart-badge').textContent = 'Last 4 weeks';
    document.getElementById('stat-best-day').textContent = 'Week 3';
    document.getElementById('stat-completion-avg').textContent = '86% avg';

    const bars = [
      { label: 'Week 1', val: 74 },
      { label: 'Week 2', val: 81 },
      { label: 'Week 3', val: 92, best: true },
      { label: 'Week 4', val: Math.max(70, todayRate) }
    ];
    renderBarChart(bars);
  }
}

function renderBarChart(bars) {
  const chart = document.getElementById('summary-chart');
  chart.innerHTML = bars.map(b => `
    <div class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
      <span class="text-[10px] font-bold text-slate-400">${b.val}%</span>
      <div class="w-full max-w-[34px] rounded-t-xl transition-all duration-500 ${b.best ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-cyan-500'}" style="height: ${b.val}%"></div>
      <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">${b.label}</span>
    </div>
  `).join('');
}

// ==================== UTILITIES ====================
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}


// ==================== 8. PROGRESSIVE WEB APP (PWA) & OS WEB NOTIFICATIONS ====================
let deferredInstallPrompt = null;

function initPwaAndNotifications() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => {
        const statusEl = document.getElementById('pwa-install-status');
        if (statusEl) statusEl.textContent = 'Service Worker active • Ready for offline use & installation';
      })
      .catch(() => {});
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const navBtn = document.getElementById('btn-pwa-install-nav');
    if (navBtn) {
      navBtn.classList.remove('hidden');
      navBtn.classList.add('inline-flex');
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const navBtn = document.getElementById('btn-pwa-install-nav');
    if (navBtn) navBtn.classList.add('hidden');
    const statusEl = document.getElementById('pwa-install-status');
    if (statusEl) statusEl.textContent = 'Installed as standalone app ✓';
    showToast('DayFlow installed to your device!');
  });

  updateOsNotificationStatusUI();
}

async function triggerPwaInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('Installing DayFlow...');
    }
    deferredInstallPrompt = null;
  } else {
    showToast('Tip: Use your browser menu ("Install App" or "Add to Home Screen") to install DayFlow.');
  }
}

function updateOsNotificationStatusUI() {
  const statusEl = document.getElementById('notif-permission-status');
  const btn = document.getElementById('btn-enable-os-notif');
  if (!statusEl || !btn) return;

  if (!('Notification' in window)) {
    statusEl.textContent = 'Browser does not support OS push notifications.';
    btn.textContent = 'Unsupported';
    btn.disabled = true;
    return;
  }

  if (Notification.permission === 'granted') {
    statusEl.textContent = 'Enabled ✓ — System alerts will appear even in background tabs';
    btn.textContent = 'Enabled ✓';
    btn.className = 'px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/70 dark:border-emerald-800/60 shrink-0';
  } else if (Notification.permission === 'denied') {
    statusEl.textContent = 'Blocked in browser settings. Enable notifications in site permissions.';
    btn.textContent = 'Blocked';
  } else {
    statusEl.textContent = 'Receive system notifications when task or focus alarms ring';
    btn.textContent = 'Enable Alerts';
  }
}

async function requestOsNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('System notifications are not supported in this browser.');
    return;
  }
  const perm = await Notification.requestPermission();
  updateOsNotificationStatusUI();
  if (perm === 'granted') {
    sendSystemNotification('DayFlow Alerts Enabled', 'You will now receive real-time OS notifications for your tasks and focus timer.');
    showToast('OS Notifications enabled!');
  } else {
    showToast('Notification permission was not granted.');
  }
}

function sendSystemNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body,
          icon: './icons/icon-192.svg',
          badge: './icons/icon-192.svg',
          tag: 'dayflow-alarm'
        });
      });
    } else {
      new Notification(title, { body, icon: './icons/icon-192.svg' });
    }
  } catch (e) {}
}

// ==================== 9. AI SMART PRODUCTIVITY ASSISTANT ====================
let aiAssistantMode = 'tasks';
let lastAiGeneratedPayload = null;

function saveGeminiApiKey() {
  if (!appData) return;
  const keyVal = (document.getElementById('pref-gemini-key').value || '').trim();
  appData.preferences.geminiApiKey = keyVal;
  saveUserData();
  updateAiModeBadge();
  showToast(keyVal ? 'Gemini API Key saved!' : 'Switched to Built-in Smart AI.');
}

function updateAiModeBadge() {
  const badge = document.getElementById('ai-mode-badge');
  const keyInput = document.getElementById('pref-gemini-key');
  if (!appData) return;
  const hasKey = !!(appData.preferences && appData.preferences.geminiApiKey);
  if (keyInput) keyInput.value = appData.preferences.geminiApiKey || '';
  if (badge) {
    badge.textContent = hasKey ? 'Gemini Live API Connected' : 'Built-in Smart AI';
  }
}

function openAiAssistantModal(mode = 'tasks') {
  switchAiAssistantMode(mode);
  document.getElementById('ai-result-box').classList.add('hidden');
  document.getElementById('ai-result-preview').innerHTML = '';
  lastAiGeneratedPayload = null;
  document.getElementById('modal-ai-assistant').classList.remove('hidden');
}

function switchAiAssistantMode(mode) {
  aiAssistantMode = mode;
  const tBtn = document.getElementById('ai-tab-tasks');
  const nBtn = document.getElementById('ai-tab-notes');
  const genLabel = document.getElementById('btn-ai-generate-label');
  const input = document.getElementById('ai-prompt-input');

  if (mode === 'tasks') {
    tBtn.className = 'py-2 text-xs font-bold rounded-lg bg-white dark:bg-slateDark-800 text-blue-600 dark:text-cyan-400 shadow-xs transition';
    nBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400 transition';
    genLabel.textContent = 'Generate Smart Routine Tasks';
    input.placeholder = 'e.g., Prepare for IT 105 Final Web App Defense tomorrow';
  } else {
    nBtn.className = 'py-2 text-xs font-bold rounded-lg bg-white dark:bg-slateDark-800 text-blue-600 dark:text-cyan-400 shadow-xs transition';
    tBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-500 dark:text-slate-400 transition';
    genLabel.textContent = 'Generate Structured Study Note';
    input.placeholder = 'e.g., Key concepts of Progressive Web Apps and Service Workers';
  }
  document.getElementById('ai-result-box').classList.add('hidden');
}

function setAiSamplePrompt(text) {
  document.getElementById('ai-prompt-input').value = text;
}

async function runAiAssistantGeneration() {
  const promptText = (document.getElementById('ai-prompt-input').value || '').trim();
  if (!promptText) {
    showToast('Please enter a goal or topic first.');
    return;
  }

  const btn = document.getElementById('btn-ai-generate');
  const label = document.getElementById('btn-ai-generate-label');
  const origLabel = label.textContent;
  btn.disabled = true;
  label.textContent = 'Thinking...';

  const apiKey = appData && appData.preferences && appData.preferences.geminiApiKey;

  try {
    if (apiKey) {
      const liveResult = await callGeminiRestApi(apiKey, promptText, aiAssistantMode);
      if (liveResult) {
        lastAiGeneratedPayload = liveResult;
        renderAiPreview(liveResult, '✨ Gemini 2.5 Flash Live Response');
        btn.disabled = false;
        label.textContent = origLabel;
        return;
      }
    }
  } catch (err) {
    // Fallback gracefully to deterministic smart planner
  }

  // Built-in Smart Local AI Breakdown Engine (works offline & without API keys)
  await new Promise(r => setTimeout(r, 450));
  const fallbackResult = buildSmartHeuristicPlan(promptText, aiAssistantMode);
  lastAiGeneratedPayload = fallbackResult;
  renderAiPreview(fallbackResult, '✨ DayFlow Smart AI Planner');

  btn.disabled = false;
  label.textContent = origLabel;
}

async function callGeminiRestApi(apiKey, promptText, mode) {
  const sysInstruction = mode === 'tasks'
    ? 'Return ONLY valid JSON: {"type":"tasks","items":[{"title":"...","time":"HH:MM","routine":"Morning|Afternoon|Evening","notes":"..."}]} with 3 to 4 actionable tasks.'
    : 'Return ONLY valid JSON: {"type":"note","title":"...","folder":"Study","body":"..."} with a concise structured study note.';

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${sysInstruction}\n\nUser goal: ${promptText}` }] }]
    })
  });
  if (!res.ok) return null;
  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = rawText.replace(/```json|```/gi, '').trim();
  const parsed = JSON.parse(cleaned);
  return parsed && parsed.type ? parsed : null;
}

function buildSmartHeuristicPlan(goal, mode) {
  const cleanGoal = goal.charAt(0).toUpperCase() + goal.slice(1);
  if (mode === 'tasks') {
    return {
      type: 'tasks',
      items: [
        {
          title: `Outline & research: ${cleanGoal}`,
          time: '09:00',
          routine: 'Morning',
          notes: 'Gather key references, requirements, and core objectives.'
        },
        {
          title: `Deep work sprint on ${cleanGoal}`,
          time: '14:00',
          routine: 'Afternoon',
          notes: 'Use a 25-minute Pomodoro timer for distraction-free execution.'
        },
        {
          title: `Review, test & finalize: ${cleanGoal}`,
          time: '19:30',
          routine: 'Evening',
          notes: 'Verify completeness and prepare next steps.'
        }
      ]
    };
  }
  return {
    type: 'note',
    title: `Study Guide: ${cleanGoal}`,
    folder: 'Study',
    body: `• Core Objective: ${cleanGoal}\n• Key Action Steps:\n  1. Break down main concepts into small, testable milestones.\n  2. Practice active recall and summarize takeaways in your own words.\n  3. Schedule a 25-minute Focus Timer review block before deadline.`
  };
}

function renderAiPreview(payload, sourceLabel) {
  const box = document.getElementById('ai-result-box');
  const preview = document.getElementById('ai-result-preview');
  const srcEl = document.getElementById('ai-result-source-label');

  srcEl.textContent = sourceLabel;
  box.classList.remove('hidden');

  if (payload.type === 'tasks') {
    preview.innerHTML = payload.items.map(t => `
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slateDark-900 border border-slate-200/70 dark:border-slate-700/70">
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">${escapeHtml(t.title)}</p>
          <span class="text-[11px] font-bold text-blue-600 dark:text-cyan-400 shrink-0">${t.routine} • ${formatTime12h(t.time)}</span>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${escapeHtml(t.notes || '')}</p>
      </div>
    `).join('');
  } else {
    preview.innerHTML = `
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slateDark-900 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
        <span class="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 text-[11px] font-bold">${escapeHtml(payload.folder || 'Study')}</span>
        <p class="text-sm font-extrabold text-slate-900 dark:text-white">${escapeHtml(payload.title)}</p>
        <p class="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">${escapeHtml(payload.body)}</p>
      </div>
    `;
  }
}

function applyAiGeneratedContent() {
  if (!lastAiGeneratedPayload || !appData) return;

  if (lastAiGeneratedPayload.type === 'tasks') {
    lastAiGeneratedPayload.items.forEach((item, idx) => {
      appData.tasks.push({
        id: 't_ai_' + Date.now() + '_' + idx,
        title: item.title,
        time: item.time || '09:00',
        routine: ['Morning', 'Afternoon', 'Evening'].includes(item.routine) ? item.routine : 'Morning',
        completed: false,
        alarm: true,
        notes: item.notes || 'Generated by DayFlow AI',
        snoozeUntil: null
      });
    });
    saveUserData();
    closeModal('modal-ai-assistant');
    switchTab('tasks');
    showToast(`Added ${lastAiGeneratedPayload.items.length} AI tasks to your routine! ✨`);
  } else {
    const stamp = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    appData.notes.unshift({
      id: 'n_ai_' + Date.now(),
      title: lastAiGeneratedPayload.title,
      folder: lastAiGeneratedPayload.folder || 'Study',
      pinned: true,
      body: lastAiGeneratedPayload.body,
      updatedAt: stamp
    });
    saveUserData();
    closeModal('modal-ai-assistant');
    switchTab('notes');
    showToast('AI Study Note saved & pinned! ✨');
  }
}
