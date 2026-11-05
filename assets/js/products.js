/* VandeTrack — product catalogue (render + filter + search). No deps. */
(function () {
  'use strict';

  var WA = '918238707442';

  var PRODUCTS = [
    { id: 'vt140', name: 'VandeTrack VT-140 (AIS-140)', cat: 'ais140', img: 'assets/img/prod-ais140.jpg',
      badge: 'Govt. Approved', badgeClass: 'green',
      desc: 'AIS-140 certified VLTD with IRNSS (NavIC) + GPS, eSIM and IP67 rugged body — mandatory compliance for commercial & public transport vehicles.',
      chips: ['AIS-140', 'IRNSS', 'eSIM', 'IP67'] },
    { id: 's06a', name: 'VandeTrack S06A', cat: 'vehicle', img: 'assets/img/prod-wired.jpg',
      badge: 'Fleet Favourite',
      desc: 'Wired 2G GPS tracker built for delivery trucks & commercial fleets — multi I/O for fuel, door and sensor alerts.',
      chips: ['2G', 'Wired', 'Fleet I/O'] },
    { id: 's106', name: 'VandeTrack S106', cat: 'vehicle', img: 'assets/img/prod-wired.jpg',
      desc: 'Hardwired 2G tracker for assets, equipment and vehicles with engine cut-off and wide voltage support.',
      chips: ['2G', 'Hardwired', 'Engine Cut'] },
    { id: 's22', name: 'VandeTrack S22', cat: 'wireless', img: 'assets/img/prod-magnetic.jpg',
      badge: 'No Wiring',
      desc: '2G wireless magnetic asset GPS tracker — stick it under any vehicle or asset. Zero installation, instant tracking.',
      chips: ['Magnetic', 'Wire-free', 'Instant Mount'] },
    { id: 'w15', name: 'VandeTrack W15', cat: 'wireless', img: 'assets/img/prod-magnetic.jpg',
      badge: '3-Yr Battery',
      desc: 'Wireless magnetic tracker with extended battery life up to 3 years — ideal for containers, trailers & idle assets.',
      chips: ['3-Yr Battery', 'Magnetic', 'IP65'] },
    { id: 's11', name: 'VandeTrack S11 Mini', cat: 'wireless', img: 'assets/img/prod-mini.jpg',
      badge: 'Best Seller',
      desc: 'Hidden magnetic mini tracker with audio recording — the most loved anti-theft device for bikes & cars.',
      chips: ['Audio', 'Hidden', 'Magnetic'] },
    { id: 'idcard', name: 'VandeTrack ID Card Tracker', cat: 'personal', img: 'assets/img/prod-idcard.jpg',
      desc: 'Credit-card sized tracker with 1200 mAh battery & geofence — perfect for field staff, students & elders.',
      chips: ['1200 mAh', 'Geofence', 'SOS'] },
    { id: 'mini', name: 'VandeTrack Personal Mini', cat: 'personal', img: 'assets/img/prod-mini.jpg',
      desc: 'Coin-sized personal GPS for kids, elders & two-wheelers — SOS button with live location on your phone.',
      chips: ['SOS', 'Tiny', 'Live Location'] },
    { id: 'bagtag', name: 'VandeTrack Bag Tag', cat: 'personal', img: 'assets/img/prod-bag.jpg',
      desc: 'Tiny tag for bags, luggage, trolleys & valuables. Clip it on and track from anywhere in India.',
      chips: ['Luggage', 'Compact', 'Long Standby'] },
    { id: 'r56l', name: 'VandeTrack R56L', cat: 'obd', img: 'assets/img/prod-obd.jpg',
      badge: '4G + Mic',
      desc: '4G OBD plug-in tracker with microphone for live voice monitoring & recording — plug & play in seconds.',
      chips: ['4G', 'OBD', 'Voice Monitor'] },
    { id: 'r58l', name: 'VandeTrack R58L', cat: 'obd', img: 'assets/img/prod-obd.jpg',
      desc: '4G OBD2 GPS tracker for cars — no wiring, instant trip history & vehicle health data.',
      chips: ['4G', 'OBD2', 'Plug & Play'] },
    { id: 'v6', name: 'VandeTrack DashCam V6', cat: 'obd', img: 'assets/img/prod-dashcam.jpg',
      badge: 'ADAS',
      desc: '4G dash cam with ADAS alerts and live GPS tracking — video evidence + live view on your phone.',
      chips: ['4G', 'ADAS', 'Live Video'] },
    { id: 'v7', name: 'VandeTrack DashCam V7', cat: 'obd', img: 'assets/img/prod-dashcam.jpg',
      desc: 'Next-gen dash cam with sharper night vision and dual recording for cars & trucks.',
      chips: ['Full HD', 'Night Vision', 'GPS'] }
  ];

  var CATS = {
    all: 'All Products',
    vehicle: 'Vehicle GPS',
    wireless: 'Wireless & Magnetic',
    personal: 'Personal & Bag',
    obd: 'OBD & Dash Cams',
    ais140: 'AIS-140'
  };

  function waLink(p) {
    return 'https://wa.me/' + WA + '?text=' +
      encodeURIComponent('Hi VandeTrack! I want the best price for ' + p.name + '. Please share details.');
  }

  function card(p) {
    var badge = p.badge
      ? '<span class="badge ' + (p.badgeClass || '') + '">' + p.badge + '</span>' : '';
    var chips = p.chips.map(function (c) { return '<span class="chip">' + c + '</span>'; }).join('');
    return '' +
      '<article class="card pcard" id="p-' + p.id + '" data-cat="' + p.cat + '">' +
        badge +
        '<div class="pimg"><img src="' + p.img + '" alt="' + p.name + '" loading="lazy"></div>' +
        '<div class="pbody">' +
          '<h3>' + p.name + '</h3>' +
          '<p class="pdesc">' + p.desc + '</p>' +
          '<div class="pchips">' + chips + '</div>' +
          '<div class="pcta">' +
            '<a class="btn btn-green btn-sm" href="' + waLink(p) + '" target="_blank" rel="noopener">Get Best Price</a>' +
            '<a class="btn btn-ghost btn-sm" href="tel:+918238707442">Call</a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  var grid = document.getElementById('productGrid');
  var search = document.getElementById('productSearch');
  var count = document.getElementById('productCount');
  if (!grid) return;

  var CAT_ORDER = ['vehicle', 'wireless', 'personal', 'obd', 'ais140'];
  var CAT_DESC = {
    vehicle: 'Wired GPS trackers for trucks, fleets & commercial vehicles.',
    wireless: 'Magnetic, wire-free trackers — stick it on and start tracking.',
    personal: 'Compact trackers for people, bags & valuables.',
    obd: 'Plug-in OBD trackers and 4G dash cams.',
    ais140: 'Government-approved AIS-140 VLTD compliance devices.'
  };

  var state = { q: '' };

  function render() {
    var q = state.q.toLowerCase();
    var html = '';
    var shown = 0;
    CAT_ORDER.forEach(function (cat) {
      var list = PRODUCTS.filter(function (p) {
        if (p.cat !== cat) return false;
        return !q || (p.name + ' ' + p.desc + ' ' + p.chips.join(' ')).toLowerCase().indexOf(q) !== -1;
      });
      if (!list.length) return;
      shown += list.length;
      var quick = list.map(function (p) {
        return '<a href="#p-' + p.id + '">' + p.name.replace('VandeTrack ', '') + '</a>';
      }).join('');
      html += '<section class="pcat">' +
        '<div class="pcat-head">' +
          '<h2>' + CATS[cat] + '</h2>' +
          '<p>' + CAT_DESC[cat] + '</p>' +
          '<span class="pcat-count">' + list.length + ' product' + (list.length === 1 ? '' : 's') + '</span>' +
          '<div class="pcat-hover">' + quick + '</div>' +
        '</div>' +
        '<div class="grid grid-3">' + list.map(card).join('') + '</div>' +
      '</section>';
    });
    grid.innerHTML = html ||
      '<p style="text-align:center;color:var(--muted);padding:40px 0">No products matched — clear the search, or ask us directly on WhatsApp.</p>';
    if (count) {
      count.textContent = shown + ' product' + (shown === 1 ? '' : 's') +
        (q ? ' matching \u201c' + state.q + '\u201d' : ' across 5 categories');
    }
    /* register freshly rendered cards/heads with the reveal system */
    if (window.__vtRevealScan) window.__vtRevealScan();
  }

  if (search) {
    search.addEventListener('input', function () {
      state.q = search.value.trim();
      render();
    });
  }

  render();
})();
