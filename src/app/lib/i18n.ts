export type Lang = 'en' | 'lv' | 'lt' | 'et';

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'lv', label: 'Latvian',    flag: '🇱🇻' },
  { code: 'lt', label: 'Lithuanian', flag: '🇱🇹' },
  { code: 'et', label: 'Estonian',   flag: '🇪🇪' },
];

const translations = {
  // ── Navigation ───────────────────────────────────────────────────────────────
  nav_cases:       { en: 'Cases',       lv: 'Kastes',      lt: 'Dėžutės',    et: 'Kastid'      },
  nav_leaderboard: { en: 'Leaderboard', lv: 'Līdervalde',  lt: 'Lyderių lenta', et: 'Edetabel' },
  nav_market:      { en: 'Market',      lv: 'Tirgus',      lt: 'Rinka',       et: 'Turg'        },
  nav_login:       { en: 'Login/Register', lv: 'Pieslēgties/Reģistrēties', lt: 'Prisijungti/Registruotis', et: 'Logi sisse/Registreeru' },
  nav_logout:      { en: 'Log out',     lv: 'Iziet',       lt: 'Atsijungti',  et: 'Logi välja'  },

  // ── Hero / Welcome ────────────────────────────────────────────────────────────
  hero_title:      { en: 'Welcome to SkinMaze', lv: 'Laipni lūdzam SkinMaze', lt: 'Sveiki atvykę į SkinMaze', et: 'Tere tulemast SkinMaze\'i' },
  hero_sub:        { en: 'Your premier place for CS2 Fun!', lv: 'Tava labākā vieta CS2 priekam!', lt: 'Geriausias CS2 pramogų šaltinis!', et: 'Parim koht CS2 lõbuks!' },
  hero_desc:       { en: 'Register and get deposit bonus & 5 Free Cases', lv: 'Reģistrējies un saņem depozīta bonusu un 5 bezmaksas kastes', lt: 'Registruokitės ir gaukite depozito bonusą ir 5 nemokamas dėžutes', et: 'Registreeru ja saa deposiidibonus ja 5 tasuta kasti' },
  hero_btn:        { en: 'Login/Register', lv: 'Pieslēgties / Reģistrēties', lt: 'Prisijungti / Registruotis', et: 'Logi sisse / Registreeru' },

  // ── Highest Win ───────────────────────────────────────────────────────────────
  highest_win:     { en: 'Highest Win',  lv: 'Lielākais laimests', lt: 'Didžiausias laimėjimas', et: 'Suurim võit' },
  period_daily:    { en: 'Daily',        lv: 'Dienas',      lt: 'Dienos',      et: 'Päevane'     },
  period_weekly:   { en: 'Weekly',       lv: 'Nedēļas',     lt: 'Savaitės',    et: 'Nädalane'    },
  period_monthly:  { en: 'Monthly',      lv: 'Mēneša',      lt: 'Mėnesio',     et: 'Kuu'         },
  no_data:         { en: 'No data yet',  lv: 'Nav datu',    lt: 'Duomenų nėra', et: 'Andmeid pole' },

  // ── Deposit strip ────────────────────────────────────────────────────────────
  make_deposit:    { en: 'Make Deposit', lv: 'Veikt Depozītu', lt: 'Atlikti Depozitą', et: 'Tee Deposiit' },
  methods_50:      { en: '50+ Methods',  lv: '50+ Metodes', lt: '50+ Metodų',  et: '50+ Meetodit' },
  deposit_btn:     { en: 'Deposit',      lv: 'Depozīts',    lt: 'Depozitas',   et: 'Deposiit'    },

  // ── Support cards ────────────────────────────────────────────────────────────
  grassroots_title: { en: 'Grassroots Support', lv: 'Pamata atbalsts', lt: 'Pagrindinis palaikymas', et: 'Rohujuure tugi' },
  grassroots_sub:   { en: '"KLEVERR" Latvian League', lv: '"KLEVERR" Latvijas Līga', lt: '"KLEVERR" Latvijos lyga', et: '"KLEVERR" Läti liiga' },
  grassroots_desc:  { en: "We've been proud supporter of biggest esports league in Latvia", lv: 'Mēs lepni atbalstām lielāko esports līgu Latvijā', lt: 'Mes didžiuojamės remdami didžiausią esportų lygą Latvijoje', et: 'Oleme olnud suurima Läti e-spordi liiga uhke toetaja' },
  team_title:       { en: 'Team Support',  lv: 'Komandas atbalsts', lt: 'Komandos palaikymas', et: 'Meeskonna tugi' },
  team_desc:        { en: "We've been proud supporter of the Griezes / EC Banga esports team", lv: 'Mēs lepni atbalstām Griezes / EC Banga esports komandu', lt: 'Mes didžiuojamės remdami Griezes / EC Banga esportų komandą', et: 'Oleme olnud Griezes / EC Banga e-spordi meeskonna uhke toetaja' },
  open_cases:       { en: 'Open Cases',    lv: 'Atvērt kastes', lt: 'Atidaryti dėžutes', et: 'Ava kastid' },

  // ── Stats / Together ─────────────────────────────────────────────────────────
  together_title:   { en: 'We Made It',    lv: 'Mēs to paveicām', lt: 'Mes tai padarėme', et: 'Me tegime seda' },
  together_accent:  { en: 'Together',      lv: 'Kopā',        lt: 'Kartu',       et: 'Koos'        },
  together_desc:    { en: 'From Day 1 we at SkinMaze have awarded our users with bonuses, promo codes and freebies. Be part of our SkinMaze community', lv: 'No pirmās dienas mēs SkinMaze esam apbalvojuši lietotājus ar bonusiem, promo kodiem un dāvanām. Esi daļa no SkinMaze kopienas', lt: 'Nuo pirmos dienos mes SkinMaze apdovanoję vartotojus bonusais, promo kodais ir dovanomis. Tapk SkinMaze bendruomenės dalimi', et: 'Esimesest päevast peale oleme SkinMaze\'is premeerinud kasutajaid boonuste, promo koodide ja tasuta kinkidega. Ole osa meie SkinMaze kogukonnast' },
  join_discord:     { en: 'Join our Discord', lv: 'Pievienojies Discord', lt: 'Prisijunk prie Discord', et: 'Liitu meie Discordiga' },
  stat_players:     { en: 'Players',       lv: 'Spēlētāji',   lt: 'Žaidėjai',    et: 'Mängijad'    },
  stat_online:      { en: 'Online',        lv: 'Tiešsaistē',  lt: 'Prisijungę',  et: 'Võrgus'      },
  stat_cases:       { en: 'Opened Cases',  lv: 'Atvērtās kastes', lt: 'Atidarytos dėžutės', et: 'Avatud kastid' },
  stat_support:     { en: 'Support',       lv: 'Atbalsts',    lt: 'Palaikymas',  et: 'Tugi'        },

  // ── Case detail page ─────────────────────────────────────────────────────────
  case_open:        { en: 'Open',          lv: 'Atvērt',      lt: 'Atidaryti',   et: 'Ava'         },
  case_demo:        { en: 'Demo',          lv: 'Demo',        lt: 'Demo',        et: 'Demo'        },
  case_fast:        { en: 'Fast',          lv: 'Ātri',        lt: 'Greitai',     et: 'Kiire'       },
  case_contains:    { en: 'Case Contains', lv: 'Kastē ir',    lt: 'Dėžutėje yra', et: 'Kastis on'  },
  case_spin:        { en: 'Spin',          lv: 'Griezt',      lt: 'Sukti',       et: 'Keera'       },
  case_keep:        { en: 'Keep',          lv: 'Paturēt',     lt: 'Palikti',     et: 'Hoia'        },
  case_sell:        { en: 'Sell',          lv: 'Pārdot',      lt: 'Parduoti',    et: 'Müü'         },
  case_sell_all:    { en: 'Sell All',      lv: 'Pārdot visu', lt: 'Parduoti viską', et: 'Müü kõik' },
  case_keep_all:    { en: 'Keep All',      lv: 'Paturēt visu', lt: 'Palikti viską', et: 'Hoia kõik' },
  cases_price:      { en: 'Price',         lv: 'Cena',        lt: 'Kaina',       et: 'Hind'        },
  cases_drop:       { en: 'Drop Chance',   lv: 'Izkrituma iespēja', lt: 'Iškritimo tikimybė', et: 'Langemisvõimalus' },
  login_to_open:    { en: 'Login to open', lv: 'Pieslēdzies, lai atvērtu', lt: 'Prisijunkite, kad atidarytumėte', et: 'Logi sisse avamiseks' },
  not_enough:       { en: 'Not enough balance', lv: 'Nepietiek bilances', lt: 'Nepakanka balanso', et: 'Ebapiisav saldo' },

  // ── Profile page ─────────────────────────────────────────────────────────────
  profile_settings: { en: 'Settings',      lv: 'Iestatījumi', lt: 'Nustatymai',  et: 'Seaded'      },
  profile_inventory:{ en: 'Inventory',     lv: 'Inventārs',   lt: 'Inventorius', et: 'Inventar'    },
  profile_transactions: { en: 'Transactions', lv: 'Darījumi', lt: 'Sandoriai',   et: 'Tehingud'    },
  profile_total_win:{ en: 'Total Win',     lv: 'Kopējais laimests', lt: 'Bendras laimėjimas', et: 'Kogu võit' },
  profile_wagered:  { en: 'Total Wagered', lv: 'Kopā likts',  lt: 'Bendras statymas', et: 'Kokku panustatud' },
  profile_opened:   { en: 'Cases Opened',  lv: 'Atvērtās kastes', lt: 'Atidarytos dėžutės', et: 'Avatud kastid' },
  profile_fav_case: { en: 'Favorite Case', lv: 'Mīļākā kaste', lt: 'Mėgstamiausia dėžutė', et: 'Lemmikkast' },
  profile_none:     { en: 'None yet',      lv: 'Vēl nav',     lt: 'Dar nėra',    et: 'Pole veel'   },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer_owned:     { en: 'SkinMaze SIA is owned and operated by:', lv: 'SkinMaze SIA pieder un darbojas:', lt: 'SkinMaze SIA priklauso ir valdoma:', et: 'SkinMaze SIA kuulub ja seda haldab:' },
  footer_powered:   { en: 'Powered by Steam. Not affiliated with Valve Corp.', lv: 'Darbina Steam. Nav saistīts ar Valve Corp.', lt: 'Veikia su Steam. Nesusijęs su Valve Corp.', et: 'Töötab Steamil. Pole seotud Valve Corp-iga.' },
  footer_copyright: { en: '© Copyright 2025 | All rights reserved.', lv: '© Autortiesības 2025 | Visas tiesības aizsargātas.', lt: '© Autorių teisės 2025 | Visos teisės saugomos.', et: '© Autoriõigus 2025 | Kõik õigused kaitstud.' },
  footer_support:   { en: 'Support 24/7', lv: 'Atbalsts 24/7', lt: 'Palaikymas 24/7', et: 'Tugi 24/7'  },

  // ── Cases page ───────────────────────────────────────────────────────────────
  all_cases:        { en: 'All Cases',     lv: 'Visas kastes', lt: 'Visos dėžutės', et: 'Kõik kastid' },
  coming_soon:      { en: 'Coming soon',   lv: 'Drīzumā',     lt: 'Netrukus',    et: 'Tulemas peagi' },
  fairness_title:   { en: 'Provably Fair', lv: 'Pierādāmi taisnīgs', lt: 'Įrodytai teisingas', et: 'Tõendatult õiglane' },
} as const;

export type TKey = keyof typeof translations;

export function t(key: TKey, lang: Lang): string {
  return translations[key][lang] ?? translations[key]['en'];
}
