const links = ['The League', 'Fixtures', 'Table', 'Match of the Day', 'Rules', 'Contact', 'Letters to the Editor'];

export default function Footer() {
  return (
    <footer>
      <div className="footer-mast">
        The <em>Prediction</em> Post
      </div>
      <div className="footer-meta">
        Published every morning of the World Cup &middot; Prishtinë, Kosovo &middot; MMXXVI
      </div>
      <div className="footer-links">
        {links.map((link) => (
          <a key={link} href="#">
            {link}
          </a>
        ))}
      </div>
      <div className="footer-credit">
        &copy; The Prediction Post MMXXVI &middot; All scorelines reserved &middot; Set in Playfair Display
        &amp; EB Garamond &middot; Printed digitally &middot; No bookmakers, no bets, only bragging rights.
      </div>
    </footer>
  );
}
