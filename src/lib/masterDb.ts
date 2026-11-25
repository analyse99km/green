import fs from 'fs';
import path from 'path';

export const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
export const CATALOG_FILE = path.join(process.cwd(), 'data', 'catalog.json');
export const MASTER_STORAGE_REPO = 'pocomon9/green-status';

function getMasterPat(): string {
  return process.env.GH_PAT || process.env.MASTER_PAT || '';
}

export function loadLocalUsers(): Record<string, any> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load local users:', err);
  }
  return {};
}

export function saveLocalUsers(users: Record<string, any>): void {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local users:', err);
  }
}

export function cleanReferralInput(raw: string): string {
  if (!raw) return '';
  let str = String(raw).trim();
  if (str.includes('start=')) {
    str = str.split('start=')[1].split('&')[0];
  } else if (str.includes('/start ')) {
    str = str.split('/start ')[1].split(' ')[0];
  }
  return str.trim().toUpperCase();
}

export function matchesReferral(referredBy: string, user: any, userEmail: string): boolean {
  if (!referredBy || !user) return false;
  const ref = cleanReferralInput(referredBy);
  if (!ref) return false;

  const stripped = ref.replace(/^(REF[_-]|NEON[_-]|TG[_-])+/, '');
  const tgCandidate = stripped.replace(/[^0-9]/g, '');

  const myCode = (user.userReferralCode || user.playerState?.referrals?.referralCode || '').toUpperCase();
  const myCodeStripped = myCode.replace(/^(REF[_-]|NEON[_-]|TG[_-])+/, '');
  const myTgId = String(user.telegramId || '').toUpperCase();
  const myUserId = String(user.userId || user.playerState?.id || '').toUpperCase();
  const myEmail = String(userEmail || user.email || '').toUpperCase();
  const myName = String(user.name || user.playerState?.name || '').toUpperCase();
  const myUsername = String(user.username || '').toUpperCase();

  return (
    (myCode !== '' && (myCode === ref || myCode === stripped || (myCodeStripped !== '' && myCodeStripped === stripped) || (stripped.length >= 3 && myCode.includes(stripped)))) ||
    (myTgId !== '' && (myTgId === ref || myTgId === stripped || (tgCandidate !== '' && myTgId === tgCandidate))) ||
    (myUserId !== '' && (myUserId === ref || myUserId === stripped || myUserId.includes(ref))) ||
    (myEmail !== '' && myEmail === ref) ||
    (myUsername !== '' && (myUsername === ref || `@${myUsername}` === ref)) ||
    (myName !== '' && myName === ref)
  );
}

export function findRecruiterEmail(users: Record<string, any>, rawRef: string): string | null {
  if (!rawRef) return null;
  for (const [em, u] of Object.entries(users)) {
    if (matchesReferral(rawRef, u, em)) {
      return em;
    }
  }
  return null;
}

/**
 * Monotonically merges two user records so claimed missions, sponsor attribution,
 * recruits, milestones, and timestamps are NEVER lost or reverted by an older snapshot.
 */
export function mergeUserRecords(baseUser: any, incomingUser: any, preferIncomingStats = false): any {
  if (!baseUser) return incomingUser;
  if (!incomingUser) return baseUser;

  const basePs = baseUser.playerState || {};
  const incPs = incomingUser.playerState || {};

  const baseTs = Number(baseUser.lastSaveAt || basePs.lastSaveTimestamp || 0);
  const incTs = Number(incomingUser.lastSaveAt || incPs.lastSaveTimestamp || 0);
  const incIsNewer = preferIncomingStats ? incTs >= baseTs : incTs > baseTs;

  // 1. Irrevocable Sponsor attribution (once referredBy is set, NEVER overwrite with null/empty)
  const baseRefBy = baseUser.referredBy || basePs.referrals?.referredBy || null;
  const incRefBy = incomingUser.referredBy || incPs.referrals?.referredBy || null;
  const finalReferredBy = incRefBy || baseRefBy || null;

  // 2. Irrevocable Claimed Mission Ledger (union across claimedMissionIds + m.claimed)
  const claimedSet = new Set<string>([
    ...(Array.isArray(basePs.claimedMissionIds) ? basePs.claimedMissionIds : []),
    ...(Array.isArray(incPs.claimedMissionIds) ? incPs.claimedMissionIds : []),
  ]);
  for (const m of Array.isArray(basePs.missions) ? basePs.missions : []) {
    if (m?.claimed && m?.id) claimedSet.add(m.id);
  }
  for (const m of Array.isArray(incPs.missions) ? incPs.missions : []) {
    if (m?.claimed && m?.id) claimedSet.add(m.id);
  }

  // Merge missions array preserving max count and irrevocable completed/claimed flags
  const msnMap = new Map<string, any>();
  const primaryMissions = incIsNewer ? (incPs.missions || basePs.missions || []) : (basePs.missions || incPs.missions || []);
  const secondaryMissions = incIsNewer ? (basePs.missions || []) : (incPs.missions || []);

  for (const m of Array.isArray(secondaryMissions) ? secondaryMissions : []) {
    if (m?.id) msnMap.set(m.id, { ...m });
  }
  for (const m of Array.isArray(primaryMissions) ? primaryMissions : []) {
    if (!m?.id) continue;
    const prev = msnMap.get(m.id);
    const isClaimed = Boolean(prev?.claimed || m.claimed || claimedSet.has(m.id));
    const isCompleted = Boolean(prev?.completed || m.completed || isClaimed);
    msnMap.set(m.id, {
      ...(prev || {}),
      ...m,
      currentCount: Math.max(Number(prev?.currentCount || 0), Number(m.currentCount || 0)),
      completed: isCompleted,
      claimed: isClaimed,
    });
  }
  for (const claimedId of claimedSet) {
    const existing = msnMap.get(claimedId);
    if (existing) {
      existing.completed = true;
      existing.claimed = true;
    }
  }
  const mergedMissions = Array.from(msnMap.values());
  const mergedClaimedIds = Array.from(claimedSet);

  // 3. Monotonic Referrals Merge
  const baseRefs = basePs.referrals || {};
  const incRefs = incPs.referrals || {};

  const mergedRecruits = [...(Array.isArray(baseRefs.recruits) ? baseRefs.recruits : [])];
  for (const r of Array.isArray(incRefs.recruits) ? incRefs.recruits : []) {
    const idx = mergedRecruits.findIndex(
      (ex: any) =>
        (r.id && ex.id === r.id) ||
        (r.email && ex.email && ex.email.toLowerCase() === r.email.toLowerCase())
    );
    if (idx === -1) {
      mergedRecruits.push(r);
    } else if (incIsNewer) {
      mergedRecruits[idx] = {
        ...mergedRecruits[idx],
        ...r,
        totalGeneratedGreen: Math.max(Number(mergedRecruits[idx].totalGeneratedGreen || 0), Number(r.totalGeneratedGreen || 0)),
      };
    }
  }

  const mergedMilestones = Array.from(
    new Set([
      ...(Array.isArray(baseRefs.claimedMilestones) ? baseRefs.claimedMilestones : []),
      ...(Array.isArray(incRefs.claimedMilestones) ? incRefs.claimedMilestones : []),
    ])
  );

  // Use incoming unclaimedCommissionGreen when incoming is newer (so Till collection persists),
  // otherwise keep max
  const mergedUnclaimedCommission = incIsNewer
    ? Number(incRefs.unclaimedCommissionGreen ?? baseRefs.unclaimedCommissionGreen ?? 0)
    : Math.max(Number(baseRefs.unclaimedCommissionGreen || 0), Number(incRefs.unclaimedCommissionGreen || 0));

  const mergedReferrals = {
    ...baseRefs,
    ...(incIsNewer ? incRefs : {}),
    referralCode: incRefs.referralCode || baseRefs.referralCode || incomingUser.userReferralCode || baseUser.userReferralCode,
    referredBy: finalReferredBy,
    hasClaimedWelcomeBonus: Boolean(finalReferredBy || baseRefs.hasClaimedWelcomeBonus || incRefs.hasClaimedWelcomeBonus),
    recruits: mergedRecruits,
    totalRecruits: Math.max(Number(baseRefs.totalRecruits || 0), Number(incRefs.totalRecruits || 0), mergedRecruits.filter((r: any) => (r.tier || 1) === 1).length),
    networkTotalCitizens: Math.max(Number(baseRefs.networkTotalCitizens || 0), Number(incRefs.networkTotalCitizens || 0), mergedRecruits.length),
    claimedMilestones: mergedMilestones,
    unclaimedCommissionGreen: mergedUnclaimedCommission,
    lifetimeCommissionGreen: Math.max(Number(baseRefs.lifetimeCommissionGreen || 0), Number(incRefs.lifetimeCommissionGreen || 0)),
    lastDailyStipendClaimTimestamp: Math.max(
      Number(baseRefs.lastDailyStipendClaimTimestamp || 0),
      Number(incRefs.lastDailyStipendClaimTimestamp || 0)
    ),
    lastDailyRoyaltyClaimTimestamp: Math.max(
      Number(baseRefs.lastDailyRoyaltyClaimTimestamp || 0),
      Number(incRefs.lastDailyRoyaltyClaimTimestamp || 0)
    ),
  };

  // 4. Daily Combo Progress merge
  const baseCombo = basePs.dailyComboProgress;
  const incCombo = incPs.dailyComboProgress;
  let mergedCombo = incIsNewer ? (incCombo || baseCombo) : (baseCombo || incCombo);
  if (baseCombo && incCombo && baseCombo.date === incCombo.date) {
    mergedCombo = {
      date: baseCombo.date,
      upgradedCardIds: Array.from(new Set([...(baseCombo.upgradedCardIds || []), ...(incCombo.upgradedCardIds || [])])),
      claimed: Boolean(baseCombo.claimed || incCombo.claimed),
    };
  }

  // 5. DreamCards merge (monotonic card levels)
  const mergedCards: Record<string, number> = { ...(basePs.dreamCards || {}) };
  for (const [cid, lvl] of Object.entries(incPs.dreamCards || {})) {
    mergedCards[cid] = Math.max(Number(mergedCards[cid] || 0), Number(lvl || 0));
  }

  const winningPs = incIsNewer ? { ...basePs, ...incPs } : { ...incPs, ...basePs };
  const mergedPlayerState = {
    ...winningPs,
    missions: mergedMissions.length > 0 ? mergedMissions : winningPs.missions,
    claimedMissionIds: mergedClaimedIds,
    referrals: mergedReferrals,
    dreamCards: mergedCards,
    dailyComboProgress: mergedCombo,
    lastSaveTimestamp: Math.max(baseTs, incTs),
  };

  const winningUser = incIsNewer ? { ...baseUser, ...incomingUser } : { ...incomingUser, ...baseUser };
  return {
    ...winningUser,
    passwordHash: winningUser.passwordHash || baseUser.passwordHash || incomingUser.passwordHash,
    salt: winningUser.salt || baseUser.salt || incomingUser.salt,
    userReferralCode: incomingUser.userReferralCode || baseUser.userReferralCode || mergedReferrals.referralCode,
    referredBy: finalReferredBy,
    playerState: mergedPlayerState,
    lastSaveAt: Math.max(Number(baseUser.lastSaveAt || 0), Number(incomingUser.lastSaveAt || 0)),
    lastLoginAt: Math.max(Number(baseUser.lastLoginAt || 0), Number(incomingUser.lastLoginAt || 0)),
  };
}

/**
 * Reconciles Tier 1 (Direct) and Tier 2..5 (Indirect) recruits across the entire users map.
 */
export function reconcileAllReferrals(users: Record<string, any>, defaultBounty = 100): boolean {
  let modified = false;

  // Build quick lookup: key -> list of direct recruits
  const directChildrenMap = new Map<string, Array<{ key: string; user: any }>>();

  for (const [recruiterKey, recruiter] of Object.entries(users)) {
    if (!recruiter.playerState) recruiter.playerState = {};
    if (!recruiter.playerState.referrals) {
      recruiter.playerState.referrals = {
        referralCode: recruiter.userReferralCode || `NEON-${Date.now().toString(36).toUpperCase()}`,
        recruits: [],
        totalRecruits: 0,
        networkTotalCitizens: 0,
        unclaimedCommissionGreen: 0,
        lifetimeCommissionGreen: 0,
        claimedMilestones: [],
      };
    }
    if (!Array.isArray(recruiter.playerState.referrals.recruits)) {
      recruiter.playerState.referrals.recruits = [];
    }

    const recruits = recruiter.playerState.referrals.recruits;
    const directChildren: Array<{ key: string; user: any }> = [];

    for (const [candidateKey, candidate] of Object.entries(users)) {
      if (candidateKey.toLowerCase() === recruiterKey.toLowerCase()) continue;
      const ref = candidate.referredBy || candidate.playerState?.referrals?.referredBy;
      if (ref && matchesReferral(ref, recruiter, recruiterKey)) {
        directChildren.push({ key: candidateKey, user: candidate });

        const alreadyIdx = recruits.findIndex(
          (r: any) =>
            (candidate.userId && r.id === candidate.userId) ||
            (candidate.playerState?.id && r.id === candidate.playerState.id) ||
            (r.email && candidate.email && r.email.toLowerCase() === candidate.email.toLowerCase()) ||
            (r.email && r.email.toLowerCase() === candidateKey.toLowerCase()) ||
            (candidate.telegramId && String(r.telegramId) === String(candidate.telegramId))
        );

        if (alreadyIdx === -1) {
          recruits.unshift({
            id: candidate.userId || candidateKey,
            name: candidate.name || candidate.playerState?.name || candidateKey.split('@')[0],
            email: candidate.email || candidateKey,
            joinedAt: candidate.createdAt || Date.now(),
            level: candidate.level || candidate.playerState?.level || 1,
            tier: 1,
            dailyGameplayEarned: 150,
            totalGeneratedGreen: 50,
            lastActive: 'Active Operative',
          });
          recruiter.playerState.referrals.unclaimedCommissionGreen =
            (recruiter.playerState.referrals.unclaimedCommissionGreen || 0) + defaultBounty;
          recruiter.playerState.referrals.lifetimeCommissionGreen =
            (recruiter.playerState.referrals.lifetimeCommissionGreen || 0) + defaultBounty;
          modified = true;
        }
      }
    }
    directChildrenMap.set(recruiterKey, directChildren);
  }

  // BFS for Tier 2..Tier 5 cascading network members + count updates
  for (const [recruiterKey, recruiter] of Object.entries(users)) {
    const recruits = recruiter.playerState.referrals.recruits;
    const visited = new Set<string>([recruiterKey.toLowerCase()]);
    let frontier = [...(directChildrenMap.get(recruiterKey) || [])];
    for (const f of frontier) visited.add(f.key.toLowerCase());

    for (let tier = 2; tier <= 5; tier++) {
      const nextFrontier: Array<{ key: string; user: any }> = [];
      for (const node of frontier) {
        for (const child of directChildrenMap.get(node.key) || []) {
          const lower = child.key.toLowerCase();
          if (visited.has(lower)) continue;
          visited.add(lower);
          nextFrontier.push(child);

          const cUser = child.user;
          const already = recruits.some(
            (r: any) =>
              (cUser.userId && r.id === cUser.userId) ||
              (r.email && (r.email.toLowerCase() === lower || (cUser.email && r.email.toLowerCase() === cUser.email.toLowerCase())))
          );
          if (!already) {
            recruits.push({
              id: cUser.userId || child.key,
              name: cUser.name || cUser.playerState?.name || child.key.split('@')[0],
              email: cUser.email || child.key,
              joinedAt: cUser.createdAt || Date.now(),
              level: cUser.level || cUser.playerState?.level || 1,
              tier,
              dailyGameplayEarned: 100,
              totalGeneratedGreen: 20,
              lastActive: `Tier ${tier} Operative`,
            });
            modified = true;
          }
        }
      }
      frontier = nextFrontier;
      if (frontier.length === 0) break;
    }

    const tier1Count = recruits.filter((r: any) => (r.tier || 1) === 1).length;
    const effTotal = Math.max(Number(recruiter.playerState.referrals.totalRecruits || 0), tier1Count);
    const effNetwork = Math.max(Number(recruiter.playerState.referrals.networkTotalCitizens || 0), recruits.length);

    if (
      recruiter.playerState.referrals.totalRecruits !== effTotal ||
      recruiter.playerState.referrals.networkTotalCitizens !== effNetwork
    ) {
      recruiter.playerState.referrals.totalRecruits = effTotal;
      recruiter.playerState.referrals.networkTotalCitizens = effNetwork;
      modified = true;
    }
  }

  return modified;
}

/**
 * Fetches users.json directly from GitHub Contents API (ZERO CDN cache!) + current SHA.
 */
export async function fetchMasterUsersFresh(): Promise<{ users: Record<string, any>; sha: string }> {
  const pat = getMasterPat();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Neon-Sync-Worker',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };
  if (pat) headers.Authorization = `Bearer ${pat}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${MASTER_STORAGE_REPO}/contents/users.json?t=${Date.now()}`,
      { headers, cache: 'no-store' }
    );
    if (res.ok) {
      const json = await res.json();
      const sha = json.sha || '';
      if (json.content) {
        const decoded = Buffer.from(String(json.content).replace(/\n/g, ''), 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed === 'object') {
          return { users: parsed, sha };
        }
      } else if (json.download_url) {
        const rawRes = await fetch(`${json.download_url}?t=${Date.now()}`, { cache: 'no-store' });
        if (rawRes.ok) {
          return { users: await rawRes.json(), sha };
        }
      }
    }
  } catch (err) {
    console.warn('GitHub API fresh read fallback:', err);
  }

  // Fallback to raw URL only if Contents API fails
  try {
    const rawRes = await fetch(`https://raw.githubusercontent.com/${MASTER_STORAGE_REPO}/main/users.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (rawRes.ok) {
      return { users: await rawRes.json(), sha: '' };
    }
  } catch {}

  return { users: {}, sha: '' };
}

export function mergeUsersDictionaries(
  localUsers: Record<string, any>,
  remoteUsers: Record<string, any>
): Record<string, any> {
  const merged: Record<string, any> = {};
  const allKeys = new Set([...Object.keys(localUsers), ...Object.keys(remoteUsers)]);
  for (const key of allKeys) {
    const l = localUsers[key];
    const r = remoteUsers[key];
    if (l && r) {
      merged[key] = mergeUserRecords(l, r);
    } else {
      merged[key] = l || r;
    }
  }
  return merged;
}

async function getPrimaryNodeUrl(): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/pocomon9/green/contents/status.json?t=${Date.now()}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Neon-Sync-Worker' },
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.content) {
        const st = JSON.parse(Buffer.from(String(json.content).replace(/\n/g, ''), 'base64').toString('utf-8'));
        if (st?.url && String(st.url).startsWith('https://')) {
          return String(st.url).replace(/\/+$/, '');
        }
      }
    }
  } catch {}
  return null;
}

/**
 * Atomic Read-Merge-Mutate-Save-Push across local disk and GitHub Master DB.
 * Retries up to 3 times on HTTP 409 SHA conflicts so concurrent runners NEVER overwrite each other.
 * If this node lacks direct write access to pocomon9/green-status (e.g., Slot 2/3), relays to Slot 1.
 */
export async function mutateMasterUsers(
  commitMessage: string,
  mutator: (users: Record<string, any>) => Promise<void> | void,
  relayConfig?: { endpoint: string; payload: any; isRelay?: boolean }
): Promise<Record<string, any>> {
  const pat = getMasterPat();
  const maxAttempts = pat ? 3 : 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const localUsers = loadLocalUsers();
    const { users: remoteUsers, sha } = await fetchMasterUsersFresh();
    const users = mergeUsersDictionaries(localUsers, remoteUsers);

    await mutator(users);
    reconcileAllReferrals(users);

    saveLocalUsers(users);

    if (!pat) {
      if (relayConfig && !relayConfig.isRelay) {
        const slot1Url = await getPrimaryNodeUrl();
        if (slot1Url) {
          fetch(`${slot1Url}${relayConfig.endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-cluster-relay': '1' },
            body: JSON.stringify(relayConfig.payload),
          }).catch(() => {});
        }
      }
      return users;
    }

    try {
      const content = Buffer.from(JSON.stringify(users, null, 2), 'utf-8').toString('base64');
      const bodyData: any = { message: commitMessage, content };
      if (sha) bodyData.sha = sha;

      const putRes = await fetch(`https://api.github.com/repos/${MASTER_STORAGE_REPO}/contents/users.json`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Neon-Sync-Worker',
        },
        body: JSON.stringify(bodyData),
      });

      if (putRes.ok) {
        return users;
      }

      if (putRes.status === 409 && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 250 * attempt));
        continue;
      }

      // If this secondary slot lacks write permission to pocomon9/green-status, relay to Slot 1
      if ((putRes.status === 401 || putRes.status === 403 || putRes.status === 404) && relayConfig && !relayConfig.isRelay) {
        const slot1Url = await getPrimaryNodeUrl();
        if (slot1Url) {
          await fetch(`${slot1Url}${relayConfig.endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-cluster-relay': '1' },
            body: JSON.stringify(relayConfig.payload),
          }).catch(() => {});
        }
      }

      console.warn(`Master DB PUT returned HTTP ${putRes.status} on attempt ${attempt}`);
      return users;
    } catch (err) {
      console.warn(`Master DB PUT error on attempt ${attempt}:`, err);
      if (attempt === maxAttempts) return users;
    }
  }

  return loadLocalUsers();
}
