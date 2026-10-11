const app = document.getElementById('app');

// ---------- state ----------
const state = {
  screen: 'landing',
  cart: [
    { id: 1, name: 'Skin Langka | Fade', price: 10307074, ind: '−4%', indCls: 'ind-down', seller: 'bunnyhap ✓' },
    { id: 2, name: 'Trading Card | Foil', price: 7572405, ind: '+5%', indCls: 'ind-up', seller: 'sellerX ✓' },
  ],
  balance: 15398295,
  selectedItems: ['Trading Card', 'Skin Langka'],
  tosChecked: true,
  depositMethod: 0,
  watch: 0,
};

const rp = n => 'Rp ' + n.toLocaleString('id-ID');

// ---------- helpers ----------
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = el('<div id="toast"></div>'); document.getElementById('phone').appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 1800);
}
function go(screen) { state.screen = screen; render(); document.getElementById('screen').scrollTop = 0; }

// ---------- shared fragments ----------
const statusBar = () => `
  <div class="statusbar"><span>21:06</span><span class="sicons">▮▮▮ ⏻</span></div>`;

const bottomNav = (active) => `
  <div class="bottomnav">
    <button class="tab ${active === 'market' ? 'active' : ''}" data-nav="market"><span class="ic">🏪</span>Market</button>
    <button class="tab ${active === 'etalase' ? 'active' : ''}" data-nav="etalase"><span class="ic">�</span>Etalase</button>
    <button class="tab ${active === 'faq' ? 'active' : ''}" data-nav="faq"><span class="ic">❓</span>FAQ</button>
  </div>`;

const homebar = () => `<div class="homebar"></div>`;

const itemCard = (d) => `
  <div class="card itemcard" data-item="${d.name}">
    <div class="head"><div class="t">${d.name}</div><div class="s">${d.sub}</div></div>
    <div class="imgph">🖼${d.views ? ' ' + d.views : ''}</div>
    <div class="prow"><span class="p">${rp(d.price)}</span><span class="h">${d.hearts} ♡</span></div>
    <div class="irow"><span class="${d.indCls}">${d.ind}</span></div>
  </div>`;

const marketItems = [
  { name: 'Whoops!', sub: 'Game X - Trading Card (Foil)', price: 7572405, ind: '-5%', indCls: 'ind-up', hearts: 128, views: '' },
  { name: 'You mad bro?', sub: 'Game Y - Emoticon', price: 29362143, ind: '+2%', indCls: 'ind-down', hearts: 96, views: '' },
  { name: 'Stilleto Knife | Fade', sub: 'Counter Strike 2 - Skin', price: 10307074, ind: '? data kurang', indCls: 'ind-na', hearts: 54, views: '' },
  { name: "It's Raining (Animated)", sub: 'Game Z - Profile Background', price: 19051732, ind: '-1%', indCls: 'ind-up', hearts: 211, views: '911 views' },
];

// ---------- screens ----------
const screens = {};

screens.landing = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <div class="logo">M</div>
    </div>
    <div class="hero">
      <div class="big">🌫️</div>
      <h1>Jual & beli item Steam</h1>
      <p>Dimana ada uap, disitu ada kabut.</p>
    </div>
    <div class="vprops">
      <div class="v"><span class="ic">🔒</span><span class="t">Transaksi aman</span></div>
      <div class="v"><span class="ic">💸</span><span class="t">Fee penjual 2%</span></div>
      <div class="v"><span class="ic">💱</span><span class="t">Mata uang bermacam</span></div>
    </div>
    <div style="display:flex;gap:10px;padding:10px 16px">
      <button class="btn primary" data-nav="login">Sign In</button>
      <button class="btn secondary" data-nav="market">Jelajahi Item</button>
    </div>
    <div class="sectionlabel">Item Populer</div>
    <div class="grid3">
      ${[['M4A4 | Emperor', 'Rp 417.074', '-3%', 'ind-up'], ['Bunny Dance', 'Rp 10.231', '-1%', 'ind-up'], ['Smile4Camera', 'Rp 2.143', '+9%', 'ind-down']]
        .map(([n, p, i, c]) => `
        <div class="card itemcard" data-item="${n}">
          <div class="imgph small">🖼</div>
          <div style="padding:6px 8px 8px">
            <div style="font-size:11px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n}</div>
            <div style="font-size:11px;font-weight:600">${p}</div>
            <div class="${c}" style="font-size:10px;font-weight:500">${i}</div>
          </div>
        </div>`).join('')}
    </div>
    <div style="height:8px"></div>
  </div>
  ${bottomNav('market')}
  ${homebar()}`;

screens.login = () => `
  ${statusBar()}
  <div id="screen" style="display:flex;flex-direction:column">
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px">
      <div class="logo" style="width:72px;height:72px;border-radius:18px;font-size:32px">M</div>
      <div style="font-size:24px;font-weight:700">Masuk ke Mist</div>
      <div style="font-size:13px;color:var(--text-2);text-align:center">Login memakai akun Steam. Mist tidak menyimpan password-mu.</div>
      <button class="btn primary" style="height:52px;border-radius:12px;background:#171a21;border:1px solid var(--brand)" data-nav="onboarding">🎮 &nbsp;Sign in dengan Steam</button>
      <div style="font-size:11px;color:var(--text-3);text-align:center">Kamu akan diarahkan ke halaman login resmi Steam (OpenID).</div>
      <div style="font-size:10px;color:var(--text-3);text-align:center">Dengan masuk, kamu setuju Ketentuan Layanan & Kebijakan Privasi Mist.</div>
    </div>
  </div>
  ${homebar()}`;

screens.onboarding = () => `
  ${statusBar()}
  <div id="screen" style="display:flex;flex-direction:column">
    <div style="padding:40px 24px 0">
      <div style="font-size:24px;font-weight:700">Selamat datang! 👋</div>
      <div style="font-size:13px;color:var(--text-2);margin-top:6px">Atur preferensi. Bisa diubah lewat menu profil.</div>
    </div>
    <div class="sectionlabel" style="padding-left:24px">Mata uang</div>
    <div class="dropdown" style="margin:0 24px;border-color:var(--brand)" id="dd-currency">
      <span>🌐</span><span class="v">IDR — Rupiah</span><span class="chev">▾</span>
    </div>
    <div class="ddlist" id="ddlist-currency" style="display:none">
      <div class="search">🔍 Cari mata uang…</div>
      <div class="opt sel">IDR — Rupiah ✓</div><div class="opt">USD — Dollar</div><div class="opt">EUR — Euro</div>
    </div>
    <div class="sectionlabel" style="padding-left:24px">Bahasa</div>
    <div class="dropdown" style="margin:0 24px" id="dd-lang">
      <span>💬</span><span class="v">Bahasa Indonesia</span><span class="chev">▾</span>
    </div>
    <div style="flex:1"></div>
    <div class="ctabar">
      <button class="btn primary" data-nav="market">Mulai pakai Mist</button>
    </div>
  </div>
  ${homebar()}`;

screens.market = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <div class="logo">M</div>
      <div style="display:flex;gap:10px">
        <button class="iconbtn" data-toast="Keranjang dibuka">🛒</button>
        <button class="iconbtn" data-toast="Tidak ada notifikasi baru">🔔</button>
        <button class="iconbtn" data-nav="drawer">👤</button>
      </div>
    </div>
    <div class="screen-pad" style="padding-top:6px;padding-bottom:6px">
      <div class="searchbar">🔍 Cari item…<span style="margin-left:auto">▣</span></div>
    </div>
    <div style="display:flex;gap:10px;padding:4px 16px;align-items:center">
      <button class="chip" data-nav="filter">▽ Filter</button>
      <button class="chip" data-nav="lelang">⚡ Lelang</button>
      <button class="chip" style="flex:1;text-align:left" data-toast="Urutkan: Penawaran Terbaik">Penawaran Terbaik ▾</button>
    </div>
    <div class="grid2">${marketItems.map(itemCard).join('')}</div>
    <div style="height:8px"></div>
  </div>
  ${bottomNav('market')}
  ${homebar()}`;

screens.filter = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar"><div class="logo">M</div><div style="display:flex;gap:10px"><button class="iconbtn">🛒</button><button class="iconbtn">🔔</button><button class="iconbtn">🎨</button><button class="iconbtn">👤</button></div></div>
    <div style="height:200px"></div>
  </div>
  <div class="overlay" style="position:absolute">
    <div style="flex:1" data-nav="market"></div>
    <div class="sheet">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="font-size:18px;font-weight:600">Filter</div>
        <button class="action" data-nav="market" style="background:none;border:none;color:var(--text-2);font-size:16px;cursor:pointer">✕</button>
      </div>
      <div class="sectionlabel" style="padding:0 0 6px">Harga</div>
      <div style="display:flex;gap:10px;margin-bottom:14px">
        <div class="input" style="flex:1;margin:0;font-size:12px;font-weight:400;color:var(--text-2)">Rp Terendah</div>
        <div class="input" style="flex:1;margin:0;font-size:12px;font-weight:400;color:var(--text-2)">Rp Tertinggi</div>
      </div>
      <div class="sectionlabel" style="padding:0 0 6px">Jenis Item</div>
      <div class="dropdown" style="margin:0 0 14px"><span class="v">Semua Jenis</span><span class="chev">🔍 ▾</span></div>
      <div class="sectionlabel" style="padding:0 0 6px">Game</div>
      <div class="dropdown" style="margin:0 0 20px"><span class="v">Semua Game</span><span class="chev">🔍 ▾</span></div>
      <div style="display:flex;gap:12px">
        <button class="btn danger-outline" data-nav="market">Pulihkan</button>
        <button class="btn primary" data-nav="market">Cari di Pasar</button>
      </div>
    </div>
  </div>
  ${homebar()}`;

screens.detail = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <button class="back" data-nav="market">←</button>
      <div class="title">Detail Item</div>
      <button class="action" data-toast="Ditambahkan ke Watchlist ♡">♡</button>
    </div>
    <div class="detail-hero">🖼</div>
    <div class="infosec">
      <div class="t">Butterfly Knife | Lore</div>
      <div class="s">Skin · Steam · CS2</div>
      <div class="prow"><span class="price">${rp(10207074)}</span><span class="badge down">+4%</span></div>
    </div>
    <div class="chartsec">
      <div class="sectionlabel" style="padding:10px 16px 4px">Riwayat Harga (30 hari)</div>
      <div class="chart">
        <div class="ylabels"><span>10,5jt</span><span>10,3jt</span><span>10,1jt</span></div>
        <div class="bars">${[120,150,135,165,158,180,172,188,182,195,190,202].map(h => `<div class="bar" style="height:${h}px"></div>`).join('')}</div>
      </div>
    </div>
    <div class="seller">
      <div class="av"></div>
      <div><div class="n">bunnyhap ✓</div><div class="s">98% positif · 412 transaksi · pengiriman 5 menit</div></div>
    </div>
  </div>
  <div class="ctabar">
    <div style="display:flex;gap:10px;margin-bottom:8px">
      <button class="btn secondary" data-toast="Tawaran dikirim ke penjual (demo)">Kirim Tawaran</button>
      <button class="btn secondary" data-toast="Buy order dibuat (demo)">Buat Buy Order</button>
    </div>
    <button class="btn primary" data-nav="checkout">Beli Sekarang</button>
  </div>
  ${homebar()}`;

screens.lelang = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <button class="back" data-nav="market">←</button>
      <div class="title">Lelang</div>
      <button class="action" data-toast="Ditambahkan ke Watchlist ♡">♡</button>
    </div>
    <div class="livebadge"><div class="dot"></div><div class="t">LIVE — berakhir dalam 00:14:32</div></div>
    <div class="auction-hero">
      <div class="ic">🖼</div>
      <div class="t">Skin Langka | Fade (Unggulan)</div>
      <div class="s">Skin langka · Steam · lelang</div>
    </div>
    <div class="infosec">
      <div class="prow" style="margin-top:0"><span class="price">${rp(24750000)}</span><span class="badge up">17 penawar</span></div>
      <div class="meta">Tawaran tertinggi oleh trader_99 · 42 tawaran total</div>
    </div>
    <div class="sectionlabel">Riwayat Tawaran</div>
    <div class="card" style="margin:0 16px;padding:4px 14px">
      <div class="bidrow"><span class="who">trader_07</span><span class="amt">${rp(24750000)} · 2 mnt</span></div>
      <div class="bidrow"><span class="who">sniper_id</span><span class="amt">${rp(24500000)} · 5 mnt</span></div>
      <div class="bidrow"><span class="who">kolektor88</span><span class="amt">${rp(24250000)} · 9 mnt</span></div>
    </div>
    <div style="height:8px"></div>
  </div>
  <div class="ctabar">
    <div style="font-size:10px;color:var(--text-3);margin-bottom:8px">Min. kelipatan tawaran Rp 250.000 · dana ditahan sampai lelang selesai</div>
    <div style="display:flex;gap:10px">
      <div class="input" style="flex:1;margin:0">Rp 25.000.000</div>
      <button class="btn primary" style="width:120px" data-toast="Tawar dikirim! (demo)">Tawar</button>
    </div>
  </div>
  ${homebar()}`;

screens.drawer = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar"><div class="logo">M</div><div style="display:flex;gap:10px"><button class="iconbtn">🛒</button><button class="iconbtn">🔔</button><button class="iconbtn">🎨</button><button class="iconbtn">👤</button></div></div>
    <div style="height:400px"></div>
  </div>
  <div class="overlay" style="position:absolute;justify-content:flex-start" data-nav="market">
    <div class="drawer" onclick="event.stopPropagation()">
      <div class="balancecard"><div class="l">Saldo</div><div class="v">${rp(state.balance)}</div></div>
      <div class="dropdown" style="margin-bottom:8px" data-dd="dd-c"><span>🌐</span><span class="v">IDR — Rupiah</span><span class="chev">🔍 ▾</span></div>
      <div class="ddlist" id="dd-c" style="display:none"><div class="search">🔍 Cari…</div><div class="opt sel">IDR — Rupiah ✓</div><div class="opt">USD — Dollar</div></div>
      <div class="dropdown" style="margin-bottom:8px" data-dd="dd-l"><span>💬</span><span class="v">Bahasa Indonesia</span><span class="chev">🔍 ▾</span></div>
      <div class="ddlist" id="dd-l" style="display:none"><div class="search">🔍 Cari…</div><div class="opt sel">Bahasa Indonesia ✓</div><div class="opt">English</div></div>
      <div style="margin-top:8px">
        <div class="menurow" data-nav="profil"><span class="ic">👤</span>Profil</div>
        <div class="menurow" data-nav="deposit"><span class="ic">＋</span>Deposit</div>
        <div class="menurow" data-nav="withdraw"><span class="ic">↓</span>Withdraw</div>
        <div class="menurow" data-toast="Trades: 2 tervalidasi (demo)"><span class="ic">⇄</span>Trades</div>
        <div class="menurow" data-nav="jual"><span class="ic">📋</span>Daftar Item</div>
        <div class="menurow" data-toast="Etalase Saya (demo)"><span class="ic">🏪</span>Etalase Saya</div>
        <div class="menurow" data-toast="Tawaran: 1 pending (demo)"><span class="ic">💬</span>Tawaran</div>
        <div class="menurow" data-toast="Watchlist: 3 item (demo)"><span class="ic">♡</span>Watchlist</div>
        <div class="menurow" data-nav="faq"><span class="ic">🛟</span>Dukungan</div>
        <div class="menurow danger" data-nav="landing"><span class="ic">⏻</span>Logout</div>
      </div>
    </div>
  </div>
  ${homebar()}`;

screens.profil = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <button class="back" data-nav="market">←</button>
      <div class="title">Profil</div>
      <div style="width:36px"></div>
    </div>
    <div class="identity">
      <div class="av"></div>
      <div>
        <div class="nm">bunnyhap</div>
        <div class="badges"><span class="badge v">✓ Terverifikasi</span><span class="badge s">🏪 Penjual</span></div>
        <div class="kyc" data-toast="KYC: fitur demo">Lengkapi KYC →</div>
      </div>
    </div>
    <div class="earnings">
      <div class="e"><div class="l">Penghasilan (bulan ini)</div><div class="v green">${rp(2145000)}</div></div>
      <div class="e"><div class="l">Item terjual</div><div class="v">23 item</div></div>
    </div>
    <div class="sectionlabel">Kondisi Akun</div>
    <div class="standing">
      ${['Excellent','Good','Fair','Poor','Banned'].map((s, i) => `
        <div class="st"><div class="circle ${i === 1 ? 'on' : ''}"></div><div class="lbl ${i === 1 ? 'on' : ''}">${s}</div></div>`).join('')}
    </div>
    <div class="tabs">
      <div class="tab2 active">Info</div><div class="tab2" data-toast="Tab Transaksi (demo)">Transaksi</div>
      <div class="tab2" data-toast="Tab Buy Order (demo)">Buy Order</div><div class="tab2" data-toast="Tab Tawaran (demo)">Tawaran</div>
    </div>
    <div style="display:flex;gap:6px;padding:10px 16px">
      ${['Semua','Deposit','Jual','Tarik','Fee'].map((c, i) => `<span class="chip ${i === 0 ? 'active' : ''}" style="flex:1;text-align:center">${c}</span>`).join('')}
    </div>
    <div class="card" style="margin:0 16px">
      <div class="trow"><span class="a">Penjualan</span><span class="b" style="color:var(--success)">+ ${rp(1250000)}</span></div>
      <div class="trow"><span class="a">Deposit</span><span class="b" style="color:var(--success)">+ ${rp(500000)}</span></div>
      <div class="trow"><span class="a">Withdraw</span><span class="b" style="color:var(--danger)">− ${rp(300000)}</span></div>
      <div class="trow"><span class="a">Fee penjual</span><span class="b" style="color:var(--danger)">− ${rp(25000)}</span></div>
    </div>
    <div style="height:8px"></div>
  </div>
  ${homebar()}`;

screens.jual = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <button class="back" data-nav="market">←</button>
      <div class="title">Jual Item</div>
      <div style="width:36px"></div>
    </div>
    <div class="steps">
      <div class="step active">1 Pilih Item</div><div class="step">2 Harga</div><div class="step">3 Konfirmasi</div>
    </div>
    <div class="screen-pad" style="padding-top:8px;padding-bottom:6px"><div class="searchbar">🔍 Cari item di inventori…</div></div>
    <div style="display:flex;gap:10px;padding:4px 16px;align-items:center">
      <button class="chip" style="flex:1;text-align:left" data-toast="Urutkan: Terbaru">Urutkan: Terbaru ▾</button>
    </div>
    <div class="invgroup">
      <div class="glabel">Steam Community</div>
      <div class="items">
        ${[['Trading Card', 'Rp 12.500', true], ['Emoticon', 'Rp 8.200', false], ['Background', 'Rp 15.000', false], ['Profil Item', 'Rp 5.000', false]]
          .map(([n, p, s]) => `<div class="invitem ${s ? 'selected' : ''}" data-inv="${n}"><span class="ic">🖼</span><span class="nm">${n}</span><span class="pr">${p}</span></div>`).join('')}
      </div>
    </div>
    <div class="invgroup">
      <div class="glabel">Counter-Strike 2</div>
      <div class="items">
        ${[['Skin Langka', 'Rp 10.500.000', true], ['Skin Biasa', 'Rp 320.000', false], ['Sticker', 'Rp 45.000', false], ['Case', 'Rp 78.000', false]]
          .map(([n, p, s]) => `<div class="invitem ${s ? 'selected' : ''}" data-inv="${n}"><span class="ic">🖼</span><span class="nm">${n}</span><span class="pr">${p}</span></div>`).join('')}
      </div>
    </div>
    <div class="invgroup">
      <div class="glabel">Team Fortress 2</div>
      <div class="items">
        ${[['Hat Langka', 'Rp 1.250.000', false], ['Metal', 'Rp 1.500', false], ['Paint', 'Rp 22.000', false], ['Key', 'Rp 42.000', false]]
          .map(([n, p, s]) => `<div class="invitem ${s ? 'selected' : ''}" data-inv="${n}"><span class="ic">🖼</span><span class="nm">${n}</span><span class="pr">${p}</span></div>`).join('')}
      </div>
    </div>
    <div style="height:8px"></div>
  </div>
  <div class="ctabar"><button class="btn primary" data-nav="harga">Jual Item Terpilih</button></div>
  ${homebar()}`;

screens.harga = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <button class="back" data-nav="jual">←</button>
      <div class="title">Tentukan Harga</div>
      <div style="width:36px"></div>
    </div>
    <div class="steps">
      <div class="step">1 Pilih Item</div><div class="step active">2 Harga</div><div class="step">3 Konfirmasi</div>
    </div>
    ${state.selectedItems.map(n => `
      <div class="card" style="margin:10px 16px;padding:12px 14px">
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500"><span>🖼</span>${n}</div>
        <div class="input" style="margin:10px 0 6px;border-color:var(--brand)">${n === 'Skin Langka' ? 'Rp 10.500.000' : 'Rp 12.500'}</div>
        <div style="font-size:10px;color:var(--text-2)">Saran: median database ${n === 'Skin Langka' ? 'Rp 10.307.074' : 'Rp 12.100'} · indikator pasar +3%</div>
      </div>`).join('')}
    <div class="card" style="margin:10px 16px;padding:12px 16px">
      <div class="rowline"><span class="l">Total harga item</span><span class="r">${rp(10512500)}</span></div>
      <div class="rowline"><span class="l">Fee penjual (2%)</span><span class="r" style="color:var(--danger)">− ${rp(210250)}</span></div>
      <div class="rowline"><span class="l" style="color:var(--text);font-weight:600">Kamu terima</span><span class="r" style="color:var(--success);font-size:15px">${rp(10302250)}</span></div>
    </div>
    <div style="height:8px"></div>
  </div>
  <div class="ctabar"><button class="btn primary" data-nav="konfirmasi">Lanjut ke Konfirmasi</button></div>
  ${homebar()}`;

screens.konfirmasi = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <button class="back" data-nav="harga">←</button>
      <div class="title">Konfirmasi</div>
      <div style="width:36px"></div>
    </div>
    <div class="steps">
      <div class="step">1 Pilih Item</div><div class="step">2 Harga</div><div class="step active">3 Konfirmasi</div>
    </div>
    ${state.selectedItems.map(n => `
      <div class="cartrow" style="margin:10px 16px">
        <div class="imgph">🖼</div>
        <div class="info"><div class="t">${n}</div><div class="m">${n === 'Skin Langka' ? rp(10500000) + ' · Counter-Strike 2' : rp(12500) + ' · Steam Community'}</div></div>
      </div>`).join('')}
    <div class="card" style="margin:10px 16px;padding:12px 16px">
      <div style="font-size:13px;font-weight:500;color:var(--text-2);margin-bottom:8px">Setelah dipublikasikan</div>
      <div style="font-size:11px;color:var(--text-2);line-height:1.9">
        ✓ Item tetap di inventori Steam-mu sampai terjual<br>
        ✓ Pembeli membayar → dana ditahan Mist<br>
        ✓ Trade offer dikirim & divalidasi ekstensi browser<br>
        ✓ Trade dikonfirmasi → dana diteruskan ke wallet-mu
      </div>
    </div>
    <div style="height:8px"></div>
  </div>
  <div class="ctabar"><button class="btn primary" data-toast="Listing dipublikasikan! (demo)">Publikasikan Listing</button></div>
  ${homebar()}`;

screens.deposit = () => {
  const methods = [
    { nm: 'Kartu Kredit/Debit', meta: 'Instan · IDR', fee: 'Rp 1.000.000 (0% fee)', cls: 'free' },
    { nm: 'Crypto', meta: 'USD · butuh KYC', fee: 'Rp 1.010.000 total (1% fee)', cls: 'cost' },
    { nm: 'Bank Transfer', meta: '1–2 hari kerja · IDR', fee: 'Rp 1.005.000 total (0,5% fee)', cls: 'cost' },
  ];
  return `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <button class="back" data-nav="market">←</button>
      <div class="title">Deposit / Withdraw</div>
      <div style="width:36px"></div>
    </div>
    <div style="display:flex;gap:10px;padding:8px 16px">
      <button class="btn primary" style="height:36px;border-radius:18px;font-size:13px">Deposit</button>
      <button class="btn secondary" style="height:36px;border-radius:18px;font-size:13px" data-nav="withdraw">Withdraw</button>
    </div>
    <div class="sectionlabel">Nominal (Rupiah)</div>
    <div class="input">Rp 1.000.000</div>
    <div class="sectionlabel">Metode</div>
    ${methods.map((m, i) => `
      <div class="method ${state.depositMethod === i ? 'selected' : ''}" data-method="${i}">
        <div class="info">
          <div class="nm">${m.nm}</div>
          <div class="meta">${m.meta}</div>
          <div class="fee ${m.cls}">${m.fee}</div>
        </div>
        <div class="radio"></div>
      </div>`).join('')}
    <div style="height:8px"></div>
  </div>
  <div class="ctabar"><button class="btn primary" data-toast="Deposit diproses (demo)">Deposit via ${methods[state.depositMethod].nm}</button></div>
  ${homebar()}`;
};

screens.withdraw = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <button class="back" data-nav="market">←</button>
      <div class="title">Withdraw</div>
      <div style="width:36px"></div>
    </div>
    <div style="display:flex;gap:10px;padding:8px 16px">
      <button class="btn secondary" style="height:36px;border-radius:18px;font-size:13px" data-nav="deposit">Deposit</button>
      <button class="btn primary" style="height:36px;border-radius:18px;font-size:13px">Withdraw</button>
    </div>
    <div class="sectionlabel">Nominal (Rupiah)</div>
    <div class="input">Rp 2.000.000</div>
    <div style="font-size:11px;color:var(--text-2);padding:0 16px 8px">Saldo bisa ditarik: ${rp(2145000)}</div>
    <div class="sectionlabel">Tujuan Payout</div>
    <div class="method selected">
      <div class="info"><div class="nm">🏦 Bank BCA ···· 4821</div><div class="meta">1–2 hari kerja</div></div>
      <div class="radio"></div>
    </div>
    <div class="method">
      <div class="info"><div class="nm">₿ Crypto (USDT)</div><div class="meta">TRC-20 · cepat</div></div>
      <div class="radio"></div>
    </div>
    <div style="padding:0 16px;font-size:12px;color:var(--brand);font-weight:500;cursor:pointer" data-toast="Tambah rekening (demo)">+ Tambah rekening / wallet</div>
    <div class="card" style="margin:12px 16px;padding:12px 16px">
      <div class="rowline"><span class="l">Nominal</span><span class="r">${rp(2000000)}</span></div>
      <div class="rowline"><span class="l">Fee withdraw (1,0%)</span><span class="r" style="color:var(--danger)">− ${rp(20000)}</span></div>
      <div class="rowline"><span class="l" style="color:var(--text);font-weight:600">Diterima di rekening</span><span class="r" style="color:var(--success);font-size:15px">${rp(1980000)}</span></div>
    </div>
    <div style="height:8px"></div>
  </div>
  <div class="ctabar"><button class="btn primary" data-toast="Withdraw diproses (demo)">Tarik ${rp(2000000)}</button></div>
  ${homebar()}`;

screens.checkout = () => {
  const total = state.cart.reduce((s, c) => s + c.price, 0);
  const short = total - state.balance;
  return `
  ${statusBar()}
  <div id="screen">
    <div class="topbar"><div class="logo">M</div><div style="display:flex;gap:10px"><button class="iconbtn">🛒</button><button class="iconbtn">🔔</button><button class="iconbtn">🎨</button><button class="iconbtn">👤</button></div></div>
    <div style="height:200px"></div>
  </div>
  <div class="overlay" style="position:absolute">
    <div style="flex:1" data-nav="market"></div>
    <div class="sheet">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:18px;font-weight:600">Keranjang</div>
        <button style="background:none;border:none;color:var(--danger);font-size:12px;font-weight:500;cursor:pointer" data-toast="Keranjang dibersihkan (demo)">Bersihkan</button>
      </div>
      ${state.cart.map(c => `
        <div class="cartrow">
          <div class="imgph">🖼</div>
          <div class="info"><div class="t">${c.name}</div><div class="m">${rp(c.price)} · ${c.ind} · ${c.seller}</div></div>
          <button class="del" data-del="${c.id}">🗑</button>
        </div>`).join('')}
      <div class="rowline" style="padding:12px 0 4px"><span class="l" style="color:var(--text);font-weight:600;font-size:14px">Total Harga</span><span class="r" style="font-size:18px;font-weight:700">${rp(total)}</span></div>
      <div class="rowline" style="padding:0 0 8px"><span class="l" style="font-size:12px">Saldo wallet</span><span class="r" style="font-size:11px;color:var(--warning)">${rp(state.balance)} · kurang ${rp(short)}</span></div>
      <div class="tosrow">
        <div class="box ${state.tosChecked ? '' : 'off'}" id="tosbox">✓</div>
        <span>Saya setuju dengan Ketentuan Layanan</span>
      </div>
      <button class="btn primary" id="paybtn" data-toast="${state.tosChecked ? 'Arahkan ke top-up wallet (demo)' : 'Setujui Ketentuan Layanan dulu'}">
        ${state.tosChecked ? 'Tambah ' + rp(short) + ' ke wallet' : 'Setujui Ketentuan Layanan'}
      </button>
    </div>
  </div>
  ${homebar()}`;
};

screens.faq = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar">
      <button class="back" data-nav="market">←</button>
      <div class="title">FAQ & Dukungan</div>
      <div style="width:36px"></div>
    </div>
    <div class="card" style="margin:8px 16px;padding:12px 16px">
      <div style="font-size:13px;font-weight:500;color:var(--text-2);margin-bottom:10px">Butuh bantuan?</div>
      <div style="display:flex;gap:10px">
        <button class="btn primary" style="height:40px;font-size:13px" data-toast="Tiket dukungan dibuat (demo)">Tiket Dukungan</button>
        <button class="btn secondary" style="height:40px;font-size:13px" data-toast="Buka FAQ (demo)">Lihat FAQ</button>
      </div>
    </div>
    <div class="warn">⚠️ Mist tidak pernah meminta pembatalan trade. Waspadai penipuan.</div>
    <div class="sectionlabel">Kategori FAQ</div>
    ${[['Market', 'Cara beli, fee, indikator harga'], ['Penjual', 'Listing item, fee penjual, payout'], ['Pembeli', 'Buy order, tawaran, lelang'], ['Akun & Keamanan', 'KYC, login Steam, 2FA'], ['Ekstensi', 'Validasi trade offer']]
      .map(([t, s]) => `<div class="faqrow" data-toast="${t} (demo)"><div class="info"><div class="t">${t}</div><div class="s">${s}</div></div><span class="chev">›</span></div>`).join('')}
    <div style="height:8px"></div>
  </div>
  ${bottomNav('faq')}
  ${homebar()}`;

screens.etalase = () => `
  ${statusBar()}
  <div id="screen">
    <div class="topbar"><div class="logo">M</div><div style="display:flex;gap:10px"><button class="iconbtn">🛒</button><button class="iconbtn">🔔</button><button class="iconbtn">🎨</button><button class="iconbtn">👤</button></div></div>
    <div class="sectionlabel">Etalase — item yang kamu jual</div>
    <div class="grid2">
      ${itemCard({ name: 'Skin Biasa', sub: 'Listing aktif', price: 320000, ind: '+2%', indCls: 'ind-up', hearts: 12 })}
      ${itemCard({ name: 'Sticker | Mist', sub: 'Listing aktif', price: 45000, ind: '+8%', indCls: 'ind-up', hearts: 7 })}
    </div>
    <div class="empty">Semua listing aktif ditampilkan di sini.</div>
  </div>
  ${bottomNav('etalase')}
  ${homebar()}`;

// ---------- render ----------
function render() {
  const fn = screens[state.screen];
  if (!fn) { app.innerHTML = ''; return; }
  app.innerHTML = `<div id="phone">${fn()}</div>`;
  bind();
}

function bind() {
  const root = document.getElementById('phone');

  // navigation
  root.querySelectorAll('[data-nav]').forEach(n => {
    n.addEventListener('click', e => { e.stopPropagation(); go(n.dataset.nav); });
  });

  // toast actions
  root.querySelectorAll('[data-toast]').forEach(n => {
    n.addEventListener('click', e => { e.stopPropagation(); toast(n.dataset.toast); });
  });

  // item cards → detail
  root.querySelectorAll('[data-item]').forEach(n => {
    n.addEventListener('click', () => go('detail'));
  });

  // inventory multi-select
  root.querySelectorAll('[data-inv]').forEach(n => {
    n.addEventListener('click', () => {
      n.classList.toggle('selected');
      const nm = n.dataset.inv;
      const i = state.selectedItems.indexOf(nm);
      if (i >= 0) state.selectedItems.splice(i, 1); else state.selectedItems.push(nm);
      toast(n.classList.contains('selected') ? nm + ' dipilih' : nm + ' dibatalkan');
    });
  });

  // deposit method select
  root.querySelectorAll('[data-method]').forEach(n => {
    n.addEventListener('click', () => {
      state.depositMethod = parseInt(n.dataset.method);
      render();
    });
  });

  // cart delete
  root.querySelectorAll('[data-del]').forEach(n => {
    n.addEventListener('click', () => {
      state.cart = state.cart.filter(c => c.id !== parseInt(n.dataset.del));
      render();
      toast('Item dihapus dari keranjang');
    });
  });

  // ToS checkbox
  const tos = root.querySelector('#tosbox');
  if (tos) tos.addEventListener('click', () => { state.tosChecked = !state.tosChecked; render(); });

  // drawer dropdowns
  root.querySelectorAll('[data-dd]').forEach(n => {
    n.addEventListener('click', e => {
      e.stopPropagation();
      const list = document.getElementById(n.dataset.dd);
      if (list) list.style.display = list.style.display === 'none' ? 'block' : 'none';
    });
  });

  // onboarding dropdowns
  const ddc = root.querySelector('#dd-currency');
  if (ddc) ddc.addEventListener('click', () => {
    const l = document.getElementById('ddlist-currency');
    l.style.display = l.style.display === 'none' ? 'block' : 'none';
  });
}

render();
