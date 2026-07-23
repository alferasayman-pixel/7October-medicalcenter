(() => {
  document.documentElement.style.colorScheme = 'only light';
  document.body.style.backgroundColor = '#ffffff';
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    }).catch(() => {});
  }
  if ('caches' in window) {
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).catch(() => {});
  }

  const menuButton = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const navLinks = [...document.querySelectorAll('.nav-menu a')];
  const backTop = document.querySelector('.back-top');
  const form = document.querySelector('#appointment-form');
  const formStatus = document.querySelector('#form-status');
  const specialtyField = document.querySelector('#specialty');
  const dateField = form?.querySelector('input[type="date"]');
  const year = document.querySelector('#year');
  const serviceSearch = document.querySelector('#service-search');
  const filterButtons = [...document.querySelectorAll('.filter-chip')];
  const serviceCards = [...document.querySelectorAll('.service-card')];
  const servicesEmpty = document.querySelector('#services-empty');
  const mapLink = document.querySelector('#map-link');
  const centerWhatsApp = document.body.dataset.whatsapp || '';
  let activeFilter = 'all';

  if (year) year.textContent = String(new Date().getFullYear());
  if (dateField) dateField.min = new Date().toISOString().split('T')[0];

  const closeMenu = () => {
    menu?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'فتح القائمة');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = menu?.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(Boolean(isOpen)));
    menuButton.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (!menu?.classList.contains('open')) return;
    if (menu.contains(event.target) || menuButton?.contains(event.target)) return;
    closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.querySelectorAll('[data-specialty]').forEach((link) => {
    link.addEventListener('click', () => {
      if (specialtyField) specialtyField.value = link.dataset.specialty || '';
    });
  });

  const normalizeArabic = (value) => String(value || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();

  const applyServiceFilter = () => {
    const query = normalizeArabic(serviceSearch?.value);
    let visibleCount = 0;
    serviceCards.forEach((card) => {
      const categoryMatches = activeFilter === 'all' || card.dataset.category === activeFilter;
      const haystack = normalizeArabic(`${card.textContent} ${card.dataset.keywords || ''}`);
      const queryMatches = !query || haystack.includes(query);
      const visible = categoryMatches && queryMatches;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (servicesEmpty) servicesEmpty.hidden = visibleCount !== 0;
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      applyServiceFilter();
    });
  });
  serviceSearch?.addEventListener('input', applyServiceFilter);

  const sections = [...document.querySelectorAll('.section-marker[id], header[id]')];
  const updateNavigation = () => {
    const marker = window.scrollY + 170;
    let current = 'home';
    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section.id;
    });
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    backTop?.classList.toggle('show', window.scrollY > 650);
  };

  window.addEventListener('scroll', updateNavigation, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.remove('visible'));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px' });
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
  }

  const copyText = async (text) => {
    if (!navigator.clipboard) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      if (formStatus) {
        formStatus.textContent = 'يرجى استكمال الحقول المطلوبة والتحقق من رقم الهاتف.';
        formStatus.style.color = '#9f342c';
      }
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const message = [
      'طلب موعد جديد — مركز 7 أكتوبر الطبي',
      '',
      `الاسم: ${data.get('name')}`,
      `رقم الهاتف: ${data.get('phone')}`,
      `التخصص: ${data.get('specialty')}`,
      `التاريخ المفضل: ${data.get('date')}`,
      `الفترة المفضلة: ${data.get('time')}`,
      `ملاحظات: ${data.get('message') || 'لا توجد'}`
    ].join('\n');

    const placeholderNumber = !centerWhatsApp || /0{6,}/.test(centerWhatsApp);
    if (placeholderNumber) {
      const copied = await copyText(message);
      if (formStatus) {
        formStatus.textContent = copied
          ? 'تم تجهيز الطلب ونسخه. أضف رقم واتساب الرسمي للمركز لتفعيل الإرسال المباشر.'
          : 'تم تجهيز الطلب. أضف رقم واتساب الرسمي للمركز لتفعيل الإرسال المباشر.';
        formStatus.style.color = '#0a6b68';
      }
      return;
    }

    if (formStatus) {
      formStatus.textContent = 'سيتم الآن فتح واتساب لإرسال طلب الموعد.';
      formStatus.style.color = '#0a6b68';
    }
    window.open(`https://wa.me/${centerWhatsApp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });

  mapLink?.addEventListener('click', (event) => {
    if (mapLink.getAttribute('href') === '#') {
      event.preventDefault();
      mapLink.textContent = 'أضف رابط الخريطة الرسمي أولًا';
    }
  });

  updateNavigation();
  applyServiceFilter();
})();
