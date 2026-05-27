import { Link } from 'react-router-dom';
import { ArrowIcon } from './icons.jsx';

// Editorial call-to-action button with the signature offset shadow block.
//   variant="ink"  — solid ink fill, burgundy shadow
//   variant="out"  — outlined, gold shadow
// Pass `to` for client-side routing, `href` for a plain anchor, or
// `onClick`/`type` to render a real <button>.
export default function Button({
  variant = 'ink',
  to,
  href,
  onClick,
  type,
  disabled,
  children,
  withArrow = false,
  className = '',
  style,
}) {
  const classes = `btn btn-${variant}${className ? ` ${className}` : ''}`;
  const inner = (
    <>
      {children}
      {withArrow && <ArrowIcon />}
    </>
  );

  if (to) {
    return (
      <Link className={classes} to={to} style={style}>
        {inner}
      </Link>
    );
  }
  if (onClick || type) {
    return (
      <button className={classes} type={type ?? 'button'} onClick={onClick} disabled={disabled} style={style}>
        {inner}
      </button>
    );
  }
  return (
    <a className={classes} href={href ?? '#'} style={style}>
      {inner}
    </a>
  );
}
