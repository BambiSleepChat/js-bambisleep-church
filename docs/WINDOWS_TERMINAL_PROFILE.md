# Windows Terminal Profile Configuration for BambiSleep™ Church

Add this profile to your Windows Terminal settings (`settings.json`) to quickly open the project in WSL.

## Profile Configuration

Open Windows Terminal → Settings (Ctrl+,) → Open JSON file

Add this to the `"profiles"` → `"list"` array:

```json
{
  "name": "🌸 BambiSleep™ Church (WSL)",
  "commandline": "wsl.exe -d Ubuntu cd /mnt/f/bambisleep-church && bash",
  "icon": "🌸",
  "colorScheme": "One Half Dark",
  "startingDirectory": "//wsl$/Ubuntu/mnt/f/bambisleep-church",
  "tabTitle": "BambiSleep™ Church",
  "suppressApplicationTitle": false,
  "fontFace": "Cascadia Code",
  "fontSize": 10,
  "background": "#1e1e2e",
  "foreground": "#cdd6f4",
  "cursorShape": "bar",
  "useAcrylic": false,
  "bellStyle": "visual"
}
```

## Alternative: Simple WSL Profile

If you prefer a simpler configuration:

```json
{
  "name": "BambiSleep™ Church - WSL",
  "commandline": "wsl.exe ~ -e bash -c 'cd /mnt/f/bambisleep-church && exec bash'",
  "startingDirectory": "//wsl$/Ubuntu/mnt/f/bambisleep-church",
  "icon": "🌸"
}
```

## Quick Launch Commands

After adding the profile, you can:

### From Windows Terminal:
1. Open Windows Terminal
2. Click dropdown arrow next to "+" tab button
3. Select "🌸 BambiSleep™ Church (WSL)"

### From Command Line:
```powershell
# Launch Windows Terminal with WSL profile
wt -p "BambiSleep™ Church (WSL)"

# Or use WSL directly
wsl -d Ubuntu -e bash -c "cd /mnt/f/bambisleep-church && exec bash"
```

## Color Schemes (Optional)

### Diablo-Inspired Theme
Add to `"schemes"` array in Windows Terminal settings:

```json
{
  "name": "BambiSleep Diablo",
  "background": "#0c0c0c",
  "foreground": "#d0d0d0",
  "black": "#0c0c0c",
  "blue": "#0037da",
  "cyan": "#3a96dd",
  "green": "#13a10e",
  "purple": "#881798",
  "red": "#c50f1f",
  "white": "#cccccc",
  "yellow": "#c19c00",
  "brightBlack": "#767676",
  "brightBlue": "#3b78ff",
  "brightCyan": "#61d6d6",
  "brightGreen": "#16c60c",
  "brightPurple": "#b4009e",
  "brightRed": "#e74856",
  "brightWhite": "#f2f2f2",
  "brightYellow": "#f9f1a5",
  "cursorColor": "#ffffff",
  "selectionBackground": "#ffffff"
}
```

Then update your profile to use it:
```json
"colorScheme": "BambiSleep Diablo"
```

## Auto-Start Tasks

Add these to your profile for automatic initialization:

```json
{
  "name": "🌸 BambiSleep™ Church (Dev Server)",
  "commandline": "wsl.exe -d Ubuntu -e bash -c 'cd /mnt/f/bambisleep-church && npm run dev'",
  "startingDirectory": "//wsl$/Ubuntu/mnt/f/bambisleep-church",
  "icon": "✨",
  "tabTitle": "Dev Server"
}
```

## Multiple Tabs Layout

Create a complex layout with multiple services:

```json
{
  "profiles": [
    {
      "name": "🌸 Church - Main",
      "commandline": "wsl.exe -d Ubuntu -e bash -c 'cd /mnt/f/bambisleep-church && bash'"
    },
    {
      "name": "✨ Church - Dev Server",
      "commandline": "wsl.exe -d Ubuntu -e bash -c 'cd /mnt/f/bambisleep-church && npm run dev'"
    },
    {
      "name": "💎 Church - Tests",
      "commandline": "wsl.exe -d Ubuntu -e bash -c 'cd /mnt/f/bambisleep-church && npm run test:watch'"
    }
  ]
}
```

Launch all at once:
```powershell
wt -p "Church - Main" ; split-pane -p "Church - Dev Server" ; split-pane -p "Church - Tests"
```

## Keybindings (Optional)

Add to `"actions"` array:

```json
{
  "command": {
    "action": "newTab",
    "profile": "BambiSleep™ Church (WSL)"
  },
  "keys": "ctrl+shift+b"
}
```

Now press `Ctrl+Shift+B` to instantly open a new tab with the project!

## Verification

Test your profile:
```powershell
# In Windows Terminal
wt -p "BambiSleep™ Church (WSL)"

# Should open in /mnt/f/bambisleep-church
pwd
# Output: /mnt/f/bambisleep-church

# Verify Node.js
node --version
# Output: v20.x.x
```

---

**Reference**: [Windows Terminal Documentation](https://learn.microsoft.com/en-us/windows/terminal/)
