# Dark Mode Conversion Guide

Instructions for converting the Mermaid Flowchart Studio to dark mode using LazyVim.

## Vim Motion Basics

### Navigation Within a Line

| Command | Action | Example |
|---------|--------|---------|
| `l` | Move right one character | Slow for long distances |
| `h` | Move left one character | Slow for long distances |
| `w` | Jump to **start** of next word | Fast horizontal movement |
| `b` | Jump **back** to start of previous word | Reverse of `w` |
| `e` | Jump to **end** of current/next word | Useful before append |
| `$` | Jump to **end of line** | Quick line-end access |
| `0` | Jump to **beginning of line** (column 0) | Absolute start |
| `^` | Jump to **first non-whitespace** character | Smart start |
| `f{char}` | **Find** next occurrence of `{char}` on line | `f"` finds next quote |
| `t{char}` | Jump **to** (before) next `{char}` | `t"` stops before quote |
| `;` | Repeat last `f` or `t` motion | Find next occurrence |
| `,` | Repeat last `f` or `t` backwards | Find previous |

**Example:** To quickly move from start of line to the word "overflow":
```vim
0        " Go to start of line
/overflow " Search for it
# OR use word jumps
wwww     " Jump forward 4 words (if it's the 4th word)
```

### Vim Operator-Motion Pattern

Vim uses a **grammar** of `[operator][motion]`:

**Operators:**
- `c` = **change** (delete and enter insert mode)
- `d` = **delete** (cut)
- `y` = **yank** (copy)

**Text Objects:**
- `iw` = **inner word** (word without spaces)
- `aw` = **a word** (word with spaces)
- `i"` = **inner quotes** (text inside quotes)
- `a"` = **around quotes** (includes quotes)
- `i(` = **inner parentheses**
- `it` = **inner tag** (HTML/XML)

**Combined Examples:**
- `ciw` = **change inner word** (delete word, enter insert)
- `diw` = **delete inner word** (cut word)
- `yiw` = **yank inner word** (copy word)
- `ci"` = **change inside quotes**
- `da(` = **delete around parentheses** (including parens)

This pattern is called **Vim's composable command language**.

---

## Changes Required

### 1. Main Background Gradient (Line 92)

**Navigate:** `92gg` (go to line 92)

**Find:** `/from-primary-600 via-primary-500 to-primary-700` then `Enter`

**Replace Options:**

**Option A - Change in word mode:**
1. `ciw` on "from-primary-600" → type `from-gray-900`
2. `w` then `ciw` on "via-primary-500" → type `via-gray-800`
3. `w` then `ciw` on "to-primary-700" → type `to-primary-950`

**Option B - Substitute command:**
```vim
:s/from-primary-600 via-primary-500 to-primary-700/from-gray-900 via-gray-800 to-primary-950/
```

---

### 2. Preview Panel Background (Line 174)

**Navigate:** `174gg`

**Find:** `/bg-white overflow` then `Enter`

**Replace Options:**

**Option A - Change in word:**
- `ciw` on "bg-white" → type `bg-gray-900`

**Option B - Substitute command:**
```vim
:s/bg-white overflow/bg-gray-900 overflow/
```

---

### 3. Mermaid Theme Configuration (Line 19)

**Navigate:** `19gg`

**Find:** `/theme: 'default'` then `Enter`

**Replace Options:**

**Option A - Change inside quotes:**
- `f'` (jump to first quote)
- `ci'` (change inside quotes)
- Type `dark`

**Option B - Substitute command:**
```vim
:s/theme: 'default'/theme: 'dark'/
```

---

### 4. Add Dark Background to Preview Container (Line 175)

**Navigate:** `175gg`

**Find:** `/id="preview"` then `Enter`

**Add class attribute:**
- `f"` (jump to closing quote of id)
- `a` (append after quote)
- Type ` class="bg-gray-800 rounded-lg"`

**Result:**
```html
<div id="preview" class="bg-gray-800 rounded-lg flex items-center justify-center min-h-full"></div>
```

---

## Quick LazyVim Workflow (All Changes at Once)

Execute all substitutions in sequence:

```vim
:92s/from-primary-600 via-primary-500 to-primary-700/from-gray-900 via-gray-800 to-primary-950/
:174s/bg-white overflow/bg-gray-900 overflow/
:19s/theme: 'default'/theme: 'dark'/
:175s/class="/class="bg-gray-800 rounded-lg /
:w
```

---

## Summary

These changes will:
- Convert the purple gradient background to dark grays
- Make the preview panel dark
- Switch Mermaid to use dark theme
- Add proper dark background for diagram rendering
- **Keep all glassmorphism effects intact**

File: `src/routes/+page.svelte`

---

## Practical Workflow Example

Let's walk through Change #1 step by step:

**Goal:** Change `from-primary-600 via-primary-500 to-primary-700` to dark grays

**Step-by-step navigation:**
```vim
92gg                    " Jump to line 92
/from-primary           " Search for the text
n                       " Next match (if needed)
w                       " Jump to start of 'from-primary-600'
ciw                     " Change inner word
from-gray-900           " Type replacement
<Esc>                   " Back to normal mode
w                       " Jump to 'via-primary-500'
ciw                     " Change inner word
via-gray-800            " Type replacement
<Esc>                   " Back to normal mode
w                       " Jump to 'to-primary-700'
ciw                     " Change inner word
to-primary-950          " Type replacement
<Esc>                   " Done!
```

**Why this is powerful:**
- No mouse needed
- No holding arrow keys
- Precise, repeatable edits
- Muscle memory builds fast

---

## Pro Tips

### 1. Use Dot Repeat
After doing `ciw` + replacement, press `.` to repeat the last change:
```vim
ciw                     " Change inner word
new-text                " Type it
<Esc>                   " Exit insert
w                       " Move to next word
.                       " Repeat the SAME change (types 'new-text')
```

### 2. Visual Mode for Multi-word Changes
If you need to change several words:
```vim
v                       " Enter visual mode
3w                      " Select 3 words forward
c                       " Change selection
your-new-text           " Type replacement
```

### 3. Search and Replace Across File
```vim
:%s/old-text/new-text/g        " Replace all in file
:%s/old-text/new-text/gc       " Replace with confirmation
:92,174s/old/new/g             " Replace in line range
```

### 4. Jump to Matching Bracket/Quote
```vim
%                       " Jump between matching () [] {}
```

### 5. Undo/Redo
```vim
u                       " Undo last change
Ctrl-r                  " Redo
```

---

## Learning Path

This workflow demonstrates **Vim's philosophy**:
1. **Operators** (verbs) - what to do: `c`, `d`, `y`
2. **Motions** (nouns) - where to do it: `w`, `$`, `iw`
3. **Compose** them together: `ciw`, `d$`, `yaw`

The name for this is **modal editing** with **composable commands**.

Once you internalize this pattern, you can edit text at "the speed of thought."
