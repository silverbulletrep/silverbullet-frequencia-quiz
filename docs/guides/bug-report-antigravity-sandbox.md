# Bug Report: Antigravity Runtime Sandbox Blocks `node_modules` Access

**Date:** 2026-02-12
**macOS Version:** _(fill in: `sw_vers`)_
**Antigravity Version:** _(fill in from About menu)_
**Architecture:** Apple Silicon (arm64)

---

## Summary

The Antigravity IDE applies a **runtime sandbox profile** to all spawned shell subprocesses (`bash`, `ls`, `mkdir`, `stat`, etc.), which blocks filesystem operations on directories named `node_modules`, `dist`, and `.aios-core`. This prevents the integrated terminal/agent from running `npm install` or interacting with installed dependencies.

> **CAUTION:** This sandbox restriction **cannot be resolved** by granting Full Disk Access or App Management permissions in macOS System Settings. The sandbox is applied programmatically by the app itself, overriding OS-level permissions.

---

## Impact

- `npm install` fails with `EPERM: operation not permitted`
- Agent cannot `ls`, `stat`, `mkdir`, or `touch` anything inside `node_modules`
- Agent cannot create a directory named `node_modules` even when it doesn't exist
- `sudo` is also blocked (`/usr/bin/sudo: Operation not permitted`)
- Developers must use an external Terminal.app for all dependency management

---

## Reproduction Steps

1. Open a project in Antigravity that has a `node_modules` directory (created by Terminal.app or another process)
2. Use the Antigravity integrated terminal or agent to run:
   ```bash
   ls node_modules
   ```
3. Observe: `Operation not permitted`
4. Delete `node_modules` from an external terminal
5. Try to create it from Antigravity:
   ```bash
   mkdir node_modules
   ```
6. Observe: `Operation not permitted`
7. Try a different name:
   ```bash
   mkdir node_modulez
   ```
8. Observe: **Succeeds** — proving the restriction is name-specific

---

## Diagnostic Evidence

### 1. Kernel Log Proof (Definitive)

Command run in external Terminal.app:
```bash
log stream --predicate 'process == "kernel" && eventMessage contains "deny"' --info
```

Captured output when Antigravity agent attempted operations:

```
kernel: (Sandbox) Sandbox: bash(88459) deny(1) file-write-data /dev/dtracehelper
kernel: (Sandbox) Sandbox: bash(88459) deny(1) file-write-data /dev/tty
kernel: (Sandbox) Sandbox: bash(88459) deny(1) file-write-data /dev/ttys005
kernel: (Sandbox) Sandbox: ls(88462)   deny(1) file-read-metadata .../Funil-Quiz/node_modules
kernel: (Sandbox) Sandbox: mkdir(88463) deny(1) file-write-data /dev/dtracehelper
kernel: (Sandbox) Sandbox: stat(88465)  deny(1) file-read-metadata .../Funil-Quiz/node_modules
```

> **KEY FINDING:** The kernel explicitly attributes these denials to **Sandbox**, not to file permissions or TCC. The `bash` process spawned by Antigravity inherits a restrictive sandbox profile that blocks even `/dev/tty` access.

### 2. Entitlements Comparison (Antigravity vs Trae)

Command:
```bash
codesign -d --entitlements - "/Applications/Antigravity.app/Contents/Frameworks/Antigravity Helper (Plugin).app"
codesign -d --entitlements - "/Applications/Trae.app/Contents/Frameworks/Trae Helper (Plugin).app"
```

| Entitlement | Antigravity Helper (Plugin) | Trae Helper (Plugin) |
|---|---|---|
| `cs.allow-jit` | ✅ | ✅ |
| `cs.allow-unsigned-executable-memory` | ❌ Missing | ✅ |
| `cs.disable-library-validation` | ❌ Missing | ✅ |

Main app entitlements are identical between both IDEs. The difference is only in the Helper (Plugin) subprocess.

### 3. Name-Specific Blocking

| Operation | Result |
|---|---|
| `mkdir random_folder_name` | ✅ Success |
| `mkdir node_modulez` | ✅ Success |
| `mkdir build` | ✅ Success |
| `mkdir node_modules` | ❌ `Operation not permitted` |
| `mkdir dist` | ❌ `Operation not permitted` (when exists) |
| `mv random_folder node_modules` | ❌ `Operation not permitted` |

### 4. Full Disk Access Verification

FDA is confirmed active — the agent can read `~/Library/Safari` (a TCC-protected path). The sandbox override is independent of FDA.

```bash
ls /Users/brunogovas/Library/Safari  # SUCCESS — FDA works
mkdir node_modules                    # FAIL — Sandbox overrides FDA
```

### 5. Sudo Blocked

```bash
sudo npm install
# bash: /usr/bin/sudo: Operation not permitted
```

The sandbox blocks execution of `/usr/bin/sudo` entirely.

---

## Root Cause Analysis

The Antigravity app applies a **runtime sandbox profile** (likely via `sandbox_init()` or `sandbox-exec`) to its child processes. This profile:

1. **Allows** general file read/write in the project directory
2. **Denies** access to paths matching known dependency/build directory names (`node_modules`, `dist`)
3. **Denies** access to system binaries like `sudo`, `ps`
4. **Denies** write access to TTY devices (`/dev/tty`)

This is **not** a macOS system restriction — it is an application-level sandbox applied by the Antigravity IDE itself.

---

## Suggested Fix

Add the following entitlements to `Antigravity Helper (Plugin).app` to match Trae's configuration:

```xml
<key>com.apple.security.cs.allow-unsigned-executable-memory</key>
<true/>
<key>com.apple.security.cs.disable-library-validation</key>
<true/>
```

Additionally, review the runtime sandbox profile to ensure it does not block common development paths like `node_modules`, `dist`, `build`, or `.bin`.

---

## Workaround

Until a fix is released, developers must run dependency management commands from an external Terminal.app:

```bash
# Always run from Terminal.app, not from Antigravity
npm install
npm install <package-name>
rm -rf node_modules && npm install
```

The Antigravity agent can still edit source code files, create new files, and perform most development tasks — only `node_modules`-related operations are blocked.
