export interface LegalDoc {
  titleKey: string;
  lastUpdated: string;
  sections: {
    headingKey: string;
    bodyKey: string;
  }[];
}

export const LEGAL_PAGES: Record<'privacy' | 'terms' | 'refund', LegalDoc> = {
  privacy: {
    titleKey: 'privacyTitle',
    lastUpdated: '2026-08-20',
    sections: [
      { headingKey: 'privacySec1Title', bodyKey: 'privacySec1Body' },
      { headingKey: 'privacySec2Title', bodyKey: 'privacySec2Body' },
      { headingKey: 'privacySec3Title', bodyKey: 'privacySec3Body' },
      { headingKey: 'privacySec4Title', bodyKey: 'privacySec4Body' },
    ]
  },
  terms: {
    titleKey: 'termsTitle',
    lastUpdated: '2026-08-20',
    sections: [
      { headingKey: 'termsSec1Title', bodyKey: 'termsSec1Body' },
      { headingKey: 'termsSec2Title', bodyKey: 'termsSec2Body' },
      { headingKey: 'termsSec3Title', bodyKey: 'termsSec3Body' },
      { headingKey: 'termsSec4Title', bodyKey: 'termsSec4Body' },
    ]
  },
  refund: {
    titleKey: 'refundTitle',
    lastUpdated: '2026-08-20',
    sections: [
      { headingKey: 'refundSec1Title', bodyKey: 'refundSec1Body' },
      { headingKey: 'refundSec2Title', bodyKey: 'refundSec2Body' },
      { headingKey: 'refundSec3Title', bodyKey: 'refundSec3Body' },
    ]
  }
};
