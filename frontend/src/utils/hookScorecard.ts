export interface ScorecardCheck {
  id: string;
  label: string;
  passed: boolean;
  tip: string;
}

export interface HookScorecardResult {
  score: number;
  grade: 'Needs Polish' | 'Good' | 'Strong Hook' | 'Viral Grade';
  color: string;
  checks: ScorecardCheck[];
}

export const evaluateHookScore = (caption: string, firstComment: string): HookScorecardResult => {
  if (!caption || caption.trim().length === 0) {
    return {
      score: 0,
      grade: 'Needs Polish',
      color: 'text-gray-400',
      checks: [
        { id: 'length', label: 'Hook before fold (< 210 chars)', passed: false, tip: 'Keep the opening under 210 chars so it is visible before "...see more".' },
        { id: 'spacing', label: 'White space & Line breaks', passed: false, tip: 'Add a blank line after your opening hook.' },
        { id: 'grip', label: 'Numbers, Questions, or Power triggers', passed: false, tip: 'Include numbers, a question, or a strong contrarian statement.' },
        { id: 'links', label: 'Algorithm link protection', passed: true, tip: 'Keep links out of the caption body.' },
        { id: 'cta', label: 'Closing call to action / Question', passed: false, tip: 'End with a question to encourage comments and engagement.' }
      ]
    };
  }

  const lines = caption.split('\n');
  const firstLine = lines[0] || '';

  // 1. Fold check: first 1-2 lines under 210 chars
  const openingLength = firstLine.length;
  const foldPassed = openingLength > 10 && openingLength <= 210;

  // 2. White space spacing check: blank line right after hook or formatted structure
  const spacingPassed = lines.length > 1 && (lines[1].trim() === '' || lines.length >= 3);

  // 3. Grip factors: contains numbers, question mark, or strong trigger words
  const gripPattern = /(\d+|how to|why|lessons?|mistake|secret|truth|framework|stop|unpopular|\?|guide|system)/i;
  const gripPassed = gripPattern.test(caption);

  // 4. Algorithm link check: NO http/https links in caption body
  const hasLinkInCaption = /https?:\/\/[^\s]+/i.test(caption);
  const linksPassed = !hasLinkInCaption;

  // 5. CTA check: question mark near end or words like comment, share, thoughts, agree, below
  const lastLines = lines.slice(-3).join(' ').toLowerCase();
  const ctaPattern = /(\?|drop it|below|thoughts|agree|what do you think|let me know|repost|comment)/i;
  const ctaPassed = ctaPattern.test(lastLines);

  const checks: ScorecardCheck[] = [
    {
      id: 'length',
      label: 'Hook Visibility (< 210 chars)',
      passed: foldPassed,
      tip: foldPassed 
        ? 'Opening line fits cleanly before the LinkedIn desktop fold.' 
        : 'First line is too long (> 210 chars) or too brief. Make it punchy!'
    },
    {
      id: 'spacing',
      label: 'Readability & Line Breaks',
      passed: spacingPassed,
      tip: spacingPassed 
        ? 'Good paragraph spacing prevents a wall of text.' 
        : 'Add empty lines between your hook and body to make it easy to skim.'
    },
    {
      id: 'grip',
      label: 'Hook Grip (Numbers & Triggers)',
      passed: gripPassed,
      tip: gripPassed 
        ? 'Contains persuasive triggers (numbers, curiosity, or how-to).' 
        : 'Add specific numbers (e.g. "3 lessons") or a question to spark curiosity.'
    },
    {
      id: 'links',
      label: 'Algorithm Link Safety',
      passed: linksPassed,
      tip: linksPassed 
        ? (firstComment ? 'Protected: Links placed in first comment for 2x organic reach.' : 'Safe: No outbound links in post caption.') 
        : 'Warning: Outbound links in the caption trigger an algorithm reach penalty. Move it to the First Comment box!'
    },
    {
      id: 'cta',
      label: 'Engagement Call-To-Action (CTA)',
      passed: ctaPassed,
      tip: ctaPassed 
        ? 'Ends with a clear question or prompt to generate comments.' 
        : 'End your post with a closing question to prompt reader comments.'
    }
  ];

  let score = 0;
  if (foldPassed) score += 25;
  if (spacingPassed) score += 20;
  if (gripPassed) score += 20;
  if (linksPassed) score += 20;
  if (ctaPassed) score += 15;

  let grade: 'Needs Polish' | 'Good' | 'Strong Hook' | 'Viral Grade' = 'Needs Polish';
  let color = 'text-red-500';

  if (score >= 90) {
    grade = 'Viral Grade';
    color = 'text-green-600';
  } else if (score >= 75) {
    grade = 'Strong Hook';
    color = 'text-orange-600';
  } else if (score >= 50) {
    grade = 'Good';
    color = 'text-amber-500';
  }

  return {
    score,
    grade,
    color,
    checks
  };
};
