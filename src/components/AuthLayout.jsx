// Split-screen auth chrome: stadium-lit brand hero on the left, form on the right.
export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <div className="auth-hero">
        <div className="brandmark">Kupa e Botës · MMXXVI</div>
        <h1>
          <span className="b">KUPA E</span>
          <br />
          <span className="g">BOTËS 2026</span>
        </h1>
        <p>Bashkohu me mijëra tifozë. Parashiko ndeshjet, fito pikë dhe shpallu kampion.</p>
        <div className="stats">
          <div>
            <div className="v text-green">12K+</div>
            <div className="l">Lojtarë</div>
          </div>
          <div>
            <div className="v text-gold">104</div>
            <div className="l">Ndeshje</div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form">{children}</div>
      </div>
    </div>
  );
}
