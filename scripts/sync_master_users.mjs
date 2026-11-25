import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const REPO = process.env.SHARED_STORAGE_REPO || 'pocomon9/green-status';
const GH_PAT = process.env.GH_PAT || '';
const MSG = process.argv[2] || 'sync master users.json [skip ci]';

function loadLocal() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function mergeUser(a, b) {
  if (!a) return b;
  if (!b) return a;
  const aPs = a.playerState || {};
  const bPs = b.playerState || {};
  const aTs = Number(a.lastSaveAt || aPs.lastSaveTimestamp || 0);
  const bTs = Number(b.lastSaveAt || bPs.lastSaveTimestamp || 0);
  const newer = bTs >= aTs ? b : a;
  const older = bTs >= aTs ? a : b;

  const finalReferredBy = a.referredBy || aPs.referrals?.referredBy || b.referredBy || bPs.referrals?.referredBy || null;

  const claimedSet = new Set([
    ...(Array.isArray(aPs.claimedMissionIds) ? aPs.claimedMissionIds : []),
    ...(Array.isArray(bPs.claimedMissionIds) ? bPs.claimedMissionIds : []),
  ]);
  for (const m of Array.isArray(aPs.missions) ? aPs.missions : []) {
    if (m?.claimed && m?.id) claimedSet.add(m.id);
  }
  for (const m of Array.isArray(bPs.missions) ? bPs.missions : []) {
    if (m?.claimed && m?.id) claimedSet.add(m.id);
  }

  const msnMap = new Map();
  for (const m of Array.isArray(older.playerState?.missions) ? older.playerState.missions : []) {
    if (m?.id) msnMap.set(m.id, { ...m });
  }
  for (const m of Array.isArray(newer.playerState?.missions) ? newer.playerState.missions : []) {
    if (!m?.id) continue;
    const prev = msnMap.get(m.id);
    const isClaimed = Boolean(prev?.claimed || m.claimed || claimedSet.has(m.id));
    msnMap.set(m.id, {
      ...(prev || {}),
      ...m,
      currentCount: Math.max(Number(prev?.currentCount || 0), Number(m.currentCount || 0)),
      completed: Boolean(prev?.completed || m.completed || isClaimed),
      claimed: isClaimed,
    });
  }
  for (const id of claimedSet) {
    const m = msnMap.get(id);
    if (m) {
      m.completed = true;
      m.claimed = true;
    }
  }

  const aRefs = aPs.referrals || {};
  const bRefs = bPs.referrals || {};
  const mergedRecruits = [...(Array.isArray(aRefs.recruits) ? aRefs.recruits : [])];
  for (const r of Array.isArray(bRefs.recruits) ? bRefs.recruits : []) {
    if (!mergedRecruits.some((x) => (r.id && x.id === r.id) || (r.email && x.email && x.email.toLowerCase() === r.email.toLowerCase()))) {
      mergedRecruits.push(r);
    }
  }
  const mergedMilestones = Array.from(
    new Set([...(Array.isArray(aRefs.claimedMilestones) ? aRefs.claimedMilestones : []), ...(Array.isArray(bRefs.claimedMilestones) ? bRefs.claimedMilestones : [])])
  );

  const nPs = newer.playerState || {};
  const nRefs = nPs.referrals || {};
  return {
    ...older,
    ...newer,
    referredBy: finalReferredBy,
    lastSaveAt: Math.max(aTs, bTs),
    lastLoginAt: Math.max(Number(a.lastLoginAt || 0), Number(b.lastLoginAt || 0)),
    playerState: {
      ...nPs,
      claimedMissionIds: Array.from(claimedSet),
      missions: msnMap.size > 0 ? Array.from(msnMap.values()) : nPs.missions,
      referrals: {
        ...nRefs,
        referredBy: finalReferredBy,
        hasClaimedWelcomeBonus: Boolean(finalReferredBy || nRefs.hasClaimedWelcomeBonus),
        recruits: mergedRecruits,
        totalRecruits: Math.max(Number(aRefs.totalRecruits || 0), Number(bRefs.totalRecruits || 0), mergedRecruits.filter((r) => (r.tier || 1) === 1).length),
        networkTotalCitizens: Math.max(Number(aRefs.networkTotalCitizens || 0), Number(bRefs.networkTotalCitizens || 0), mergedRecruits.length),
        claimedMilestones: mergedMilestones,
        lifetimeCommissionGreen: Math.max(Number(aRefs.lifetimeCommissionGreen || 0), Number(bRefs.lifetimeCommissionGreen || 0)),
        lastDailyStipendClaimTimestamp: Math.max(Number(aRefs.lastDailyStipendClaimTimestamp || 0), Number(bRefs.lastDailyStipendClaimTimestamp || 0)),
        lastDailyRoyaltyClaimTimestamp: Math.max(Number(aRefs.lastDailyRoyaltyClaimTimestamp || 0), Number(bRefs.lastDailyRoyaltyClaimTimestamp || 0)),
      },
      lastSaveTimestamp: Math.max(aTs, bTs),
    },
  };
}

async function run() {
  if (!GH_PAT) return;
  const headers = {
    Authorization: `Bearer ${GH_PAT}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Neon-Sync-Script',
  };

  let remote = {};
  let sha = '';
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/users.json?t=${Date.now()}`, { headers });
    if (res.ok) {
      const json = await res.json();
      sha = json.sha || '';
      if (json.content) {
        remote = JSON.parse(Buffer.from(json.content.replace(/\n/g, ''), 'base64').toString('utf-8'));
      }
    }
  } catch {}

  const local = loadLocal();
  const merged = {};
  const keys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  for (const k of keys) {
    merged[k] = mergeUser(local[k], remote[k]);
  }

  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(merged, null, 2), 'utf-8');

  const content = Buffer.from(JSON.stringify(merged, null, 2), 'utf-8').toString('base64');
  const payload = { message: MSG, content };
  if (sha) payload.sha = sha;

  await fetch(`https://api.github.com/repos/${REPO}/contents/users.json`, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

run();
