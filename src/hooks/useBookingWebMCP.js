import { services } from "../config.js";
import { useEffect } from "react";

export default function useBookingWebMCP(openBooking) {
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: "start_journey_inquiry",
            description:
              "Open a Swiss ZH Transport journey inquiry with an optional service. Does not send or confirm a booking.",
            inputSchema: {
              type: "object",
              properties: { service: { type: "string", enum: services } },
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: false },
            execute: async (input = {}) => {
              if (
                !input ||
                typeof input !== "object" ||
                Object.keys(input).some((k) => k !== "service") ||
                (input.service && !services.includes(input.service))
              )
                throw new Error("Choose Airport Services, Limousine or Taxi.");
              openBooking(input.service ? { service: input.service } : {});
              await new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              );
              return { status: "inquiry_opened", sent: false };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Optional browser API. The visible inquiry flow remains available. */
    }
    return () => lifecycle.abort();
  }, [openBooking]);
}
