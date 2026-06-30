'use client';
import { useStore } from '@/app/store/useStore';
import type { ProfileTab, InventoryItem } from '@/app/store/useStore';
import { CoinIcon } from '../CoinIcon';
import { SkinImage } from '../SkinImage';
import { useEffect, useState } from 'react';
import { t } from '@/app/lib/i18n';

const PROFILE_TAB_DEFS: Array<{ key: ProfileTab | 'logout'; icon: string }> = [
  { key: 'inventory',    icon: '🎒' },
  { key: 'settings',    icon: '⚙️' },
  { key: 'security',    icon: '🔒' },
  { key: 'affiliate',   icon: '💀' },
  { key: 'transactions', icon: '🧾' },
  { key: 'logout',      icon: '🚪' },
];

const SELF_OPTS = ['1 Day', '2 Days', '3 Days', '7 Days', '1 Month', '1 Year'];

function buildChartPath() {
  const cw = 1040, chh = 300;
  const ys = [0.42, 0.48, 0.6, 0.82, 0.5, 0.28, 0.38, 0.5, 0.55, 0.7, 0.92, 0.78, 0.55, 0.36];
  const stp = cw / (ys.length - 1);
  const coords = ys.map((v, i) => [Math.round(i * stp), Math.round(chh - (v * (chh - 40)) - 15)]);
  const line = 'M ' + coords.map(c => c[0] + ',' + c[1]).join(' L ');
  const area = line + ` L ${cw},${chh} L 0,${chh} Z`;
  return { line, area };
}

const { line: chartLine, area: chartArea } = buildChartPath();

const sessions = Array.from({ length: 4 }, (_, i) => ({ id: i, loc: 'Belarus IP 192.168.0.0', date: '01.08.2025', dev: 'Windows 10' }));
const referrals = Array.from({ length: 6 }, (_, i) => ({ id: i, name: 'whoisfrnz', wager: '1,343.09', earned: '1,343.09', since: '01.08.2025' }));

interface PlayerStats {
  totalWin: number;
  totalWagered: number;
  casesOpened: number;
  favoriteCase: string | null;
  transactions: DbWager[];
}

interface DbWager {
  id: string;
  case_name: string;
  amount: number;
  won_item: string;
  won_item_image: string | null;
  won_item_color: string | null;
  won_value: number;
  profit: number;
  player_name: string;
  created_at: string;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ProfilePage() {
  const { profileTab, setProfileTab, logout, flash, selfExcl, setSelfExcl, logged, lang } = useStore();
  const tabLabels: Record<string, string> = {
    inventory: t('profile_inventory', lang),
    settings: t('profile_settings', lang),
    security: 'Security',
    affiliate: 'Affiliate',
    transactions: t('profile_transactions', lang),
    logout: t('nav_logout', lang),
  };
  const PROFILE_TABS = PROFILE_TAB_DEFS.map(d => ({ ...d, label: tabLabels[d.key] ?? d.key }));
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    if (!logged) return;
    fetch('/api/player-stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, [logged]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 28, alignItems: 'start' }}>
      {/* Sidebar */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 78 }}>
        {PROFILE_TABS.map(({ key, label, icon }) => {
          const isActive = profileTab === key;
          return (
            <div key={key} onClick={() => {
              if (key === 'logout') logout();
              else setProfileTab(key as ProfileTab);
            }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 11,
              cursor: 'pointer', fontSize: 14, fontWeight: 500,
              background: isActive ? 'rgba(95,213,95,.12)' : 'transparent',
              color: isActive ? '#7fe877' : '#9aa39a',
              border: isActive ? '1px solid rgba(95,213,95,.3)' : '1px solid transparent' }}>
              <span style={{ fontSize: 15 }}>{icon}</span>{label}
            </div>
          );
        })}
      </aside>

      <div>
        {/* XP Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#0b0e0a',
          border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '16px 20px', marginBottom: 24 }}>
          <span style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#3a5cff,#8847ff)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ position: 'relative', height: 14, borderRadius: 8, background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '71%', background: 'linear-gradient(90deg,#1a8a9a,#3fd6c8)' }} />
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#9aa39a', marginTop: 7 }}>
              <span style={{ color: '#e8ece8', fontWeight: 600 }}>5,000 XP</span> / 7,000 XP
            </div>
          </div>
          <div style={{ background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '10px 16px' }}>
            <div style={{ fontSize: 11, color: '#9aa39a' }}>Your ID</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
              ID4592953-0432 <span onClick={() => flash('Copied!')} style={{ cursor: 'pointer', color: '#6b746b' }}>⧉</span>
            </div>
          </div>
        </div>

        {/* Inventory tab */}
        {profileTab === 'inventory' && <InventoryTab />}

        {/* Settings tab */}
        {profileTab === 'settings' && (
          <div>
            {/* Live stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: t('profile_total_win', lang),   value: stats ? fmt(stats.totalWin)       : '—', coin: true  },
                { label: t('profile_wagered', lang),     value: stats ? fmt(stats.totalWagered)   : '—', coin: true, green: true },
                { label: t('profile_opened', lang),      value: stats ? String(stats.casesOpened) : '—', coin: false },
                { label: t('profile_fav_case', lang),    value: stats?.favoriteCase ?? t('profile_none', lang), coin: false, gold: true },
              ].map(({ label, value, coin, green, gold }) => (
                <div key={label} style={{ background: green ? 'linear-gradient(120deg,#0c130b,#0e1a0d)' : '#0c100c',
                  border: green ? '1px solid rgba(95,213,95,.18)' : gold ? '1px solid rgba(230,150,60,.25)' : '1px solid rgba(255,255,255,.06)',
                  borderRadius: 14, padding: 18 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontWeight: 600, color: gold ? '#e6b33e' : undefined }}>
                    {coin && <CoinIcon size={15} />}{value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px', marginBottom: 22 }}>
              {[
                { label: '🎮 Steam Trade URL', ph: 'steamcommunity.com/tradeoffer/new/?p...', type: 'text', val: undefined },
                { label: '✉️ E-mail', ph: undefined, type: 'text', val: 'email@mail.com' },
              ].map(({ label, ph, type, val }) => (
                <div key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{label}</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input type={type} defaultValue={val} placeholder={ph} style={{ flex: 1, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 14px', color: '#cfd4cf', fontFamily: 'var(--font-outfit)', outline: 'none' }} />
                    <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 700, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '0 22px', borderRadius: 10, cursor: 'pointer' }}>Apply</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#0c100c', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '20px 22px', marginBottom: 18 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 600, fontSize: 16 }}>🕵️ Anonymous</div>
                <div style={{ fontSize: 13, color: '#9aa39a', marginTop: 5 }}>Set your profile to private to hide your account from public leaderboards and statistics.</div>
              </div>
              <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 600, fontSize: 14, color: '#cfd4cf', background: '#2a2f2a', border: '1px solid rgba(255,255,255,.1)', padding: '12px 22px', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>Active Privacy</button>
            </div>
            <div style={{ background: '#0c100c', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 22 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Self exclusion</div>
              <div style={{ fontSize: 13, color: '#9aa39a', marginBottom: 16, maxWidth: 760 }}>The self-exclusion feature on our site lets you take a break from playing whenever you need it. Just choose your time-out period, and we&apos;ll pause your account and stop all promotional messages. This action cannot be reversed</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: 4, gap: 2, flex: 1 }}>
                  {SELF_OPTS.map(o => (
                    <span key={o} onClick={() => setSelfExcl(o)} style={{ flex: 1, textAlign: 'center', padding: 11, borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500,
                      background: selfExcl === o ? '#1c241b' : 'transparent',
                      color: selfExcl === o ? '#e8ece8' : '#9aa39a' }}>{o}</span>
                  ))}
                </div>
                <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 700, fontSize: 14, color: '#fff', background: '#e2342f', border: 'none', padding: '13px 30px', borderRadius: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>Lock account</button>
              </div>
            </div>
          </div>
        )}

        {/* Security tab */}
        {profileTab === 'security' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#0c100c', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
              <div style={{ maxWidth: 660 }}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Two Factor Authentication (2FA)</div>
                <div style={{ fontSize: 13, color: '#9aa39a' }}>Two-factor authentication is an extra layer of security for your account to ensure that you&apos;re the only person who can access your account</div>
              </div>
              <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 700, fontSize: 14, color: '#fff', background: '#5865f2', border: 'none', padding: '13px 28px', borderRadius: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>Enable 2FA</button>
            </div>
            <div style={{ background: '#0c100c', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
                <div style={{ maxWidth: 560 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Active Sessions</div>
                  <div style={{ fontSize: 13, color: '#9aa39a' }}>Your account is currently being used by these devices. If you notice any suspicious activity, log out of all sessions and change your password immediately.</div>
                </div>
                <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 600, fontSize: 14, color: '#cfd4cf', background: '#2a2f2a', border: '1px solid rgba(255,255,255,.1)', padding: '12px 20px', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>Logout from all Devices</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr 60px', gap: 10, padding: '0 4px 12px', color: '#9aa39a', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div>Location</div><div>Date</div><div>Device</div><div style={{ textAlign: 'right' }}>Logout</div>
              </div>
              {sessions.map(se => (
                <div key={se.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr 60px', gap: 10, padding: '16px 4px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 14 }}>
                  <div>{se.loc}</div><div>{se.date}</div><div>{se.dev}</div>
                  <div style={{ textAlign: 'right' }}><span onClick={() => flash('Session ended')} style={{ color: '#eb4b4b', cursor: 'pointer', fontSize: 16 }}>⎋</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Affiliate tab */}
        {profileTab === 'affiliate' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, background: '#0c100c', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 20 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>Your Affiliate Code</div>
                  <div style={{ fontSize: 12, color: '#9aa39a', marginTop: 3 }}>Users will be prompted to claim your code.</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0a0d0a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#cfd4cf' }}>
                    skinmaze.com/r/whoisfrnz <span onClick={() => flash('Copied!')} style={{ cursor: 'pointer', color: '#6b746b' }}>⧉</span>
                  </div>
                  <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 700, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '11px 20px', borderRadius: 10, cursor: 'pointer' }}>Apply</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, background: 'linear-gradient(120deg,#0c150b,#0e1d0d)', border: '1px solid rgba(95,213,95,.25)', borderRadius: 14, padding: 20 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 17 }}>Available Funds</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7, fontWeight: 600 }}>
                    <CoinIcon size={15} />1,343.09
                  </div>
                </div>
                <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 700, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '12px 24px', borderRadius: 10, cursor: 'pointer' }}>Claim</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
              {[['Active Refferals','👥 34'],['Total Played','1,343.09'],['Total Earned','1,343.09'],['Total Deposits','91,343.09']].map(([label, val]) => (
                <div key={label as string} style={{ background: '#0c100c', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
                    {label !== 'Active Refferals' && <CoinIcon size={14} />}{val}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ background: '#0c100c', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 18, marginBottom: 24 }}>
              <svg viewBox="0 0 1040 300" preserveAspectRatio="none" style={{ width: '100%', height: 280, display: 'block' }}>
                <defs>
                  <linearGradient id="affg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#46c041" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#46c041" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path d={chartArea} fill="url(#affg)" />
                <path d={chartLine} fill="none" stroke="#5fd75f" strokeWidth={2.5} />
              </svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17, marginBottom: 16 }}>👤 My Referrals</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '13px 16px', marginBottom: 14 }}>
              <span style={{ color: '#6b746b' }}>🔍</span>
              <input placeholder="Search referrals" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e8ece8', fontFamily: 'var(--font-outfit)', fontSize: 14 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, padding: '0 6px 12px', color: '#9aa39a', fontSize: 13 }}>
              <div>Username</div><div>Wager</div><div>Earned</div><div style={{ textAlign: 'right' }}>Since</div>
            </div>
            {referrals.map(rf => (
              <div key={rf.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, padding: '13px 6px', alignItems: 'center', borderRadius: 9, fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#3a5cff,#8847ff)', display: 'inline-block' }} />
                  {rf.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CoinIcon size={13} />{rf.wager}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CoinIcon size={13} />{rf.earned}</div>
                <div style={{ textAlign: 'right', color: '#9aa39a' }}>{rf.since}</div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
              <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 600, fontSize: 13, color: '#cfd4cf', background: '#0e120e', border: '1px solid rgba(255,255,255,.12)', padding: '11px 22px', borderRadius: 10, cursor: 'pointer' }}>Show more +</button>
            </div>
          </div>
        )}

        {/* Transactions tab */}
        {profileTab === 'transactions' && (
          <TransactionsTab stats={stats} />
        )}
      </div>
    </div>
  );
}

// ── Transactions Tab ──────────────────────────────────────────────────────────

function TransactionsTab({ stats }: { stats: PlayerStats | null }) {
  const { flash } = useStore();
  const txns = stats?.transactions ?? [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 18 }}>🧾 Transactions</div>
      </div>

      {txns.length === 0 ? (
        <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16,
          padding: '60px 24px', textAlign: 'center', color: '#6b746b', fontSize: 14 }}>
          {stats === null ? 'Loading…' : 'No transactions yet. Open a case to get started!'}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.8fr 1fr 1fr 1fr', gap: 10, padding: '0 6px 12px', color: '#9aa39a', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div>Time</div><div>Item won</div><div>Case</div><div>Cost</div><div style={{ textAlign: 'right' }}>Value</div>
          </div>
          {txns.map(tx => {
            const profit = tx.profit ?? (tx.won_value - tx.amount);
            const profitPositive = profit >= 0;
            const dateStr = new Date(tx.created_at).toLocaleString('en-GB', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            });
            const color = tx.won_item_color ?? '#4b69ff';
            return (
              <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.8fr 1fr 1fr 1fr', gap: 10, padding: '14px 6px', alignItems: 'center', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <div style={{ color: '#6b746b', fontSize: 12 }}>{dateStr}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {tx.won_item_image && (
                    <img src={tx.won_item_image} alt="" style={{ width: 36, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                  )}
                  <span style={{ color, fontWeight: 600, fontSize: 12, lineHeight: 1.3 }}>{tx.won_item}</span>
                </div>
                <div style={{ color: '#9aa39a', fontSize: 12 }}>{tx.case_name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CoinIcon size={12} />
                  <span style={{ fontWeight: 600 }}>{fmt(tx.amount)}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                  <CoinIcon size={12} />
                  <span style={{ fontWeight: 700, color: profitPositive ? '#3ad48f' : '#eb4b4b' }}>{fmt(tx.won_value)}</span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── Inventory Tab ─────────────────────────────────────────────────────────────

const RARITY_LABEL: Record<string, string> = {
  blue: 'Mil-Spec', purple: 'Restricted', pink: 'Classified', red: 'Covert', gold: 'Extraordinary',
};
const RARITY_COLOR: Record<string, string> = {
  blue: '#4b69ff', purple: '#8847ff', pink: '#d32ce6', red: '#eb4b4b', gold: '#e6c33e',
};

function InventoryTab() {
  const { inventory, sellItem, withdrawItem, flash } = useStore();

  if (inventory.length === 0) {
    return (
      <div style={{ background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16,
        padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🎒</div>
        <div style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
          Your inventory is empty
        </div>
        <div style={{ color: '#6b746b', fontSize: 13, marginBottom: 24 }}>
          Open a case and click <strong style={{ color: '#7fe877' }}>Keep</strong> to save items here.
        </div>
      </div>
    );
  }

  const totalValue = inventory.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/,/g, '')) || 0;
    return sum + price;
  }, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#0b0e0a', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14,
        padding: '14px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#9aa39a' }}>
          <span style={{ fontSize: 18 }}>🎒</span>
          <strong style={{ color: '#e8ece8' }}>{inventory.length}</strong> item{inventory.length !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: '#9aa39a' }}>
          Total value:
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 16, color: '#7fe877' }}>
            <CoinIcon size={16} />{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {inventory.map(item => {
          const color = RARITY_COLOR[item.rar] ?? '#4b69ff';
          const dateStr = new Date(item.openedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          return (
            <div key={item.inventoryId} style={{
              background: '#0b0e0a',
              border: `1px solid ${color}44`,
              borderRadius: 14,
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{ height: 3, background: color }} />
              <div style={{ padding: '14px 14px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}18`,
                    border: `1px solid ${color}44`, borderRadius: 5, padding: '2px 8px' }}>
                    {RARITY_LABEL[item.rar] ?? item.rar}
                  </span>
                  <span style={{ fontSize: 10, color: '#4a7a4a' }}>{dateStr}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <SkinImage marketName={item.marketName} imageUrl={item.imageUrl} size={120} glowColor={color} />
                </div>
                <div style={{ textAlign: 'center', fontSize: 11, color: '#9aa39a', marginBottom: 2 }}>{item.w}</div>
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, color, marginBottom: 2, lineHeight: 1.3 }}>{item.skin}</div>
                <div style={{ textAlign: 'center', fontSize: 11, color: '#4a7a4a', marginBottom: 6 }}>
                  from <span style={{ color: '#6b746b' }}>{item.caseName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                  <CoinIcon size={15} /><span>{item.price}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { const v = parseFloat(item.price.replace(/,/g, '')) || 0; sellItem(item.inventoryId, v); }}
                    style={{ flex: 1, fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 12,
                      color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)',
                      border: 'none', padding: '9px 0', borderRadius: 9, cursor: 'pointer' }}>
                    Sell
                  </button>
                  <button
                    onClick={() => withdrawItem(item.inventoryId)}
                    style={{ flex: 1, fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 12,
                      color: '#9aa39a', background: '#0e120e',
                      border: '1px solid rgba(255,255,255,.1)', padding: '9px 0', borderRadius: 9, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <span style={{ fontSize: 11 }}>🔗</span> Withdraw
                  </button>
                </div>
                <div style={{ textAlign: 'center', fontSize: 9, color: '#3a4a3a', marginTop: 6 }}>
                  via CSFloat → Steam
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
