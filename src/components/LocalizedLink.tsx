import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useLocale } from '@/contexts/LocaleContext';

/**
 * Drop-in replacement for react-router's `<Link>` that automatically
 * prepends the current locale prefix (e.g. `/de`, `/es`, `/ru`).
 *
 * For English (default), paths are left unchanged.
 * Only string `to` props are localized; object `to` is passed through.
 */
export const LocalizedLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, ...props }, ref) => {
    const { localePath } = useLocale();
    const localizedTo = typeof to === 'string' ? localePath(to) : to;
    return <Link ref={ref} to={localizedTo} {...props} />;
  }
);

LocalizedLink.displayName = 'LocalizedLink';
