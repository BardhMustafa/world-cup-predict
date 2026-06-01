// send-reminders — daily email to users with open matches to predict
//
// Finds matches that just unlocked (kickoff 12h–36h from now), then
// emails every user who hasn't yet submitted a prediction for them.
//
// Required secrets (Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY   — from resend.com
//
// Schedule: run daily at 08:00 UTC via pg_cron (see migration 0012).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM = 'Kupa e Botës <noreply@kupaebotes.com>';
const SITE = 'https://kupaebotes.com';

const stageSq: Record<string, string> = {
  group: 'Faza Grupeve',
  round_of_32: 'Raundi i 32',
  round_of_16: 'Tetëshja',
  quarter_final: 'Çerekfinale',
  semi_final: 'Gjysmëfinale',
  third_place: 'Vendi i Tretë',
  final: 'Finalja',
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString('sq', { hour: '2-digit', minute: '2-digit', hour12: false });

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Matches newly open today: kickoff 12h–36h from now
  const now = new Date();
  const from = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const to   = new Date(now.getTime() + 36 * 60 * 60 * 1000);

  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_team, away_team, home_code, away_code, kickoff, stage, grp')
    .eq('status', 'scheduled')
    .gte('kickoff', from.toISOString())
    .lte('kickoff', to.toISOString())
    .order('kickoff');

  if (!matches || matches.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: 'no open matches today' }), { status: 200 });
  }

  // All predictions already filed for today's matches
  const matchIds = matches.map((m) => m.id);
  const { data: existing } = await supabase
    .from('predictions')
    .select('user_id, match_id')
    .in('match_id', matchIds);

  const predicted = new Set((existing ?? []).map((p) => `${p.user_id}:${p.match_id}`));

  // All users
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  let sent = 0;
  const errors: string[] = [];

  for (const user of users) {
    if (!user.email) continue;

    // Only include matches this user hasn't predicted yet
    const unpredicted = matches.filter((m) => !predicted.has(`${user.id}:${m.id}`));
    if (unpredicted.length === 0) continue;

    const matchRows = unpredicted.map((m) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:13px;">
          ${stageSq[m.stage] ?? m.stage}${m.grp ? ` · Grupi ${m.grp}` : ''}
        </td>
        <td style="padding:10px 16px;border-bottom:1px solid #1e293b;font-weight:600;text-align:right;">${m.home_team}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #1e293b;color:#22c55e;font-weight:700;text-align:center;">vs</td>
        <td style="padding:10px 16px;border-bottom:1px solid #1e293b;font-weight:600;">${m.away_team}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:13px;text-align:right;">ora ${fmt(m.kickoff)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;overflow:hidden;">

        <!-- header -->
        <tr><td style="background:#0f172a;padding:28px 32px;border-bottom:1px solid #22c55e;">
          <span style="font-size:13px;font-weight:700;letter-spacing:2px;color:#22c55e;">KUPA E BOTËS · MMXXVI</span>
          <h1 style="margin:8px 0 0;font-size:24px;color:#f8fafc;">Parashiko ndeshjet e sotme ⚽</h1>
        </td></tr>

        <!-- body -->
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 24px;color:#94a3b8;line-height:1.6;">
            Këto ndeshje janë hapur për parashikim. Ke deri 12 orë para nisjes së çdo ndeshje.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0">
            ${matchRows}
          </table>

          <div style="margin-top:32px;text-align:center;">
            <a href="${SITE}/fixtures"
               style="display:inline-block;background:#22c55e;color:#0f172a;font-weight:700;font-size:15px;
                      padding:14px 32px;border-radius:8px;text-decoration:none;">
              Parashiko Tani →
            </a>
          </div>
        </td></tr>

        <!-- footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid #0f172a;text-align:center;">
          <p style="margin:0;font-size:12px;color:#475569;">
            ${SITE} · Çregjistrohu nga <a href="${SITE}/profili" style="color:#475569;">profili yt</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: user.email,
        subject: `⚽ ${unpredicted.length} ndeshje hapur — parashiko tani!`,
        html,
      }),
    });

    if (res.ok) sent++;
    else errors.push(`${user.email}: ${await res.text()}`);
  }

  return new Response(JSON.stringify({ sent, errors }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
});
