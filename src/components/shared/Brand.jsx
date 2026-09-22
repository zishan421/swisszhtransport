export default function Brand({ footer = false }) {
  return (
    <a
      href="#home"
      className={`brand ${footer ? "brand-footer" : ""}`}
      aria-label="Swiss ZH Transport home"
    >
      <div className="logo-window">
        <img src="/images/swiss-zh-logo.png" alt="" />
      </div>
      <span>
        SWISS ZH<span>TRANSPORT</span>
      </span>
    </a>
  );
}
