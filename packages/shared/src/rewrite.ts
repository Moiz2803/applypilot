export interface RewriteSuggestion {
  original: string;
  rewritten: string;
  reason: string;
  approved: boolean;
}

export interface RewriterProvider {
  rewriteBullet: (bullet: string, keywords: string[]) => RewriteSuggestion;
}

const ACTION_PREFIXES = ['Delivered', 'Built', 'Improved', 'Streamlined', 'Implemented'];

export class DeterministicStarCarRewriter implements RewriterProvider {
  rewriteBullet(bullet: string, keywords: string[]): RewriteSuggestion {
    const normalized = bullet.replace(/[.]+$/, '').trim();
    const action = ACTION_PREFIXES[normalized.length % ACTION_PREFIXES.length];

    const keywordFragment = keywords.length > 0 ? ` using ${keywords.slice(0, 2).join(' and ')}` : '';
    const rewritten = `${action} ${normalized.toLowerCase()}${keywordFragment}, resulting in measurable process impact.`;

    return {
      original: bullet,
      rewritten,
      reason: 'Reframed bullet in STAR/CAR structure while preserving source fact pattern.',
      approved: false,
    };
  }
}

const defaultRewriter = new DeterministicStarCarRewriter();

export function rewriteBullets(
  bullets: string[],
  missingKeywords: string[],
  provider: RewriterProvider = defaultRewriter,
): RewriteSuggestion[] {
  return bullets.map((bullet) => provider.rewriteBullet(bullet, missingKeywords));
}
