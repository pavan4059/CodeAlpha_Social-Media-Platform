// Current session state
let currentUser = null;

function showAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen');
  if (authScreen) authScreen.style.display = 'flex';
  if (appScreen) appScreen.style.display = 'none';
  currentUser = null;
}

function showAppScreen() {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen');
  if (authScreen) authScreen.style.display = 'none';
  if (appScreen) appScreen.style.display = 'grid';
}

function updateNavUserBadge() {
  if (!currentUser) return;
  const avatar = document.getElementById('nav-user-avatar');
  const name = document.getElementById('nav-user-name');
  const handle = document.getElementById('nav-user-handle');
  const composerAvatar = document.getElementById('composer-avatar');

  if (avatar) avatar.src = currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
  if (name) name.textContent = currentUser.fullName;
  if (handle) handle.textContent = `@${currentUser.username}`;
  if (composerAvatar) composerAvatar.src = currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
}

async function initAuth() {
  const token = localStorage.getItem('pulse_jwt');
  if (!token) {
    showAuthScreen();
    return false;
  }

  try {
    const data = await apiGetMe();
    if (data.success && data.user) {
      currentUser = data.user;
      updateNavUserBadge();
      showAppScreen();
      return true;
    } else {
      showAuthScreen();
      return false;
    }
  } catch (error) {
    showAuthScreen();
    return false;
  }
}

// Setup Event Listeners for Auth Forms
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const showRegBtn = document.getElementById('show-register-btn');
  const showLogBtn = document.getElementById('show-login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (showRegBtn && showLogBtn) {
    showRegBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      regForm.style.display = 'block';
    });

    showLogBtn.addEventListener('click', (e) => {
      e.preventDefault();
      regForm.style.display = 'none';
      loginForm.style.display = 'block';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const idInput = document.getElementById('login-id');
      const passInput = document.getElementById('login-password');
      if (!idInput.value || !passInput.value) return;

      try {
        const res = await apiLogin(idInput.value.trim(), passInput.value);
        if (res.success && res.token) {
          localStorage.setItem('pulse_jwt', res.token);
          currentUser = res.user;
          updateNavUserBadge();
          showAppScreen();
          showToast(`Welcome back, ${currentUser.fullName}! ✨`);
          if (typeof loadHomeFeed === 'function') loadHomeFeed();
          if (typeof loadSuggestions === 'function') loadSuggestions();
        }
      } catch (err) {
        showToast(err.message || 'Login failed. Please check credentials.', true);
      }
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value.trim();
      const fullName = document.getElementById('reg-fullname').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;

      try {
        const res = await apiRegister({ username, fullName, email, password });
        if (res.success && res.token) {
          localStorage.setItem('pulse_jwt', res.token);
          currentUser = res.user;
          updateNavUserBadge();
          showAppScreen();
          showToast(`Account created! Welcome to Pulse, ${currentUser.fullName}! 🎉`);
          if (typeof loadHomeFeed === 'function') loadHomeFeed();
          if (typeof loadSuggestions === 'function') loadSuggestions();
        }
      } catch (err) {
        showToast(err.message || 'Registration error occurred.', true);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of Pulse?')) {
        localStorage.removeItem('pulse_jwt');
        showAuthScreen();
        showToast('You have been logged out.');
      }
    });
  }
});
