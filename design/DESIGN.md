# Design System Specification: Kinetic Precision

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Disciplined Pulse."** 

Taekwondo is a balance of explosive power and rigid discipline. To reflect this, the system moves away from the "cluttered gym" aesthetic toward a high-end, editorial sports experience. We achieve this through **Kinetic Asymmetry**—using the "weaving belt" motif not just as a decoration, but as a structural guide that breaks the grid, creating a sense of forward motion. We prioritize "Breathing Room" over density, ensuring the academy feels elite, modern, and welcoming.

## 2. Colors & Surface Architecture
This system utilizes a sophisticated tonal palette to define hierarchy without relying on archaic containment lines.

### Color Palette (Material Design Tokens)
*   **Primary (Power):** `#b7131a` (Primary) / `#db322f` (Primary Container)
*   **Secondary (Trust):** `#4c56af` (Secondary) / `#959efd` (Secondary Container)
*   **Surface (Environment):** `#f9f9f9` (Surface/Background) / `#eeeeee` (Surface Container)
*   **Neutral (Foundation):** `#1a1c1c` (On Surface) / `#906f6c` (Outline)

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined through background color shifts. 
*   Place a `surface_container_lowest` (#ffffff) card on a `surface` (#f9f9f9) background to create definition.
*   For high-intensity sections (e.g., "Join Now"), use a full-bleed `primary` or `secondary` background shift.

### The "Glass & Gradient" Rule
Standard flat colors feel static. To inject "soul," use a subtle **Linear Gradient** on all Primary CTAs: 
*   *Direction:* 135deg 
*   *From:* `primary` (#b7131a) *To:* `primary_container` (#db322f).
*   For floating navigation or overlays, use **Glassmorphism**: `surface` at 80% opacity with a `24px` backdrop blur.

## 3. Typography: Athletic Authority
The typography pairing balances the "Sporty" energy of martial arts with the "Readable" clarity of a professional academy.

*   **Display & Headlines (Lexend):** We use Lexend for its wide, stable stance. It feels athletic and modern. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero sections to convey "Power."
*   **Titles & Body (Inter):** Inter provides the "Friendly" counterweight. It is highly legible for schedule details and student progress reports.
*   **Editorial Scaling:** Use high-contrast scaling. A `display-md` header should sit near a `body-md` description to create a sophisticated, magazine-like layout.

## 4. Elevation & Depth: Tonal Layering
We reject the "drop shadow" of the early 2000s. Depth in this system is organic and atmospheric.

*   **The Layering Principle:** Stacking determines importance. 
    *   *Level 0:* `surface` (Base page)
    *   *Level 1:* `surface_container_low` (Sidebar or subtle sectioning)
    *   *Level 2:* `surface_container_lowest` (The "Crisp White" Card - `#ffffff`)
*   **Ambient Shadows:** If a card must "float" (e.g., an active Exam Badge), use an ambient shadow:
    *   *Blur:* 40px | *Spread:* 0 | *Color:* `on_surface` at 6% opacity.
*   **The Ghost Border Fallback:** For input fields, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

## 5. Components

### The "Weaving Belt" Graphic
This is our signature element. It should be used as a **Section Divider** or a **Header Background Mask**. It must never be a simple line; it should overlap containers, breaking the "box" of the card to create a sense of three-dimensional space.

### Buttons (Kinetic CTAs)
*   **Primary:** Large (min-height: 56px), `xl` (1.5rem) rounded corners. Uses the Primary-to-Primary-Container gradient. 
*   **Secondary:** Ghost style. No background, `outline` token at 20% opacity, with `secondary` text color.
*   **Interaction:** On hover, the button should scale 1.02x with a subtle increase in the ambient shadow.

### Cards (The Student/Class Unit)
*   **Styling:** Always `surface_container_lowest` (#ffffff).
*   **Radius:** `lg` (1rem / 16px).
*   **Layout:** No dividers. Use `title-md` for the class name and `body-sm` with `secondary` color for the time/instructor to create hierarchy through color, not lines.

### Status Badges (The Rank System)
*   **Paid/Late/Exams:** Use `secondary_container` for positive states and `error_container` for alerts. 
*   **Shape:** Pill-shaped (Rounded `full`).
*   **Typography:** `label-md` uppercase with +0.05em tracking for a premium "badge" feel.

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. Align text to a 12-column grid but allow the "weaving belt" graphic to bleed off the edge of the screen.
*   **Do** use "Warm Gray" (`surface_container_low`) for large background areas to reduce eye strain and feel more "premium" than pure white.
*   **Do** ensure all touch targets for buttons are at least 48dp, honoring the "athletic" and "accessible" requirement.

### Don't:
*   **Don't** use black (#000000) for text. Use `on_surface` (#1a1c1c) to keep the "friendly" tone.
*   **Don't** use 1px dividers between list items. Use 16px of vertical whitespace or a subtle color shift to `surface_container_high`.
*   **Don't** use sharp corners. Everything in the academy is about "controlled flow"—keep corners at a minimum of `md` (0.75rem).