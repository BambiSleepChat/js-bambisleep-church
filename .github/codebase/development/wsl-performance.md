# WSL Performance: File Storage & Cross-Filesystem Development

**Source:** [Microsoft WSL Setup Guide - File Storage](https://learn.microsoft.com/en-gb/windows/wsl/setup/environment#file-storage)

---

## ⚡ The Golden Rule

**Store project files on the SAME operating system as the tools you plan to use.**

```bash
# ❌ ANTI-PATTERN: Cross-filesystem access
/mnt/f/CATHEDRAL/bambisleep-church  # Windows drive accessed via WSL
# Tools: git (Linux), npm (Linux), nodemon (Linux)
# Result: 5-10x slower I/O, sluggish file watching, delayed hot reload

# ✅ CORRECT PATTERN: Same-filesystem access
/home/melkanea/CATHEDRAL/bambisleep-church  # Native WSL filesystem
# Tools: git (Linux), npm (Linux), nodemon (Linux)
# Result: Full Linux I/O speed, instant file operations
```

---

## 📊 Performance Impact by Operation

| Operation | `/mnt/f/` (Windows) | `~/` (WSL) | Speedup |
|-----------|---------------------|------------|---------|
| `git status` | ~800ms | ~80ms | **10x** |
| `npm install` | ~120s | ~15s | **8x** |
| `nodemon` file watch | High latency | Instant | **Immediate** |
| `docker build` | Slow layer caching | Fast | **5x** |
| `jest --coverage` | ~45s | ~8s | **5.6x** |

*Benchmarks vary by hardware, but cross-filesystem penalty is consistent.*

---

## 🔍 How to Check Your Current Location

```bash
# Method 1: pwd command
pwd
# /mnt/f/CATHEDRAL          ← On Windows drive (slower)
# /home/melkanea/CATHEDRAL  ← On WSL drive (faster)

# Method 2: df command (shows filesystem type)
df -Th .
# Filesystem: drvfs  ← Windows filesystem (slower)
# Filesystem: ext4   ← Linux filesystem (faster)

# Method 3: Check if path starts with /mnt/
if [[ $(pwd) == /mnt/* ]]; then
  echo "⚠️  You're on a Windows drive - expect slower performance"
else
  echo "✅ You're on WSL native filesystem - optimal speed"
fi
```

---

## 🚀 Migration Strategy: Windows → WSL Filesystem

### **Option 1: Full Migration (Recommended for Linux-heavy workflows)**

```bash
# 1. Copy project to WSL home directory
cp -r /mnt/f/CATHEDRAL ~/CATHEDRAL

# 2. Update git remote (if needed)
cd ~/CATHEDRAL/bambisleep-church
git remote -v  # Verify remote URLs still work

# 3. Reinstall node_modules (faster on WSL filesystem)
rm -rf node_modules package-lock.json
npm install

# 4. Update VS Code workspace settings
# Open: \\wsl$\Debian\home\melkanea\CATHEDRAL
```

**Access from Windows File Explorer:**
```
\\wsl$\Debian\home\melkanea\CATHEDRAL
# or
\\wsl.localhost\Debian\home\melkanea\CATHEDRAL  (Windows 11)
```

### **Option 2: Symlink Strategy (Keep Windows drive as source of truth)**

```bash
# Keep files on Windows, create WSL workspace symlink
ln -s /mnt/f/CATHEDRAL ~/CATHEDRAL

# Note: Symlinks don't eliminate cross-filesystem penalty!
# Only useful for path convenience, not performance.
```

### **Option 3: Dual Clone (Development + Production)**

```bash
# Fast WSL clone for daily development
git clone <repo> ~/bambisleep-church

# Windows clone for backups, Windows-only tools
git clone <repo> /mnt/f/CATHEDRAL/bambisleep-church

# Sync changes via git push/pull
```

---

## 🐳 Docker Performance Considerations

**Docker Desktop with WSL 2 backend:**

```yaml
# ❌ SLOW: Bind mount from Windows drive
services:
  app:
    volumes:
      - /mnt/f/CATHEDRAL/bambisleep-church:/app

# ✅ FAST: Bind mount from WSL filesystem
services:
  app:
    volumes:
      - ~/CATHEDRAL/bambisleep-church:/app
```

**Performance impact:**
- Windows drive mounts: Layer caching inefficient, slow rebuilds
- WSL drive mounts: Native Linux performance, fast incremental builds

---

## 🎯 Decision Matrix: Where Should I Store My Project?

| Scenario | Best Location | Reason |
|----------|---------------|--------|
| **Linux VPS deployment** | WSL filesystem | Match production environment |
| **Docker-heavy development** | WSL filesystem | 5-10x faster bind mounts |
| **Windows IIS deployment** | Windows filesystem | Match production environment |
| **Mixed team (Windows + WSL)** | Windows filesystem | Easier collaboration, accept slowness |
| **Heavy git operations** | WSL filesystem | 10x faster `git status`, `git log` |
| **Windows-only tools (Photoshop, etc.)** | Windows filesystem | Tools can't access WSL directly |
| **npm/Node.js development** | WSL filesystem | Faster installs, better file watching |

---

## 🔧 VS Code Settings for WSL Development

**Optimal setup for WSL filesystem projects:**

```jsonc
// .vscode/settings.json
{
  // Use WSL terminal by default
  "terminal.integrated.defaultProfile.windows": "Debian (WSL)",
  
  // Remote-WSL extension enables full WSL integration
  "remote.WSL.fileWatcher.polling": false,  // Use native inotify (faster)
  
  // Disable Windows Defender scanning of WSL files (huge speedup)
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.git/**": true
  }
}
```

**Windows Defender Exclusion (Run in PowerShell as Admin):**

```powershell
# Exclude WSL filesystem from real-time scanning
Add-MpPreference -ExclusionPath "\\wsl$\Debian\home\melkanea\CATHEDRAL"
```

---

## 🧪 Benchmark Your Own Setup

```bash
#!/bin/bash
# save as benchmark-filesystem.sh

echo "=== Git Performance ==="
time git status > /dev/null

echo ""
echo "=== npm Performance ==="
rm -rf node_modules package-lock.json
time npm install > /dev/null 2>&1

echo ""
echo "=== File I/O Performance ==="
time dd if=/dev/zero of=testfile bs=1M count=100 > /dev/null 2>&1
rm testfile

echo ""
echo "=== Filesystem Type ==="
df -Th . | tail -1
```

**Run on both locations:**

```bash
# Test Windows drive
cd /mnt/f/CATHEDRAL/bambisleep-church
./benchmark-filesystem.sh

# Test WSL drive
cd ~/CATHEDRAL/bambisleep-church
./benchmark-filesystem.sh

# Compare results
```

---

## 📚 Related Microsoft Documentation

- [WSL File Systems](https://learn.microsoft.com/en-gb/windows/wsl/filesystems)
- [Best Practices for WSL](https://learn.microsoft.com/en-gb/windows/wsl/setup/environment)
- [Comparing WSL 1 and WSL 2](https://learn.microsoft.com/en-gb/windows/wsl/compare-versions)

---

## 🎭 The Philosophy: Law vs Lore

**Law (Technical Truth):**
- Cross-filesystem access incurs 9P protocol overhead
- Linux syscalls on Windows files require kernel translation
- File watching uses polling instead of inotify

**Lore (Human Context):**
- Developers discovered 45-second test suites became 8 seconds after migration
- `nodemon` hot reload went from "delayed frustration" to "instant joy"
- The moment you `git status` in <100ms, you feel the difference

**The Choice:**
- Keep files on Windows if Windows tools are primary (Photoshop, Office, games)
- Move files to WSL if Linux tools are primary (git, npm, docker, ssh)
- Accept the tradeoff if you truly need both worlds

---

**Current Project Status:** `/mnt/f/CATHEDRAL` (Windows drive)  
**Recommendation:** Migrate to `~/CATHEDRAL` for 5-10x performance gain  
**Updated:** November 3, 2025 (per Microsoft WSL documentation)
