'use client';
import { create } from 'zustand';
import { CaseItem, SkinItem, ReelItem } from '@/app/lib/data';
import { generateSeed, sha256 } from '@/app/lib/provablyFair';

// Module-level navigate function — registered by NavigationProvider on mount
let _navigate: (path: string) => void = (path) => {
  if (typeof window !== 'undefined') window.location.href = path;
};
export function registerNavigate(fn: (path: string) => void) { _navigate = fn; }

function routeToPath(r: Route): string {
  if (r === 'home') return '/';
  if (r === 'casedetail') return '/cases';
  return '/' + r;
}

export interface SpinRecord {
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  hash: string;
  item: string;
  price: string;
}

export type Route = 'home' | 'cases' | 'market' | 'casedetail' | 'profile' | 'wallet';
export type Phase = 'idle' | 'spin' | 'done';
export type ProfileTab = 'settings' | 'security' | 'affiliate' | 'transactions' | 'inventory';
export type WalletTab = 'deposit' | 'withdraw';
export type WalletView = 'methods' | 'amount';

export interface MpState {
  type: string | null;
  exts: string[];
  stat: 'no' | 'yes' | null;
  q: string;
  knives: string[];
  color: number | null;
}

export interface InventoryItem extends ReelItem {
  inventoryId: string;   // unique per item instance
  caseName: string;
  openedAt: string;      // ISO timestamp
}

export interface UserInfo {
  id: string;
  steamId: string;
  username: string;
  avatar: string | null;
  email: string | null;
  balance: number;
}

interface Store {
  route: Route;
  logged: boolean;
  user: UserInfo | null;
  inventory: InventoryItem[];
  phase: Phase;
  won: ReelItem | null;
  reel: ReelItem[];
  currentCase: CaseItem | null;
  multiplier: number;
  profileTab: ProfileTab;
  walletTab: WalletTab;
  walletView: WalletView;
  depositAmt: number;
  selfExcl: string;
  mpItem: SkinItem | null;
  toast: string | null;
  fav: boolean;
  caseQuery: string;
  caseTab: string;
  bestTab: string;
  mp: MpState;
  _toastTimer: ReturnType<typeof setTimeout> | null;

  // Provably fair
  serverSeed: string;
  serverSeedHash: string;
  nextServerSeed: string;
  nextServerSeedHash: string;
  clientSeed: string;
  nonce: number;
  spinHistory: SpinRecord[];
  fairnessOpen: boolean;
  lastSpinHash: string | null;
  loginOpen: boolean;

  setRoute: (r: Route) => void;
  go: (r: Route) => void;
  loadCase: (c: CaseItem) => void;
  flash: (msg: string) => void;
  login: () => void;
  openCase: (c: CaseItem) => void;
  startSpin: (reel: ReelItem[], won: ReelItem) => void;
  finishSpin: () => void;
  closeOpen: () => void;
  openAgain: () => void;
  setPhase: (p: Phase) => void;
  setMultiplier: (n: number) => void;
  goProfile: (tab?: ProfileTab) => void;
  goWallet: () => void;
  openMpItem: (it: SkinItem) => void;
  closeMpItem: () => void;
  setMpType: (t: string) => void;
  toggleExt: (e: string) => void;
  setStat: (s: 'no' | 'yes') => void;
  setColor: (i: number) => void;
  toggleKnife: (k: string) => void;
  setMpSearch: (q: string) => void;
  toggleAllKnives: (allKnives: string[]) => void;
  setCaseQuery: (q: string) => void;
  setCaseTab: (t: string) => void;
  setBestTab: (t: string) => void;
  setFav: (v: boolean) => void;
  setProfileTab: (t: ProfileTab) => void;
  setSelfExcl: (v: string) => void;
  setWalletTab: (t: WalletTab) => void;
  setWalletView: (v: WalletView) => void;
  setDepositAmt: (n: number) => void;

  // Balance
  adjustBalance: (delta: number) => Promise<{ balance: number } | { error: string; balance?: number }>;

  // Provably fair actions
  keepItem: (item: ReelItem, caseName: string) => void;
  sellItem: (inventoryId: string, coinValue: number) => void;
  withdrawItem: (inventoryId: string) => void;

  setClientSeed: (s: string) => void;
  rotateSeed: () => Promise<void>;
  openFairness: () => void;
  closeFairness: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  setUser: (u: UserInfo) => void;
  checkSession: () => Promise<void>;
  logout: () => void;
  recordSpin: (r: SpinRecord) => void;
  setLastSpinHash: (h: string | null) => void;
}

function makeFairInit() {
  const serverSeed = generateSeed();
  const nextServerSeed = generateSeed();
  const clientSeed = generateSeed().slice(0, 16);
  return { serverSeed, nextServerSeed, clientSeed };
}

const _fi = makeFairInit();

export const useStore = create<Store>((set, get) => ({
  route: 'home',
  user: null,
  logged: false,
  inventory: [],
  phase: 'idle',
  won: null,
  reel: [],
  currentCase: null,
  multiplier: 1,
  profileTab: 'settings',
  walletTab: 'deposit',
  walletView: 'methods',
  depositAmt: 50,
  selfExcl: '1 Day',
  mpItem: null,
  toast: null,
  fav: false,
  caseQuery: '',
  caseTab: 'All Cases',
  bestTab: '10% Cases',
  mp: { type: 'Knifes', exts: ['Factory New','Minimal Wear','Field-Tested','Battle-Scarred'], stat: 'no', q: '', knives: [], color: null },
  _toastTimer: null,

  serverSeed: _fi.serverSeed,
  serverSeedHash: '',
  nextServerSeed: _fi.nextServerSeed,
  nextServerSeedHash: '',
  clientSeed: _fi.clientSeed,
  nonce: 0,
  spinHistory: [],
  fairnessOpen: false,
  lastSpinHash: null,
  loginOpen: false,

  setRoute: (r) => set({ route: r }),
  go: (r) => { set({ route: r, mpItem: null }); _navigate(routeToPath(r)); try { window.scrollTo(0, 0); } catch {}; },
  loadCase: (c) => { set({ currentCase: c, phase: 'idle', won: null, reel: [] }); },
  flash: (msg) => {
    const prev = get()._toastTimer;
    if (prev) clearTimeout(prev);
    const t = setTimeout(() => set({ toast: null }), 1900);
    set({ toast: msg, _toastTimer: t });
  },
  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),
  login: () => { set({ logged: true, loginOpen: false }); _navigate('/cases'); },
  setUser: (u) => set({ user: u, logged: true }),
  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/me');
      const u = await res.json();
      if (u) set({ user: u, logged: true });
    } catch {}
  },
  logout: () => {
    fetch('/api/auth/logout', { method: 'POST' });
    set({ logged: false, user: null });
    _navigate('/');
  },
  openCase: (c) => {
    set({ currentCase: c, phase: 'idle', won: null, reel: [] });
    _navigate('/cases/' + c.id);
    try { window.scrollTo(0, 0); } catch {}
  },
  startSpin: (reel, won) => set({ phase: 'spin', won, reel }),
  finishSpin: () => set({ phase: 'done' }),
  closeOpen: () => { set({ phase: 'idle' }); _navigate('/cases'); },
  openAgain: () => { set({ phase: 'idle' }); },
  setPhase: (p) => set({ phase: p }),
  setMultiplier: (n) => set({ multiplier: n }),
  goProfile: (tab) => { set({ profileTab: tab || 'settings' }); _navigate('/profile'); try { window.scrollTo(0, 0); } catch {}; },
  goWallet: () => { set({ walletView: 'methods', walletTab: 'deposit' }); _navigate('/wallet'); try { window.scrollTo(0, 0); } catch {}; },
  openMpItem: (it) => set({ mpItem: it }),
  closeMpItem: () => set({ mpItem: null }),
  setMpType: (t) => set(s => ({ mp: { ...s.mp, type: s.mp.type === t ? null : t } })),
  toggleExt: (e) => set(s => {
    const exts = s.mp.exts.slice();
    const i = exts.indexOf(e);
    if (i >= 0) exts.splice(i, 1); else exts.push(e);
    return { mp: { ...s.mp, exts } };
  }),
  setStat: (sv) => set(s => ({ mp: { ...s.mp, stat: sv } })),
  setColor: (i) => set(s => ({ mp: { ...s.mp, color: s.mp.color === i ? null : i } })),
  toggleKnife: (k) => set(s => {
    const ks = s.mp.knives.slice();
    const i = ks.indexOf(k);
    if (i >= 0) ks.splice(i, 1); else ks.push(k);
    return { mp: { ...s.mp, knives: ks } };
  }),
  setMpSearch: (q) => set(s => ({ mp: { ...s.mp, q } })),
  toggleAllKnives: (allKnives) => set(s => ({ mp: { ...s.mp, knives: s.mp.knives.length ? [] : allKnives } })),
  setCaseQuery: (q) => set({ caseQuery: q }),
  setCaseTab: (t) => set({ caseTab: t }),
  setBestTab: (t) => set({ bestTab: t }),
  setFav: (v) => set({ fav: v }),
  setProfileTab: (t) => set({ profileTab: t }),
  setSelfExcl: (v) => set({ selfExcl: v }),
  setWalletTab: (t) => set({ walletTab: t }),
  setWalletView: (v) => set({ walletView: v }),
  setDepositAmt: (n) => set({ depositAmt: n }),

  adjustBalance: async (delta) => {
    const res = await fetch('/api/balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    const data = await res.json();
    if (res.ok) {
      set(s => ({ user: s.user ? { ...s.user, balance: data.balance } : s.user }));
    }
    return data;
  },

  keepItem: (item, caseName) => {
    const entry: InventoryItem = {
      ...item,
      inventoryId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      caseName,
      openedAt: new Date().toISOString(),
    };
    set(s => ({ inventory: [entry, ...s.inventory] }));
    get().flash('Item kept — check your Inventory!');
  },
  sellItem: (inventoryId, coinValue) => {
    const item = get().inventory.find(i => i.inventoryId === inventoryId);
    const value = coinValue ?? parseFloat((item?.price ?? '0').replace(/,/g, '')) ?? 0;
    set(s => ({ inventory: s.inventory.filter(i => i.inventoryId !== inventoryId) }));
    get().adjustBalance(value).then(() => {
      get().flash(`Sold for ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} coins`);
    });
  },
  withdrawItem: (inventoryId) => {
    get().flash('CSFloat withdrawal coming soon ✨');
  },

  setClientSeed: (s) => set({ clientSeed: s }),
  rotateSeed: async () => {
    const s = get();
    const newServer = generateSeed();
    const newClient = generateSeed().slice(0, 16);
    const [revealedHash, newServerHash] = await Promise.all([
      sha256(s.serverSeed),
      sha256(s.nextServerSeed),
    ]);
    set({
      serverSeed: s.nextServerSeed,
      serverSeedHash: revealedHash,
      nextServerSeed: newServer,
      nextServerSeedHash: newServerHash,
      clientSeed: newClient,
      nonce: 0,
    });
  },
  openFairness: () => set({ fairnessOpen: true }),
  closeFairness: () => set({ fairnessOpen: false }),
  recordSpin: (r) => set(s => ({ spinHistory: [r, ...s.spinHistory].slice(0, 50) })),
  setLastSpinHash: (h) => set({ lastSpinHash: h }),
}));

// Bootstrap seed hashes on first load (client-side only)
if (typeof window !== 'undefined') {
  Promise.all([sha256(_fi.serverSeed), sha256(_fi.nextServerSeed)]).then(([h1, h2]) => {
    useStore.setState({ serverSeedHash: h1, nextServerSeedHash: h2 });
  });
}
