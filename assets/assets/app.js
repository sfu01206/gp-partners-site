(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function lockScroll(locked){
    document.documentElement.style.overflow = locked ? 'hidden' : '';
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  function initMobileNav(){
    const openBtn = $('[data-menu-open]');
    const mobile = $('[data-mobile]');
    const closeBtn = $('[data-menu-close]');
    if(!openBtn || !mobile || !closeBtn) return;

    const backdrop = $('[data-mobile-backdrop]', mobile);
    const panel = $('[data-mobile-panel]', mobile);

    const open = () => {
      mobile.classList.add('is-open');
      openBtn.setAttribute('aria-expanded', 'true');
      lockScroll(true);
      // focus first link
      const firstLink = $('a', mobile);
      if(firstLink) firstLink.focus();
    };

    const close = () => {
      mobile.classList.remove('is-open');
      openBtn.setAttribute('aria-expanded', 'false');
      lockScroll(false);
      openBtn.focus();
    };

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    mobile.addEventListener('click', (e) => {
      // click a link closes
      const a = e.target.closest('a');
      if(a) close();
    });

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && mobile.classList.contains('is-open')) close();
    });

    // simple focus trap
    document.addEventListener('keydown', (e) => {
      if(e.key !== 'Tab') return;
      if(!mobile.classList.contains('is-open')) return;
      const focusables = $$('a, button', panel).filter(el => !el.disabled);
      if(!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
    });
  }

  function scrollToId(id){
    const el = document.getElementById(id);
    if(!el) return;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
    const top = el.getBoundingClientRect().top + window.scrollY - (navH - 6);
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function initAnchorOffset(){
    // smooth scroll with offset for in-page anchors
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if(!a) return;
      const href = a.getAttribute('href');
      const id = href.slice(1);
      if(!id) return;
      const target = document.getElementById(id);
      if(!target) return;
      e.preventDefault();
      scrollToId(id);
      history.replaceState(null, '', `#${id}`);
    });

    // on load with hash
    window.addEventListener('load', () => {
      const hash = location.hash?.replace('#','');
      if(hash) setTimeout(() => scrollToId(hash), 0);
    });
  }

  function setActiveNav(id){
    const links = $$('[data-nav]');
    links.forEach(l => l.classList.toggle('is-active', l.getAttribute('data-nav') === id));
  }

  function setNavTheme(theme){
    const nav = $('[data-nav-root]');
    if(!nav) return;
    nav.classList.toggle('nav--on-dark', theme === 'dark');
    nav.classList.toggle('nav--on-light', theme !== 'dark');
  }

  function initIndexObservers(){
    const page = document.body.getAttribute('data-page');
    if(page !== 'home') return;

    const sections = $$('[data-section]');
    if(!sections.length) return;

    // Theme switching based on section data-theme
    const themeObserver = new IntersectionObserver((entries) => {
      // choose the entry most visible near top
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if(!visible) return;
      const theme = visible.target.getAttribute('data-theme') || 'light';
      setNavTheme(theme);
    }, { root: null, threshold: [0.15, 0.35, 0.55] });

    sections.forEach(s => themeObserver.observe(s));

    // Active link based on scroll position
    const activeObserver = new IntersectionObserver((entries) => {
      const nearTop = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if(!nearTop) return;
      const id = nearTop.target.id;
      if(id) setActiveNav(id);
    }, { root: null, rootMargin: `-${Math.floor((parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'))||76)+12)}px 0px -60% 0px`, threshold: [0.1, 0.2, 0.35] });

    sections.forEach(s => activeObserver.observe(s));

    // default
    setNavTheme('dark');
    setActiveNav('home');
  }

  function initStaticPagesTheme(){
    const page = document.body.getAttribute('data-page');
    if(page && page !== 'home'){
      setNavTheme('light');
    }
  }

  function initMemosList(){
    const container = $('[data-memos-list]');
    if(!container) return;

    const memos = [
      {
        id: "dm-001",
        code: "DM-001",
        type: "身份路径判断",
        title: "快速入籍背后，真正被锁定的是什么？",
        summary: "把速度的诱惑拆开：控制权、汇率与退出路径是否真实存在。",
        window: "2024 年末",
        minutes: 6,
        updated: "2026 年 1 月",
        lenses: ["控制权","流动性/退出"]
      },
      {
        id: "dm-002",
        code: "DM-002",
        type: "跨境结构与合规",
        title: "合规并不等于可退出：退出路径要被验证",
        summary: "在“看起来合规”之外，真正需要被验证的是退出条件与买方现实。",
        window: "2025 年初",
        minutes: 8,
        updated: "2026 年 1 月",
        lenses: ["流动性/退出","激励不对称"]
      },
      {
        id: "dm-003",
        code: "DM-003",
        type: "集中风险与灵活性",
        title: "门槛不是问题，集中风险才是",
        summary: "金额不是核心，关键在于风险是否被压在一个点上，以及灵活性如何下降。",
        window: "2024 年末",
        minutes: 7,
        updated: "2026 年 1 月",
        lenses: ["集中风险","选项保留"]
      }
    ];

    const state = {
      type: 'all',
      lens: 'all',
      length: 'all',
      sort: 'new'
    };

    const typeSel = $('[data-filter-type]');
    const lensSel = $('[data-filter-lens]');
    const lenSel  = $('[data-filter-length]');
    const sortSel = $('[data-sort]');

    function matches(m){
      if(state.type !== 'all' && m.type !== state.type) return false;
      if(state.lens !== 'all' && !m.lenses.includes(state.lens)) return false;
      if(state.length !== 'all'){
        const t = state.length;
        if(t === '3' && m.minutes > 3) return false;
        if(t === '6' && (m.minutes < 4 || m.minutes > 7)) return false;
        if(t === '10' && m.minutes < 8) return false;
      }
      return true;
    }

    function sortList(list){
      if(state.sort === 'updated') return list.slice().sort((a,b) => (b.updated||"").localeCompare(a.updated||""));
      if(state.sort === 'starter') return list.slice().sort((a,b) => a.minutes - b.minutes);
      return list; // default "new" (static demo)
    }

    function cardHTML(m){
      return `
        <article class="card card--soft">
          <div class="card__meta">
            <span><strong>${m.code}</strong></span>
            <span>·</span>
            <span>${m.type}</span>
          </div>
          <h3 class="h3 mt-12">${m.title}</h3>
          <p class="p" style="margin:8px 0 0;">${m.summary}</p>
          <div class="divider"></div>
          <div class="row" style="justify-content:space-between;">
            <div class="muted">判断窗口：${m.window} · 阅读 ${m.minutes} 分钟${m.updated ? ` · 最近更新：${m.updated}` : ''}</div>
            <a class="btn btn--secondary" href="memo.html?id=${encodeURIComponent(m.id)}" aria-label="阅读 ${m.code}">阅读</a>
          </div>
        </article>
      `;
    }

    function render(){
      const filtered = sortList(memos.filter(matches));
      container.innerHTML = filtered.map(cardHTML).join('');

      const empty = $('[data-memos-empty]');
      if(empty){
        empty.style.display = filtered.length ? 'none' : 'block';
      }
    }

    function wire(){
      if(typeSel) typeSel.addEventListener('change', () => { state.type = typeSel.value; render(); });
      if(lensSel) lensSel.addEventListener('change', () => { state.lens = lensSel.value; render(); });
      if(lenSel)  lenSel.addEventListener('change', () => { state.length = lenSel.value; render(); });
      if(sortSel) sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(); });
    }

    wire(); render();
  }

  function initMemoDetail(){
    const root = $('[data-memo-detail]');
    if(!root) return;

    const params = new URLSearchParams(location.search);
    const id = params.get('id') || 'dm-001';

    const db = {
      "dm-001": {
        code:"DM-001",
        type:"身份路径判断",
        window:"2024 年末",
        minutes:6,
        updated:"2026 年 1 月",
        premise:"在资金需要保持流动的前提下，是否值得用不可逆承诺换取身份选项？",
        forces:"时间压力与外部推进并存：窗口被反复强调，但退出路径的现实验证不足；推动者的激励与承担后果的人不一致。",
        boundaries:[
          "不讨论执行方案与材料清单",
          "不评估“通过概率”或“结果承诺”",
          "判断止于签署不可逆承诺之前",
          "先验证退出与控制权，再谈推进"
        ],
        tensions:[
          {t:"控制权", d:"资产控制权与决策主动权是否在关键节点被转移。"},
          {t:"退出是否真实", d:"退出条件、窗口、买方与成本是否可验证。"},
          {t:"选项保留", d:"是否提前封死未来调整空间。"}
        ],
        lenses:{
          "控制权":"核心问题不是速度，而是承诺发生后你仍剩多少主动权。",
          "流动性/退出":"“能卖”不等于“卖得掉”；退出要有条件、窗口与现实买方。",
          "集中风险":"风险是否集中在单一国家变量或单一资产之上。",
          "激励不对称":"推动者获得即时收益，而承担后果的人承担长期成本。",
          "选项保留":"选择是否过早锁死，导致未来空间变窄。"
        },
        flips:[
          "若退出路径可被独立第三方验证且成本可控，判断将明显改变。",
          "若承诺结构可保留关键控制权（或可逆），风险层级将下调。",
          "若窗口压力被证伪（并非真实临界），可优先保留选项。"
        ],
        next:[
          "先验证退出：条件、窗口、交易成本、买方现实（用证据而非口头承诺）。",
          "把“不可逆承诺”的节点列出，并评估每个节点的控制权变化。",
          "必要时对接执行专业人士核对条款与合规边界。"
        ]
      },
      "dm-002": {
        code:"DM-002",
        type:"跨境结构与合规",
        window:"2025 年初",
        minutes:8,
        updated:"2026 年 1 月",
        premise:"当合规被反复强调时，真正需要判断的是：退出是否真实存在，以及退出成本是否被低估。",
        forces:"信息来自多方，但每一方都更擅长讲“合规”而非讲“退出”；推动者更关心推进速度。",
        boundaries:["不讨论具体产品推介","不以“历史表现”替代退出验证","止于执行之前"],
        tensions:[
          {t:"退出路径", d:"退出条件是否清晰且可执行。"},
          {t:"成本与摩擦", d:"交易摩擦是否被隐藏在细节里。"},
          {t:"激励", d:"谁推动，谁承担后果。"}
        ],
        lenses:{
          "控制权":"合规结构下，关键控制权是否仍在你手里。",
          "流动性/退出":"退出条款、窗口与实际对手方必须被验证。",
          "集中风险":"风险是否集中在单一管理方或单一路径。",
          "激励不对称":"推动者通常不承担退出失败的成本。",
          "选项保留":"是否保留调整空间与替代路径。"
        },
        flips:["若退出可被验证且成本透明，判断将上调。","若出现更可逆的替代结构，优先保留选项。","若窗口压力被证伪，则延后承诺。"],
        next:["要求以文件与第三方验证退出条件。","把摩擦成本（费率/税务/时间）显性化。","必要时对接执行专业人士。"]
      },
      "dm-003": {
        code:"DM-003",
        type:"集中风险与灵活性",
        window:"2024 年末",
        minutes:7,
        updated:"2026 年 1 月",
        premise:"当门槛很高时，真正需要判断的不是金额，而是集中风险与灵活性下降。",
        forces:"叙事把注意力放在“门槛”上，但对集中风险的讨论不足；推动者倾向于用“稀缺性”制造紧迫感。",
        boundaries:["不讨论任何具体配置建议","不承诺回报与结果","止于执行之前"],
        tensions:[
          {t:"集中风险", d:"风险是否被压在一个点上（国家/制度/单一资产）。"},
          {t:"灵活性下降", d:"承诺后调整空间是否显著变窄。"},
          {t:"选项保留", d:"是否还有足够多的可逆选择。"}
        ],
        lenses:{
          "控制权":"高门槛不应换来控制权下降。",
          "流动性/退出":"退出窗口与成本决定灵活性。",
          "集中风险":"集中并不可怕，可怕的是集中且不可退出。",
          "激励不对称":"推动者喜欢强调稀缺，却不承担集中后果。",
          "选项保留":"保留多路径比押注单一路径更重要。"
        },
        flips:["若集中风险可分层且可退出，判断将改善。","若出现更低不可逆成本的替代路径，优先保留选项。","若家庭约束变化，需更新边界。"],
        next:["把集中风险显性化（情景/压力测试）。","把灵活性损失写成可验证清单。","必要时对接执行专业人士核对条款。"]
      }
    };

    const m = db[id] || db["dm-001"];

    function li(arr){ return arr.map(x => `<li>${x}</li>`).join(''); }
    function tension(arr){ return arr.map(x => `<div class="card card--soft"><h3 class="h3">${x.t}</h3><p class="p mb-0">${x.d}</p></div>`).join(''); }
    function lenses(obj){
      return Object.entries(obj).map(([k,v]) => `
        <div class="card card--soft">
          <div class="card__meta"><span><strong>${k}</strong></span></div>
          <p class="p mb-0">${v}</p>
        </div>
      `).join('');
    }

    root.innerHTML = `
      <div class="card">
        <div class="card__meta">
          <span><strong>${m.code}</strong></span><span>·</span><span>${m.type}</span>
        </div>
        <h1 class="h2 mt-12">判断纪要</h1>
        <p class="muted">判断窗口：${m.window} · 阅读 ${m.minutes} 分钟${m.updated ? ` · 最近更新：${m.updated}` : ''}</p>
      </div>

      <div class="section section--tight">
        <div class="container read">
          <div class="kicker">当时的命题</div>
          <h2 class="h2">把问题写到可判断</h2>
          <p class="p">${m.premise}</p>

          <div class="divider"></div>

          <div class="kicker">推动这件事的力量</div>
          <h2 class="h2">把推进压力写清</h2>
          <p class="p">${m.forces}</p>

          <div class="divider"></div>

          <div class="kicker">我们先锁定的边界</div>
          <h2 class="h2">判断止步在哪里</h2>
          <ul class="p">${li(m.boundaries)}</ul>
        </div>
      </div>

      <div class="section section--tight">
        <div class="container">
          <div class="kicker">关键纠结点</div>
          <h2 class="h2">让读者产生代入感</h2>
          <div class="grid grid--3 mt-16">
            ${tension(m.tensions)}
          </div>
        </div>
      </div>

      <div class="section section--tight">
        <div class="container">
          <div class="kicker">我们如何拆（五个视角）</div>
          <h2 class="h2">用同一套语言拆不同决定</h2>
          <div class="grid grid--3 mt-16">
            ${lenses(m.lenses)}
          </div>
        </div>
      </div>

      <div class="section section--tight">
        <div class="container read">
          <div class="kicker">翻转条件</div>
          <h2 class="h2">什么发生会改变判断</h2>
          <ul class="p">${li(m.flips)}</ul>

          <div class="divider"></div>

          <div class="kicker">当时建议带走的下一步</div>
          <h2 class="h2">只写动作，不写结论</h2>
          <ul class="p">${li(m.next)}</ul>

          <div class="notice mt-24">
            不展示结果，仅呈结构。<br>
            本内容不构成法律、税务或投资建议；必要时我们会建议你对接相应执行专业人士。
          </div>

          <div class="row mt-24">
            <a class="btn btn--secondary" href="memos.html">返回判断纪要列表</a>
            <a class="btn btn--primary" href="book.html">预约一次对话</a>
          </div>
        </div>
      </div>
    `;
  }

  // Boot
  initMobileNav();
  initAnchorOffset();
  initStaticPagesTheme();
  initIndexObservers();
  initMemosList();
  initMemoDetail();
})();
