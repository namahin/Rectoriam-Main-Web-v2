/* ============================================================================
   Rectoriam — site behaviour

   Loaded from <head> immediately after the Tailwind CDN, so the theme
   extension is registered before Tailwind generates its utilities and the
   'js' flag lands before the first paint. Everything that touches the DOM
   waits for DOMContentLoaded, so the same file serves every page.
   ============================================================================ */

/* Reveal animations only apply when JS can undo them; without JS the page stays visible. */
document.documentElement.classList.add('js');

/* ---- Tailwind theme extension. Guarded so a blocked CDN cannot abort this
       file — the reveal setup below still runs and the page stays readable. ---- */
if (window.tailwind) {
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    page: 'rgb(var(--c-page) / <alpha-value>)',
                    surface: 'rgb(var(--c-surface) / <alpha-value>)',
                    line: 'rgb(var(--c-line) / <alpha-value>)',
                    ink: 'rgb(var(--c-ink) / <alpha-value>)',
                    muted: 'rgb(var(--c-muted) / <alpha-value>)',
                    brand: 'rgb(var(--c-brand) / <alpha-value>)',
                    brandHover: 'rgb(var(--c-brand-hover) / <alpha-value>)',
                    brandSoft: 'rgb(var(--c-brand-soft) / <alpha-value>)',
                    indigo: 'rgb(var(--c-indigo) / <alpha-value>)',
                    indigoDeep: 'rgb(var(--c-indigo-deep) / <alpha-value>)',
                },
                fontFamily: {
                    sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
                    mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
                },
                borderRadius: {
                    // SHAPE LOCK: panels = 'panel' (18px), icon tiles = 'tile' (12px),
                    // every interactive control = rounded-full. No other radii on this page.
                    panel: '18px',
                    tile: '12px',
                },
                maxWidth: {
                    shell: '1240px'
                },
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {

    // Scroll reveal via IntersectionObserver. Elements stay visible once shown.
    (function () {
        var nodes = document.querySelectorAll('[data-reveal]');
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduce || !('IntersectionObserver' in window)) {
            nodes.forEach(function (n) {
                n.classList.add('is-in');
            });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -80px 0px',
            threshold: 0
        });

        nodes.forEach(function (n) {
            io.observe(n);
        });
    })();

    // Mobile navigation panel.
    (function () {
        var btn = document.getElementById('navToggle');
        var panel = document.getElementById('navPanel');
        if (!btn || !panel) return;

        btn.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            btn.setAttribute('aria-expanded', String(open));
            btn.querySelector('i').className = 'ph i text-xl ' + (open ? 'ph-x' : 'ph-list');
        });
    })();

    // Account deletion request form. Only present on account-deletion.html.
    (function () {
        var form = document.getElementById('dataRequestForm');
        if (!form) return;

        var full = document.getElementById('boxFull');
        var partial = document.getElementById('boxPartial');
        var list = document.getElementById('partialList');

        // Request-type switch: only one card is active, and the selective list
        // is revealed with it.
        function toggleMode(mode) {
            if (mode === 'full') {
                full.classList.add('selected');
                partial.classList.remove('selected');
                list.style.display = 'none';
            } else {
                partial.classList.add('selected');
                full.classList.remove('selected');
                list.style.display = 'block';
            }
        }

        form.querySelectorAll('input[name="requestType"]').forEach(function (radio) {
            radio.addEventListener('change', function () {
                toggleMode(radio.value);
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var isPartial = form.querySelector('input[name="requestType"]:checked').value === 'partial';
            if (isPartial) {
                var chosen = document.getElementById('dataCache').checked
                    || document.getElementById('dataHistory').checked
                    || document.getElementById('dataKyc').checked;

                if (!chosen) {
                    alert('Please specify at least one type of data you wish to remove from your Rectoriam account.');
                    return;
                }
            }

            var btn = document.getElementById('btnSubmit');
            btn.textContent = 'Authenticating & Submitting...';
            btn.disabled = true;

            setTimeout(function () {
                btn.style.display = 'none';
                document.getElementById('formNote').style.display = 'none';
                document.getElementById('msgSuccess').style.display = 'flex';
            }, 1500);
        });
    })();

});
