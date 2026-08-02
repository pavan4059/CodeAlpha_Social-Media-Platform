// XSS sanitizer
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Time formatting helper (e.g. 2h ago)
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Render single Post Card
function createPostCardElement(post, currentUserId, onDeleteCallback = null) {
  const isAuthor = post.author && post.author._id.toString() === currentUserId.toString();
  const isLiked = post.likes && post.likes.some(like => {
    const id = typeof like === 'object' ? like._id : like;
    return id.toString() === currentUserId.toString();
  });
  const isExternal = !!post.source;

  const authorName = escapeHTML(post.author ? post.author.fullName : 'Unknown User');
  const authorHandle = escapeHTML(post.author ? post.author.username : 'user');
  const authorAvatar = post.author ? (post.author.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150') : '';

  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.postId = post._id;

  card.innerHTML = `
    <img src="${authorAvatar}" alt="${authorHandle}" class="avatar profile-link-trigger" data-username="${authorHandle}" style="${isExternal ? 'border: 2px solid var(--accent-cyan);' : ''}" />
    <div class="post-content-area">
      <div class="post-header">
        <div class="author-info profile-link-trigger" data-username="${authorHandle}" style="cursor: pointer;">
          <span class="author-name">${authorName}</span>
          <span class="author-handle">@${authorHandle}</span>
          ${isExternal ? `
            <span class="external-badge" style="background: rgba(0, 242, 254, 0.15); color: var(--accent-cyan); font-size: 0.75rem; padding: 0.15rem 0.6rem; border-radius: 9999px; font-weight: 600; margin-left: 0.4rem; border: 1px solid rgba(0,242,254,0.3); display: inline-flex; align-items: center; gap: 0.3rem;">
              <i class="fa-solid fa-satellite-dish"></i> Live ${escapeHTML(post.source)}
            </span>
          ` : ''}
          <span style="color: var(--text-muted); margin-left: 0.3rem;">·</span>
          <span class="post-time">${formatTimeAgo(post.createdAt)}</span>
        </div>
      </div>
      <p class="post-body" style="white-space: pre-line;">${escapeHTML(post.content)}</p>
      ${post.imageUrl ? `<img src="${escapeHTML(post.imageUrl)}" alt="Attachment" class="post-image" loading="lazy" />` : ''}
      
      <div class="post-interactions">
        <button class="interaction-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post._id}">
          <i class="icon-heart ${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          <span class="likes-count">${post.likes ? post.likes.length : 0}</span>
        </button>

        <button class="interaction-btn comment-btn" data-post-id="${post._id}" title="Discussion">
          <i class="fa-regular fa-comment"></i>
          <span class="comments-count">${post.commentsCount || 0}</span>
        </button>

        ${isExternal && post.externalLink ? `
          <a href="${post.externalLink}" target="_blank" rel="noopener noreferrer" class="interaction-btn" style="color: var(--accent-cyan); font-weight: 600; text-decoration: none;" title="Open live canonical thread">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Live Thread
          </a>
        ` : ''}

        ${isAuthor && !isExternal ? `
          <button class="interaction-btn delete-btn" data-post-id="${post._id}" title="Delete Post">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        ` : ''}
      </div>
    </div>
  `;

  // Attach interactive events
  const likeBtn = card.querySelector('.like-btn');
  likeBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (isExternal) {
      const countSpan = likeBtn.querySelector('.likes-count');
      const icon = likeBtn.querySelector('.icon-heart');
      const currentCount = parseInt(countSpan.textContent) || 0;
      if (likeBtn.classList.contains('liked')) {
        likeBtn.classList.remove('liked');
        icon.className = 'icon-heart fa-regular fa-heart';
        countSpan.textContent = Math.max(0, currentCount - 1);
      } else {
        likeBtn.classList.add('liked');
        icon.className = 'icon-heart fa-solid fa-heart';
        countSpan.textContent = currentCount + 1;
        showToast(`Reacted to live ${post.source} discussion! ❤️`);
      }
      return;
    }

    try {
      const res = await apiToggleLike(post._id);
      if (res.success) {
        const countSpan = likeBtn.querySelector('.likes-count');
        const icon = likeBtn.querySelector('.icon-heart');
        countSpan.textContent = res.likesCount;
        if (res.isLiked) {
          likeBtn.classList.add('liked');
          icon.className = 'icon-heart fa-solid fa-heart';
          showToast('Liked pulse ❤️');
        } else {
          likeBtn.classList.remove('liked');
          icon.className = 'icon-heart fa-regular fa-heart';
        }
      }
    } catch (err) {
      showToast('Error liking post', true);
    }
  });

  const commentBtn = card.querySelector('.comment-btn');
  commentBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isExternal && post.externalLink) {
      showToast(`Opening live ${post.source} discussion thread!`);
      window.open(post.externalLink, '_blank', 'noopener,noreferrer');
      return;
    }
    if (typeof openPostModal === 'function') openPostModal(post._id);
  });

  if (isAuthor && !isExternal) {
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to completely remove this pulse?')) {
        try {
          await apiDeletePost(post._id);
          card.remove();
          showToast('Pulse deleted successfully');
          if (onDeleteCallback) onDeleteCallback();
        } catch (err) {
          showToast('Could not delete post', true);
        }
      }
    });
  }

  // Click card body to view discussion thread or external link
  card.addEventListener('click', (e) => {
    if (e.target.closest('.interaction-btn') || e.target.closest('.profile-link-trigger') || e.target.closest('a')) return;
    if (isExternal && post.externalLink) {
      showToast(`Opening live ${post.source} discussion thread!`);
      window.open(post.externalLink, '_blank', 'noopener,noreferrer');
      return;
    }
    if (typeof openPostModal === 'function') openPostModal(post._id);
  });

  // Navigate to author profile
  card.querySelectorAll('.profile-link-trigger').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isExternal) {
        showToast(`Verified live creator on ${post.source}`);
        return;
      }
      const username = el.dataset.username;
      if (typeof navigateTo === 'function') navigateTo('profile', username);
    });
  });

  return card;
}

// Render Who To Follow Suggestion Item
function createSuggestionItem(user, isAlreadyFollowing = false) {
  const item = document.createElement('div');
  item.className = 'suggestion-item';
  item.innerHTML = `
    <div class="suggestion-meta profile-link-trigger" data-username="${escapeHTML(user.username)}" style="cursor: pointer;">
      <img src="${user.avatarUrl}" alt="${user.username}" class="avatar" style="width: 40px; height: 40px;" />
      <div>
        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${escapeHTML(user.fullName)}</div>
        <div style="font-size: 0.82rem; color: var(--text-muted);">@${escapeHTML(user.username)}</div>
      </div>
    </div>
    <button class="btn-secondary follow-btn" style="padding: 0.4rem 1rem; font-size: 0.85rem;">
      ${isAlreadyFollowing ? 'Following' : 'Follow'}
    </button>
  `;

  const followBtn = item.querySelector('.follow-btn');
  followBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      const res = await apiToggleFollow(user._id);
      if (res.success) {
        followBtn.textContent = res.isFollowing ? 'Following' : 'Follow';
        showToast(res.message);
        if (typeof reloadFeed === 'function' && window.currentFeedType === 'following') {
          reloadFeed();
        }
      }
    } catch (err) {
      showToast('Error modifying follow status', true);
    }
  });

  item.querySelector('.suggestion-meta').addEventListener('click', () => {
    if (typeof navigateTo === 'function') navigateTo('profile', user.username);
  });

  return item;
}

// Render Profile View Header & Tabs
function createProfileHeaderElement(profileData, currentUserId) {
  const { user, postsCount, followersCount, followingCount } = profileData;
  const isOwnProfile = user._id.toString() === currentUserId.toString();
  const isFollowing = user.followers.some(id => {
    const fId = typeof id === 'object' ? id._id : id;
    return fId.toString() === currentUserId.toString();
  });

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="profile-header-banner" style="${user.coverUrl ? `background-image: url('${escapeHTML(user.coverUrl)}')` : ''}"></div>
    <div class="profile-details-area">
      <div class="profile-top-bar">
        <img src="${escapeHTML(user.avatarUrl)}" alt="${escapeHTML(user.username)}" class="avatar avatar-lg" />
        <div>
          ${isOwnProfile ? `
            <button id="profile-edit-btn" class="btn-secondary" style="border-color: var(--accent-cyan);"><i class="fa-solid fa-user-pen"></i> Edit Profile</button>
          ` : `
            <button id="profile-follow-btn" class="${isFollowing ? 'btn-secondary' : 'btn-primary'}" style="padding: 0.6rem 1.5rem;">
              ${isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          `}
        </div>
      </div>
      
      <div class="profile-names">
        <h2>${escapeHTML(user.fullName)}</h2>
        <p>@${escapeHTML(user.username)}</p>
      </div>

      ${user.bio ? `<p class="profile-bio">${escapeHTML(user.bio)}</p>` : `<p class="profile-bio" style="font-style: italic; color: var(--text-muted);">No bio written yet.</p>`}

      <div class="profile-stats">
        <div class="stat-item"><span class="stat-value">${postsCount}</span> Pulses</div>
        <div class="stat-item"><span class="stat-value" id="profile-followers-count">${followersCount}</span> Followers</div>
        <div class="stat-item"><span class="stat-value">${followingCount}</span> Following</div>
      </div>
    </div>

    <div class="stream-header" style="position: static;">
      <div class="stream-tab active" id="tab-user-posts">Authored Pulses (${postsCount})</div>
      <div class="stream-tab" id="tab-user-likes">Liked Pulses (${profileData.likedPosts ? profileData.likedPosts.length : 0})</div>
    </div>
  `;

  if (isOwnProfile) {
    const editBtn = container.querySelector('#profile-edit-btn');
    editBtn.addEventListener('click', () => {
      if (typeof openEditProfileModal === 'function') openEditProfileModal(user);
    });
  } else {
    const followBtn = container.querySelector('#profile-follow-btn');
    followBtn.addEventListener('click', async () => {
      try {
        const res = await apiToggleFollow(user._id);
        if (res.success) {
          followBtn.textContent = res.isFollowing ? 'Unfollow' : 'Follow';
          followBtn.className = res.isFollowing ? 'btn-secondary' : 'btn-primary';
          container.querySelector('#profile-followers-count').textContent = res.followersCount;
          showToast(res.message);
        }
      } catch (err) {
        showToast('Failed to modify follow connection', true);
      }
    });
  }

  return container;
}
