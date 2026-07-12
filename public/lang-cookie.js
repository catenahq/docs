// Remember the language the visitor is reading so the nginx redirect at
// / can honour it on later visits. Reads the current <html lang> and
// writes a `lang` cookie; re-fires after client-side navigations.
(function () {
  function setLangCookie() {
    var lang = document.documentElement.lang;
    if (lang === "en" || lang === "fr") {
      document.cookie = "lang=" + lang + "; path=/; max-age=31536000; samesite=lax";
    }
  }
  setLangCookie();
  document.addEventListener("astro:page-load", setLangCookie);
})();
