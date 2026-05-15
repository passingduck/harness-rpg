---
name: OpenCode Retro-RPG
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9ccb2'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#84967e'
  outline-variant: '#3b4b37'
  surface-tint: '#00e639'
  primary: '#ebffe2'
  on-primary: '#003907'
  primary-container: '#00ff41'
  on-primary-container: '#007117'
  inverse-primary: '#006e16'
  secondary: '#fff9ef'
  on-secondary: '#3a3000'
  secondary-container: '#ffdb3c'
  on-secondary-container: '#725f00'
  tertiary: '#f7f8ff'
  on-tertiary: '#003259'
  tertiary-container: '#c7deff'
  on-tertiary-container: '#0063a8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#72ff70'
  primary-fixed-dim: '#00e639'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#00530e'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#d2e4ff'
  tertiary-fixed-dim: '#9fcaff'
  on-tertiary-fixed: '#001d36'
  on-tertiary-fixed-variant: '#00497e'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  headline-lg:
    fontFamily: Space Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -1px
  headline-md:
    fontFamily: Space Mono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Courier Prime
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
spacing:
  pixel-unit: 4px
  gutter: 16px
  container-padding: 24px
  sidebar-width: 280px
---

## Brand & Style
This design system fuses the nostalgic aesthetics of 16-bit dungeon crawlers and classic RPG interfaces with the technical rigor of modern AI development. The target audience—developers and AI engineers—should feel like they are "crafting spells" rather than writing code, treating AI agent orchestration as a quest through a digital labyrinth.

The style is **Retro-Modern Brutalism**, utilizing pixel-perfect accuracy, heavy beveled borders, and CRT-inspired visual effects. It balances the grit of a dark dungeon with the high-tech glow of a terminal. Every interaction should feel tactile and "clicky," reminiscent of a cartridge-era inventory screen.

## Colors
The palette is rooted in a "Dark Dungeon" atmosphere, ensuring high contrast for code readability while maintaining the RPG theme.

- **Primary (CRT Green):** Used for terminal output, successful agent executions, and active code blocks.
- **Secondary (RPG Gold):** Reserved for "legendary" items, primary call-to-action buttons, and leveling up milestones.
- **Tertiary (Mana Blue):** Represents AI "intelligence" or processing power, used for progress bars, token usage, and active agent states.
- **Neutral (Dungeon Black/Grey):** The base for all surfaces, creating depth through layered stone-colored shades.

## Typography
While the aesthetic is 8-bit, legibility is paramount for an IDE. We use modern monospaced fonts that evoke a retro feel without the eye strain of low-resolution pixel fonts.

- **Headlines:** Space Mono provides a geometric, tech-heavy feel for titles and section headers.
- **Body & Code:** JetBrains Mono is the workhorse for code editing and agent logs, offering superior readability for long-form technical content.
- **Labels:** Courier Prime is used for "parchment" style metadata and UI labels, providing a typewriter-meets-scroll aesthetic.

## Layout & Spacing
The layout follows a **Fixed-Grid System** inspired by inventory management screens. Components must align to a 4px "pixel" grid to ensure borders and bevels never look blurry.

- **Grid:** A 12-column layout for the main canvas where agent nodes are orchestrated.
- **Sidebars:** Fixed-width "panels" (left for Skill Tree/Tools, right for Agent Stats/Attributes).
- **Margins:** Heavy outer margins to simulate a CRT monitor frame.
- **Mobile:** Elements stack vertically, with the Skill Tree collapsing into a "Spellbook" bottom-sheet menu.

## Elevation & Depth
Depth is created through **Beveled Pixel Borders** rather than shadows. 

- **Level 0 (Floor):** The base background (#1a1a1a) with a subtle scanline overlay.
- **Level 1 (Panels):** Raised stone texture borders (#4a4a4a) with a 2px "highlight" on the top/left and a 2px "shadow" on the bottom/right.
- **Level 2 (Modals/Popups):** Double-bordered "Parchment" panels or "Obsidian" blocks with a gold inner stroke.
- **Interactions:** When pressed, buttons shift 2px down and right to simulate physical depression.

## Shapes
Sharp corners are mandatory. All UI elements must have **0px roundedness** to maintain the pixel-art integrity. 

- **Borders:** Use 2px or 4px solid borders.
- **Bevels:** Use contrasting colors on the edges to simulate 3D depth (e.g., a lighter green top-border on a green button).
- **Icons:** All icons must be strictly pixel-art style, using a 16x16 or 32x32 base grid.

## Components
- **Buttons:** Styled as "Action Tiles." Primary buttons use a Gold (#ffd700) bevel. Active state shows a CRT flicker.
- **Input Fields:** Styled as "Stone Slabs." Dark background with a Primary Green (#00ff41) inner glow when focused. The cursor is a blinking green block.
- **Skill Tree (The Toolset):** AI tools are represented as sword icons (Functions), shield icons (Security/Validators), and potion icons (Optimization/Refactoring).
- **Health/Mana Bars:** "Health" represents the Agent's confidence score; "Mana" represents remaining tokens or API quota. These are thick, segmented pixel bars.
- **Cards:** Used for Agent Profiles. Includes a pixel-art avatar slot and "Stat" bars (Speed, Accuracy, Creativity).
- **Scrolls:** For documentation and long-form logs, use a light-grey "parchment" background with burned-edge border styling.