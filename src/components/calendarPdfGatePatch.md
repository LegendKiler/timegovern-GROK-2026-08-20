# Calendar PDF F3 wiring

Replace in CalendarPillar.tsx and PdfScheduleModal.tsx:

```ts
import { downloadPdfWithMemberGates } from '../lib/pdfEntitlementsDownload';
// remove downloadMonthlyPdfSchedule from pdfScheduleGenerator import if unused

// instead of downloadMonthlyPdfSchedule(options):
downloadPdfWithMemberGates(options);
```
