# Property Deal — TIC-80 Game

## Project Overview
This is a Monopoly Deal-inspired card game built for TIC-80 fantasy console.
Working title: Property Deal (cannot use Monopoly branding, mechanics are not copyrightable).
Target: 1v1 player vs AI, controller-first design for couch gaming on Google TV.

## Language
JavaScript (TIC-80 JS mode via duktape). Every file must start with `// script: js` and other JS headers.

## Documentation
- TIC80_API.md — full TIC-80 API reference, pasted from official docs
- TIC-80.wiki/ — full offline clone of the TIC-80 GitHub wiki (do not commit)
Always consult these before suggesting APIs or capabilities.

## Key Constraints
- No DOM, no Node.js, no browser APIs — this is a fantasy console
- No external libraries — only TIC-80 built-in functions
- 64KB code limit
- Single file cartridge — all code in game.js, copy-pasted into TIC-80 editor

## Input
Controller-first. Use btn() for held buttons, btnp() for single presses.
Player 1 button IDs: UP=0 DOWN=1 LEFT=2 RIGHT=3 A=4 B=5 X=6 Y=7

## Game Design
- Card game based on Monopoly Deal mechanics
- Property sets, money, action cards
- Win condition: first to 3 complete property sets
- Turn: draw 2 cards, play up to 3 cards
- "Inspired by Monopoly Deal" — not affiliated with Hasbro