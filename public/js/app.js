// Global application router and state manager
window.currentFeedType = 'all';
let currentAttachedImgUrl = null;
let currentActivePostId = null;

// Routing mechanism
function navigateTo(view, param = null) {
  if (!currentUser) return;

  // Update left navigation highlight
  document.querySelectorAll('.nav-item').forEach(el => {
    if (el.dataset.nav === view || (view === 'profile' && el.dataset.nav === 'profile' && (!param || param === currentUser.username))) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  const feedContainer = document.getElementById('feed-container');
  const composer = document.getElementById('feed-composer');
  const streamHeader = document.getElementById('stream-header');

  if (view === 'home') {
    if (streamHeader) streamHeader.style.display = 'flex';
    if (composer) composer.style.display = 'flex';
    loadHomeFeed();
  } else if (view === 'explore') {
    if (streamHeader) streamHeader.style.display = 'none';
    if (composer) composer.style.display = 'none';
    loadExploreView();
  } else if (view === 'profile') {
    if (streamHeader) streamHeader.style.display = 'none';
    if (composer) composer.style.display = 'none';
    loadProfileView(param || currentUser.username);
  }
}

// Home Feed Loader
async function loadHomeFeed() {
  const container = document.getElementById('feed-container');
  if (!container) return;
  container.innerHTML = '<div style="padding: 2.5rem; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--accent-cyan);"></i> Loading social stream...</div>';

  try {
    const res = await apiGetFeed(window.currentFeedType);
    container.innerHTML = '';
    if (!res.posts || res.posts.length === 0) {
      container.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--text-muted);">
        <i class="fa-solid fa-wind" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
        No pulses found in this feed yet. Start publishing or discover creators in Explore!
      </div>`;
      return;
    }
    res.posts.forEach(post => {
      container.appendChild(createPostCardElement(post, currentUser._id));
    });
  } catch (err) {
    container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--accent-red);">Failed to retrieve feed. Please check your network or server connection.</div>';
  }
}

function reloadFeed() {
  loadHomeFeed();
}

// Explore & discovery view
async function loadExploreView() {
  const container = document.getElementById('feed-container');
  if (!container) return;
  container.innerHTML = `
    <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-color);">
      <h2 style="font-size: 1.5rem; color: var(--text-primary); margin-bottom: 0.25rem;"><i class="fa-solid fa-compass" style="color: var(--accent-cyan);"></i> Explore Creators & Trends</h2>
      <p style="color: var(--text-muted);">Discover passionate visionaries across the Pulse sphere.</p>
    </div>
    <div id="explore-grid" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--accent-cyan); align-self: center;"></i>
    </div>
  `;

  try {
    const res = await apiGetSuggestions();
    const grid = document.getElementById('explore-grid');
    grid.innerHTML = '';
    if (!res.users || res.users.length === 0) {
      grid.innerHTML = '<div style="color: var(--text-muted); text-align: center;">No further user accounts found at the moment.</div>';
      return;
    }
    res.users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'widget-card flex items-center justify-between';
      card.style.padding = '1.25rem';
      card.innerHTML = `
        <div class="flex items-center gap-3 profile-link-trigger" data-username="${escapeHTML(user.username)}" style="cursor: pointer;">
          <img src="${escapeHTML(user.avatarUrl)}" class="avatar" style="width: 50px; height: 50px;" />
          <div>
            <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${escapeHTML(user.fullName)}</div>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.25rem;">@${escapeHTML(user.username)}</div>
            ${user.bio ? `<div style="font-size: 0.9rem; color: var(--text-secondary); max-width: 420px;">${escapeHTML(user.bio)}</div>` : ''}
          </div>
        </div>
        <button class="btn-primary follow-btn" style="padding: 0.5rem 1.4rem;">Follow</button>
      `;

      card.querySelector('.follow-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        const btn = e.target;
        try {
          const followRes = await apiToggleFollow(user._id);
          if (followRes.success) {
            btn.textContent = followRes.isFollowing ? 'Following' : 'Follow';
            btn.className = followRes.isFollowing ? 'btn-secondary' : 'btn-primary';
            showToast(followRes.message);
          }
        } catch (err) {
          showToast('Failed to modify follow status', true);
        }
      });

      card.querySelector('.profile-link-trigger').addEventListener('click', () => {
        navigateTo('profile', user.username);
      });

      grid.appendChild(card);
    });
  } catch (err) {
    showToast('Failed to load explore directory', true);
  }
}

// Profile page loader
async function loadProfileView(username) {
  const container = document.getElementById('feed-container');
  if (!container) return;
  container.innerHTML = '<div style="padding: 2.5rem; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--accent-cyan);"></i> Loading profile...</div>';

  try {
    const res = await apiGetUserProfile(username);
    container.innerHTML = '';
    if (!res.success) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center;">User profile could not be resolved.</div>';
      return;
    }

    const headerEl = createProfileHeaderElement(res, currentUser._id);
    container.appendChild(headerEl);

    const listContainer = document.createElement('div');
    listContainer.id = 'profile-posts-list';
    container.appendChild(listContainer);

    const renderPostsList = (postsArray, emptyMsg) => {
      listContainer.innerHTML = '';
      if (!postsArray || postsArray.length === 0) {
        listContainer.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--text-muted); font-style: italic;">${emptyMsg}</div>`;
        return;
      }
      postsArray.forEach(p => {
        listContainer.appendChild(createPostCardElement(p, currentUser._id, () => loadProfileView(username)));
      });
    };

    // Default view: authored posts
    renderPostsList(res.posts, 'This user has not published any pulses yet.');

    // Tab switcher inside profile
    const tabAuthored = headerEl.querySelector('#tab-user-posts');
    const tabLiked = headerEl.querySelector('#tab-user-likes');

    if (tabAuthored && tabLiked) {
      tabAuthored.addEventListener('click', () => {
        tabAuthored.classList.add('active');
        tabLiked.classList.remove('active');
        renderPostsList(res.posts, 'This user has not published any pulses yet.');
      });

      tabLiked.addEventListener('click', () => {
        tabLiked.classList.add('active');
        tabAuthored.classList.remove('active');
        renderPostsList(res.likedPosts, 'No liked pulses found for this account.');
      });
    }
  } catch (err) {
    container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--accent-red);">Error displaying profile data.</div>';
  }
}

// Right bar Who To Follow loader
async function loadSuggestions() {
  const container = document.getElementById('suggestions-container');
  if (!container || !currentUser) return;
  try {
    const res = await apiGetSuggestions();
    container.innerHTML = '';
    if (!res.users || res.users.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">No recommendations at this time.</div>';
      return;
    }
    res.users.forEach(u => {
      container.appendChild(createSuggestionItem(u));
    });
  } catch (err) {
    container.innerHTML = '<div style="color: var(--accent-red); font-size: 0.85rem;">Failed to retrieve recommendations.</div>';
  }
}

// Modal handling logic
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// Open Post Thread Details & Comments
async function openPostModal(postId) {
  currentActivePostId = postId;
  const detailsBox = document.getElementById('modal-post-details');
  if (!detailsBox) return;
  detailsBox.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--accent-cyan);"></i> Loading thread discussion...</div>';
  openModal('post-modal');

  try {
    const [postRes, commentsRes] = await Promise.all([
      apiGetPostById(postId),
      apiGetComments(postId)
    ]);

    if (!postRes.success) {
      detailsBox.innerHTML = '<div style="padding: 1.5rem; color: var(--accent-red);">Post thread could not be loaded.</div>';
      return;
    }

    detailsBox.innerHTML = '';
    // Append parent post card
    detailsBox.appendChild(createPostCardElement(postRes.post, currentUser._id));

    const commentsSection = document.createElement('div');
    commentsSection.style.marginTop = '1rem';
    commentsSection.style.borderTop = '1px solid var(--border-color)';
    commentsSection.style.paddingTop = '1rem';
    commentsSection.innerHTML = `<h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-secondary);">Replies (${commentsRes.count})</h4>`;

    const repliesList = document.createElement('div');
    repliesList.id = 'modal-replies-list';
    repliesList.style.display = 'flex';
    repliesList.style.flexDirection = 'column';
    repliesList.style.gap = '1rem';

    if (commentsRes.comments && commentsRes.comments.length > 0) {
      commentsRes.comments.forEach(c => {
        repliesList.appendChild(createCommentElement(c));
      });
    } else {
      repliesList.innerHTML = '<p id="empty-replies-msg" style="color: var(--text-muted); font-style: italic;">No responses yet. Start the conversation!</p>';
    }

    commentsSection.appendChild(repliesList);
    detailsBox.appendChild(commentsSection);
  } catch (err) {
    detailsBox.innerHTML = '<div style="padding: 1.5rem; color: var(--accent-red);">Error resolving thread details.</div>';
  }
}

function createCommentElement(comment) {
  const el = document.createElement('div');
  el.style.display = 'flex';
  el.style.gap = '0.75rem';
  el.style.padding = '0.75rem';
  el.style.borderRadius = 'var(--radius-md)';
  el.style.background = '#171a27';
  el.style.border = '1px solid rgba(255, 255, 255, 0.04)';

  const authorName = escapeHTML(comment.author ? comment.author.fullName : 'User');
  const authorHandle = escapeHTML(comment.author ? comment.author.username : 'user');
  const authorAvatar = comment.author ? (comment.author.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150') : '';

  el.innerHTML = `
    <img src="${authorAvatar}" class="avatar" style="width: 36px; height: 36px;" />
    <div style="flex: 1;">
      <div class="flex items-center gap-2" style="margin-bottom: 0.2rem;">
        <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${authorName}</span>
        <span style="color: var(--text-muted); font-size: 0.85rem;">@${authorHandle}</span>
        <span style="color: var(--text-muted); font-size: 0.8rem;">· ${formatTimeAgo(comment.createdAt)}</span>
      </div>
      <p style="font-size: 0.96rem; color: var(--text-primary); line-height: 1.4;">${escapeHTML(comment.text)}</p>
    </div>
  `;
  return el;
}

function openEditProfileModal(user) {
  document.getElementById('edit-fullname').value = user.fullName || '';
  document.getElementById('edit-bio').value = user.bio || '';
  document.getElementById('edit-avatar').value = user.avatarUrl || '';
  document.getElementById('edit-cover').value = user.coverUrl || '';
  openModal('edit-profile-modal');
}

// Application Startup Initialization
document.addEventListener('DOMContentLoaded', async () => {
  const isLoggedIn = await initAuth();
  if (isLoggedIn) {
    loadHomeFeed();
    loadSuggestions();
  }

  // Stream Tab Switchers (For You / Following)
  const tabs = document.querySelectorAll('#stream-header .stream-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      window.currentFeedType = tab.dataset.feed;
      loadHomeFeed();
    });
  });

  // Navigation menu clicks
  document.querySelectorAll('.nav-links .nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const navView = link.dataset.nav;
      navigateTo(navView);
    });
  });

  // New pulse quick trigger
  const newPulseBtn = document.getElementById('nav-new-pulse-btn');
  if (newPulseBtn) {
    newPulseBtn.addEventListener('click', () => {
      navigateTo('home');
      const textarea = document.getElementById('composer-text');
      if (textarea) textarea.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Composer character counter & limits
  const composerText = document.getElementById('composer-text');
  const charCounter = document.getElementById('char-counter');
  if (composerText && charCounter) {
    composerText.addEventListener('input', () => {
      const len = composerText.value.length;
      charCounter.textContent = `${len} / 500`;
      if (len > 500) {
        charCounter.style.color = 'var(--accent-red)';
      } else {
        charCounter.style.color = 'var(--text-muted)';
      }
    });
  }

  // Image Attachment Trigger
  const addImgBtn = document.getElementById('add-img-btn');
  if (addImgBtn) {
    addImgBtn.addEventListener('click', () => {
      document.getElementById('img-url-input').value = currentAttachedImgUrl || '';
      openModal('img-url-modal');
    });
  }

  const confirmImgBtn = document.getElementById('confirm-img-url');
  if (confirmImgBtn) {
    confirmImgBtn.addEventListener('click', () => {
      const input = document.getElementById('img-url-input');
      const url = input.value.trim();
      if (url) {
        currentAttachedImgUrl = url;
        document.getElementById('preview-img-tag').src = url;
        document.getElementById('composer-img-preview').classList.add('visible');
      }
      closeModal('img-url-modal');
    });
  }

  const removeImgBtn = document.getElementById('remove-img-btn');
  if (removeImgBtn) {
    removeImgBtn.addEventListener('click', () => {
      currentAttachedImgUrl = null;
      document.getElementById('preview-img-tag').src = '';
      document.getElementById('composer-img-preview').classList.remove('visible');
    });
  }

  // Publish Pulse button
  const publishBtn = document.getElementById('publish-btn');
  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      const text = composerText ? composerText.value.trim() : '';
      if (!text) {
        showToast('Please enter some text for your pulse!', true);
        return;
      }
      if (text.length > 500) {
        showToast('Pulse content exceeds 500 character maximum', true);
        return;
      }

      publishBtn.disabled = true;
      publishBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Pulsing...';

      try {
        const res = await apiCreatePost(text, currentAttachedImgUrl);
        if (res.success && res.post) {
          composerText.value = '';
          if (charCounter) charCounter.textContent = '0 / 500';
          currentAttachedImgUrl = null;
          document.getElementById('composer-img-preview').classList.remove('visible');

          // Immediately prepend post to feed without page refresh!
          const feedContainer = document.getElementById('feed-container');
          if (feedContainer) {
            if (feedContainer.querySelector('.fa-wind')) feedContainer.innerHTML = '';
            feedContainer.insertBefore(createPostCardElement(res.post, currentUser._id), feedContainer.firstChild);
          }
          showToast('Pulse published to the sphere! ⚡');
        }
      } catch (err) {
        showToast(err.message || 'Failed to publish pulse.', true);
      } finally {
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Pulse';
      }
    });
  }

  // Modal reply comment button
  const postCommentBtn = document.getElementById('post-comment-btn');
  const commentInput = document.getElementById('new-comment-input');
  if (postCommentBtn && commentInput) {
    const submitComment = async () => {
      const text = commentInput.value.trim();
      if (!text || !currentActivePostId) return;

      try {
        const res = await apiAddComment(currentActivePostId, text);
        if (res.success && res.comment) {
          commentInput.value = '';
          const repliesList = document.getElementById('modal-replies-list');
          const emptyMsg = document.getElementById('empty-replies-msg');
          if (emptyMsg) emptyMsg.remove();
          repliesList.appendChild(createCommentElement(res.comment));

          // Update comment count on background card
          const bgCard = document.querySelector(`.post-card[data-post-id="${currentActivePostId}"]`);
          if (bgCard) {
            const countSpan = bgCard.querySelector('.comments-count');
            if (countSpan) countSpan.textContent = res.commentsCount;
          }
          showToast('Reply added to discussion!');
        }
      } catch (err) {
        showToast('Could not send reply', true);
      }
    };

    postCommentBtn.addEventListener('click', submitComment);
    commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitComment();
    });
  }

  // Profile edit form submit
  const editForm = document.getElementById('edit-profile-form');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('edit-fullname').value;
      const bio = document.getElementById('edit-bio').value;
      const avatarUrl = document.getElementById('edit-avatar').value;
      const coverUrl = document.getElementById('edit-cover').value;

      try {
        const res = await apiUpdateProfile({ fullName, bio, avatarUrl, coverUrl });
        if (res.success && res.user) {
          currentUser = res.user;
          updateNavUserBadge();
          closeModal('edit-profile-modal');
          showToast('Profile successfully customized! 🎨');
          loadProfileView(currentUser.username);
        }
      } catch (err) {
        showToast('Error updating profile settings', true);
      }
    });
  }

  // Universal Modal Close triggers
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.modal;
      closeModal(modalId);
    });
  });

  // Close modals on overlay backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });
});
