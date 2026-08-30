/**
 * Client behaviour for the writing / notes / projects listing pages:
 * search, tag filters, grid/list toggle, and the "New" badge for recent entries.
 * Runs on load; also listens for astro:page-load in case a ClientRouter is added later.
 */

const FRESH_DAYS = 4;
const VIEW_KEY = 'swm-listing-view';

const cap = (s: string) => s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

let onClick: ((e: MouseEvent) => void) | null = null;
document.addEventListener('click', (e) => onClick?.(e));

function init() {
  const grid = document.getElementById('listing-grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll<HTMLElement>('.entry-card'));
  const search = document.getElementById('listing-search') as HTMLInputElement | null;
  const tagFilters = document.getElementById('tag-filters');
  const activeFilters = document.getElementById('active-filters');
  const filterCount = document.getElementById('filter-count');
  const filterToggle = document.getElementById('filter-toggle');
  const filterPanel = document.getElementById('filter-panel');
  const empty = document.getElementById('listing-empty');
  const shown = document.getElementById('shown');
  const total = document.getElementById('total');

  const active = new Set<string>();
  let query = '';

  // ---- "New" badge + bounce for anything published in the last few days
  const now = Date.now();
  cards.forEach((card) => {
    const d = card.dataset.date;
    if (!d) return;
    const age = (now - new Date(d).getTime()) / 864e5;
    if (age >= 0 && age <= FRESH_DAYS) {
      card.classList.add('entry-card--fresh');
      const badge = document.createElement('span');
      badge.className = 'entry-card__new';
      badge.textContent = 'New';
      card.append(badge);
    }
  });

  // ---- tag filter panel
  const allTags = [...new Set(cards.flatMap((c) => (c.dataset.tags || '').split(',').filter(Boolean)))].sort();
  if (tagFilters) {
    tagFilters.innerHTML = '';
    allTags.forEach((tag) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.tag = tag;
      b.textContent = cap(tag);
      tagFilters.append(b);
    });
  }
  if (total) total.textContent = String(cards.length);

  function apply() {
    let visible = 0;
    cards.forEach((card) => {
      const hay = card.dataset.hay || '';
      const tags = (card.dataset.tags || '').split(',');
      const ok = (!query || hay.includes(query)) && [...active].every((t) => tags.includes(t));
      card.hidden = !ok;
      if (ok) visible++;
    });
    if (shown) shown.textContent = String(visible);
    empty?.classList.toggle('is-visible', visible === 0);

    tagFilters?.querySelectorAll<HTMLElement>('.chip').forEach((c) => c.classList.toggle('chip--on', active.has(c.dataset.tag || '')));
    if (filterCount) {
      filterCount.textContent = String(active.size);
      filterCount.classList.toggle('is-visible', active.size > 0);
    }
    if (activeFilters) {
      activeFilters.innerHTML = '';
      active.forEach((tag) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip chip--on';
        b.dataset.remove = tag;
        b.setAttribute('aria-label', `Remove filter ${cap(tag)}`);
        b.innerHTML = `${cap(tag)}<span aria-hidden="true">×</span>`;
        activeFilters.append(b);
      });
    }
  }

  function toggleTag(tag: string) {
    active.has(tag) ? active.delete(tag) : active.add(tag);
    apply();
  }

  // ---- grid / list toggle, remembered per browser
  const viewGrid = document.getElementById('view-grid');
  const viewList = document.getElementById('view-list');
  function setView(v: 'grid' | 'list') {
    try { localStorage.setItem(VIEW_KEY, v); } catch {}
    viewGrid?.setAttribute('aria-pressed', String(v === 'grid'));
    viewList?.setAttribute('aria-pressed', String(v === 'list'));
    grid!.classList.toggle('entry-grid--list', v === 'list');
  }
  let saved: string | null = null;
  try { saved = localStorage.getItem(VIEW_KEY); } catch {}
  setView(saved === 'list' ? 'list' : 'grid');
  viewGrid?.addEventListener('click', () => setView('grid'));
  viewList?.addEventListener('click', () => setView('list'));

  // ---- events (delegated so re-rendered chips keep working; one listener, rebound per page)
  onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const tagEl = target.closest<HTMLElement>('[data-tag]');
    if (tagEl) { e.preventDefault(); toggleTag(tagEl.dataset.tag!); return; }
    const removeEl = target.closest<HTMLElement>('[data-remove]');
    if (removeEl) { active.delete(removeEl.dataset.remove!); apply(); return; }

    if (filterToggle && filterPanel) {
      if (filterToggle.contains(target)) {
        filterPanel.hidden = !filterPanel.hidden;
        filterToggle.setAttribute('aria-expanded', String(!filterPanel.hidden));
      } else if (!filterPanel.contains(target)) {
        filterPanel.hidden = true;
        filterToggle.setAttribute('aria-expanded', 'false');
      }
    }
  };

  document.getElementById('clear-filters')?.addEventListener('click', () => {
    active.clear();
    query = '';
    if (search) search.value = '';
    apply();
  });

  search?.addEventListener('input', () => {
    query = search.value.toLowerCase().trim();
    apply();
  });

  apply();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
document.addEventListener('astro:page-load', init);
