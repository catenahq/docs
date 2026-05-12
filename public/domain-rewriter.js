// Interactive yourdomain.com placeholder.
//
// The docs source keeps the literal string `yourdomain.com` everywhere
// (plain markdown, grep-able, no Astro frontmatter magic). At read
// time, this script swaps it for the value the operator/client typed
// into the header input pill, persists the choice in localStorage,
// and accepts an explicit `?domain=` URL override for shareable
// links.
//
// Hooks:
//   - text-node MutationObserver -- catches Starlight's dynamic
//     navigation render
//   - clipboard rewrite on copy-code buttons -- pasted snippets use
//     the substituted form, not the placeholder
//   - Pagefind result hook (default-export ui only) -- search snippets
//     show the substituted form
//
// Escape hatch: any element with `data-no-domain-rewrite` is left
// alone (and its descendants).

(() => {
  const KEY = "catena_domain";
  const PLACEHOLDER = "yourdomain.com";
  const PLACEHOLDER_RE = /\byourdomain\.com\b/g;

  function readUrlOverride() {
    try {
      const v = new URL(location.href).searchParams.get("domain");
      return v ? sanitize(v) : null;
    } catch {
      return null;
    }
  }

  function sanitize(raw) {
    if (!raw) return "";
    let v = String(raw).trim().toLowerCase();
    v = v.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v)) return "";
    return v;
  }

  function getDomain() {
    const fromUrl = readUrlOverride();
    if (fromUrl) return fromUrl;
    try {
      const v = localStorage.getItem(KEY);
      return v ? sanitize(v) : "";
    } catch {
      return "";
    }
  }

  function setDomain(v) {
    const clean = sanitize(v);
    try {
      if (clean) localStorage.setItem(KEY, clean);
      else localStorage.removeItem(KEY);
    } catch {}
    return clean;
  }

  function shouldSkip(node) {
    let n = node;
    while (n) {
      if (
        n.nodeType === 1 &&
        (n.hasAttribute?.("data-no-domain-rewrite") ||
          n.tagName === "SCRIPT" ||
          n.tagName === "STYLE")
      ) {
        return true;
      }
      n = n.parentNode;
    }
    return false;
  }

  function rewriteTextNode(node, target) {
    if (!node.nodeValue || !PLACEHOLDER_RE.test(node.nodeValue)) {
      PLACEHOLDER_RE.lastIndex = 0;
      return;
    }
    PLACEHOLDER_RE.lastIndex = 0;
    if (shouldSkip(node)) return;
    node.nodeValue = node.nodeValue.replace(PLACEHOLDER_RE, target);
  }

  function rewriteAttribute(el, attr, target) {
    const val = el.getAttribute(attr);
    if (!val || !val.includes(PLACEHOLDER)) return;
    if (shouldSkip(el)) return;
    el.setAttribute(attr, val.split(PLACEHOLDER).join(target));
  }

  function rewriteAllUnder(root, target) {
    if (!target) return;
    // Text nodes.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) rewriteTextNode(node, target);
    // href / src / value / title attributes that reference yourdomain.com.
    const els = root.querySelectorAll?.(
      '[href*="yourdomain.com"], [src*="yourdomain.com"], [value*="yourdomain.com"], [title*="yourdomain.com"]'
    );
    els?.forEach((el) => {
      ["href", "src", "value", "title"].forEach((a) => {
        if (el.hasAttribute(a)) rewriteAttribute(el, a, target);
      });
    });
  }

  function installObserver(target) {
    const obs = new MutationObserver((records) => {
      const t = state.target;
      if (!t) return;
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (n.nodeType === 3) rewriteTextNode(n, t);
          else if (n.nodeType === 1) rewriteAllUnder(n, t);
        }
        if (r.type === "characterData" && r.target.nodeType === 3) {
          rewriteTextNode(r.target, t);
        }
      }
    });
    obs.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    return obs;
  }

  function installClipboardHook() {
    document.addEventListener(
      "copy",
      (e) => {
        const t = state.target;
        if (!t) return;
        const sel = document.getSelection?.()?.toString();
        if (!sel || !sel.includes(PLACEHOLDER)) return;
        e.clipboardData?.setData("text/plain", sel.split(PLACEHOLDER).join(t));
        e.preventDefault();
      },
      true,
    );
    // Starlight's <Code> "copy" buttons fire a click -> programmatic
    // clipboard write. Listen for clicks on .copy / [data-copy] and
    // patch the value before it lands.
    document.addEventListener("click", (ev) => {
      const t = state.target;
      if (!t) return;
      const btn = ev.target?.closest?.(
        'button.copy, button[data-code], button[data-copy], [data-action="copy"]',
      );
      if (!btn) return;
      const code = btn.closest("figure, pre, .expressive-code, .copy-target")?.querySelector("code, pre");
      if (!code) return;
      // The button reads code.textContent at click time; patch it.
      // Save original so re-clicks stay correct.
      if (!code.dataset.cnDomainPatched) {
        code.dataset.cnDomainPatched = "1";
        // No-op: the textContent is rewritten by the MutationObserver
        // pass already. This block reserved for engines that copy
        // from a hidden buffer.
      }
    }, true);
  }

  const state = { target: "", domainEl: null };

  function applyTarget(value) {
    const target = sanitize(value);
    state.target = target;
    if (target) {
      rewriteAllUnder(document.body, target);
    }
    document.documentElement.dataset.cnDomain = target || "";
    if (state.domainEl) {
      state.domainEl.value = target;
    }
  }

  const STRINGS = {
    en: {
      label: "Your domain",
      clearTitle: "Clear and restore placeholder",
    },
    fr: {
      label: "Votre domaine",
      clearTitle: "Effacer et restaurer le texte par défaut",
    },
  };

  function getLocale() {
    const lang = (document.documentElement.lang || "en").toLowerCase();
    return lang.startsWith("fr") ? "fr" : "en";
  }

  function injectPill() {
    const t = STRINGS[getLocale()];
    const pill = document.createElement("div");
    pill.setAttribute("data-no-domain-rewrite", "");
    pill.className = "catena-domain-pill";
    pill.innerHTML = `
      <label for="catena-domain-input" class="catena-domain-pill__label">
        ${t.label}
      </label>
      <div class="catena-domain-pill__row">
        <input id="catena-domain-input" type="text"
               placeholder="yourdomain.com"
               autocomplete="off"
               spellcheck="false"
               class="catena-domain-pill__input"/>
        <button type="button" data-clear
                title="${t.clearTitle}"
                aria-label="${t.clearTitle}"
                class="catena-domain-pill__clear">&times;</button>
      </div>
    `;
    const input = pill.querySelector("input");
    const clear = pill.querySelector("[data-clear]");
    state.domainEl = input;
    input.value = state.target || "";
    input.addEventListener("input", () => {
      applyTarget(setDomain(input.value));
    });
    clear.addEventListener("click", () => {
      input.value = "";
      setDomain("");
      // Reload to restore the placeholder text fully -- in-page reset
      // is fragile because we already mutated text nodes.
      location.reload();
    });
    return pill;
  }

  function mountPill() {
    // Mount inside the left sidebar so the input flows with the nav
    // instead of crowding the header. Fallback to <main> only if the
    // sidebar is absent (some Starlight pages render without one).
    const sidebar = document.querySelector(
      "nav.sidebar .sidebar-content, #starlight__sidebar .sidebar-content, .sidebar-content"
    );
    const target = sidebar || document.querySelector("main");
    if (!target) return;
    const pill = injectPill();
    if (sidebar) {
      sidebar.insertBefore(pill, sidebar.firstChild);
    } else {
      target.appendChild(pill);
    }
  }

  function installPagefindHook() {
    // Pagefind exposes window.pagefind once initialized. If results
    // are rendered with the default UI, we patch via a ResultRender
    // option. This is best-effort -- if not present, the regular
    // MutationObserver still rewrites the rendered snippets.
    document.addEventListener("DOMContentLoaded", () => {
      const orig = window.pagefind?.search;
      if (!orig) return;
      window.pagefind.search = async (...args) => {
        const result = await orig.apply(window.pagefind, args);
        if (result?.results && state.target) {
          for (const r of result.results) {
            const origData = r.data;
            r.data = async () => {
              const d = await origData();
              if (d.excerpt) {
                d.excerpt = d.excerpt.split(PLACEHOLDER).join(state.target);
              }
              return d;
            };
          }
        }
        return result;
      };
    });
  }

  function init() {
    applyTarget(getDomain());
    installObserver();
    installClipboardHook();
    installPagefindHook();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mountPill);
    } else {
      mountPill();
    }
  }

  init();
})();
