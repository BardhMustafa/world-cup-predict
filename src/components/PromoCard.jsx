import { useEffect, useRef } from 'react';
import usePromo from '../hooks/usePromo.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { trackEvent } from '../lib/analytics.js';

function useImpressionTracking(ref, promo) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!promo || tracked.current || !ref.current) return;
    const el = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || tracked.current) return;
        tracked.current = true;
        observer.disconnect();

        if (isSupabaseConfigured) {
          supabase.rpc('track_promo_event', { p_promo_id: promo.id, p_event: 'impression' });
        }
        trackEvent('promo_impression', { promo_slot: promo.slot, promo_title: promo.title });
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [promo, ref]);
}

export default function PromoCard({ slot, compact = false }) {
  const promo = usePromo(slot);
  const ref = useRef(null);
  useImpressionTracking(ref, promo);

  if (!promo) return null;

  const handleClick = () => {
    if (isSupabaseConfigured) {
      supabase.rpc('track_promo_event', { p_promo_id: promo.id, p_event: 'click' });
    }
    trackEvent('promo_click', { promo_slot: promo.slot, promo_title: promo.title });
  };

  if (compact) {
    return (
      <div ref={ref} className="promo-card promo-compact card pad">
        <span className="promo-badge">Sponsorizuar</span>
        {promo.image_url && <img src={promo.image_url} alt="" className="promo-logo" />}
        <div className="promo-compact-title">{promo.title}</div>
        {promo.cta_label && promo.cta_url && (
          <a
            href={promo.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline sm block"
            style={{ marginTop: 10 }}
            onClick={handleClick}
          >
            {promo.cta_label}
          </a>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="promo-card card pad">
      <div className="promo-head">
        <span className="promo-badge">Sponsorizuar</span>
        {promo.image_url && <img src={promo.image_url} alt="" className="promo-logo" />}
      </div>
      <div className="promo-title">{promo.title}</div>
      {promo.body && <p className="promo-body">{promo.body}</p>}
      {promo.cta_label && promo.cta_url && (
        <a
          href={promo.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline block"
          style={{ marginTop: 14 }}
          onClick={handleClick}
        >
          {promo.cta_label}
        </a>
      )}
    </div>
  );
}
