export interface HookTemplate {
  id: string;
  category: 'Story & Journey' | 'Contrarian Truth' | 'Playbook & How-To' | 'Cheatsheet & Curation' | 'Framework & Systems';
  title: string;
  hook: string;
  template: string;
}

export const HOOK_CATEGORIES = [
  'All',
  'Story & Journey',
  'Contrarian Truth',
  'Playbook & How-To',
  'Cheatsheet & Curation',
  'Framework & Systems'
] as const;

export const HOOK_TEMPLATES: HookTemplate[] = [
  {
    id: 'story-years-ago',
    category: 'Story & Journey',
    title: '3 Years Ago vs. Today',
    hook: '3 years ago, I had 0 experience in [Field/Domain].\nToday, I lead a team of [Number] generating [Milestone].',
    template: `3 years ago, I had 0 experience in [Field/Domain].
Today, I [Key achievement / milestone reached].

Here are the 4 non-obvious lessons that changed everything for me:

1. [Lesson 1: Focus on high-leverage skills]
→ Stop trying to learn everything at once. Pick one painful problem and solve it deeply.

2. [Lesson 2: Consistency over intensity]
→ Doing 30 minutes a day beats a 10-hour sprint followed by burnout.

3. [Lesson 3: Build in public]
→ Sharing your journey builds trust 10x faster than showing off only when you succeed.

4. [Lesson 4: Surround yourself with doers]
→ You don't need a hundred connections; you need 5 people actively building what inspires you.

If you are just starting today, remember:
[Inspirational takeaway sentence].

What's the #1 lesson that transformed your trajectory? Drop it below 👇`
  },
  {
    id: 'story-biggest-mistake',
    category: 'Story & Journey',
    title: 'The Costliest Mistake I Made',
    hook: 'I lost $[Amount] (and [Time/Months]) doing [Common Practice].\nNever again. Here is what happened:',
    template: `I lost [Amount of money or months of time] doing [Mistake or standard industry practice].

Never again. 

Here is what went wrong and how you can avoid it:

The Mistake:
[Brief explanation of what you did and why it sounded good at the time].

What went wrong:
• [Consequence 1]
• [Consequence 2]
• [Consequence 3]

The Pivot:
Instead of [Old way], I started [New better way].

The Result:
Within [Timeframe], [Positive outcome achieved].

Save yourself the headache:
Don't repeat my mistakes. Focus on [Key principle] from Day 1.

Has anyone else learned this the hard way?`
  },
  {
    id: 'contrarian-stop-doing',
    category: 'Contrarian Truth',
    title: 'Stop Doing X (Unpopular Truth)',
    hook: 'Unpopular opinion: Stop doing [Common advice].\nIt’s actually hurting your [Career / Growth / Revenue].',
    template: `Unpopular opinion:
Stop doing [Common advice or trend everyone is repeating].

Everyone says it's essential, but in reality, it's hurting your [Career / Growth / Revenue].

Here is why:

1. [Counter-argument 1]
Most people think [Common belief], but [The reality].

2. [Counter-argument 2]
It creates vanity metrics instead of real [Value / Revenue / Substance].

3. [Counter-argument 3]
The top 1% don't do this. Instead, they focus relentlessly on [The real leverage point].

What to do instead:
→ [Actionable step A]
→ [Actionable step B]
→ [Actionable step C]

Agree or disagree? Let's discuss in the comments.`
  },
  {
    id: 'contrarian-myth-vs-reality',
    category: 'Contrarian Truth',
    title: 'Myth vs. Reality in [Industry]',
    hook: '90% of people believe [Myth].\nThe truth? It is the exact opposite.',
    template: `90% of people believe [Common Myth in your industry].

The truth? It's the exact opposite.

Myth:
"[Quote the standard misconception]"

Reality:
[Reveal the hard truth backed by observation or experience].

Here is why this misconception spreads:
• People look for shortcuts instead of fundamentals.
• Surface-level tutorials ignore edge cases.
• The real work is quiet, repetitive, and unglamorous.

If you want to achieve [Goal], focus on these 3 fundamentals instead:
1. [Core fundamental 1]
2. [Core fundamental 2]
3. [Core fundamental 3]

Bookmark this for when you need a reality check.`
  },
  {
    id: 'playbook-step-by-step',
    category: 'Playbook & How-To',
    title: 'The Step-by-Step Playbook',
    hook: 'How to [Achieve desirable result] in [Timeframe]\n(Without [Major pain point or expensive budget]):',
    template: `How to [Achieve desirable result] in [Timeframe]
(Without [Major pain point, huge budget, or burnout]):

A step-by-step guide you can implement this week:

Step 1: [Preparation / Discovery]
→ Identify your single highest-leverage target.
→ Cut out all unnecessary noise.

Step 2: [Execution / Build]
→ Implement [Specific tactic].
→ Measure [Key metric] daily.

Step 3: [Optimization / Polish]
→ Refine based on early feedback.
→ Automate repetitive steps.

Step 4: [Scale / Amplify]
→ Double down on the 20% that produced 80% of the results.

Total time required: ~[X hours/week].
Expected payoff: [Tangible result].

Found this helpful? Repost ♻️ to help your network execute better.`
  },
  {
    id: 'playbook-steal-my-system',
    category: 'Playbook & How-To',
    title: 'Steal My Exact Daily Routine',
    hook: 'I manage [Major Responsibility] in just [Hours] hours a day.\nSteal my exact schedule breakdown:',
    template: `I manage [Major Responsibility/Project] in just [Number] hours a day.

No 14-hour grind. No burnout.

Steal my exact daily operating rhythm:

🌅 Morning (Deep Work Block):
• 08:00 - 09:30: [Highest-priority single task, no notifications]
• 09:30 - 10:00: [Review metrics, unblock team]

⚡ Afternoon (Execution & Alignment):
• 11:00 - 12:30: [Batch communications, client touchpoints]
• 14:00 - 15:30: [Iterative execution / feature building]

🌙 Evening (Reflection & Planning):
• 16:30 - 17:00: [Write tomorrow's 3 non-negotiable tasks]

The secret isn't working harder.
It's ruthlessly protecting your peak energy hours.

What does your most productive hour look like?`
  },
  {
    id: 'cheatsheet-curated-tools',
    category: 'Cheatsheet & Curation',
    title: 'The Ultimate Cheatsheet / Tool Stack',
    hook: 'I spent 50+ hours testing tools for [Problem].\nHere are the top 6 that will save you 15 hours a week:',
    template: `I spent 50+ hours testing tools for [Problem / Domain].

Most are bloated and overpriced.

Here are the top 6 that actually deliver and save you 15+ hours a week:

1. [Tool Name 1] — [What it does best]
→ Best for: [Specific use case]
→ Alternative: [Free alternative]

2. [Tool Name 2] — [What it does best]
→ Best for: [Specific use case]

3. [Tool Name 3] — [What it does best]
→ Best for: [Specific use case]

4. [Tool Name 4] — [What it does best]
→ Best for: [Specific use case]

5. [Tool Name 5] — [What it does best]
→ Best for: [Specific use case]

Which one is already part of your daily workflow? Let me know 👇`
  },
  {
    id: 'cheatsheet-checklist',
    category: 'Cheatsheet & Curation',
    title: 'The Pre-Launch / Pre-Ship Checklist',
    hook: 'Never ship a [Product/Campaign/Feature] without running this 7-point checklist:',
    template: `Never ship a [Product / Campaign / Feature] without running this 7-point checklist:

Pre-Flight Checks:
✓ 1. [Critical sanity check 1 - e.g. mobile responsiveness]
✓ 2. [Tracking and analytics firing properly]
✓ 3. [Clear single Call-to-Action without distractions]
✓ 4. [Fast load speed and asset optimization]
✓ 5. [Error states and fallback messages tested]
✓ 6. [Clear user onboarding pathway]
✓ 7. [Backup and rollback plan ready]

Skipping even one of these can cost you [Consequence].

Save this post so you have it ready before your next launch 📌`
  },
  {
    id: 'framework-system-breakdown',
    category: 'Framework & Systems',
    title: 'The [X]-Pillar Framework for Growth',
    hook: 'Why do 95% of people fail at [Goal]?\nThey lack a system. Here is the [X]-Pillar framework to fix it:',
    template: `Why do 95% of people fail at [Goal]?

It's almost never a lack of motivation.
It's almost always a lack of a clear system.

Here is the 3-Pillar Framework used by the top 1%:

Pillar 1: Input Clarity
→ Know exactly what inputs produce your desired outputs.
→ Ignore everything else.

Pillar 2: Friction Reduction
→ Make the right habits easy and the wrong habits painful.
→ Set up default environments that force progress.

Pillar 3: Feedback Loops
→ If you can't measure it weekly, you can't improve it.
→ Review every Friday: What worked? What stalled?

Systems beat willpower every single time.

Which pillar needs the most work in your current setup?`
  }
];
