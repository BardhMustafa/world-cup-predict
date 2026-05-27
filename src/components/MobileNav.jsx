import { FrontIcon, FixturesIcon, TableIcon, ProfileIcon } from './icons.jsx';

// Sticky bottom navigation shown on narrow screens (≤ 960px).
const items = [
  { label: 'Front', Icon: FrontIcon, active: true },
  { label: 'Fixtures', Icon: FixturesIcon },
  { label: 'Table', Icon: TableIcon },
  { label: 'Profile', Icon: ProfileIcon },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      {items.map(({ label, Icon, active }) => (
        <a key={label} href="#" className={active ? 'active' : undefined}>
          <Icon />
          {label}
        </a>
      ))}
    </nav>
  );
}
