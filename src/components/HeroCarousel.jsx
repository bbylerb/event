import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useLanguage, localized } from '@/lib/i18n';
import { formatDate, formatPrice } from '@/lib/constants';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';

export default function HeroCarousel({ items }) {
  const { lang, t } = useLanguage();
  const [index, setIndex] = useState(0);
  const total = items.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(total, 1)), [total]);
  const prev = () => setIndex((i) => (i - 1 + total) % Math.max(total, 1));

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, total]);

  if (!total) return null;
  const item = items[index];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl bg-neutral-200 aspect-[4/5] sm:aspect-[21/9]">
      <Image src={item.image_url} alt={localized(item, 'name', lang)} className="w-full h-full" fittingType="fill" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-10">
        <div className="max-w-2xl">
          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-orange-500 text-white mb-2 sm:mb-3">
            {t(`cat.${item.category}`)}
          </span>
          <h2 className="text-xl sm:text-4xl font-bold text-white mb-1.5 sm:mb-2 line-clamp-2 drop-shadow-lg">{localized(item, 'name', lang)}</h2>
          <p className="text-xs sm:text-base text-white/90 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-2 drop-shadow">
            {localized(item, 'desc', lang)}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-sm text-white/90 mb-3 sm:mb-5 pb-6 sm:pb-0">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {formatDate(item.date, lang)}</span>
            <span className="flex items-center gap-1 min-w-0"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> <span className="truncate">{localized(item, 'location', lang) || item.province}</span></span>
            <span className="font-bold text-orange-300 text-sm sm:text-base">{formatPrice(item.price)}</span>
          </div>
          <Link
            to={`/events/${item.id}`}
            className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm transition-colors shadow-lg"
          >
            {t('common.viewDetails')}
          </Link>
        </div>
      </div>

      {total > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center backdrop-blur shadow" aria-label="Previous">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-neutral-800 flex items-center justify-center backdrop-blur shadow" aria-label="Next">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 sm:left-auto sm:right-5 sm:justify-end">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-orange-500' : 'w-2 bg-white/60'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
