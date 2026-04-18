# CFG & Parse Tree Simulator

A comprehensive Context-Free Grammar (CFG) and Parse Tree visualization simulator built with React, D3.js, and Tailwind CSS.

## Features

- **Grammar Input Panel** - Enter and validate CFG production rules with example presets
- **String Tester** - Test whether strings are accepted by the grammar
- **FIRST & FOLLOW Sets** - Automatically compute and display FIRST and FOLLOW sets for all non-terminals
- **CYK Algorithm** - Visualize the Cocke-Younger-Kasami parsing algorithm with CNF conversion
- **Parse Tree Visualization** - Interactive D3.js-powered parse tree with pan/zoom and animation
- **Derivation Stepper** - Step through leftmost and rightmost derivations with playback controls
- **LL(1) Parsing Table** - Build and analyze LL(1) parsing tables with conflict detection

## Tech Stack

- **React 18** - UI framework with functional components and hooks
- **D3.js v7** - Interactive tree visualization
- **Tailwind CSS** - Utility-first styling
- **Vite** - Next-generation build tool

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Enter grammar production rules in the **Grammar Input** panel
   - Use `->` for production (or `→` or `::=`)
   - Use `|` for alternatives
   - Use `ε` or `epsilon` for empty strings
   - Uppercase letters are non-terminals, lowercase are terminals

2. Enter a test string in the **String Tester** panel

3. Switch between tabs to view:
   - **Overview** - Grammar structure and symbols
   - **FIRST/FOLLOW** - Terminal sets for each non-terminal
   - **CYK Algorithm** - Parse table using Cocke-Younger-Kasami algorithm
   - **Parse Tree** - Visual tree representation
   - **Derivation** - Step-by-step derivation sequences
   - **LL(1) Table** - Predictive parsing table

## Example Grammars

- **aⁿbⁿ**: `S -> aSb | ab`
- **Arithmetic**: `E -> E + T | T` / `T -> T * F | F` / `F -> (E) | id`
- **Palindrome**: `S -> aSa | bSb | a | b | ε`
- **Balanced Parentheses**: `S -> (S) | SS | ε`

## Architecture

```
src/
├── components/
│   └── CFGSimulator/
│       ├── index.jsx              (Main component)
│       ├── GrammarInput.jsx        (Grammar editor)
│       ├── StringTester.jsx        (String acceptance)
│       ├── FirstFollowTable.jsx    (FIRST/FOLLOW)
│       ├── CYKTable.jsx            (CYK algorithm)
│       ├── ParseTreeD3.jsx         (D3 tree visualization)
│       ├── DerivationStepper.jsx   (Derivation steps)
│       └── LL1Table.jsx            (LL(1) parsing table)
├── utils/
│   ├── cfgParser.js               (Grammar parsing)
│   ├── firstFollow.js             (FIRST/FOLLOW computation)
│   ├── cnfConverter.js            (CNF conversion)
│   ├── cykAlgorithm.js            (CYK implementation)
│   └── derivation.js              (Derivation engine)
├── App.jsx
├── main.jsx
└── index.css
```

## Key Algorithms

- **CFG Parsing**: Custom tokenizer supporting multi-character non-terminals
- **FIRST/FOLLOW**: Fixed-point iteration algorithm
- **CNF Conversion**: Elimination of epsilon, unit productions, and binary normalization
- **CYK Algorithm**: O(n³|G|) dynamic programming parser
- **Derivation**: BFS-based derivation search

## Design

- Dark sidebar + light main panel layout (VS Code inspired)
- Glassmorphism cards with backdrop blur effects
- Smooth animations and transitions
- Responsive design for tablet and desktop
- Color-coded elements:
  - **Electric Blue** (#3B82F6) - Primary actions
  - **Amber** (#F59E0B) - Terminals
  - **Emerald** (#10B981) - Accepted states
  - **Rose** (#F43F5E) - Errors/Rejected
  - **Purple** (#8B5CF6) - Non-terminals

## Development

```bash
# Watch mode for development
npm run dev

# Format code (if configured)
npm run lint

# Build and preview
npm run build
npm run preview
```

## Author

SAUMYA ANSHUL
