/**
 * Altitude Ecstasy - Vanilla JavaScript Controller
 * Lightweight script handling:
 * 1. Mobile navigation drawer toggle
 * 2. Active navbar link spy on scroll
 * 3. GLightbox initialization (standard, zero-dependency lightbox)
 * 4. Gallery tag filtering & live search
 * 5. Smooth scroll-to-top
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile navigation toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const hamburgerIcon = hamburgerBtn?.querySelector('.hamburger-icon');
  const closeIcon = hamburgerBtn?.querySelector('.close-icon');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      const isClosed = mobileDrawer.classList.contains('hidden');
      if (isClosed) {
        mobileDrawer.classList.remove('hidden');
        hamburgerIcon?.classList.add('hidden');
        closeIcon?.classList.remove('hidden');
      } else {
        mobileDrawer.classList.add('hidden');
        hamburgerIcon?.classList.remove('hidden');
        closeIcon?.classList.add('hidden');
      }
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
        hamburgerIcon?.classList.remove('hidden');
        closeIcon?.classList.add('hidden');
      });
    });
  }

  // 1b. Desktop Menu Dropdown Toggle & Accessibility
  const dropdownWrapper = document.getElementById('nav-dropdown-wrapper');
  const dropdownBtn = document.getElementById('nav-dropdown-btn');
  const dropdownItems = document.querySelectorAll('.nav-dropdown-menu .dropdown-item');

  if (dropdownWrapper && dropdownBtn) {
    const toggleDropdown = (open) => {
      const shouldOpen =
        typeof open === 'boolean' ? open : !dropdownWrapper.classList.contains('is-open');
      dropdownWrapper.classList.toggle('is-open', shouldOpen);
      dropdownBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    };

    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });

    document.addEventListener('click', (e) => {
      if (!dropdownWrapper.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleDropdown(false);
        dropdownBtn.focus();
      }
    });

    dropdownItems.forEach((item) => {
      item.addEventListener('click', () => {
        toggleDropdown(false);
      });
    });
  }

  // 2. Active navbar link scroll spy
  const sections = document.querySelectorAll('section[id]');
  const desktopLinks = document.querySelectorAll(
    '.desktop-nav .nav-link, .nav-dropdown-menu .dropdown-item'
  );

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id') || '';
      }
    });

    let dropdownHasActive = false;
    desktopLinks.forEach((link) => {
      const isCurrent = link.getAttribute('data-section') === current;
      link.classList.toggle('active', isCurrent);
      if (isCurrent && link.classList.contains('dropdown-item')) {
        dropdownHasActive = true;
      }
    });

    if (dropdownBtn) {
      dropdownBtn.classList.toggle('has-active-child', dropdownHasActive);
    }
  });

  // 3. Initialize GLightbox (standard, lightweight vanilla JS lightbox)
  let lightbox = null;
  if (typeof GLightbox !== 'undefined') {
    lightbox = GLightbox({
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      autoplayVideos: false,
      zoomable: true,
      openEffect: 'zoom',
      closeEffect: 'fade',
    });
  }

  // 4. Gallery Filtering, Search & Load More Pagination
  const filterPills = document.querySelectorAll('#filter-pills .pill-btn');
  const searchInput = document.getElementById('gallery-search-input');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const noResultsBox = document.getElementById('no-results-box');
  const resetSearchBtn = document.getElementById('reset-search-btn');
  const loadMoreWrapper = document.getElementById('load-more-wrapper');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const loadMoreCounter = document.getElementById('load-more-counter');

  const BATCH_SIZE = 15;
  let visibleLimit = BATCH_SIZE;
  let activeFilter = 'all';
  let searchTerm = '';

  function applyGalleryFilters() {
    const matchingItems = [];

    galleryItems.forEach((item) => {
      const tags = item.getAttribute('data-tags') || '';
      const title = (item.getAttribute('data-title') || '').toLowerCase();
      const caption = (item.getAttribute('data-caption') || '').toLowerCase();

      const matchesFilter = activeFilter === 'all' || tags.includes('tag-' + activeFilter);
      const matchesSearch =
        searchTerm === '' || title.includes(searchTerm) || caption.includes(searchTerm);

      if (matchesFilter && matchesSearch) {
        matchingItems.push(item);
      } else {
        item.classList.add('hidden');
      }
    });

    const totalMatching = matchingItems.length;
    const limit = Math.min(visibleLimit, totalMatching);

    matchingItems.forEach((item, index) => {
      if (index < limit) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    // Handle "Load more moments" button & counter
    if (loadMoreWrapper) {
      if (totalMatching > limit) {
        loadMoreWrapper.classList.remove('hidden');
        if (loadMoreCounter) {
          const remaining = totalMatching - limit;
          loadMoreCounter.textContent = `Showing ${limit} of ${totalMatching} moments (${remaining} more)`;
        }
      } else {
        loadMoreWrapper.classList.add('hidden');
      }
    }

    // Handle no results empty state
    if (noResultsBox) {
      if (totalMatching === 0) {
        noResultsBox.classList.remove('hidden');
      } else {
        noResultsBox.classList.add('hidden');
      }
    }

    // Refresh lightbox instance so navigation only walks through visible slides
    if (lightbox) {
      lightbox.reload();
    }
  }

  // Load More Button Event: increments in batches of 15
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleLimit += BATCH_SIZE;
      applyGalleryFilters();
    });
  }

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-filter') || 'all';
      visibleLimit = BATCH_SIZE;
      applyGalleryFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = (e.target.value || '').trim().toLowerCase();
      visibleLimit = BATCH_SIZE;
      applyGalleryFilters();
    });
  }

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchTerm = '';
      activeFilter = 'all';
      visibleLimit = BATCH_SIZE;
      filterPills.forEach((p) => {
        p.classList.toggle('active', p.getAttribute('data-filter') === 'all');
      });
      applyGalleryFilters();
    });
  }

  // Handle external navigation with data-filter (e.g. clicking 'Uttarakhand' in navbar)
  document.querySelectorAll('[data-filter="uttarakhand"]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      activeFilter = 'uttarakhand';
      visibleLimit = BATCH_SIZE;
      filterPills.forEach((p) => {
        p.classList.toggle('active', p.getAttribute('data-filter') === 'uttarakhand');
      });
      applyGalleryFilters();
      const galleryEl = document.getElementById('gallery');
      if (galleryEl) {
        galleryEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Initial calculation on page load (shows first 15 photos)
  applyGalleryFilters();

  // 5. Back to top button
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
