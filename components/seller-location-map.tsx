'use client';

type SellerLocationMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  country?: string | null;
};

export function SellerLocationMap({ latitude, longitude, city, country }: SellerLocationMapProps) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
        Localisation GPS non disponible pour {city ?? '-'}, {country ?? '-'}.
      </div>
    );
  }

  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=13&output=embed`;

  return (
    <div className="overflow-hidden rounded-xl border">
      <iframe
        title="seller-location-map"
        src={mapUrl}
        className="h-60 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

