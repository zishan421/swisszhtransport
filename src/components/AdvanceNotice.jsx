import { bookingPolicy } from "../config.js";
import { ShieldCheck } from "lucide-react";

export default function AdvanceNotice() {
  return (
    <aside
      className="advance-notice full"
      aria-label="Advance payment requirement"
    >
      <div className="advance-notice-heading">
        <ShieldCheck size={20} aria-hidden="true" />
        <strong>
          {bookingPolicy.advancePercent}% advance to confirm your booking
        </strong>
      </div>
      <p>
        Pay {bookingPolicy.advancePercent}% of the agreed total fare in advance.
        The remaining balance is {bookingPolicy.balancePercent}%. Your booking
        is confirmed only after availability is agreed and the advance payment
        is received.
      </p>
    </aside>
  );
}
