document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       Mobilne menu (hamburger)
       ========================================= */
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');

    if (hamburger && navMenu && navOverlay) {
        function closeMenu() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('no-scroll');
        }

        function toggleMenu() {
            const isActive = navMenu.classList.toggle('active');
            hamburger.classList.toggle('active', isActive);
            navOverlay.classList.toggle('active', isActive);
            hamburger.setAttribute('aria-expanded', String(isActive));
            document.body.classList.toggle('no-scroll', isActive);
        }

        hamburger.addEventListener('click', toggleMenu);
        navOverlay.addEventListener('click', closeMenu);
        navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
        window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    }

    /* =========================================
       Cień navbaru przy scrollu
       ========================================= */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    /* =========================================
       Mikroanimacje - scroll reveal
       ========================================= */
    const revealEls = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach((el, i) => {
        el.style.transitionDelay = `${(i % 3) * 0.1}s`;
        revealObserver.observe(el);
    });

    /* =========================================
       Lightbox - powiększanie zrzutów ekranu
       ========================================= */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    if (lightbox && lightboxImg && lightboxClose) {
        function openLightbox(src, alt) {
            lightboxImg.src = src;
            lightboxImg.alt = alt || 'Podgląd ekranu aplikacji';
            lightbox.classList.add('active');
            document.body.classList.add('no-scroll');
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }

        document.querySelectorAll('.phone-frame').forEach(frame => {
            frame.addEventListener('click', () => {
                const img = frame.querySelector('img');
                if (img) openLightbox(img.src, img.alt);
            });
        });

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    /* =========================================
       Formularz kontaktowy (StaticForms)
       ========================================= */
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    const formError = document.getElementById('formError');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Ochrona antyspamowa - jeśli honeypot wypełniony, to bot -> ignorujemy cicho
            if (contactForm.honeypot.value) {
                return;
            }

            formError.classList.remove('active');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            const payload = {};
            formData.forEach((value, key) => { payload[key] = value; });

            // Ustawiamy replyTo, żeby odpowiadając na maila trafić bezpośrednio do klienta
            payload.replyTo = payload.email;

            try {
                const response = await fetch('https://api.staticforms.dev/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json().catch(() => ({}));

                if (response.ok && data.success !== false) {
                    contactForm.classList.add('is-hidden');
                    formSuccess.classList.add('active');
                } else {
                    throw new Error(data.message || 'Błąd wysyłki formularza');
                }
            } catch (err) {
                console.error('Błąd wysyłki formularza:', err);
                formError.classList.add('active');
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }

});