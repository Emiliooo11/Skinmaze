'use client';
import { useStore } from '@/app/store/useStore';
import type { ProfileTab } from '@/app/store/useStore';
import { CoinIcon } from '../CoinIcon';

const PROFILE_TABS: Array<{ key: ProfileTab | 'verify' | 'logout'; label: string; icon: string }> = [
  { key: 'settings', label: 'Setting', icon: '⚙️' },
  { key: 'security', label: 'Security', icon: '🔒' },
  { key: 'affiliate', label: 'Affiliate', icon: '💀' },
  { key: 'transactions', label: 'Transactions', icon: '🧾' },
  { key: 'verify', label: 'Verify Identity', icon: '🛡️' },
  { key: 'logout', label: 'Logout', icon: '🚪' },
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
const txnStatuses = ['Paid', 'Failed', 'In Progress', 'Failed', 'Paid', 'Failed', 'In Progress', 'Failed', 'Paid', 'Failed'];
const txns = txnStatuses.map((st, i) => ({
  id: i, time: '10.07.2024 00:52', tid: '31252434', status: st,
  stColor: st === 'Paid' ? '#3ad48f' : st === 'Failed' ? '#eb4b4b' : '#e0a82e',
  stBg: st === 'Paid' ? 'rgba(58,212,143,.14)' : st === 'Failed' ? 'rgba(235,75,75,.14)' : 'rgba(224,168,46,.14)',
  sum: '1,343.09', payout: '1,343.09', details: '01.08.2025',
}));
const referrals = Array.from({ length: 6 }, (_, i) => ({ id: i, name: 'whoisfrnz', wager: '1,343.09', earned: '1,343.09', since: '01.08.2025' }));

export function ProfilePage() {
  const { profileTab, setProfileTab, logout, flash, selfExcl, setSelfExcl } = useStore();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 28, alignItems: 'start' }}>
      {/* Sidebar */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 78 }}>
        {PROFILE_TABS.map(({ key, label, icon }) => {
          const isActive = profileTab === key;
          return (
            <div key={key} onClick={() => {
              if (key === 'logout') logout();
              else if (key === 'verify') flash('Identity verification coming soon');
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

        {/* Settings tab */}
        {profileTab === 'settings' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Win', value: '1,343.09', coin: true },
                { label: 'Total Wagered', value: '1,343.09', coin: true, green: true },
                { label: 'Unboxed Cases', value: '14,433', coin: false },
                { label: 'Favorite Case', value: '10% Knife', coin: false, gold: true },
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
                { label: '🔒 Change Password', ph: undefined, type: 'password', val: 'password' },
                { label: '🎮 Steam Trade URL', ph: 'steamcommunity.com/tradeoffer/new/?p...', type: 'text', val: undefined },
                { label: '✉️ E-mail', ph: undefined, type: 'password', val: 'email@mail.com' },
              ].map(({ label, ph, type, val }) => (
                <div key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{label}</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input type={type} defaultValue={val} placeholder={ph} style={{ flex: 1, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '12px 14px', color: '#cfd4cf', fontFamily: 'var(--font-outfit)', outline: 'none' }} />
                    <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 700, color: '#06270a', background: 'linear-gradient(160deg,#74e36b,#46c041)', border: 'none', padding: '0 22px', borderRadius: 10, cursor: 'pointer' }}>Apply</button>
                  </div>
                </div>
              ))}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 600, fontSize: 16, marginBottom: 12 }}>💬 Discord account</div>
                <button onClick={() => flash('Coming soon ✨')} style={{ width: '100%', fontWeight: 700, color: '#fff', background: '#5865f2', border: 'none', padding: 13, borderRadius: 10, cursor: 'pointer' }}>Connect to Discord</button>
              </div>
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 18 }}>🧾 Transactions</div>
              <div onClick={() => flash('Coming soon ✨')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0e120e', border: '1px solid rgba(255,255,255,.08)', borderRadius: 11, padding: '11px 16px', color: '#9aa39a', fontSize: 14, cursor: 'pointer' }}>
                Price: <span style={{ color: '#e8ece8' }}>High to Low</span> ◂
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 1fr 1.2fr 1.2fr 1fr', gap: 10, padding: '0 6px 12px', color: '#9aa39a', fontSize: 13 }}>
              <div>Time</div><div>ID</div><div>Status</div><div>Sum</div><div>Payout</div><div style={{ textAlign: 'right' }}>Details</div>
            </div>
            {txns.map(tx => (
              <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.2fr 1fr 1.2fr 1.2fr 1fr', gap: 10, padding: '14px 6px', alignItems: 'center', borderRadius: 9, fontSize: 14, borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                <div>{tx.time}</div>
                <div style={{ color: '#cfd4cf' }}>{tx.tid}</div>
                <div><span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, color: tx.stColor, background: tx.stBg }}>{tx.status}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#3ad48f', fontWeight: 700 }}>$</span>{tx.sum}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CoinIcon size={13} />{tx.payout}</div>
                <div style={{ textAlign: 'right', color: '#9aa39a' }}>{tx.details}</div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
              <button onClick={() => flash('Coming soon ✨')} style={{ fontWeight: 600, fontSize: 13, color: '#cfd4cf', background: '#0e120e', border: '1px solid rgba(255,255,255,.12)', padding: '11px 22px', borderRadius: 10, cursor: 'pointer' }}>Show more +</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
