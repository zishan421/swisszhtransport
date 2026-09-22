export default function PageSkeleton({ exiting = false }) {
  return (
    <div
      className={`page-skeleton${exiting ? " is-exiting" : ""}`}
      role="status"
      aria-label="Loading Swiss ZH Transport"
    >
      <div className="page-skeleton-shell">
        <div className="skeleton-header">
          <span className="skeleton-logo" />
          <div className="skeleton-header-links">
            <span />
            <span />
            <span />
            <span />
          </div>
          <span className="skeleton-header-action" />
        </div>

        <div className="skeleton-hero">
          <span className="skeleton-kicker" />
          <span className="skeleton-title skeleton-title-wide" />
          <span className="skeleton-title skeleton-title-short" />
          <span className="skeleton-copy" />
          <span className="skeleton-copy skeleton-copy-short" />
          <span className="skeleton-hero-button" />
        </div>

        <div className="skeleton-planner">
          <span className="skeleton-planner-title" />
          <div className="skeleton-planner-fields">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="skeleton-section-heading">
          <span className="skeleton-heading-line" />
          <span className="skeleton-heading-line skeleton-heading-line-short" />
        </div>
        <div className="skeleton-card-grid">
          <span />
          <span />
          <span />
        </div>
        <span className="skeleton-loading-label">Preparing your journey</span>
      </div>
    </div>
  );
}
