# App wiring for Advertise (AD2)

If `CompanyPillarAdvertiseBridge` is not yet in App.tsx after pull, add:

1. Lazy import next to CompanyPillar:
```ts
const CompanyPillarAdvertiseBridge = lazy(() =>
  import('./components/CompanyPillarAdvertiseBridge').then((m) => ({
    default: m.CompanyPillarAdvertiseBridge,
  }))
);
```

2. Replace company pillar render:
```tsx
{activePillar === 11 && (
  <CompanyPillarAdvertiseBridge>
    <CompanyPillar onNavigatePillar={setActivePillar} />
  </CompanyPillarAdvertiseBridge>
)}
```

3. Open media kit: go to Company pillar, then set URL hash to `#advertise`, or click house ad CTA (dispatches `tg-open-advertise`).

Ad slots (AD1) already work via updated `AdBanner` → `AdSlot` without App changes.
