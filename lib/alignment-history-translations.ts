import type { LanguageCode } from "./translations.ts";

export interface AlignmentHistoryTranslationPack {
  title: string;
  body: string;
  methodNote: string;
  nearBadge: string;
  midpointTitle: string;
  midpointDetail: string;
  exileTitle: string;
  exileDetail: string;
}

export const ALIGNMENT_HISTORY_TRANSLATIONS: Record<
  LanguageCode,
  AlignmentHistoryTranslationPack
> = {
  en: {
    title: "History near the 293-year marks",
    body: "These events and historical intervals fall on or near a 293-Sacred-year boundary. Signed offsets are calculated from the website’s own dates: minus is before, plus is after.",
    methodNote: "Calendar proximity is a pattern for exploration, not evidence that the cycle caused an event.",
    nearBadge: "Near a 293-year alignment",
    midpointTitle: "Midpoint of Israel’s time in Egypt",
    midpointDetail: "Calculated midpoint between Jacob’s family entering Egypt and the Exodus in traditional Hebrew chronology.",
    exileTitle: "Babylonian exile",
    exileDetail: "Alignment #11 falls inside the mainstream 586–539 BCE interval. The 80-date chronology continues to use traditional Hebrew chronology.",
  },
  he: {
    title: "היסטוריה סמוך לנקודות 293 השנים",
    body: "אירועים ותקופות אלה חלים בנקודת גבול של 293 שנות קודש או בסמוך לה. ההפרש המחושב: מינוס לפני הגבול, פלוס אחריו.",
    methodNote: "קרבה בלוח היא דפוס לעיון, לא הוכחה שהמחזור גרם לאירוע.",
    nearBadge: "סמוך ליישור של 293 שנים",
    midpointTitle: "אמצע שהות ישראל במצרים",
    midpointDetail: "נקודת אמצע מחושבת בין ירידת משפחת יעקב למצרים לבין יציאת מצרים לפי הכרונולוגיה העברית המסורתית.",
    exileTitle: "גלות בבל",
    exileDetail: "יישור 11 חל בתוך הטווח המקובל 586–539 לפנה״ס. רשימת 80 התאריכים ממשיכה להשתמש בכרונולוגיה העברית המסורתית.",
  },
  ar: {
    title: "التاريخ قرب علامات 293 سنة",
    body: "تقع هذه الأحداث والفترات عند حدّ من 293 سنة مقدسة أو بالقرب منه. الفارق المحسوب بالسالب قبل الحد وبالموجب بعده.",
    methodNote: "التقارب التقويمي نمط للاستكشاف وليس دليلاً على أن الدورة سببت الحدث.",
    nearBadge: "قريب من محاذاة 293 سنة",
    midpointTitle: "منتصف إقامة بني إسرائيل في مصر",
    midpointDetail: "منتصف محسوب بين نزول أسرة يعقوب إلى مصر والخروج منها وفق التسلسل العبري التقليدي.",
    exileTitle: "السبي البابلي",
    exileDetail: "تقع المحاذاة 11 داخل الفترة الشائعة 586–539 ق.م. وتبقى قائمة التواريخ الثمانين على التسلسل العبري التقليدي.",
  },
  it: {
    title: "La storia vicino alle soglie di 293 anni",
    body: "Questi eventi e intervalli cadono su una soglia di 293 anni Sacri o nelle sue vicinanze. Il segno meno indica prima, il più dopo.",
    methodNote: "La prossimità nel calendario è uno spunto da esplorare, non prova che il ciclo abbia causato un evento.",
    nearBadge: "Vicino a un allineamento di 293 anni",
    midpointTitle: "Punto medio della permanenza d’Israele in Egitto",
    midpointDetail: "Punto medio calcolato fra la discesa in Egitto della famiglia di Giacobbe e l’Esodo, secondo la cronologia ebraica tradizionale.",
    exileTitle: "Esilio babilonese",
    exileDetail: "L’allineamento 11 cade nell’intervallo convenzionale 586–539 a.C. La cronologia delle 80 date resta quella ebraica tradizionale.",
  },
  el: {
    title: "Η ιστορία κοντά στα σημεία των 293 ετών",
    body: "Αυτά τα γεγονότα και διαστήματα πέφτουν πάνω ή κοντά σε όριο 293 Ιερών ετών. Το μείον σημαίνει πριν και το συν μετά.",
    methodNote: "Η ημερολογιακή εγγύτητα είναι μοτίβο προς διερεύνηση, όχι απόδειξη ότι ο κύκλος προκάλεσε ένα γεγονός.",
    nearBadge: "Κοντά σε ευθυγράμμιση 293 ετών",
    midpointTitle: "Μέσο της παραμονής του Ισραήλ στην Αίγυπτο",
    midpointDetail: "Υπολογισμένο μέσο μεταξύ της καθόδου της οικογένειας του Ιακώβ στην Αίγυπτο και της Εξόδου, με την παραδοσιακή εβραϊκή χρονολογία.",
    exileTitle: "Βαβυλώνια αιχμαλωσία",
    exileDetail: "Η ευθυγράμμιση 11 βρίσκεται μέσα στο συμβατικό διάστημα 586–539 π.Χ. Η χρονολογία των 80 ημερομηνιών παραμένει η παραδοσιακή εβραϊκή.",
  },
  ru: {
    title: "История рядом с 293-летними рубежами",
    body: "Эти события и периоды приходятся на рубеж 293 Священных лет или близко к нему. Минус означает до рубежа, плюс — после.",
    methodNote: "Календарная близость — повод для исследования, а не доказательство причинной связи.",
    nearBadge: "Рядом с 293-летним совпадением",
    midpointTitle: "Середина пребывания Израиля в Египте",
    midpointDetail: "Расчётная середина между переселением семьи Иакова в Египет и Исходом по традиционной еврейской хронологии.",
    exileTitle: "Вавилонское пленение",
    exileDetail: "Совпадение №11 находится внутри общепринятого периода 586–539 гг. до н. э. Хронология 80 дат сохраняет традиционную еврейскую систему.",
  },
  zh: {
    title: "293年节点附近的历史",
    body: "这些事件和历史时段发生在293个圣年边界上或附近。负号表示边界之前，正号表示之后。",
    methodNote: "历法上的接近只供探索，并不证明周期导致了事件。",
    nearBadge: "接近293年对齐点",
    midpointTitle: "以色列人在埃及时期的中点",
    midpointDetail: "依据传统希伯来年代，在雅各一家进入埃及与出埃及之间计算出的中点。",
    exileTitle: "巴比伦之囚",
    exileDetail: "第11次对齐落在主流采用的公元前586至539年区间内；80日期年表仍采用传统希伯来年代。",
  },
  hi: {
    title: "293-वर्षीय सीमाओं के पास इतिहास",
    body: "ये घटनाएँ और ऐतिहासिक काल 293 पवित्र वर्षों की सीमा पर या उसके पास आते हैं। ऋण सीमा से पहले और धन उसके बाद दर्शाता है।",
    methodNote: "कैलेंडर की निकटता खोज का एक पैटर्न है, यह प्रमाण नहीं कि चक्र ने घटना कराई।",
    nearBadge: "293-वर्षीय संरेखण के पास",
    midpointTitle: "मिस्र में इस्राएल के समय का मध्यबिंदु",
    midpointDetail: "पारंपरिक हिब्रू कालक्रम में याकूब के परिवार के मिस्र आने और निर्गमन के बीच गणितीय मध्यबिंदु।",
    exileTitle: "बाबुल निर्वासन",
    exileDetail: "संरेखण 11 मुख्यधारा के 586–539 ईसा-पूर्व काल के भीतर है। 80-तिथि कालक्रम पारंपरिक हिब्रू कालक्रम ही रखता है।",
  },
  es: {
    title: "La historia cerca de los hitos de 293 años",
    body: "Estos acontecimientos y periodos caen en un límite de 293 años Sagrados o cerca de él. El signo menos indica antes; el más, después.",
    methodNote: "La proximidad calendárica es un patrón para explorar, no prueba de que el ciclo causara un acontecimiento.",
    nearBadge: "Cerca de una alineación de 293 años",
    midpointTitle: "Punto medio de la estancia de Israel en Egipto",
    midpointDetail: "Punto medio calculado entre la llegada a Egipto de la familia de Jacob y el Éxodo según la cronología hebrea tradicional.",
    exileTitle: "Exilio babilónico",
    exileDetail: "La alineación 11 cae dentro del intervalo convencional 586–539 a. C. La cronología de 80 fechas mantiene la tradición hebrea.",
  },
  fr: {
    title: "L’histoire près des jalons de 293 ans",
    body: "Ces événements et périodes tombent sur une limite de 293 années Sacrées ou à proximité. Le signe moins indique avant, le plus après.",
    methodNote: "La proximité calendaire est une piste d’exploration, non la preuve que le cycle a causé un événement.",
    nearBadge: "Près d’un alignement de 293 ans",
    midpointTitle: "Milieu du séjour d’Israël en Égypte",
    midpointDetail: "Milieu calculé entre l’arrivée en Égypte de la famille de Jacob et l’Exode selon la chronologie hébraïque traditionnelle.",
    exileTitle: "Exil babylonien",
    exileDetail: "L’alignement 11 se situe dans l’intervalle conventionnel 586–539 av. J.-C. La chronologie des 80 dates reste hébraïque traditionnelle.",
  },
  ja: {
    title: "293年の節目に近い歴史",
    body: "これらの出来事や期間は293聖年の境界上、またはその近くにあります。マイナスは境界前、プラスは境界後です。",
    methodNote: "暦上の近さは探究するためのパターンであり、周期が出来事を引き起こした証拠ではありません。",
    nearBadge: "293年整列点の近く",
    midpointTitle: "イスラエルのエジプト滞在期間の中点",
    midpointDetail: "伝統的ヘブライ年代に基づき、ヤコブ一家のエジプト到着と出エジプトの間を計算した中点です。",
    exileTitle: "バビロン捕囚",
    exileDetail: "第11整列点は一般的な前586〜539年の期間内にあります。80日付の年表は伝統的ヘブライ年代を維持します。",
  },
  ko: {
    title: "293년 경계 가까이의 역사",
    body: "이 사건과 역사적 기간은 293 성년 경계 위나 그 가까이에 있습니다. 음수는 경계 전, 양수는 경계 후입니다.",
    methodNote: "달력상 근접성은 탐구할 패턴이지 주기가 사건을 일으켰다는 증거가 아닙니다.",
    nearBadge: "293년 정렬점 근처",
    midpointTitle: "이스라엘의 이집트 체류 중간점",
    midpointDetail: "전통 히브리 연대기에 따라 야곱 가족의 이집트 이주와 출애굽 사이를 계산한 중간점입니다.",
    exileTitle: "바빌론 유수",
    exileDetail: "제11 정렬점은 통상적인 기원전 586~539년 구간 안에 있습니다. 80개 날짜 연대기는 전통 히브리 연대기를 유지합니다.",
  },
};
