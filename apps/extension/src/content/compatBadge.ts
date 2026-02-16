const BADGE_ID = 'applypilot-compat-badge';

export function removeCompatibilityBadge() {
  document.getElementById(BADGE_ID)?.remove();
}

export function mountCompatibilityBadge() {
  removeCompatibilityBadge();

  const badge = document.createElement('button');
  badge.id = BADGE_ID;
  badge.type = 'button';
  badge.innerHTML = `
    <span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:6px;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#f8fafc;font-size:10px;font-weight:700;line-height:1;">A</span>
    <span>Job Copilot available</span>
  `;
  badge.setAttribute('aria-label', 'Open ApplyPilot copilot side panel');
  badge.style.position = 'fixed';
  badge.style.right = '16px';
  badge.style.bottom = '16px';
  badge.style.zIndex = '2147483647';
  badge.style.padding = '7px 10px';
  badge.style.display = 'inline-flex';
  badge.style.alignItems = 'center';
  badge.style.gap = '8px';
  badge.style.borderRadius = '999px';
  badge.style.border = '1px solid #bfdbfe';
  badge.style.background = 'rgba(255,255,255,0.96)';
  badge.style.color = '#1e3a8a';
  badge.style.fontSize = '12px';
  badge.style.fontWeight = '600';
  badge.style.cursor = 'pointer';
  badge.style.boxShadow = '0 6px 18px rgba(15, 23, 42, 0.14)';
  badge.style.backdropFilter = 'blur(4px)';
  badge.style.transition = 'transform 140ms ease, box-shadow 140ms ease';

  badge.addEventListener('mouseenter', () => {
    badge.style.transform = 'translateY(-1px)';
    badge.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.18)';
  });
  badge.addEventListener('mouseleave', () => {
    badge.style.transform = 'translateY(0)';
    badge.style.boxShadow = '0 6px 18px rgba(15, 23, 42, 0.14)';
  });

  badge.addEventListener('click', () => {
    void chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
  });

  document.body.appendChild(badge);
}
