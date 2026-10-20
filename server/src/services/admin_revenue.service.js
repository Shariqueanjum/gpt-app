const repo = require('../repositories/admin_revenue.repository');

// ============================================================
// Revenue & profit for the admin.
//
//  Actual value   = what the client paid          (user amount + our commission)
//  Paid to users  = what users received
//  Net revenue    = our commission                (ideal, before any losses)
//  Dilution       = referral commission paid (minus clawbacks)
//                   + daily bonus + level-up rewards + other bonuses
//  Net profit     = net revenue
//                   - commission lost on reversed surveys
//                   - net referral commission
//                   - bonuses & rewards
//
// All amounts are POINTS (100 points = $1). The UI shows the dollar value.
// Reversals are counted in the month of the ORIGINAL survey (a survey completed
// in August and reversed in September lowers August). So a past month can still
// go down later; `late_*` shows how much of a period's loss arrived after it ended.
// ============================================================

const num = (v) => parseFloat(v) || 0;
const round2 = (n) => parseFloat(Number(n).toFixed(2));
const sum = (rows, key) => round2(rows.reduce((s, r) => s + num(r[key]), 0));
const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d = 1) => `${y}-${pad(m)}-${pad(d)}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = MONTHS.map((m) => m.slice(0, 3));

// ---------- periods ----------
const periodFor = (granularity, year, index) => {
  if (granularity === 'month') {
    const next = index === 12 ? { y: year + 1, m: 1 } : { y: year, m: index + 1 };
    return { key: ymd(year, index), label: `${MONTHS[index - 1]} ${year}`, short: `${SHORT_MONTHS[index - 1]} ${String(year).slice(2)}`, from: ymd(year, index), to: ymd(next.y, next.m) };
  }
  if (granularity === 'quarter') {
    const startMonth = (index - 1) * 3 + 1;
    const next = startMonth + 3 > 12 ? { y: year + 1, m: startMonth + 3 - 12 } : { y: year, m: startMonth + 3 };
    return { key: ymd(year, startMonth), label: `Q${index} ${year}`, short: `Q${index} ${String(year).slice(2)}`, from: ymd(year, startMonth), to: ymd(next.y, next.m) };
  }
  return { key: ymd(year, 1), label: `${year}`, short: `${year}`, from: ymd(year, 1), to: ymd(year + 1, 1) };
};

const customPeriod = (dateFrom, dateTo) => {
  const end = new Date(`${dateTo}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1); // date_to is inclusive for the admin, exclusive in SQL
  return { key: `${dateFrom}_${dateTo}`, label: `${dateFrom} to ${dateTo}`, short: `${dateFrom} - ${dateTo}`, from: dateFrom, to: end.toISOString().slice(0, 10) };
};

const previousPeriod = (granularity, year, index) => {
  if (granularity === 'month') return index === 1 ? periodFor('month', year - 1, 12) : periodFor('month', year, index - 1);
  if (granularity === 'quarter') return index === 1 ? periodFor('quarter', year - 1, 4) : periodFor('quarter', year, index - 1);
  if (granularity === 'year') return periodFor('year', year - 1, 1);
  return null;
};

// ---------- the profit maths (single source of truth) ----------
const buildTotals = ({ survey = [], reversals = [], clawbacks = [], bonuses = [], adjustments = [], paidWithdrawals = [], includeGlobal }) => {
  const clientValue = sum(survey, 'client_value');
  const userValue = sum(survey, 'user_value');
  const commission = sum(survey, 'commission');

  const reversed = {
    count: reversals.reduce((s, r) => s + r.cnt, 0),
    client_value: sum(reversals, 'client_value'),
    user_value: sum(reversals, 'user_value'),
    commission_lost: sum(reversals, 'commission_lost'),
    // part of the loss that was only reversed AFTER the period ended (so the period went down later)
    late_count: reversals.reduce((s, r) => s + (r.late_cnt || 0), 0),
    late_commission_lost: sum(reversals, 'commission_lost_later'),
  };

  const referralPaid = sum(survey, 'referral_paid');
  const referralClawed = sum(clawbacks, 'clawed_back');
  const referral = {
    paid: referralPaid,
    clawed_back: referralClawed,
    net: round2(referralPaid - referralClawed),
    referred_surveys: survey.reduce((s, r) => s + r.referred_surveys, 0),
    clawback_count: clawbacks.reduce((s, r) => s + r.cnt, 0),
  };

  const pick = (types) => {
    const rows = bonuses.filter((b) => types.includes(b.type));
    return { count: rows.reduce((s, r) => s + r.cnt, 0), points: sum(rows, 'points') };
  };
  const daily = includeGlobal ? pick(['daily_bonus']) : { count: 0, points: 0 };
  const levelUp = includeGlobal ? pick(['level_up_bonus']) : { count: 0, points: 0 };
  const other = includeGlobal ? pick(['bonus', 'promo', 'payment_proof_reward']) : { count: 0, points: 0 };
  const bonusTotal = round2(daily.points + levelUp.points + other.points);

  const profitBeforeBonuses = round2(commission - reversed.commission_lost - referral.net);
  const profit = round2(profitBeforeBonuses - bonusTotal);

  const totals = {
    surveys: survey.reduce((s, r) => s + r.surveys, 0),
    client_value: clientValue,
    user_value: userValue,
    commission,
    effective_commission_rate: clientValue > 0 ? round2((commission / clientValue) * 100) : 0,
    reversals: reversed,
    referral,
    bonuses: { daily, level_up: levelUp, other, total: bonusTotal, included: !!includeGlobal },
    profit_before_bonuses: profitBeforeBonuses,
    profit,
    margin_on_client_value: clientValue > 0 ? round2((profit / clientValue) * 100) : 0,
    commission_kept_pct: commission > 0 ? round2((profit / commission) * 100) : 0,
  };

  if (includeGlobal) {
    const credits = sum(adjustments, 'credits');
    const debits = sum(adjustments, 'debits');
    totals.adjustments = { credits, debits, net: round2(credits - debits) };
    totals.cash_paid_out = { count: paidWithdrawals.reduce((s, r) => s + r.cnt, 0), points: sum(paidWithdrawals, 'points') };
  }
  return totals;
};

// All raw rows for one scope
const loadRows = async (scope, includeGlobal) => {
  const [survey, reversals, clawbacks, bonuses, adjustments, paidWithdrawals] = await Promise.all([
    repo.getSurveyRevenue(scope),
    repo.getSurveyReversals(scope),
    repo.getReferralClawbacks(scope),
    includeGlobal ? repo.getBonuses(scope) : [],
    includeGlobal ? repo.getAdjustments(scope) : [],
    includeGlobal ? repo.getPaidWithdrawals(scope) : [],
  ]);
  return { survey, reversals, clawbacks, bonuses, adjustments, paidWithdrawals };
};

const scopeFor = (period, offerWallId, trunc = null) => ({
  from: period.from, to: period.to, offerWallId: offerWallId || null, trunc,
});

// ---------- public: filter dropdown data ----------
const getMeta = async () => {
  const [walls, years] = await Promise.all([repo.getOfferWalls(), repo.getYearRange()]);
  const nowYear = new Date().getUTCFullYear();
  return {
    offer_walls: walls.map((w) => ({ id: w.id, name: w.name, commission_rate: w.commission_rate, is_active: w.is_active })),
    first_year: Math.min(years.first_year || nowYear, nowYear),
    last_year: Math.max(years.last_year || nowYear, nowYear),
    current: { year: nowYear, month: new Date().getUTCMonth() + 1, quarter: Math.floor(new Date().getUTCMonth() / 3) + 1 },
  };
};

// ---------- public: list of periods for the chart / table ----------
const getTrend = async ({ granularity, year, offer_wall_id }) => {
  const offerWallId = offer_wall_id ? parseInt(offer_wall_id, 10) : null;
  const includeGlobal = !offerWallId;
  const nowYear = new Date().getUTCFullYear();
  let periods;

  if (granularity === 'year') {
    const years = await repo.getYearRange();
    const last = Math.max(years.last_year || nowYear, nowYear);
    const first = Math.max(Math.min(years.first_year || last, last), last - 9);
    periods = Array.from({ length: last - first + 1 }, (_, i) => periodFor('year', first + i, 1));
  } else {
    const y = parseInt(year, 10) || nowYear;
    const count = granularity === 'month' ? 12 : 4;
    periods = Array.from({ length: count }, (_, i) => periodFor(granularity, y, i + 1));
  }

  const scope = { from: periods[0].from, to: periods[periods.length - 1].to, offerWallId, trunc: granularity };
  const raw = await loadRows(scope, includeGlobal);
  const forBucket = (rows, key) => rows.filter((r) => r.bucket === key);

  const data = periods.map((p) => {
    const t = buildTotals({
      survey: forBucket(raw.survey, p.key), reversals: forBucket(raw.reversals, p.key),
      clawbacks: forBucket(raw.clawbacks, p.key), bonuses: forBucket(raw.bonuses, p.key),
      adjustments: forBucket(raw.adjustments, p.key), paidWithdrawals: forBucket(raw.paidWithdrawals, p.key),
      includeGlobal,
    });
    return {
      key: p.key, label: p.label, short: p.short, from: p.from, to: p.to,
      surveys: t.surveys, client_value: t.client_value, user_value: t.user_value, commission: t.commission,
      commission_lost: t.reversals.commission_lost, referral_net: t.referral.net, bonuses_total: t.bonuses.total,
      profit_before_bonuses: t.profit_before_bonuses, profit: t.profit,
    };
  });

  return { granularity, bonuses_included: includeGlobal, periods: data };
};

// ---------- public: everything about ONE period ----------
const getBreakdown = async (q) => {
  const offerWallId = q.offer_wall_id ? parseInt(q.offer_wall_id, 10) : null;
  const includeGlobal = !offerWallId;
  const year = parseInt(q.year, 10);
  const index = parseInt(q.index, 10) || 1;

  const period = q.granularity === 'custom' ? customPeriod(q.date_from, q.date_to) : periodFor(q.granularity, year, index);
  const prev = q.granularity === 'custom' ? null : previousPeriod(q.granularity, year, index);

  const scope = scopeFor(period, offerWallId);
  const [raw, walls, topReferrers, prevRaw, liability] = await Promise.all([
    loadRows(scope, includeGlobal),
    repo.getOfferWalls(),
    repo.getTopReferrers(scope, 5),
    prev ? loadRows(scopeFor(prev, offerWallId), includeGlobal) : null,
    includeGlobal ? repo.getLiabilitySnapshot() : null,
  ]);

  const totals = buildTotals({ ...raw, includeGlobal });

  // One row per client (bonuses can't be assigned to a single client, so they stay out of these rows)
  const byWall = (rows, id) => rows.filter((r) => r.offer_wall_id === id);
  const wallIds = new Set([...raw.survey, ...raw.reversals, ...raw.clawbacks].map((r) => r.offer_wall_id).filter((v) => v !== null && v !== undefined));
  const nameOf = new Map(walls.map((w) => [w.id, w]));
  const byClient = [...wallIds].map((id) => {
    const t = buildTotals({ survey: byWall(raw.survey, id), reversals: byWall(raw.reversals, id), clawbacks: byWall(raw.clawbacks, id), includeGlobal: false });
    const wall = nameOf.get(id);
    return {
      offer_wall_id: id, name: wall ? wall.name : `Client #${id}`, configured_commission_rate: wall ? wall.commission_rate : null,
      surveys: t.surveys, client_value: t.client_value, user_value: t.user_value, commission: t.commission,
      effective_commission_rate: t.effective_commission_rate,
      reversed_count: t.reversals.count, reversed_client_value: t.reversals.client_value, commission_lost: t.reversals.commission_lost,
      referral_paid: t.referral.paid, referral_clawed_back: t.referral.clawed_back, referral_net: t.referral.net,
      profit_before_bonuses: t.profit_before_bonuses,
      margin_on_client_value: t.client_value > 0 ? round2((t.profit_before_bonuses / t.client_value) * 100) : 0,
    };
  }).sort((a, b) => b.profit_before_bonuses - a.profit_before_bonuses);

  const previous = prev && prevRaw ? { label: prev.label, totals: buildTotals({ ...prevRaw, includeGlobal }) } : null;

  return {
    period: { granularity: q.granularity, label: period.label, from: period.from, to_exclusive: period.to },
    offer_wall_id: offerWallId,
    totals,
    previous,
    by_client: byClient,
    top_referrers: topReferrers.map((r) => ({ user_id: r.user_id, username: r.username, public_id: r.public_id, surveys: r.surveys, earned: round2(num(r.earned)) })),
    liability_now: liability,
  };
};

module.exports = { getMeta, getTrend, getBreakdown, buildTotals, periodFor, customPeriod };
