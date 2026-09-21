# Campus Bites

BUNK N BITE — PRODUCTION-READY UI/UX BUILD PROMPT

Build BUNK N BITE, a production-ready multi-campus university food ordering platform.

The application must feel like a real commercial SaaS + food-tech product, not a prototype, student project, generic admin dashboard, or template.

The visual quality should be comparable to modern products such as Stripe, Linear, Vercel, Notion, Airbnb, and premium food-ordering applications — while maintaining its own BUNK N BITE identity.

The most important design principle:

Professional. Minimal. Fast. Clear. Premium.

1. PRODUCT CONTEXT

BUNK N BITE is a multi-campus food ordering ecosystem.

The platform supports exactly 5 user roles:

1. Owner Admin

Platform-level administrator.

Responsibilities:

Approve university requests

Create/activate university environments

Manage universities

View platform-level information

2. University Admin

Administrator of a specific university.

Responsibilities:

Manage university

Manage canteens

Approve/reject canteen access requests

Manage students

View university orders

View analytics

3. Canteen Owner

Manages a specific canteen.

Responsibilities:

Manage menu

Manage categories

Manage item availability

Manage incoming orders

Update order status

View revenue

View analytics

4. Student

University student.

Responsibilities:

Browse campus canteens

Browse menus

Add items to cart

Place orders

Pay online

Track orders

View order history

5. Visitor

Guest user.

Responsibilities:

Scan QR

Browse canteen

Browse menu

Add items to cart

Pay online

Receive order confirmation

Visitor should require the least amount of friction.

2. CRITICAL NAVIGATION RULE

DO NOT USE A SIDEBAR.

Absolutely no:

Left sidebar

Right sidebar

Collapsible sidebar

Sidebar drawer

Traditional ERP navigation

The product must have a top floating capsule navigation system.

Example:

[ Overview ] [ Orders ] [ Menu ] [ Analytics ]

Active section:

[ Orders ]

Use:

rounded-full navigation container

subtle border

subtle shadow

clean spacing

active capsule

smooth transitions

The navigation should feel like a modern premium application.

3. NAVIGATION BY ROLE

Owner Admin

Overview
Universities
Requests
Analytics

Right:

Profile ▾

University Admin

Overview
Canteens
Orders
Students
Analytics

Right:

University ▾
Profile ▾

Canteen Owner

Overview
Orders
Menu
Analytics

Right:

Canteen ▾
Profile ▾

Student

Home
Orders

Right:

Campus ▾
Cart
Profile ▾

Visitor

Minimal navigation:

BUNK N BITE

Canteen ▾

Cart

Do not expose admin-style navigation to visitors.

4. DESIGN PHILOSOPHY

The interface must communicate through:

Visual hierarchy

Components

Numbers

Icons

Short labels

Status capsules

Dropdowns

Cards

Spacing

Do NOT rely on paragraphs.

The interface must NEVER look text-heavy.

5. ABSOLUTELY NO UNNECESSARY COPY

Do NOT add:

Marketing copy

Product explanations

Hero paragraphs

"Welcome to BUNK N BITE"

"Revolutionizing campus dining"

"Your food, your way"

Long onboarding text

Feature explanations

Dummy descriptions

Generic motivational copy

Lorem ipsum

Placeholder paragraphs

Use only text that is required for actual product functionality.

For example:

Good:

Orders Today

₹24,850

Pending

Bad:

Here is a detailed overview of all the orders placed today across your university.

6. BRAND IDENTITY

Brand:

BUNK N BITE

Create a minimal, professional wordmark.

The logo should be:

compact

recognizable

modern

simple

Do not create an oversized logo.

Brand personality:

Modern campus + technology + food

Avoid childish college aesthetics.

Avoid cartoon-style food illustrations.

7. COLOR SYSTEM

Create a professional design token system.

Primary

Warm orange / saffron accent.

Use it selectively for:

Primary CTA

Active state

Important highlights

Selected controls

Brand accents

Base

Warm off-white background.

Suggested:

#FAFAF8

Surface

White:

#FFFFFF

Primary text

Deep charcoal.

Secondary text

Muted gray.

Success

Muted green.

Warning

Muted amber.

Error

Muted red.

Do NOT make the application orange everywhere.

The majority of the UI should remain neutral.

8. TYPOGRAPHY

Use a premium modern sans-serif.

Preferred:

Inter / Geist / SF Pro style

Typography hierarchy:

Page title

Section title

Card title

Body

Metadata

Caption

Avoid huge typography.

This is a product interface, not a marketing website.

9. SPACING

Use a consistent spacing system.

Prefer generous whitespace.

Never cram components together.

Use consistent:

padding

margins

gaps

card spacing

grid spacing

Everything should align to a consistent layout grid.

10. BORDER RADIUS

Use a consistent rounded system.

Large containers:

20px–24px

Cards:

16px–20px

Inputs:

12px–14px

Buttons:

9999px

Navigation:

9999px

The interface should have a cohesive rounded visual language.

11. SHADOWS

Use extremely subtle shadows.

No heavy floating cards.

Prefer:

subtle border

soft shadow

clean surface separation

The UI should feel premium without looking over-designed.

12. BUTTON SYSTEM

Primary buttons should be capsule-shaped.

Example:

+ Add Canteen

Add Item

Mark Ready

Pay ₹320

Secondary:

Export

Cancel

Danger:

Reject

Buttons must have:

hover

active

disabled

loading

states.

13. INPUT SYSTEM

Inputs must look production-ready.

Every input needs:

label

placeholder where required

focus state

error state

disabled state

validation feedback

Use rounded-xl inputs.

Do not create unnecessarily large forms.

14. DROPDOWN SYSTEM

Dropdowns are a major part of the design.

Use dropdowns for:

Campus ▾

Canteen ▾

Category ▾

Date ▾

Status ▾

Role ▾

Payment ▾

Dropdowns must support:

selected state

hover

keyboard-friendly interaction

clear active item

search when list is large

smooth open/close animation

15. FILTER SYSTEM

Filters should use capsule controls.

Example:

[ All ] [ Pending ] [ Preparing ] [ Ready ] [ Completed ]

Do not create huge filter forms.

For multiple filters:

Campus ▾ Canteen ▾ Date ▾ Status ▾

Keep them compact.

16. DASHBOARD DESIGN

Dashboards must NOT become traditional admin dashboards.

Do not create:

10+ cards

Huge graphs

Huge tables

Dense information

Instead use:

Small KPI row

Orders

Revenue

Pending

Completed

Then one or two important visual sections.

Every screen should prioritize what the user actually needs to do.

17. OWNER ADMIN

Overview

Show:

Universities

Pending Requests

Active Canteens

Orders Today

Then:

University Requests

Clean production table/list.

Columns:

University

Requested By

Date

Status

Action

Actions:

Approve

Reject

Use status capsules.

Universities

Display universities as clean cards/table.

Each university:

University name

Location

Status

Canteens

Students

Action

Open

Requests

Create a focused approval workflow.

Request details:

University

Requested by

Date

Status

Actions:

Approve

Reject

Confirmation modal before destructive actions.

18. UNIVERSITY ADMIN

Overview

Top:

Campus ▾

Date ▾

KPI row:

Orders Today

Revenue

Active Canteens

Students

Then:

Live Orders

Use a clean order list.

Each order:

#1042

Student

Canteen

Items

Amount

Status

19. CANTEENS

Show canteens in clean cards.

Each card:

Canteen image/avatar

Name

Status

Owner

Items

Orders

Action

Open

Primary action:

+ Add Canteen

20. CANTEEN REQUESTS

University Admin must be able to approve/reject canteen access requests.

Show:

Canteen

Owner

Requested date

Status

Actions:

Approve

Reject

Make this workflow extremely fast.

21. STUDENTS

Clean table/list.

Show:

Student

Email/ID

Orders

Status

Joined

Action

Do not overpopulate the table.

Use pagination.

Use search.

Use compact filters.

22. CANTEEN OWNER

Overview

Navigation:

Overview

Orders

Menu

Analytics

KPI row:

Orders

Revenue

Pending

Completed

Then:

Live Orders

This should be the most important section.

Order card:

#1042

2 × Masala Dosa

1 × Cold Coffee

₹180

Preparing

Action:

Mark Ready

Make order processing extremely fast.

23. ORDER MANAGEMENT

Order statuses:

Placed

Preparing

Ready

Completed

Cancelled

Use visually distinct but muted status capsules.

Order workflow:

Placed → Preparing → Ready → Completed

Do not use aggressive colors.

24. MENU MANAGEMENT

Menu should look like a premium food-commerce interface.

Top controls:

Canteen ▾

Category ▾

Search

+ Add Item

Food grid.

Each item:

Food image

Name

Price

Category

Availability

Actions

Example:

Masala Dosa

₹90

South Indian

Available

Edit

Use an availability toggle.

25. ADD / EDIT FOOD ITEM

Create a production-ready form.

Fields:

Food image

Item name

Category

Price

Description

Availability

Optional preparation time

Keep the form visually simple.

Use validation.

Show inline errors.

Primary:

Save Item

Secondary:

Cancel

26. STUDENT HOME

This should feel like a modern food ordering app.

Top:

Campus ▾

Canteen ▾

Then categories:

[ All ] [ Breakfast ] [ Snacks ] [ Meals ] [ Drinks ]

Food grid.

Food card:

Image

Name

Price

+

Example:

Paneer Wrap

₹120

+

Make the food images visually prominent.

27. FOOD DETAIL

Use a modal or bottom sheet.

Show:

Food image

Name

Price

Customization if available

Quantity

Add to Cart

Do not add unnecessary content.

28. CART

Clean cart.

Items:

Image

Name

Quantity control

Price

Remove

Then:

Subtotal

Taxes

Total

Primary:

Pay ₹320

Make the payment CTA visually obvious.

29. CHECKOUT

Minimal checkout.

Sections:

Order

Items

Pickup

Canteen ▾

Payment

Online Payment

Total

Primary:

Pay ₹320

Do not create unnecessary checkout steps.

30. ONLINE PAYMENT

Payment UI must clearly show:

Amount

Order

Payment method

Secure payment state

Loading state

Success state

Failure state

Do not expose sensitive payment information in the UI.

31. ORDER CONFIRMATION

After successful payment:

Show:

Order Confirmed

Order ID:

#1042

Canteen

Pickup information

Items

Total

Primary:

Track Order

Secondary:

View Orders

Keep the confirmation screen minimal.

32. ORDER TRACKING

Create a premium order-tracking UI.

Order ID:

#1042

Timeline:

Placed → Preparing → Ready → Completed

Highlight current state.

Show:

Canteen

Pickup information

Items

Total

Avoid unnecessary explanations.

33. ORDER HISTORY

Student:

Orders

Use clean order cards.

Each:

Order ID

Date

Canteen

Amount

Status

View

Filters:

All

Active

Completed

34. VISITOR EXPERIENCE

Visitor flow must be extremely short.

Flow:

QR Scan

↓

Canteen

↓

Menu

↓

Food

↓

Cart

↓

Online Payment

↓

Confirmation

No forced account creation.

No complex onboarding.

No dashboard.

No sidebar.

35. QR EXPERIENCE

Create a premium QR landing state.

Show:

BUNK N BITE

Canteen

Menu

Cart

If a QR scanner UI is required, keep it minimal.

Do not show long instructions.

36. ANALYTICS

Analytics should be useful but visually restrained.

Filters:

Today ▾

This Week ▾

This Month ▾

Metrics:

Revenue

Orders

Average Order

Top Item

Charts:

Revenue trend

Orders trend

Top items

Use minimal chart styling.

No unnecessary legends.

No rainbow colors.

37. SEARCH

Search should be available where useful.

Search input:

Search...

Use instant filtering where possible.

Search should work for:

Universities

Canteens

Students

Orders

Menu items

38. TABLE DESIGN

Tables must be modern.

Avoid Excel-like appearance.

Use:

clean header

subtle separators

compact status capsules

generous row height

hover state

pagination

Actions should be accessible without clutter.

39. EMPTY STATES

Keep them extremely minimal.

Examples:

No orders yet

No menu items

No requests

No students found

Use a small icon when useful.

Do not write paragraphs.

40. ERROR STATES

Every major screen must have production-ready error states.

Examples:

Something went wrong

Try again

Primary:

Retry

Do not expose technical errors.

41. LOADING STATES

Use skeleton loaders.

Do not rely on generic spinners.

Skeletons must match the actual component dimensions.

Include loading states for:

Cards

Tables

Orders

Menu

Analytics

Dropdown data

42. SUCCESS / TOAST SYSTEM

Use subtle toast notifications.

Examples:

Canteen approved

Menu item added

Order updated

Payment successful

Toasts should disappear automatically.

Do not use giant success banners.

43. CONFIRMATION MODALS

For destructive actions:

Reject Request

Delete Item

Cancel Order

Use confirmation modal.

Keep copy short.

Example:

Delete this item?

Buttons:

Cancel

Delete

44. RESPONSIVE DESIGN

This is mandatory.

The product must work perfectly on:

1440px desktop

1280px laptop

1024px tablet

768px tablet

390px mobile

375px mobile

Desktop:

floating capsule navigation

spacious grid

multi-column layout

Mobile:

no sidebar

horizontally scrollable capsules

compact top navigation

single-column content

sticky checkout CTA when appropriate

Do not simply shrink desktop UI.

Design responsive layouts intentionally.

45. MOBILE NAVIGATION

Do NOT introduce a hamburger sidebar.

Use:

compact top capsule navigation

horizontal scroll

contextual controls

bottom sticky action where appropriate

Student food ordering should feel especially good on mobile.

46. ACCESSIBILITY

Production-ready means accessible.

Implement:

proper contrast

keyboard navigation

visible focus states

semantic buttons

accessible form labels

aria labels where required

logical tab order

sufficient touch target size

Do not sacrifice accessibility for aesthetics.

47. INTERACTION DESIGN

Every interactive element must have:

Default

Hover

Focus

Active

Disabled

Loading

Error

Success

states where applicable.

No dead buttons.

No fake interactions.

48. MICRO-ANIMATIONS

Use subtle animation.

Examples:

dropdown opening

modal appearance

card hover

button press

quantity changes

cart updates

order status changes

toast appearance

Animations should feel premium and fast.

Avoid flashy animations.

49. COMPONENT ARCHITECTURE

Create reusable components.

At minimum:

CapsuleNavigation

Dropdown

Button

Input

SearchInput

FilterCapsules

MetricCard

FoodCard

OrderCard

StatusBadge

DataTable

Modal

BottomSheet

Toast

Skeleton

Pagination

CartItem

QuantitySelector

OrderTimeline

QRDisplay

EmptyState

ErrorState

LoadingState

Do not duplicate UI unnecessarily.

50. DESIGN TOKENS

Create centralized design tokens for:

colors

typography

spacing

radius

shadows

transitions

breakpoints

The entire application must use the same design system.

Do not hardcode random values across components.

51. DATA / UI REALISM

Use realistic sample data.

Do NOT use:

John Doe

Lorem Ipsum

Test University

Restaurant 1

Instead use believable Indian university/campus data.

Examples:

Ahmedabad University

Gujarat University

CEPT University

Canteens:

Central Café

Food Court

Campus Bites

Menu:

Masala Dosa

Paneer Wrap

Cold Coffee

Veg Biryani

Chole Bhature

Use realistic ₹ pricing.

52. PRODUCTION-READY STATES

Every major feature must have:

Loading

Loaded

Empty

Error

Success

Disabled

Permission restricted

Mobile

Desktop

Do not design only the happy path.

53. ROLE-BASED UI

The UI must clearly respect permissions.

Owner Admin sees platform-level functionality.

University Admin sees university-level functionality.

Canteen Owner sees only their canteen functionality.

Students see ordering functionality.

Visitors see only ordering functionality.

Never expose controls that the current role should not have.

54. SECURITY-AWARE UI

Do not expose:

passwords

payment secrets

API keys

sensitive credentials

Use masked sensitive information where appropriate.

For destructive/admin actions, use confirmation.

55. PERFORMANCE-AWARE DESIGN

The interface should feel fast.

Prefer:

skeleton loading

lazy-loaded food images

compact components

pagination

optimized lists

minimal unnecessary animations

Avoid enormous image assets.

56. FINAL VISUAL DIRECTION

The final result should feel like:

A serious venture-backed food-tech SaaS product used by universities across India.

Not:

college project

ERP software

restaurant POS

generic admin template

Dribbble-only concept

overly colorful food app

The design should communicate:

Trust + Speed + Simplicity + Premium Quality

57. HARD RULES

These rules override everything else:

NEVER:

Use a sidebar

Use huge hero sections

Add marketing paragraphs

Add unnecessary text

Use giant gradients

Use excessive glassmorphism

Use excessive shadows

Use rainbow colors

Use giant cards

Use dense dashboards

Use unnecessary illustrations

Use emojis as UI icons

Use generic lorem ipsum

Use fake feature descriptions

Create unnecessary navigation levels

ALWAYS:

Use capsule navigation

Use dropdowns

Use clean cards

Use consistent spacing

Use subtle borders

Use premium typography

Use realistic data

Use proper loading states

Use proper error states

Use proper empty states

Use responsive layouts

Use accessible components

Use reusable components

Maintain role-based permissions

Maintain visual consistency

58. IMPORTANT: BUILD THE ACTUAL PRODUCT UI

Do not create a static mockup.

Create a functional production-ready frontend experience.

Implement:

routing

role-based screens

navigation

dropdown interactions

filters

search

modals

forms

validation

cart interactions

quantity controls

order state changes

menu management

request approval flows

responsive behavior

loading states

error states

empty states

toast notifications

All major buttons should perform their intended UI action.

59. SCREEN INVENTORY

Build the complete UI for the following screens.

Authentication

Login

Forgot Password

Reset Password

Role-aware authentication states

Owner Admin

Overview

Universities

University details

University requests

Request details

Analytics

Profile/settings

University Admin

Overview

Canteens

Canteen details

Canteen requests

Orders

Order details

Students

Analytics

Settings

Canteen Owner

Overview

Orders

Order details

Menu

Add item

Edit item

Categories

Analytics

Settings

Student

Home

Canteen selection

Menu

Food details

Cart

Checkout

Payment

Order confirmation

Order tracking

Order history

Profile

Visitor

QR landing

Canteen

Menu

Food details

Cart

Checkout

Online payment

Order confirmation

Order tracking

60. AUTHENTICATION UI

Login should be extremely clean.

Center a compact authentication card.

Fields:

Email

Password

Primary:

Login

Secondary:

Forgot password?

Do not add unnecessary marketing copy.

After login, route the user to the correct role-based experience.

61. FINAL QUALITY CHECK

Before considering the UI complete, verify:

No sidebar exists anywhere.

Capsule navigation is consistent.

Dropdowns look consistent.

All role experiences are different where necessary.

No unnecessary text exists.

No placeholder copy exists.

No lorem ipsum exists.

Mobile layout works.

Desktop layout works.

Buttons have interaction states.

Forms have validation.

Tables have loading/empty/error states.

Orders have status states.

Menu has availability states.

Payment has success/failure/loading states.

Permissions are respected.

Visual hierarchy is consistent.

Typography is consistent.

Colors are consistent.

Spacing is consistent.

Components are reusable.

UI feels production-ready.

FINAL INSTRUCTION

Build BUNK N BITE as a premium, production-ready university food-tech platform.

The design must be:

Minimalistic
Professional
Modern
Premium
Responsive
Accessible
Fast
Consistent
Production-ready

No sidebar.

No unnecessary wording.

No generic dashboard aesthetics.

Use capsule navigation + dropdowns + clean cards + premium typography + restrained colors + excellent spacing.

Every screen should look like it belongs to the same high-quality product.

The final result should make BUNK N BITE feel like a real product that can be deployed to universities, not a UI prototype.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
