# Validation

- Production build: Vite compilation passes.
- Booking and routing logic: 14 Node tests pass for required fields, dates, Zurich time, encoded inquiry links, all five fares, decimal distances, the daily package limit, missing-distance errors, and mocked Google Routes/Distance Matrix responses.
- Local server: HTTP 200 at `http://127.0.0.1:5173/`.
- Dependency installation reported zero known vulnerabilities.
- Responsive CSS includes desktop, tablet and mobile breakpoints, wrapping controls and touch targets.
- Reduced-motion support, keyboard focus styles, labelled fields, native modal focus management and skip navigation are included.

Browser visual/interaction testing could not be performed because no connected browser is available in this session. Live Google suggestions and route responses remain unverified: the current development and production environment values contain a placeholder key. HTTP checks confirm the local Vite server is serving the updated modules. The optional WebMCP tool was not tested in a supported browser context. The tests do not send messages or create real bookings.

Before publishing, review the site on a real phone and laptop, and send a test inquiry manually from the final review step. Check business copy and photograph usage rights for the public launch.
