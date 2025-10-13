# MERMAID DIAGRAM APP REFACTORING - LazyVim Edition

## Svelte 5 State Management Philosophy: Why We're Not Using Stores

### The Store Era (Svelte 3-4)
In earlier versions of Svelte, **stores** were the solution for sharing reactive state across components. They were called "stores" because they acted as containers that "stored" values and notified subscribers when values changed - like a warehouse that alerts customers when inventory updates.

**The old pattern looked like this:**
```javascript
import { writable } from 'svelte/store';
export const count = writable(0);

// In components:
$count += 1;  // Auto-subscription with $ prefix
count.set(5);  // Manual update
count.update(n => n + 1);  // Function update
```

Stores introduced concepts like:
- `.set()` and `.update()` methods
- Subscription management
- The magic `$` auto-subscription syntax
- Derived stores for computed values

### The Runes Era (Svelte 5+)
Svelte 5 introduces **runes** (`$state`, `$derived`, `$effect`) - a simpler, more JavaScript-native approach to reactivity. The philosophy changed:

**From**: "State is a special reactive container you subscribe to"
**To**: "State is just a variable that happens to be reactive"

**The new pattern:**
```javascript
export const counter = createCounter();

function createCounter() {
    let value = $state(0);  // Reactive variable, not a container

    return {
        increment() { value += 1; },  // Direct mutation
        multiply() { value *= 2; },
        get() { return value; }  // Direct access
    };
}
```

### Why This Matters for Our Refactor

**Simplicity**: No more `.set()`, `.update()`, or subscription management
**Clarity**: Functions that mutate state directly, like regular JavaScript
**Performance**: Svelte 5's fine-grained reactivity is more efficient
**Intuition**: If you know JavaScript, you know how to use `$state`

**We're not creating "stores" anymore - we're creating "state managers"** that encapsulate reactive state with plain functions. Think of it as the difference between a warehouse with complex inventory systems (stores) versus a simple counter with direct access (state).

---

## Introduction: Your LazyVim Journey

This guide teaches you to refactor 3,035 lines of duplicated code while learning LazyVim like a pro. We'll start with basic commands and progressively level up to surgical precision editing.

**Philosophy**: Learn by doing. Each phase teaches new LazyVim skills that build on previous ones.

---

## LazyVim Basics Cheat Sheet

### Modes (The Foundation)
- `ESC` or `jk` - Return to Normal mode (home base)
- `i` - Insert mode at cursor
- `I` - Insert at beginning of line
- `a` - Append after cursor
- `A` - Append at end of line
- `o` - Open new line below
- `O` - Open new line above
- `v` - Visual mode (select text)
- `V` - Visual line mode (select lines)

### Navigation (Moving Around)
**Within Files:**
- `h` `j` `k` `l` - Left, Down, Up, Right (or use arrow keys while learning)
- `w` - Next word
- `b` - Previous word
- `e` - End of word
- `0` - Start of line
- `$` - End of line
- `gg` - Top of file
- `G` - Bottom of file
- `{` - Previous paragraph
- `}` - Next paragraph
- `%` - Jump to matching bracket/paren
- `Ctrl-d` - Half page down
- `Ctrl-u` - Half page up
- `/searchterm` - Search forward (press `n` for next, `N` for previous)
- `?searchterm` - Search backward

**Between Files (LazyVim Specific):**
- `<Space>e` - Toggle file explorer (Neo-tree)
- `<Space>ff` - Find files (Telescope fuzzy finder)
- `<Space>fg` - Live grep (search in all files)
- `<Space>fb` - Browse open buffers
- `<Space>fr` - Recent files
- `gd` - Go to definition
- `gr` - Go to references
- `Ctrl-o` - Jump back to previous location
- `Ctrl-i` - Jump forward

### Basic Editing (Start Here)
- `i` then type - Insert text
- `x` - Delete character under cursor
- `dd` - Delete entire line
- `yy` - Yank (copy) entire line
- `p` - Paste after cursor
- `P` - Paste before cursor
- `u` - Undo
- `Ctrl-r` - Redo
- `:w` - Save file
- `:q` - Quit
- `:wq` - Save and quit

---

## PHASE 1: CREATE UTILITY LAYER
**LazyVim Skills**: File creation, basic navigation, insert mode

### Step 1.1: Create Folder Structure

**What we're doing**: Creating `src/lib/state/` and `src/lib/utils/`

**LazyVim Workflow**:
```
1. Press <Space>e to open Neo-tree file explorer
2. Navigate to src/lib/ using j/k arrows
3. Press a (add) to create new folder
4. Type "state" and press Enter
5. Repeat for "utils" folder
```

**Pro Tip**: In Neo-tree:
- `a` - Add file/folder
- `d` - Delete
- `r` - Rename
- `c` - Copy
- `x` - Cut
- `p` - Paste

### Step 1.2: Create diagramState.svelte.js

**What we're doing**: Building `src/lib/state/diagramState.svelte.js` using Svelte 5 runes

**Important**: The `.svelte.js` extension tells the Svelte compiler this file uses runes like `$state`

**LazyVim Workflow**:
```
1. <Space>e - Open Neo-tree
2. Navigate to src/lib/state/
3. Press a, type "diagramState.svelte.js"
4. Press Enter - file opens in editor
5. Press i - Enter INSERT mode
6. Start typing the code (see below)
7. When done: ESC, then :w to save
```

**Code to type**:
```javascript
export const diagram = createDiagram();

function createDiagram() {
  let code = $state('');
  let error = $state('');
  let currentName = $state('');
  let currentExampleIndex = $state(0);

  return {
    setCode(newCode) {
      code = newCode;
      error = '';
    },
    setError(message) {
      error = message;
    },
    clearError() {
      error = '';
    },
    nextExample() {
      currentExampleIndex += 1;
    },
    previousExample() {
      currentExampleIndex -= 1;
    },
    setExampleIndex(index) {
      currentExampleIndex = index;
    },
    setName(name) {
      currentName = name;
    },
    // Getters for reactive access
    getCode: () => code,
    getError: () => error,
    getName: () => currentName,
    getExampleIndex: () => currentExampleIndex
  };
}
```

**LazyVim Practice**:
- After typing a few lines, press `ESC`
- Try `o` to open a new line below and continue
- Try `A` to jump to end of current line and continue typing
- Try `I` to jump to beginning of line

### Step 1.3: Create savedDiagramsState.svelte.js

**LazyVim Workflow**:
```
1. While in diagramState.svelte.js, press <Space>ff
2. Type "state/" and press Enter
3. Press Ctrl-n to create new file in that directory
   OR: <Space>e, navigate to state/, press a
4. Name it "savedDiagramsState.svelte.js"
5. Press i and start coding
```

**Code to type**:
```javascript
export const savedDiagrams = createSavedDiagrams();

function createSavedDiagrams() {
  let diagrams = $state([]);

  return {
    load(storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        diagrams = JSON.parse(saved);
      }
    },
    save(storageKey, name, code) {
      const newDiagram = {
        name,
        code,
        timestamp: new Date().toISOString()
      };
      diagrams = [...diagrams, newDiagram];
      localStorage.setItem(storageKey, JSON.stringify(diagrams));
    },
    delete(storageKey, index) {
      diagrams = diagrams.filter((_, i) => i !== index);
      localStorage.setItem(storageKey, JSON.stringify(diagrams));
    },
    getAll: () => diagrams
  };
}
```

**Level Up - Copy/Paste Skills**:
- `yy` - Copy current line
- `5yy` - Copy 5 lines starting from cursor
- `p` - Paste below current line
- `P` - Paste above current line
- `V` then `j/k` to select multiple lines, then `y` to copy

### Step 1.4: Create mermaidRenderer.js

Same workflow, create `src/lib/utils/mermaidRenderer.js`

**Progressive Challenge**: Try these instead of just `i`:
- `o` - Open new line below and start typing
- `O` - Open new line above and start typing

---

## PHASE 2: CREATE SHARED COMPONENTS
**LazyVim Skills**: Multi-file navigation, visual mode, advanced insert

### Step 2.1: Study Existing Code (Critical Step!)

**What we're doing**: Understanding what to extract from class/+page.svelte

**LazyVim Workflow**:
```
1. <Space>ff - Fuzzy find files
2. Type "class/page" - Should find class/+page.svelte
3. Press Enter to open
4. Press gg to go to top
5. Use Ctrl-d to scroll down half pages
6. Use / to search for key sections:
   /Navigation
   /textarea
   /renderDiagram
   /Examples
```

**Pro Search Tips**:
- After searching with `/`, press `n` to go to next match
- Press `N` to go to previous match
- Press `*` while cursor on a word to search for that word
- `#` to search backward for word under cursor

### Step 2.2: Create Navigation.svelte Component

**LazyVim Workflow**:
```
1. <Space>e - Open Neo-tree
2. Navigate to src/lib/
3. Press a, type "components" folder
4. Navigate into components/
5. Press a, type "Navigation.svelte"
6. Press Enter - file opens
```

**Multi-File Editing**:
```
1. You now have 2 files open: class/+page.svelte and Navigation.svelte
2. Press <Space>fb to see open buffers
3. Select the file you want to switch to
   OR: <Space>ff and type the filename
```

**Copying from Existing File**:
```
1. Switch to class/+page.svelte (<Space>ff, type "class")
2. Search for navigation section: /nav
3. Press V to enter Visual Line mode
4. Press j to select multiple lines (the entire nav block)
5. Press y to yank (copy)
6. Switch to Navigation.svelte (<Space>ff, type "Navigation")
7. Press p to paste
8. Now modify it - press i to enter insert mode
```

**First Surgery - Not Just `i` Anymore**:

When you need to change text inside quotes:
```
Old way:
  - Move cursor with arrows to opening quote
  - Press i, delete manually, type new text

Pro way:
  - Move cursor ANYWHERE inside the quotes
  - Press ci" (change inside quotes)
  - Type new text immediately
```

Example:
```svelte
<a href="/old">Text</a>

Cursor on "old", press ci" then type "new"
Result: <a href="/new">Text</a>
```

### Step 2.3: Create DiagramEditor.svelte

**LazyVim Workflow**:
```
1. In Neo-tree (src/lib/components/), press a
2. Type "DiagramEditor.svelte"
3. Press i to insert code
```

**New Skill - Change Inside Tags/Brackets**:
- `ci{` - Change inside curly braces
- `ci(` - Change inside parentheses
- `ci[` - Change inside square brackets
- `ci<` - Change inside angle brackets
- `cit` - Change inside HTML/XML tag

**Example Usage**:
```svelte
<script>
  let code = 'old value';
</script>

Cursor anywhere in 'old value', press ci' (change inside single quotes)
Type: new value
```

### Step 2.4: Create Remaining Components

Create these files using same workflow:
- DiagramPreview.svelte
- ExamplesCarousel.svelte
- SavedDiagramsList.svelte
- DiagramHeader.svelte
- ErrorBanner.svelte

**Practice Navigation While Creating**:
```
1. <Space>ff - Quick switch between files
2. <Space>e - Toggle file tree when needed
3. Ctrl-o / Ctrl-i - Jump back/forward between cursor positions
```

**Window Management** (for viewing multiple files):
```
:split filename - Horizontal split
:vsplit filename - Vertical split
Ctrl-w h/j/k/l - Move between windows
Ctrl-w c - Close current window
Ctrl-w o - Close all but current window
```

---

## PHASE 3: CREATE MASTER LAYOUT
**LazyVim Skills**: Block operations, advanced editing

### Step 3.1: Create DiagramLayout.svelte

**LazyVim Workflow**:
```
1. Create src/lib/components/DiagramLayout.svelte
2. This is a composition component - imports all others
```

**Block Editing Workflow**:

When you need to write multiple import statements:
```
Old way (using i):
  - Type first import
  - Press Enter
  - Type second import
  - Repeat...

Pro way (using o and repeat):
  - Type first import: import Navigation from './Navigation.svelte';
  - Press ESC, then press o (open line below)
  - Type second import
  - Get used to ESC o rhythm
```

**Even More Pro - Using Visual Block Mode**:

To add semicolons to multiple lines at once:
```
1. Position cursor at end of first line
2. Press Ctrl-v (Visual Block mode)
3. Press j to select multiple lines vertically
4. Press $ to go to end of each line
5. Press A (append at end of selection)
6. Type ; (semicolon)
7. Press ESC - semicolons appear on all lines!
```

### Step 3.2: Build Component Composition

**Template Structure** to type in DiagramLayout.svelte:

```svelte
<script>
  export let title;
  export let description;
  export let diagramType;
  export let storageKey;
  export let examples;
  export let defaultCode;

  import Navigation from './Navigation.svelte';
  import DiagramHeader from './DiagramHeader.svelte';
  import DiagramEditor from './DiagramEditor.svelte';
  import DiagramPreview from './DiagramPreview.svelte';
  import ExamplesCarousel from './ExamplesCarousel.svelte';
  import SavedDiagramsList from './SavedDiagramsList.svelte';
  import ErrorBanner from './ErrorBanner.svelte';

  import { diagram } from '$lib/state/diagramState.svelte.js';
  import { savedDiagrams } from '$lib/state/savedDiagramsState.svelte.js';

  // Initialize
  savedDiagrams.load(storageKey);
  diagram.setCode(defaultCode);
</script>

<Navigation currentPage={diagramType} />
<DiagramHeader {title} {description} />
<ErrorBanner error={diagram.getError()} />
<div class="main-content">
  <DiagramEditor
    code={diagram.getCode()}
    onUpdate={(code) => diagram.setCode(code)}
  />
  <DiagramPreview code={diagram.getCode()} />
</div>
<ExamplesCarousel
  {examples}
  currentIndex={diagram.getExampleIndex()}
  onSelect={(index) => diagram.setExampleIndex(index)}
/>
<SavedDiagramsList
  diagrams={savedDiagrams.getAll()}
  onLoad={(code) => diagram.setCode(code)}
  onDelete={(index) => savedDiagrams.delete(storageKey, index)}
/>
```

**Pro Editing - Delete and Change Operations**:
- `dd` - Delete line
- `5dd` - Delete 5 lines
- `dw` - Delete word
- `d$` - Delete to end of line
- `d^` - Delete to beginning of line
- `cc` - Change entire line (deletes and enters insert)
- `cw` - Change word

---

## PHASE 4: REFACTOR PAGES ONE BY ONE
**LazyVim Skills**: Side-by-side comparison, efficient refactoring

### Step 4.1: Refactor General (+page.svelte) First

**Strategy**: Keep old code, write new code, compare, then delete old

**LazyVim Workflow**:
```
1. Open src/routes/+page.svelte
2. Press gg to go to top
3. Press V to enter Visual Line mode
4. Press G to select entire file
5. Press y to copy everything
6. Press P to paste above (backup)
7. Press i, add comment: <!-- OLD CODE - DELETE AFTER TESTING
8. Navigate to end of file: G
9. Add comment: END OLD CODE -->
10. Press o to open new line
11. Start writing new refactored code
```

**The New Code** (much simpler!):
```svelte
<script>
  import DiagramLayout from '$lib/components/DiagramLayout.svelte';

  const examples = [
    {
      name: 'Simple Flow',
      code: 'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]'
    },
    {
      name: 'Decision Tree',
      code: 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Option 1]\n    B -->|No| D[Option 2]'
    }
    // Copy remaining examples array from old code
  ];

  const config = {
    title: 'General Diagram Mastery',
    description: 'Create any Mermaid diagram',
    diagramType: 'general',
    storageKey: 'mermaid-general-diagrams',
    defaultCode: 'graph TD\n    A-->B'
  };
</script>

<DiagramLayout {examples} {...config} />

<!--
  Note: No more $state subscriptions, no .set() calls!
  DiagramLayout handles all state management internally
-->
```

**Efficient Extraction Workflow**:

To copy the examples array from old code:
```
1. Search for examples: /const examples
2. Press V (visual line mode)
3. Find matching closing bracket using %
4. Press y to copy
5. Navigate to new code section
6. Press p to paste
```

### Step 4.2: Side-by-Side Testing

**LazyVim Workflow**:
```
1. :vsplit - Split window vertically
2. In right pane: navigate to old code section
3. In left pane: write new code
4. Compare visually
5. Ctrl-w h/l to switch between panes
```

### Step 4.3: Delete Old Code After Verification

**LazyVim Workflow**:
```
1. Navigate to <!-- OLD CODE comment
2. Press V to enter visual line mode
3. Search for end comment: /END OLD CODE
4. Press Enter, then j to include that line
5. Press d to delete entire block
6. Press :w to save
```

### Step 4.4: Repeat for Other Pages

Apply same workflow to:
- sequence/+page.svelte
- state/+page.svelte
- journey/+page.svelte
- class/+page.svelte (the big one!)

**Quick Reference for Each Page**:
```
1. <Space>ff, type page name
2. ggVG (select all), y (copy), P (paste as backup)
3. Comment old code
4. Write new code using DiagramLayout
5. Test
6. Delete old code block
7. :w save
```

---

## ADVANCED LAZYVIM WORKFLOWS

### Multi-File Search and Replace

**Scenario**: You need to rename a function across multiple files

**LazyVim Workflow**:
```
1. <Space>fg - Live grep
2. Type the function name to find all occurrences
3. Press Ctrl-q to send results to quickfix list
4. :cdo s/oldName/newName/g - Replace in all files
5. :cfdo update - Save all modified files
```

### Jump to Definition and Back

**When reading component code**:
```
1. Cursor on imported component name
2. Press gd (go to definition) - opens that component
3. Read the code
4. Press Ctrl-o to jump back to where you were
```

### Using Marks for Quick Navigation

**Scenario**: Jumping between files you're actively editing

```
1. In Navigation.svelte, press ma (mark as 'a')
2. Switch to DiagramLayout.svelte, press mb (mark as 'b')
3. Now from anywhere:
   - 'a jumps to mark a (Navigation.svelte)
   - 'b jumps to mark b (DiagramLayout.svelte)
```

### Macros for Repetitive Tasks

**Scenario**: You need to add semicolons to 20 import statements

```
1. Position cursor at end of first import
2. Press q a (start recording macro in register 'a')
3. Press A ; ESC j (append semicolon, go to next line)
4. Press q (stop recording)
5. Press 19@a (repeat macro 19 times)
```

---

## COMPLETE REFACTORING CHECKLIST

### Phase 1: Utility Layer
- [ ] Create `src/lib/state/` folder
- [ ] Create `src/lib/utils/` folder
- [ ] Create `diagramState.svelte.js`
- [ ] Create `savedDiagramsState.svelte.js`
- [ ] Create `mermaidRenderer.js`

**LazyVim Skills Practiced**: File creation, basic insert mode, Neo-tree navigation

**Note**: `.svelte.js` extension is required for files using runes outside of components

### Phase 2: Components
- [ ] Create `src/lib/components/` folder
- [ ] Create `Navigation.svelte`
- [ ] Create `DiagramEditor.svelte`
- [ ] Create `DiagramPreview.svelte`
- [ ] Create `ExamplesCarousel.svelte`
- [ ] Create `SavedDiagramsList.svelte`
- [ ] Create `DiagramHeader.svelte`
- [ ] Create `ErrorBanner.svelte`

**LazyVim Skills Practiced**: Multi-file navigation, visual mode, ci commands, block copying

### Phase 3: Layout
- [ ] Create `DiagramLayout.svelte`
- [ ] Import all components
- [ ] Build composition structure
- [ ] Test with mock data

**LazyVim Skills Practiced**: Visual block mode, window splits, advanced editing

### Phase 4: Refactor Pages
- [ ] Refactor `src/routes/+page.svelte` (General)
- [ ] Refactor `src/routes/sequence/+page.svelte`
- [ ] Refactor `src/routes/state/+page.svelte`
- [ ] Refactor `src/routes/journey/+page.svelte`
- [ ] Refactor `src/routes/class/+page.svelte`

**LazyVim Skills Practiced**: Side-by-side comparison, block deletion, quickfix lists

### Phase 5: Testing & Cleanup
- [ ] Test all 5 pages
- [ ] Remove commented code
- [ ] Final verification

---

## QUICK REFERENCE CARD

### Essential LazyVim Commands for This Refactor

**File Management**:
- `<Space>e` - File explorer
- `<Space>ff` - Find files
- `<Space>fg` - Grep in files
- `<Space>fb` - Browse buffers

**Navigation**:
- `gg` - Top of file
- `G` - Bottom of file
- `/text` - Search forward
- `n` / `N` - Next/previous search result
- `*` - Search word under cursor
- `gd` - Go to definition
- `Ctrl-o` - Jump back
- `%` - Jump to matching bracket

**Editing (Progressive Difficulty)**:

*Beginner*:
- `i` - Insert at cursor
- `o` - Open line below
- `ESC` - Return to normal mode

*Intermediate*:
- `ci"` - Change inside quotes
- `ci{` - Change inside braces
- `cit` - Change inside tag
- `dd` - Delete line
- `yy` - Copy line
- `p` - Paste

*Advanced*:
- `Ctrl-v` - Visual block mode
- `ma` - Set mark 'a'
- `'a` - Jump to mark 'a'
- `qa...q` - Record macro
- `@a` - Play macro

**Window Management**:
- `:vsplit` - Vertical split
- `Ctrl-w h/j/k/l` - Move between windows
- `Ctrl-w c` - Close window

---

## PROGRESSIVE LEARNING PATH

### Week 1: Phases 1-2 (Foundation)
**Focus**: Get comfortable with `i`, `o`, `ESC`, `:w`
**Goal**: Create all utility files and components using basic insert mode

### Week 2: Phase 3 (Leveling Up)
**Focus**: Learn `ci"`, `ci{`, visual mode, `yy`, `p`
**Goal**: Build DiagramLayout with more efficient editing

### Week 3: Phase 4 (Going Pro)
**Focus**: Window splits, marks, search/replace
**Goal**: Refactor all 5 pages efficiently

### Week 4: Mastery
**Focus**: Macros, quickfix lists, custom workflows
**Goal**: Be able to make changes across entire codebase confidently

---

## TROUBLESHOOTING

### "I'm stuck in a mode and can't get out!"
**Solution**: Press `ESC` or `jk` multiple times until you see `--NORMAL--` at bottom

### "I pressed something and my screen is weird!"
**Solution**:
- Press `Ctrl-w o` to close all but current window
- Press `:q!` to quit without saving
- Reopen the file with `<Space>ff`

### "How do I undo a mistake?"
**Solution**:
- In Normal mode, press `u` for undo
- Press `Ctrl-r` for redo
- Press `U` to undo all changes on current line

### "I can't find a file!"
**Solution**:
- `<Space>ff` and type part of filename
- `<Space>fr` shows recent files
- `<Space>e` opens file tree for visual browsing

---

## SUCCESS METRICS

### LazyVim Proficiency Levels

**Level 1 - Functional** (Week 1):
- Can create files with Neo-tree
- Can use `i`, `o`, `ESC`, `:w`, `:q`
- Can navigate with `j`, `k`, `gg`, `G`
- Can search with `/`

**Level 2 - Competent** (Week 2):
- Can use `ci"`, `ci{`, `cit` for surgical edits
- Can use visual mode to select and copy blocks
- Can use `<Space>ff` to jump between files effortlessly
- Can use window splits for comparison

**Level 3 - Proficient** (Week 3):
- Can use marks for quick navigation
- Can use macros for repetitive tasks
- Can use quickfix list for multi-file operations
- Can refactor entire file in <5 minutes

**Level 4 - Expert** (Week 4+):
- Muscle memory for all common operations
- Can teach others LazyVim
- Can create custom workflows
- Never reach for mouse

---

## FINAL MOTIVATION

By the end of this refactor, you will:

1. **Have a cleaner codebase**: 3,035 lines → ~800 lines (73% reduction)
2. **Be proficient in LazyVim**: From beginner to intermediate/advanced
3. **Understand component architecture**: Real-world Svelte refactoring experience
4. **Have muscle memory**: These commands will be automatic

**Remember**:
- Start slow with basic `i` mode
- Progress to `ci` commands when comfortable
- Master visual mode for block operations
- Eventually, you won't even think about the commands

**The LazyVim Philosophy**:
"Every keystroke counts. Every motion has purpose. Speed comes from efficiency, not rushing."

---

## APPENDIX: Full Command Reference

### Motion Commands
```
h/j/k/l - Left/Down/Up/Right
w/b/e - Word forward/back/end
0/$ - Start/end of line
gg/G - Top/bottom of file
{/} - Paragraph up/down
Ctrl-d/u - Half page down/up
f{char} - Find character forward
t{char} - Till character forward
```

### Operator + Motion
```
d{motion} - Delete
c{motion} - Change (delete + insert)
y{motion} - Yank (copy)
>{motion} - Indent right
<{motion} - Indent left
```

### Text Objects
```
iw/aw - Inner word / a word
i"/a" - Inside quotes / including quotes
i{/a{ - Inside braces / including braces
it/at - Inside tag / including tag
```

### LazyVim Leader Shortcuts (Space)
```
<Space>e - File explorer
<Space>ff - Find files
<Space>fg - Find in files (grep)
<Space>fb - Find buffers
<Space>fr - Recent files
<Space>/ - Search in current file
<Space>w - Save file
<Space>q - Quit
<Space>bd - Close buffer
```

Good luck with your refactoring journey! Remember: learn by doing, start simple, and progressively level up.
