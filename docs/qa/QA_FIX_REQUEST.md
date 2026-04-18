# QA_FIX_REQUEST

## Story ID: 3.5
**Severity**: CRITICAL 🚨
**Date**: 2026-02-19

---

### Issue #1 — `style.css` Global Body Override (ROOT CAUSE)

**File:** `Pressel - Wl - Vidal/assets/css/style.css` (line 14-17)  
**Imported by:** `TransitionPage.jsx` (line 6) and `PresselResultado.jsx` (line 4)

**Problem:**
This non-module CSS file sets:
```css
body {
    display: flex; justify-content: center; align-items: center;
    min-height: 100vh; padding: 20px;
}
```
Vite injects this as a global `<style>` tag into `<head>` and **never removes it** — even after navigating away from `/transition`. Every subsequent page inherits `body { display: flex }`.

Meanwhile, Vturb's `smartplayer.js` **teleports** the `<vturb-smartplayer>` element out of `#root` and places it as a **direct child of `<body>`**. This creates two flex siblings:
```
<body style="display:flex">
  <vturb-smartplayer>  ← flex child 1
  <div id="root">     ← flex child 2
```
Result: the player sits **side-by-side** with the entire React app (Print 02), or **above** it depending on viewport (Print 01).

**Fix:**
Scope the `body` rule under `.card-container` in `style.css`:
```diff
-body {
-    font-family: var(--font-body); background-color: var(--c-background); color: var(--c-brand-light);
-    display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px;
-}
+.card-container {
+    font-family: var(--font-body); background-color: var(--c-background); color: var(--c-brand-light);
+    display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px;
+}
```
Also scope `* { margin: 0; padding: 0; }` (line 12) under `.card-container *` to avoid conflicting with the app's own resets.

---

### Issue #2 — TransitionPage Cleanup Race Condition

**File:** `TransitionPage.jsx` cleanup useEffect

**Problem:**
The cleanup function in `TransitionPage.jsx` runs `document.querySelectorAll('script[src*="converteai"]').forEach(el => el.remove())` on unmount. When navigating forward to `/vsl`, `VSL.jsx` mounts and injects scripts **before** `TransitionPage` finishes unmounting. The cleanup then destroys the scripts VSL just created.

**Fix:**
Gate the cleanup behind `window.location.pathname`:
```javascript
return () => { 
  cleanup.forEach(fn => fn());
  try {
    if (!window.location.pathname.includes('/vsl')) {
      document.querySelectorAll('vturb-smartplayer').forEach(el => el.remove());
      document.querySelectorAll('script[src*="converteai"]').forEach(el => el.remove());
    }
  } catch (e) {}
}
```

---

### Previously Ruled Out (per user)
- ~~body `display: flex` override~~ — User tried but fix was incorrectly scoped (the source is `style.css`, not `index.css`)
- ~~CSS Module hashing Vturb selector~~ — Not the issue; Vturb renders outside React's DOM tree entirely
