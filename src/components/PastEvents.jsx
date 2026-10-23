import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { useLanguage, localized } from '@/lib/i18n';
import { formatDate } from '@/lib/constants';
import { History, Calendar, MapPin } from 'lucide-react';

export default function PastEvents({ items, loading }) {
  const { t, lang } = useLanguage();

  if (loading || !items?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <History className="w-6 h-6 text-orange-500" /> {t('home.pastTitle')}
        </h2>
        <p className="text-neutral-500 text-sm mt-1">{t('home.pastSub')}</p>
      </div>

      {/* horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
        {items.slice(0, 9).map((e) => (
          <Link
            key={e.id}
            to={`/events/${e.id}`}
            className="shrink-0 w-64 sm:w-auto snap-start bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all"
          >
            <div className="relative aspect-[4/3] bg-neutral-100">
              <Image src={e.image_url} alt="" className="w-full h-full" fittingType="fill" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur">
                {t('home.pastBadge')}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 line-clamp-1">{localized(e, 'name', lang)}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" /> {formatDate(e.date, lang)}</span>
                <span className="flex items-center gap-1 min-w-0"><MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" /> <span className="truncate">{localized(e, 'location', lang) || e.province || '-'}</span></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
