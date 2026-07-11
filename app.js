(() => {
  const menuButton = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const links = [...document.querySelectorAll('.nav-menu a')];
  const backTop = document.querySelector('.back-top');
  const form = document.querySelector('#appointment-form');
  const status = document.querySelector('#form-status');
  const specialtyField = document.querySelector('#specialty');
  const dateField = form?.querySelector('input[type="date"]');
  const year = document.querySelector('#year');
  const centerWhatsApp = '967000000000';

  if (year) year.textContent = new Date().getFullYear();
  if (dateField) dateField.min = new Date().toISOString().split('T')[0];

  menuButton?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  links.forEach(link => link.addEventListener('click', () => {
    menu?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  document.querySelectorAll('[data-specialty]').forEach(link => {
    link.addEventListener('click', () => {
      if (specialtyField) specialtyField.value = link.dataset.specialty || '';
    });
  });

  const sections = [...document.querySelectorAll('.section-marker[id], header[id]')];
  const updateNavigation = () => {
    const marker = window.scrollY + 160;
    let current = 'home';
    sections.forEach(section => {
      if (section.offsetTop <= marker) current = section.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
    backTop?.classList.toggle('show', window.scrollY > 600);
  };

  window.addEventListener('scroll', updateNavigation, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = 'يرجى استكمال الحقول المطلوبة والموافقة على استخدام البيانات.';
      status.style.color = '#9b3d28';
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
      `الوقت المفضل: ${data.get('time')}`,
      `ملاحظات: ${data.get('message') || 'لا توجد'}`
    ].join('\n');

    status.textContent = 'سيتم الآن فتح واتساب لإرسال طلب الموعد.';
    status.style.color = '#087074';
    window.open(`https://wa.me/${centerWhatsApp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }

  updateNavigation();
})();