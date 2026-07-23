(() => {
  'use strict';

  document.documentElement.style.colorScheme = 'only light';
  document.body.style.backgroundColor = '#ffffff';

  // Remove registrations and caches left by older versions. The site remains
  // fully visible without waiting for JavaScript or a service worker.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});
  }
  if ('caches' in window) {
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => {});
  }

  const menuButton = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const navLinks = [...document.querySelectorAll('.nav-menu a')];
  const sections = [...document.querySelectorAll('.section-marker[id], header[id]')];
  const backTop = document.querySelector('.back-top');
  const year = document.querySelector('#year');
  const serviceSearch = document.querySelector('#service-search');
  const filterButtons = [...document.querySelectorAll('.filter-chip')];
  const serviceCards = [...document.querySelectorAll('.service-card')];
  const serviceEmpty = document.querySelector('#service-empty');
  const form = document.querySelector('#appointment-form');
  const formStatus = document.querySelector('#form-status');
  const specialtyField = document.querySelector('#specialty');
  const dateField = form?.querySelector('input[type="date"]');
  const mapLink = document.querySelector('#map-link');
  const centerWhatsApp = (document.body.dataset.whatsapp || '').replace(/\D/g, '');

  if (year) year.textContent = String(new Date().getFullYear());
  if (dateField) dateField.min = new Date().toISOString().slice(0, 10);

  menuButton?.addEventListener('click', () => {
    const isOpen = menu?.classList.toggle('open') ?? false;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menu?.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
      menuButton?.setAttribute('aria-label', 'فتح القائمة');
    });
  });

  document.addEventListener('click', (event) => {
    if (!menu?.classList.contains('open')) return;
    if (menu.contains(event.target) || menuButton?.contains(event.target)) return;
    menu.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      menu?.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
      menuButton?.focus();
    }
  });

  const updateNavigation = () => {
    const marker = window.scrollY + 160;
    let current = 'home';
    sections.forEach((section) => {
      if (section.offsetTop <= marker) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
    backTop?.classList.toggle('show', window.scrollY > 650);
  };

  window.addEventListener('scroll', updateNavigation, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  let selectedFilter = 'all';
  const normalize = (value) => value
    .toLocaleLowerCase('ar')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();

  const applyServiceFilter = () => {
    const query = normalize(serviceSearch?.value || '');
    let visibleCount = 0;

    serviceCards.forEach((card) => {
      const categoryMatch = selectedFilter === 'all' || card.dataset.category === selectedFilter;
      const searchableText = normalize(`${card.textContent} ${card.dataset.keywords || ''}`);
      const searchMatch = !query || searchableText.includes(query);
      const visible = categoryMatch && searchMatch;
      card.classList.toggle('hidden', !visible);
      if (visible) visibleCount += 1;
    });

    if (serviceEmpty) serviceEmpty.hidden = visibleCount !== 0;
  };

  serviceSearch?.addEventListener('input', applyServiceFilter);
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedFilter = button.dataset.filter || 'all';
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      applyServiceFilter();
    });
  });

  document.querySelectorAll('[data-specialty]').forEach((link) => {
    link.addEventListener('click', () => {
      if (specialtyField) specialtyField.value = link.dataset.specialty || '';
    });
  });

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    textarea.remove();
    return copied;
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return fallbackCopy(text);
      }
    }
    return fallbackCopy(text);
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      if (formStatus) {
        formStatus.textContent = 'يرجى استكمال الحقول المطلوبة والتحقق من رقم الهاتف.';
        formStatus.style.color = '#9d342c';
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

    const placeholderNumber = !centerWhatsApp || /^9670{6,}$/.test(centerWhatsApp) || /0{8,}/.test(centerWhatsApp);

    if (placeholderNumber) {
      const copied = await copyText(message);
      if (formStatus) {
        formStatus.textContent = copied
          ? 'تم تجهيز الطلب ونسخه. يجب إضافة رقم واتساب الرسمي لتفعيل الإرسال المباشر.'
          : 'تم تجهيز الطلب. يجب إضافة رقم واتساب الرسمي لتفعيل الإرسال المباشر.';
        formStatus.style.color = '#0d5c61';
      }
      return;
    }

    if (formStatus) {
      formStatus.textContent = 'سيتم الآن فتح واتساب لإرسال طلب الموعد.';
      formStatus.style.color = '#0d5c61';
    }

    const url = `https://wa.me/${centerWhatsApp}?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.href = url;
  });

  mapLink?.addEventListener('click', (event) => {
    if (mapLink.getAttribute('href') === '#') {
      event.preventDefault();
      mapLink.textContent = 'تُضاف الخريطة بعد اعتماد الموقع';
    }
  });

  updateNavigation();
  applyServiceFilter();
})();
