# Swiss ZH Transport

A bespoke responsive chauffeur website built with **React + JavaScript**, **Tailwind CSS 4**, Vite and Motion. The design uses the supplied Swiss ZH logo with charcoal, ivory and red, editorial typography, scroll reveals, parallax, animated navigation, FAQ transitions and reduced-motion support.

## Run in VS Code

```sh
npm install
npm run dev
```

On Windows PowerShell, if script execution is restricted, use `npm.cmd install` and `npm.cmd run dev`. Open the local address printed by Vite.

```sh
npm run build
npm run preview
npm test
```

## Where to edit

- `src/App.jsx`: page section order and shared booking-dialog state. Import components here to add or reorder sections.
- `src/components/`: each visible section has its own JSX file (see the map below).
- `src/styles.css`: responsive design, theme and custom animations. Tailwind utilities are also available in JSX.
- `src/config.js`: business contacts, services, validation and inquiry URL formatting.
- `public/images/`: logo, vehicle and Swiss scenery.
- `index.html`: title, description and metadata.

### Component map

| File in `src/components/` | What to edit |
| --- | --- |
| `Navbar.jsx` | Desktop navigation, phone link and mobile menu |
| `Banner.jsx` | Hero image, heading, call to action and parallax animation |
| `JourneyPlanner.jsx` | Service selector and quick journey form |
| `About.jsx` | Company introduction and experience copy |
| `Services.jsx` | Limousine, Taxi and Airport Services cards; service content is at the top of this file |
| `Vehicle.jsx` | Mercedes-Benz V-Class showcase and features |
| `VehicleGallery.jsx` | 2023 V-Class exterior/interior photos and thumbnail controls; edit the `photos` array at the top |
| `Destinations.jsx` | Swiss Alps section and destination links |
| `WhyChooseUs.jsx` | Service benefits |
| `FAQ.jsx` | Questions and answers; FAQ content is at the top of this file |
| `Contact.jsx` | Contact section and booking call to action |
| `Footer.jsx` | Footer links and copyright |
| `BookingDialog.jsx` | Detailed journey form, review and WhatsApp/email inquiry links |
| `AdvanceNotice.jsx` | Shared advance payment notice |
| `WhatsAppButton.jsx` | Floating WhatsApp button |
| `ScrollProgress.jsx` | Reading progress animation |
| `shared/Brand.jsx` | Logo and company wordmark used in Navbar and Footer |
| `shared/Label.jsx` | Small section labels |
| `shared/Reveal.jsx` | Reusable scroll-reveal animation |

Navigation, FAQ, journey form and banner animation state live in their respective components. Components that launch the inquiry receive the shared `openBooking` callback from `App.jsx` (`onBook` in Navbar). Contact details and the 20% advance policy stay centralised in `src/config.js`.

`src/hooks/useBookingWebMCP.js` contains the optional browser integration; `src/lib/animation.js` contains the shared easing curve. Styles remain in `src/styles.css`, keeping the existing responsive layout intact. Run `npm run format` after editing to format your source files.

## Inquiry flow

Booking types: **Book per hour, Book per km, Book per day, Outside Switzerland, Wedding**. Visitors enter pickup, destination, date, Switzerland-local time, passenger count and name, review their details, then choose WhatsApp or email. This opens their messaging app with a prepared inquiry; the visitor still sends the message. No inquiry is silently sent, no payment is taken and no automatic reservation is promised.

Rates are centralised in `src/config.js`: hourly and wedding bookings require at least 3 hours at CHF 120/hour and CHF 150/hour respectively, CHF 5/km, Zurich Airport to Zurich city at CHF 120 and Zurich city to Zurich Airport at CHF 95, CHF 990 for a 10-hour day inside Switzerland including 220 km plus CHF 4/km for extra distance, CHF 1400 for a 10-hour day outside Switzerland including 300 km with driver confirmation required for extra distance. Missing route distances do not produce default fares.

## Google Maps setup

Set `VITE_GOOGLE_MAPS_API_KEY` in the ignored `.env` file to a valid Google Maps browser API key. Enable billing, Maps JavaScript API, Places API (New), and Routes API for its Cloud project. Restrict the key to the intended website and development origins and the required APIs. Restart Vite after environment changes; production builds must be rebuilt to pick up a changed key.

Pickup and destination fields use dropdown autocomplete. When Google search is unavailable, the site's original popular Swiss locations remain available as clearly labelled local shortcuts; they are not labelled as Google results. Road distance is fetched from Google's Routes library, with support for existing Distance Matrix API accounts. Per-km fares use the returned distance, the Switzerland day package adds CHF 4/km above 220 km, and Outside Switzerland uses a 300 km included-distance threshold. Route errors do not substitute a straight-line or hardcoded distance. A placeholder API key cannot return live suggestions or routes.

**Advance policy:** a 20% advance payment of the agreed total fare is required to confirm a booking; the remaining balance is 80%. This is shown in the journey planner, inquiry form, review step and FAQs. The inquiry asks for the total fare and payment arrangements. The percentage lives in `bookingPolicy` in `src/config.js`.

Online payment collection is not connected yet: the pricing flow and payment provider/account must be supplied. The current frontend does not enforce or verify payment and never marks an inquiry paid or confirmed.

WhatsApp: **+41 78 906 42 40**. Email: **jamaluddin174@yahoo.com**.

There is no database, payment system, live dispatch, or availability backend. Passenger counts are requests, not a promise of vehicle capacity. Confirm vehicle configuration and commercial content before public launch. English copy is original; no competitor prices or reviews are reused.

The optional browser WebMCP `start_journey_inquiry` tool opens the same visible form, without sending or confirming a booking. Unsupported browsers use the ordinary UI.

## Assets

The logo was supplied by the owner. The V-Class photo matches the supplied vehicle reference; a high-resolution copy was located online. Image sources and license information are in `public/image-credits.html`.

This project is prepared for local VS Code development. `dist/` is the static production build; deploy its contents to any static host with HTTPS. No public deployment has been made.
