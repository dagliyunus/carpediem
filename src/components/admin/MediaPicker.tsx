'use client';

import { MediaType } from '@prisma/client';
import Image from 'next/image';

export type PickerMediaItem = {
  id: string;
  url: string;
  filename: string;
  mediaType: MediaType;
  altText?: string | null;
};

type BaseProps = {
  label: string;
  hint?: string;
  items: PickerMediaItem[];
  acceptedTypes?: MediaType[];
};

function filterItems(items: PickerMediaItem[], acceptedTypes?: MediaType[]) {
  if (!acceptedTypes || acceptedTypes.length === 0) return items;
  return items.filter((item) => acceptedTypes.includes(item.mediaType));
}

function MediaPreview({ item }: { item: PickerMediaItem }) {
  if (item.mediaType === MediaType.IMAGE) {
    return (
      <Image
        src={item.url}
        alt={item.altText || item.filename}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="h-full w-full object-cover"
      />
    );
  }

  if (item.mediaType === MediaType.VIDEO) {
    return (
      <video
        src={item.url}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-black/40 text-xs font-bold uppercase tracking-[0.14em] text-accent-300">
      Datei
    </div>
  );
}

export function AdminSingleMediaPicker({
  label,
  hint,
  items,
  selectedId,
  onSelect,
  emptyLabel = 'Kein Medium',
  acceptedTypes,
}: BaseProps & {
  selectedId: string;
  onSelect: (id: string) => void;
  emptyLabel?: string;
}) {
  const visibleItems = filterItems(items, acceptedTypes);

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-accent-300">{label}</p>
        {hint ? <p className="mt-1 text-xs text-accent-400">{hint}</p> : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => onSelect('')}
          className={`rounded-2xl border p-3 text-left text-sm transition ${
            selectedId === ''
              ? 'border-primary-400/60 bg-primary-500/15 text-primary-100'
              : 'border-white/10 bg-black/20 text-white/80 hover:border-white/20'
          }`}
        >
          {emptyLabel}
        </button>

        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`overflow-hidden rounded-2xl border text-left transition ${
              selectedId === item.id
                ? 'border-primary-400/60 bg-primary-500/15'
                : 'border-white/10 bg-black/20 hover:border-white/20'
            }`}
          >
            <div className="relative aspect-video overflow-hidden bg-black/50">
              <MediaPreview item={item} />
            </div>
            <div className="space-y-1 px-3 py-2">
              <p className="line-clamp-1 text-sm font-semibold text-white">{item.filename}</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-accent-300">{item.mediaType}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AdminMultiMediaPicker({
  label,
  hint,
  items,
  selectedIds,
  onToggle,
  acceptedTypes,
}: BaseProps & {
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const visibleItems = filterItems(items, acceptedTypes);

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-accent-300">{label}</p>
        {hint ? <p className="mt-1 text-xs text-accent-400">{hint}</p> : null}
      </div>

      <div className="grid max-h-[460px] gap-3 overflow-auto rounded-2xl border border-white/10 bg-black/20 p-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className={`overflow-hidden rounded-2xl border text-left transition ${
                isSelected
                  ? 'border-primary-400/60 bg-primary-500/15'
                  : 'border-white/10 bg-black/20 hover:border-white/20'
              }`}
            >
              <div className="relative aspect-video overflow-hidden bg-black/50">
                <MediaPreview item={item} />
                {isSelected ? (
                  <span className="absolute right-2 top-2 rounded-full bg-primary-500 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Aktiv
                  </span>
                ) : null}
              </div>
              <div className="space-y-1 px-3 py-2">
                <p className="line-clamp-1 text-sm font-semibold text-white">{item.filename}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-accent-300">{item.mediaType}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
