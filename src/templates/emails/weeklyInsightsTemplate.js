/**
 * Ghost Guardian — Dynamic Weekly Audience Insights Email Generator
 * Renders complete HTML email with personalized creator metrics,
 * top audience inquiries, content opportunities, and community health.
 */

export function renderWeeklyInsightsEmail({
  creatorName = 'Alex Chen',
  channelName = 'The Long Signal',
  weekStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
  weekEndDate = new Date().toLocaleDateString(),
  metrics = {
    commentsReceived: 847,
    commentsHandled: 784,
    humanMoments: 3,
    threatsBlocked: 4,
    hoursSaved: 12,
    hourlyRate: 50,
  },
  topQuestions = [
    { text: 'Will you do a full episode on panpsychism?', count: 83, trend: '+41% from last week' },
    { text: 'What would count as evidence of understanding in an LLM?', count: 42, trend: '+120% surge this week' },
    { text: 'What did you mean around the 42-minute mark?', count: 19, trend: 'new inquiry this week' },
  ],
  opportunities = [
    {
      title: 'The Combination Problem & Panpsychism Explained',
      mentions: 137,
      suggestedAngle: 'Deep Dive Episode + Short Form Explainer',
    },
  ],
  communityHealth = {
    score: 96,
    trendDelta: '+4',
    toxicityLevel: 'Very Low (0.4%)',
  },
  topCommenters = [
    { name: 'Elena Vance (@elena_v)', detail: 'Active supporter across 60 episodes' },
  ],
  appUrl = 'https://ghostguardian.vercel.app',
} = {}) {
  const dollarValue = (metrics.hoursSaved || 12) * (metrics.hourlyRate || 50);
  const handledPct = metrics.commentsReceived > 0
    ? Math.round((metrics.commentsHandled / metrics.commentsReceived) * 1000) / 10
    : 92.5;

  const questionsHtml = topQuestions
    .slice(0, 3)
    .map(
      (q, idx) => `
      <tr>
        <td style="padding-bottom: 10px;">
          <div style="background-color: #0d0f17; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; padding: 16px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td>
                  <span style="font-size: 13px; font-weight: 700; color: #ffffff; display: block; line-height: 1.4;">
                    ${idx + 1}. "${q.text}"
                  </span>
                  <span style="font-size: 11px; color: #8f97b0; display: block; margin-top: 4px;">
                    ${q.count} mentions · <strong style="color: #34d399;">${q.trend}</strong>
                  </span>
                </td>
                <td align="right" valign="middle" style="padding-left: 12px;">
                  <a href="${appUrl}/app/audience" style="font-size: 11px; font-weight: 600; color: #4de1dc; white-space: nowrap; text-decoration: none;">
                    View all ${q.count} →
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your audience asked about ${topQuestions[0]?.text || 'top topics'} this week</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0f17; font-family: 'Inter', -apple-system, sans-serif;">
  <table align="center" width="100%" style="background-color: #0d0f17; padding: 24px 12px 40px 12px;">
    <tr>
      <td align="center">
        <table width="600" style="max-width: 600px; width: 100%; background-color: #141724; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px; background: linear-gradient(135deg, #141829 0%, #171b30 50%, #1d1833 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <span style="background-color: rgba(77, 225, 220, 0.15); border: 1px solid rgba(77, 225, 220, 0.3); border-radius: 10px; padding: 6px 12px; font-size: 11px; font-weight: bold; color: #4de1dc; letter-spacing: 0.15em; text-transform: uppercase;">
                🛡️ Ghost Guardian
              </span>
              <h1 style="margin: 20px 0 6px 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                Hey ${creatorName},
              </h1>
              <p style="margin: 0; font-size: 14px; color: #e4e7f1;">
                Here's what your audience was talking about this week across <strong>${channelName}</strong>:
              </p>
            </td>
          </tr>

          <!-- Numbers -->
          <tr>
            <td style="padding: 28px 32px 20px 32px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #4de1dc; display: block; margin-bottom: 14px;">
                📊 This Week's Numbers
              </span>

              <!-- Time Saved -->
              <div style="background: linear-gradient(135deg, rgba(77, 225, 220, 0.08) 0%, rgba(52, 211, 153, 0.08) 100%); border: 1px solid rgba(77, 225, 220, 0.25); border-radius: 14px; padding: 18px 20px; margin-bottom: 14px;">
                <table width="100%">
                  <tr>
                    <td>
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #8f97b0; display: block;">⏱️ Time Saved</span>
                      <span style="font-size: 24px; font-weight: 700; color: #ffffff;">${metrics.hoursSaved} hours <span style="font-size: 14px; color: #34d399;">(~$${dollarValue.toLocaleString()} value)</span></span>
                    </td>
                    <td align="right">
                      <a href="${appUrl}/app" style="background-color: #4de1dc; color: #0a0d14; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 10px; text-decoration: none;">View Breakdown →</a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Stats Grid -->
              <table width="100%">
                <tr>
                  <td width="50%" style="padding-right: 6px; padding-bottom: 12px;">
                    <div style="background-color: #0d0f17; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px;">
                      <span style="font-size: 10px; font-weight: 700; color: #8f97b0; display: block;">💬 Comments</span>
                      <span style="font-size: 20px; font-weight: 700; color: #ffffff;">${metrics.commentsReceived}</span>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 6px; padding-bottom: 12px;">
                    <div style="background-color: #0d0f17; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px;">
                      <span style="font-size: 10px; font-weight: 700; color: #8f97b0; display: block;">✅ Handled</span>
                      <span style="font-size: 20px; font-weight: 700; color: #4de1dc;">${metrics.commentsHandled} (${handledPct}%)</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding-right: 6px;">
                    <div style="background-color: #0d0f17; border: 1px solid rgba(192,132,252,0.25); border-radius: 12px; padding: 14px;">
                      <span style="font-size: 10px; font-weight: 700; color: #c084fc; display: block;">🤍 Human Moments</span>
                      <span style="font-size: 20px; font-weight: 700; color: #ffffff;">${metrics.humanMoments} preserved</span>
                    </div>
                  </td>
                  <td width="50%" style="padding-left: 6px;">
                    <div style="background-color: #0d0f17; border: 1px solid rgba(248,113,113,0.2); border-radius: 12px; padding: 14px;">
                      <span style="font-size: 10px; font-weight: 700; color: #f87171; display: block;">🛡️ Threats Blocked</span>
                      <span style="font-size: 20px; font-weight: 700; color: #ffffff;">${metrics.threatsBlocked} quarantined</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Questions -->
          <tr>
            <td style="padding: 20px 32px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #fbbf24; display: block; margin-bottom: 14px;">
                🔥 Top Questions Your Audience Asked
              </span>
              <table width="100%">
                ${questionsHtml}
              </table>
            </td>
          </tr>

          <!-- Content Opportunity -->
          ${
            opportunities.length > 0
              ? `<tr>
            <td style="padding: 20px 32px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #34d399; display: block; margin-bottom: 12px;">
                💡 Top Content Opportunity
              </span>
              <div style="background-color: #0d0f17; border: 1px solid rgba(52,211,153,0.25); border-radius: 14px; padding: 18px;">
                <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #ffffff;">"${opportunities[0].title}"</h3>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #8f97b0;">${opportunities[0].mentions} comments asked for this. Recommended: <strong>${opportunities[0].suggestedAngle}</strong>.</p>
                <a href="${appUrl}/app/audience" style="background-color: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.4); color: #34d399; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 8px; text-decoration: none; display: inline-block;">📁 Save to Content Roadmap</a>
              </div>
            </td>
          </tr>`
              : ''
          }

          <!-- CTA Button -->
          <tr>
            <td style="padding: 16px 32px 32px 32px; text-align: center;">
              <a href="${appUrl}/app/inbox" style="background-color: #4de1dc; color: #0a0d14; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; display: inline-block; text-decoration: none;">
                Open Your Guardian Inbox →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #090b12; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 11px; color: #8f97b0;">
              <p style="margin: 0 0 10px 0; font-style: italic; color: #e4e7f1;">
                "Curiosity before judgment. Connection before correction. Compassion without submission."
              </p>
              <p style="margin: 0 0 10px 0;">Ghost Guardian · Dispatched weekly every Monday at 9:00 AM.</p>
              <a href="${appUrl}/app/settings" style="color: #8f97b0;">Preferences</a> · 
              <a href="${appUrl}/app/settings" style="color: #8f97b0;">Unsubscribe</a> · 
              Ghost Guardian © 2026
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
