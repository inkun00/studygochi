# Tamaweb Design Analysis

## Overview
Tamaweb is a virtual pet game inspired by Tamagotchi devices. This document provides a comprehensive analysis of its design patterns, colors, layout structure, and UI elements based on the source code.

---

## Color Schemes

### Default Theme (`theme-default`)

#### Primary Colors
- **Primary A**: `#3d00ff` (Deep Blue/Purple)
- **Primary B Background**: `#fff4e8` (Cream/Off-white)
- **Primary B Border**: `#ffb362` (Orange)
- **Primary B Text**: `#ff8000` (Bright Orange)
- **Primary B Text Shadow**: `#ffcf9d` (Light Peach)
- **Primary B Shadow**: `#f5deb3` (Wheat/Beige)

#### Background Gradients
- **Container Background**: `linear-gradient(0deg, #ffddb8, #ffe5ca)` (Peach gradient)
- **Background A**: Diagonal striped pattern (`#ffddb8` to `#ffe5ca`)
- **Background B**: Diagonal striped pattern (`#ffcaf4` pink to `#ffe5ca` cream)
- **Background C**: Vertical striped pattern (`#ffd7bf` to `#ffe5ca`)
- **Background D**: Diagonal striped pattern (`#D88C9A` to `#FBACBE` pink tones)

#### Menu Item Colors (8 different colors for menu items)
1. `#fa9189` - Salmon Pink
2. `#fcae7c` - Light Orange
3. `#99ccff` - Sky Blue
4. `#ffcc99` - Peach
5. `#a4e4a9` - Mint Green
6. `#fb88ff` - Light Purple
7. `#ff99cc` - Pink
8. `#d1bdff` - Lavender

#### Special UI Colors
- **Scrollbar**: `#ff8300` (Orange)
- **Family Tree Vertical Line**: `#3d00ff` (Primary Blue)
- **Family Tree Horizontal Line**: `#ff00c6` (Magenta)
- **Post Background**: `#3d00ff` (Primary Blue)
- **Stepper Color**: `rgb(255, 128, 0)` (Orange)
- **Badge Red**: `#ED254E`
- **Badge Night**: `#180067`
- **Badge Gold**: `linear-gradient(45deg, #ffd700, #ffc800)` with `#ff7800` text

### Additional Themes

#### Pardis Theme (`theme-pardis`)
- **Primary**: `#191B51` (Dark Navy)
- **Background**: Blue striped pattern (`#2DB1E8` to `#1D9BD4`)
- **Stylized Background**: Diagonal stripes with white, light blue (`#DCF1F6`), and light pink (`#ffe8e8`)
- **Grid Item Color**: `#168ec1` (Teal Blue)

#### Uni Theme (`theme-uni`)
- **Container Background**: `linear-gradient(180deg, #8B06ED, #FA80F7)` (Purple to Pink gradient)
- **Primary**: White
- **Text**: `#00014B` (Very Dark Blue)
- **Accent Colors**: Vibrant gradients
  - Pink: `linear-gradient(-45deg, #FA2B95, #EE87E3)`
  - Orange: `linear-gradient(-45deg, #EC7849, #F3BE18)`
  - Blue: `linear-gradient(-45deg, #9070F9, #13F0EB)`
  - Green: `linear-gradient(-45deg, #0ED3CA, #43F887)`

#### Sunset Theme (`theme-sunset`)
- **Container Background**: `linear-gradient(0deg, #fef3c7, #e0f2fe)` (Yellow to Light Blue)
- **Primary**: `#2563eb` (Blue)
- **Text**: `#7c3aed` (Purple)
- **Backgrounds**: Bright striped patterns in yellow, cyan, and lime green
- **Menu Colors**: Bright, saturated colors (red, orange, blue, yellow, green, purple, pink)

---

## Typography

### Font Family
- **Primary Font**: `'PixelOld'` (PixelifySans Variable Font)
- **Fallback Font**: `'Pixel'` (PixelColeco.otf)
- **Generic Fallback**: `serif`

### Font Characteristics
- Pixel/retro style fonts
- All text is **UPPERCASE** by default (`text-transform: uppercase`)
- Word spacing: `-3px` (tighter letter spacing)

### Font Sizes
- **Default**: Standard browser default
- **Small**: `font-size: small`
- **X-Small**: `font-size: x-small`
- **XX-Large**: `font-size: xx-large` (used for grid items)

---

## Layout Structure

### Main Container
- **Device Shell**: 
  - Width: `320px`
  - Height: `400px`
  - Rounded top: `border-radius: 100% 100% 95% 95%`
  - Complex box shadows for 3D effect
  - Background: `rgb(255, 237, 217)` with cover positioning

### Screen Wrapper
- **Height**: `192px`
- **Max Width**: `192px`
- **Image Rendering**: `pixelated` (for retro pixel art style)

### Graphics Canvas
- **Background**: Black (`#000000`)
- **Image Rendering**: `pixelated`
- **Width**: 100% (responsive)
- **Outline**: `5px solid #00000040` (dark semi-transparent border)
- **Border Radius**: `5px`

### Container Types

#### Generic List Container
- Full height and width
- Vertical flex layout
- Scrollable with custom scrollbar
- Background uses theme-specific patterns

#### Generic Slider Container
- Full height and width
- Centered flex layout
- Horizontal content arrangement
- Main container height: `145px`

#### Generic Grid Container
- Flexbox with row wrap
- Grid items: `33.333333%` width (3 columns)
- Grid items: `33.333333%` height (3 rows)

---

## Button Styles

### Generic Stylized Button
- **Border**: `2px solid` with `4px` bottom border (3D effect)
- **Border Radius**: `10px`
- **Background**: Light cream (`#fff4e8`)
- **Text Color**: Orange (`#ff8000`)
- **Text Shadow**: `1px 1px 0px` light peach
- **Box Shadow**: Inset shadow for depth
- **Active State**: Scales to `0.95` and darkens background

### Back Button / Primary Solid
- **Background**: Primary blue (`#3d00ff`)
- **Text Color**: White
- **Border**: Semi-transparent black

### Button Interactions
- **Hover/Active**: Shows animated pointer icon (right-pointing arrow)
- **Pointer Animation**: Moves left-right (`-5px` to `-2px`)
- **Disabled State**: Desaturated colors, no pointer events

---

## UI Patterns & Components

### Shell Buttons (Physical Device Buttons)
- **Size**: `32px` (CSS variable `--shell-btn-size`)
- **Spacing**: `64px` apart (CSS variable `--shell-btn-space`)
- **Style**: Circular with gradient background
- **Shadow**: Multiple box shadows for 3D effect
- **Active State**: Translates down `1px` (press effect)
- **Positions**:
  - Main button: Bottom center
  - Left button: Bottom left
  - Right button: Bottom right

### Grid Items
- **Circular Background**: `::before` pseudo-element
- **Size**: `55px` diameter circle
- **Shadow**: Inset and glow effects
- **Hover**: White background with outline
- **Each Item**: Different gradient color (8 variations)
- **Icon Size**: `35px`

### Surfaces

#### Surface Stylized
- **Background**: Light cream
- **Border**: `2px solid` orange
- **Border Radius**: `10px` with asymmetric corners (`20px` top-left, `20px` bottom-right)
- **Box Shadow**: Inset shadow for depth
- **Margin**: `5px`

#### Solid Surface Stylized
- **Background**: Diagonal gradient pattern (orange tones)
- **Text Color**: Off-white (`#fff7ee`)
- **Text Shadow**: Dark orange
- **Border**: Semi-transparent orange

### Badges
- **Font Size**: `x-small`
- **Padding**: `2px 5px`
- **Border Radius**: `100%` (circular)
- **Position**: Absolute (top-right)
- **Variants**: Red, Night (dark), Gold (gradient), Transparent

### Progress Bars
- **Height**: `20px`
- **Border Radius**: `5px`
- **Background**: Full width container
- **Rod**: Black background with white right border

---

## Animation Types

### Menu Animation
- **Type**: Fade in with slide from left
- **Duration**: `0.2s`
- **Stagger**: Each child delays by `0.025s` (creates cascade effect)
- **Transform**: `translateX(-4px)` to `0`
- **Opacity**: `0` to `1`

### Slider Animations
- **In from Left**: `translateX(-200px)` to `0`
- **In from Right**: `translateX(200px)` to `0`
- **Out to Left**: `0` to `translateX(-200px)`
- **Out to Right**: `0` to `translateX(200px)`

### Pointer Animation
- **Duration**: `0.5s`
- **Type**: Infinite alternate
- **Movement**: `left: -5px` to `left: -2px`
- **Applied to**: Active/hover states on buttons and grid items

### Pulse Animation
- **Duration**: `0.25s`
- **Type**: Infinite alternate
- **Scale**: `0.85` to `1`

### Fade Pulse Animation
- **Duration**: `1s`
- **Type**: Ease-in infinite
- **Opacity**: `1` to `0.3` at 50%

### Background Pattern Scroll
- **Duration**: `60s`
- **Type**: Linear infinite
- **Transform**: `translate(0,0)` to `translate(256px, 256px)`
- **Respects**: `prefers-reduced-motion` (disabled if user prefers reduced motion)

### Loading Animation
- **Fade In**: `0.2s` from `opacity: 0.2`
- **Background Transition**: `0.2s ease`

---

## Special Components

### Post/Social Feed
- **Canvas**: Full width/height with image rendering
- **Header**: 30px height with gradient stripe below
- **Text Area**: White background, positioned at bottom
- **Profile Icon**: Circular, striped background, 22px size
- **Close/Next Buttons**: Circular, 25px, positioned absolutely

### Family Tree
- **Vertical Lines**: Primary blue
- **Horizontal Lines**: Magenta
- **Gen Badge**: Pink background with magenta text
- **Member Container**: Small text in purple

### Stepper Component
- **Steps**: Circular with 2px border
- **Active Step**: Filled with orange background
- **Connector**: Horizontal line between steps
- **Colors**: Orange theme

### Directional Control
- **Buttons**: Light purple background
- **Cancel**: Red background (`#ffc3c3`)
- **Apply**: Green background (`#0f8500`)

### Mini-Game UI
- **Text Color**: Primary blue
- **Text Shadow**: White outline (4-directional)
- **Timing Bar**: 180px width, 10px height, with colored zones (green 70%, orange 20%, red 10%)

---

## Scrollbar Customization
(Only on screens ≥ 480px width)
- **Width**: `7px`
- **Track**: Semi-transparent white with orange left border
- **Thumb**: Orange (`#ff8300`)
- **Thumb Hover**: Primary blue
- **Border Radius**: `10px` (top-right and bottom-right)

---

## Responsive Design

### Mobile-First Approach
- Base styles designed for small screens
- Scrollbar customization only on larger screens (`min-width: 480px`)
- Touch-optimized: `-webkit-tap-highlight-color: transparent`
- No user selection: `user-select: none`
- Touch action: `manipulation`

### Image Rendering
- **Pixel Art**: `image-rendering: pixelated` throughout
- Maintains crisp pixel art aesthetic

---

## Interaction Patterns

### Touch/Click Feedback
1. **Scale Down**: Buttons scale to `0.95` on active
2. **Color Change**: Background darkens slightly
3. **Pointer Icon**: Animated arrow appears on hover/active
4. **Sound Effects**: References to sound files in HTML (shell button sounds)

### Disabled States
- **Pointer Events**: None
- **Color**: Desaturated/faded
- **Opacity**: Reduced (0.5, 0.325, 0.7, 0.9)

### Hover States
- **Outline**: Semi-transparent white outline
- **Background Change**: Lighter or white background
- **Pointer**: Animated arrow indicator

---

## Design Philosophy

### Retro/Nostalgic Aesthetic
- Pixel fonts
- Pixelated graphics
- Tamagotchi-inspired device shell
- Bright, playful colors
- Striped/patterned backgrounds

### Playful & Colorful
- Multiple vibrant themes
- Gradient backgrounds
- Colorful menu items (8 distinct colors)
- Pastel and bright color combinations

### 3D/Depth Effects
- Multiple box shadows (inset and outset)
- Border variations (thicker bottom borders)
- Button press animations
- Layered shadows on device shell

### Accessibility Considerations
- Respects `prefers-reduced-motion`
- High contrast text shadows
- Clear visual feedback on interactions
- Uppercase text for readability

---

## Key Takeaways for StudyGochi

### Colors to Consider
- Warm, inviting palette (peach, cream, orange)
- Accent colors for different sections (8 distinct menu colors)
- Consistent use of gradients and patterns
- Theme system for customization

### Layout Principles
- Device-like container with rounded top
- Fixed aspect ratio for main screen
- Grid-based menu system (3x3)
- Scrollable content areas with custom scrollbars

### Button Design
- 3D effect with thicker bottom border
- Text shadows for depth
- Rounded corners (10-20px)
- Scale animation on press
- Animated pointer on hover

### Typography
- Pixel/retro font for nostalgia
- Uppercase text throughout
- Text shadows for readability on colorful backgrounds
- Tight word spacing

### Animations
- Staggered menu item entrance
- Smooth transitions (0.2s typical)
- Playful hover effects
- Background pattern animations
- Respects accessibility preferences

### UI Patterns
- Circular badges for notifications
- Striped/patterned backgrounds
- Inset shadows for depth
- Consistent border radius
- Color-coded sections
