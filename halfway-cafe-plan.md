# Halfway Cafe — Tam Proje Planı
### Danışman: Claude Sonnet 4.6 | Geliştirici: Sen + Claude + Codex

---

> **Bu belge hakkında:** Kod bilmen gerekmiyor. Her adımda tam olarak ne yapman gerektiğini, VSCode'da Claude ve Codex'e ne yazman gerektiğini, hangi sırayla ilerlediğini yazıyorum. Bir şey anlamazsan bu belgeye dön.

---

## İÇİNDEKİLER

1. [Proje Özeti](#1-proje-özeti)
2. [Araçlar ve Kurulum](#2-araçlar-ve-kurulum)
3. [Tech Stack Kararları](#3-tech-stack-kararları)
4. [Klasör Yapısı](#4-klasör-yapısı)
5. [Design System](#5-design-system)
6. [Sayfa Mimarisi](#6-sayfa-mimarisi)
7. [Veri Yapısı](#7-veri-yapısı)
8. [Component Listesi](#8-component-listesi)
9. [SEO ve Schema](#9-seo-ve-schema)
10. [UK Yasal Gereksinimler](#10-uk-yasal-gereksinimler)
11. [Performance Hedefleri](#11-performance-hedefleri)
12. [Analytics Kurulumu](#12-analytics-kurulumu)
13. [Deployment](#13-deployment)
14. [Geliştirme Sırası](#14-geliştirme-sırası)
15. [Claude ve Codex'e Prompt Şablonları](#15-claude-ve-codexe-prompt-şablonları)
16. [Sık Karşılaşılan Sorunlar](#16-sık-karşılaşılan-sorunlar)

---

## 1. Proje Özeti

**Site adı:** Halfway Cafe  
**Amaç:** Local SEO + müşteri bilgilendirme + conversion (yol tarifi, telefon, menü görme)  
**Hedef kitle:** Çevredeki mahalle sakinleri, Google'dan "full english breakfast london" arayanlar, turistler  
**Kimlik:** Greasy spoon / British caff — nostaljik, samimi, gösterişsiz  
**Öncelik sırası:** Mobile > Desktop (ziyaretçilerin %80'i telefondan gelir)

### Sitenin Yapacağı 3 Şey
1. Ziyaretçiye menüyü göster
2. Ziyaretçiyi fiziksel mekana yönlendir
3. Google'da "breakfast [mahalle]" aramalarında üst sırada çık

---

## 2. Araçlar ve Kurulum

### Bilgisayarına Kurman Gerekenler

| Araç | Ne İşe Yarar | Nereden İndirilir |
|------|-------------|-------------------|
| Node.js (v20+) | Projeyi çalıştırır | nodejs.org |
| VSCode | Kod editörü | code.visualstudio.com |
| Git | Versiyonlama | git-scm.com |
| Vercel CLI | Deploy için | `npm i -g vercel` |

### VSCode Extension'ları

VSCode açıkken sol menüde "Extensions" (Ctrl+Shift+X):

- **Claude for VSCode** — Anthropic'in resmi extension'ı
- **Codex** — GitHub Copilot veya Codex extension
- **ESLint** — kod hatalarını gösterir
- **Prettier** — kodu otomatik düzenler
- **Tailwind CSS IntelliSense** — Tailwind class önerileri
- **Auto Rename Tag** — HTML taglarını otomatik günceller

### Projeyi Başlatmak

Terminal aç (VSCode'da Ctrl+`) ve şunları sırayla yaz:

```bash
# Next.js projesi oluştur
npx create-next-app@latest halfway-cafe

# Sorular gelecek, şöyle cevapla:
# TypeScript: Yes
# ESLint: Yes
# Tailwind CSS: Yes
# src/ directory: Yes
# App Router: Yes
# Import alias: Yes (default @/)

# Klasöre gir
cd halfway-cafe

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` açılırsa kurulum tamam demektir.

---

## 3. Tech Stack Kararları

### Neden Bu Araçlar?

| Araç | Neden? | Alternatif Değil Çünkü |
|------|--------|----------------------|
| **Next.js 14** | SEO için server-side rendering şart | Create React App: SEO zayıf |
| **TypeScript** | Claude ve Codex çok daha iyi kod üretiyor | Plain JS: hata yakalamak zor |
| **Tailwind CSS** | Hızlı, tutarlı, Claude biliyor | Custom CSS: tutarsızlık riski |
| **Vercel** | Next.js ile sıfır konfigürasyon | Netlify: Next.js desteği kısıtlı |
| **next/image** | Otomatik WebP + resize | Düz img: performans berbat |
| **next/font** | Self-hosted Google Fonts | CDN fonts: GDPR riski |

### Kullanmayacağın Şeyler (ve Neden)
- **Redux/Zustand** — bu site için state management gerekmez
- **GraphQL** — menü verisi statik, overkill
- **Database** — Şimdilik. İleride Supabase eklenebilir
- **CMS** — İleride. Şimdilik `.ts` dosyasında veri

---

## 4. Klasör Yapısı

```
halfway-cafe/
├── src/
│   ├── app/                          # Next.js App Router sayfaları
│   │   ├── layout.tsx                # Root layout (Navbar + Footer)
│   │   ├── page.tsx                  # Ana sayfa (/)
│   │   ├── menu/
│   │   │   └── page.tsx              # Menü sayfası (/menu)
│   │   ├── about/
│   │   │   └── page.tsx              # Hakkımızda (/about)
│   │   ├── gallery/
│   │   │   └── page.tsx              # Galeri (/gallery)
│   │   ├── contact/
│   │   │   └── page.tsx              # İletişim (/contact)
│   │   ├── legal/
│   │   │   ├── privacy/page.tsx      # Gizlilik politikası
│   │   │   └── allergens/page.tsx    # Alerjen bilgisi (UK zorunlu)
│   │   ├── sitemap.ts                # Otomatik sitemap
│   │   └── robots.ts                 # robots.txt
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── StickyContactBar.tsx  # Mobilde sabit "Ara / Yol Tarifi"
│   │   ├── sections/                 # Her section kendi dosyasında
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturedSection.tsx
│   │   │   ├── MenuSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── GallerySection.tsx
│   │   │   └── LocationSection.tsx
│   │   └── ui/                       # Küçük, tekrar kullanılabilir parçalar
│   │       ├── DishCard.tsx
│   │       ├── MenuTab.tsx
│   │       ├── AllergenBadge.tsx
│   │       ├── ReviewStars.tsx
│   │       ├── OpenStatus.tsx        # "Şu an açık/kapalı" göstergesi
│   │       └── SectionHeader.tsx
│   │
│   ├── data/                         # Tüm içerik burada, component'te değil
│   │   ├── menu.ts                   # Tüm menü kalemleri
│   │   ├── opening-hours.ts          # Açılış saatleri
│   │   ├── gallery.ts                # Galeri fotoğraf listesi
│   │   └── reviews.ts                # Google review'ları (manuel)
│   │
│   ├── lib/
│   │   ├── utils.ts                  # Yardımcı fonksiyonlar
│   │   └── isOpen.ts                 # "Şu an açık mı?" hesaplama
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript tip tanımları
│   │
│   └── styles/
│       └── globals.css               # Global stiller + CSS variables
│
├── public/
│   ├── images/
│   │   ├── hero/
│   │   │   └── cafe-interior.jpg     # KENDİ FOTOĞRAFIN buraya
│   │   ├── menu/                     # Menü görselleri
│   │   └── gallery/                  # Galeri görselleri
│   ├── fonts/                        # Self-hosted fontlar
│   └── schema/
│       └── restaurant.json           # JSON-LD schema
│
├── .env.local                        # Gizli değişkenler (Git'e gitmiyor)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Design System

Bu değerler `globals.css` dosyasında tanımlanacak ve her yerde kullanılacak. Tutarsızlığı önler.

### Renk Paleti

```css
/* src/styles/globals.css */
:root {
  /* Greasy spoon / British caff paleti */
  --color-parchment:    #f2ebe0;   /* Ana arka plan */
  --color-parchment-2:  #ede4d3;   /* Alternatif section arka planı */
  --color-parchment-3:  #e4d9c5;   /* Kart hover, border */
  --color-ink:          #1c1209;   /* Koyu metin, navbar */
  --color-ink-mid:      #3d2b1a;   /* Orta metin */
  --color-ink-light:    #6b503a;   /* Hafif metin, açıklamalar */
  --color-red:          #b82020;   /* Ana aksan rengi */
  --color-red-dark:     #8c1818;   /* Hover state */
  --color-gold:         #c9992a;   /* İkincil aksan */
  --color-gold-light:   #e8c87a;   /* Hafif gold */
  --color-white:        #ffffff;
  --color-border:       rgba(28, 18, 9, 0.15);
}
```

### Tipografi

```css
/* Playfair Display — başlıklar için */
/* Lora — body text için */
/* Libre Baskerville — label/badge için */
```

`src/app/layout.tsx` dosyasında Next.js font sistemiyle yüklenir:

```typescript
import { Playfair_Display, Lora, Libre_Baskerville } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})
// ... diğerleri aynı şekilde
```

### Spacing Sistemi (Tailwind)

Büyük section padding'leri için tutarlı değerler:
- Section padding: `py-24` (96px)
- Container max width: `max-w-6xl mx-auto px-6`
- Card gap: `gap-6`
- Section header margin bottom: `mb-14`

### Breakpoint'ler

| İsim | Genişlik | Ne için |
|------|----------|---------|
| `sm` | 640px | Büyük telefon |
| `md` | 768px | Tablet |
| `lg` | 1024px | Küçük laptop |
| `xl` | 1280px | Desktop |

**Kural:** Her zaman mobile önce yaz. Yani önce telefonun nasıl görüneceğini yaz, sonra `md:` `lg:` ile büyük ekranı düzenle.

---

## 6. Sayfa Mimarisi

### Ana Sayfa (`/`) — Section Sırası

```
1. Navbar (fixed, scroll'da arka plan değişir)
2. Hero Section
   - Kendi cafe fotoğrafın (tam ekran)
   - Başlık + tagline
   - "View Menu" + "Get Directions" butonları
   - Sağda: opening hours kartı
3. Featured Dishes (4 kart — chef's picks)
4. Menu Preview Section
   - Kategori tabları: Breakfast | Lunch | Burgers | Desserts | Drinks
   - 3'lü grid
5. About Section (koyu arka plan)
   - Sol: fotoğraf + "Est. 2008" ribbon
   - Sağ: hikaye + 3 stat
6. Gallery Section (asimetrik grid)
7. Location Section
   - Sol: adres, telefon, saatler kartları
   - Sağ: harita placeholder (ileride Google Maps)
8. Footer
9. StickyContactBar (sadece mobilde — "📞 Ara | 📍 Yol Tarifi")
```

### Menü Sayfası (`/menu`)

```
1. Navbar
2. Page Hero (küçük — sadece başlık + breadcrumb)
3. Dietary Filter Bar (Vegetarian / Vegan / Gluten-Free toggle)
4. Kategori Tabs
5. Menu Grid (3 kolon desktop, 2 tablet, 1 mobil)
   - Her kart: fotoğraf, isim, açıklama, fiyat, alerjen badge'leri
6. Daily Specials bölümü (sabit, her gün değişmez — sadece görsel)
7. Footer
```

### Diğer Sayfalar

**About (`/about`):** Uzun hikaye, ekip fotoğrafları, değerler  
**Gallery (`/gallery`):** Masonry grid, tüm fotoğraflar  
**Contact (`/contact`):** Büyük harita, form (name/email/message), adres  
**Allergens (`/legal/allergens`):** UK zorunlu — 14 alerjen tablosu  

---

## 7. Veri Yapısı

### `src/types/index.ts`

```typescript
// Menü kalemi tipi
export type MenuItem = {
  id: string
  name: string
  description: string
  price: number          // 9.90 gibi — string değil number
  category: MenuCategory
  image: string          // /images/menu/full-english.jpg
  allergens: Allergen[]
  dietary: DietaryTag[]
  available: 'all-day' | 'breakfast-only' | 'lunch-only'
  featured: boolean
}

export type MenuCategory = 
  'breakfast' | 'lunch' | 'burgers' | 'desserts' | 'drinks'

export type Allergen = 
  'gluten' | 'dairy' | 'eggs' | 'nuts' | 'soy' | 
  'fish' | 'shellfish' | 'celery' | 'mustard' | 
  'sesame' | 'sulphites' | 'lupin' | 'molluscs' | 'peanuts'

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free'

// Açılış saati tipi
export type OpeningHours = {
  day: string
  open: string    // "07:00"
  close: string   // "21:00"
  closed: boolean
}
```

### `src/data/menu.ts` (Örnek Yapı)

```typescript
import { MenuItem } from '@/types'

export const menuItems: MenuItem[] = [
  {
    id: 'full-english',
    name: 'Full English Breakfast',
    description: 'Two eggs any style, back bacon, pork sausages, baked beans, grilled tomato & white toast.',
    price: 9.90,
    category: 'breakfast',
    image: '/images/menu/full-english.jpg',
    allergens: ['gluten', 'eggs', 'dairy'],
    dietary: [],
    available: 'breakfast-only',
    featured: true,
  },
  // ... diğerleri
]

// Kategoriye göre filtrele
export const getByCategory = (category: string) =>
  menuItems.filter(item => item.category === category)

// Featured olanları getir
export const getFeatured = () =>
  menuItems.filter(item => item.featured)
```

### `src/data/opening-hours.ts`

```typescript
export const openingHours = [
  { day: 'Monday',    open: '07:00', close: '21:00', closed: false },
  { day: 'Tuesday',   open: '07:00', close: '21:00', closed: false },
  { day: 'Wednesday', open: '07:00', close: '21:00', closed: false },
  { day: 'Thursday',  open: '07:00', close: '21:00', closed: false },
  { day: 'Friday',    open: '07:00', close: '21:00', closed: false },
  { day: 'Saturday',  open: '08:00', close: '22:00', closed: false },
  { day: 'Sunday',    open: '08:00', close: '20:00', closed: false },
]
```

---

## 8. Component Listesi

Her component için ne yapacağı, hangi veriyi alacağı:

### Layout Components

**`Navbar.tsx`**
- Sayfanın üstünde sabit durur
- Scroll > 60px olunca arka plan koyu mürekkep rengine döner
- Aktif sayfayı highlight eder
- Mobilde hamburger menu

**`Footer.tsx`**
- 4 kolon: Logo+açıklama | Menü linkleri | Sayfalar | Açılış saatleri
- Social media linkleri
- Copyright

**`StickyContactBar.tsx`**
- Sadece mobilde görünür (`md:hidden`)
- Ekranın altında sabit
- "📞 +44 1234 567890" ve "📍 Get Directions" butonları
- Bu component conversion için en kritik mobile element

### Section Components

**`HeroSection.tsx`**
- Props: yok (veri hardcoded veya config'den)
- `next/image` ile optimize hero görseli
- Scroll'da parallax efekti (CSS transform)

**`FeaturedSection.tsx`**
- Props: `items: MenuItem[]`
- `getFeatured()` ile veri çeker
- 4 kart grid

**`MenuSection.tsx`**
- Props: `items: MenuItem[]`
- Tab state: `useState<MenuCategory>('breakfast')`
- Dietary filter state: `useState<DietaryTag[]>([])`
- Filtered items hesaplaması

**`AboutSection.tsx`**
- Props: yok
- Koyu arka plan
- Stat sayaçları (intersection observer ile animasyonlu)

**`GallerySection.tsx`**
- Props: `images: GalleryImage[]`
- Asimetrik CSS grid
- Lightbox ileride eklenebilir

**`LocationSection.tsx`**
- Props: yok
- `isOpen()` hesaplaması
- Google Maps embed (ileride)

### UI Components

**`DishCard.tsx`**
```typescript
type DishCardProps = {
  item: MenuItem
  variant?: 'featured' | 'menu'  // featured: büyük, menu: normal
}
```

**`AllergenBadge.tsx`**
```typescript
type AllergenBadgeProps = {
  allergen: Allergen
}
// Her alerjen için ikon + renk kodu
```

**`OpenStatus.tsx`**
```typescript
// "Open Now" (yeşil) veya "Closes at 21:00" veya "Closed — Opens at 07:00"
// Saati otomatik hesaplar
```

**`SectionHeader.tsx`**
```typescript
type SectionHeaderProps = {
  kicker: string      // "Chef's Picks"
  title: string       // "Our Favourites"
  titleItalic?: string // "Favourites" kısmı italic olacaksa
  subtitle?: string
  centered?: boolean
}
```

---

## 9. SEO ve Schema

### Her Sayfa İçin Meta Tags

`src/app/layout.tsx` veya her sayfanın `metadata` export'u:

```typescript
// src/app/page.tsx
export const metadata = {
  title: 'Halfway Cafe | Full English Breakfast & Lunch – London EC1',
  description: 'London\'s favourite neighbourhood caff since 2008. Full English breakfast, freshly made lunches, proper burgers. Open 7 days. 123 High Street, London EC1.',
  keywords: ['full english breakfast london', 'greasy spoon london', 'breakfast ec1', 'cafe high street london'],
  openGraph: {
    title: 'Halfway Cafe – London\'s Favourite Caff',
    description: 'Fresh homemade food since 2008. Breakfast from 7am.',
    images: ['/images/og-image.jpg'],  // 1200x630px
    locale: 'en_GB',
    type: 'website',
  },
}
```

### JSON-LD Schema (`public/schema/restaurant.json`)

Bu dosya Google'a "bu bir restoran, şu bilgiler var" der. Arama sonuçlarında yıldız, açılış saati gibi bilgiler çıkar.

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Halfway Cafe",
  "description": "London's favourite neighbourhood caff. Full English breakfast, fresh lunches and proper burgers since 2008.",
  "url": "https://halfwaycafe.co.uk",
  "telephone": "+44-1234-567890",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 High Street",
    "addressLocality": "London",
    "postalCode": "EC1A 1BB",
    "addressCountry": "GB"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 51.5074,
    "longitude": -0.1278
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "07:00",
      "closes": "21:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday","Sunday"],
      "opens": "08:00",
      "closes": "22:00"
    }
  ],
  "servesCuisine": ["British", "Full English Breakfast", "Cafe"],
  "priceRange": "£",
  "hasMenu": "https://halfwaycafe.co.uk/menu",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "124"
  }
}
```

Bu schema'yı `src/app/layout.tsx` içinde `<script type="application/ld+json">` ile sayfaya ekle.

### Sitemap (`src/app/sitemap.ts`)

Next.js bunu otomatik oluşturur:

```typescript
export default function sitemap() {
  return [
    { url: 'https://halfwaycafe.co.uk',           priority: 1.0 },
    { url: 'https://halfwaycafe.co.uk/menu',       priority: 0.9 },
    { url: 'https://halfwaycafe.co.uk/about',      priority: 0.7 },
    { url: 'https://halfwaycafe.co.uk/gallery',    priority: 0.6 },
    { url: 'https://halfwaycafe.co.uk/contact',    priority: 0.8 },
  ]
}
```

### Local SEO Checklist

Siteyi bitirdikten sonra bunları yap:

- [ ] Google Business Profile oluştur / güncelle
- [ ] GBP'de fotoğraf ekle (en az 10)
- [ ] GBP açılış saatlerini site ile eşleştir
- [ ] NAP (Name, Address, Phone) — site + GBP + her yerde **aynı format**
- [ ] Google Search Console'a site ekle
- [ ] sitemap.xml'i Search Console'a gönder

---

## 10. UK Yasal Gereksinimler

### Alerjen Bilgisi (ZORUNLU)

UK Food Information Regulations 2014 gereği **14 majör alerjen** sitede gösterilmeli.

`/legal/allergens` sayfasında her menü kalemi için hangi alerjen var tablosu olmalı.

Menü kartlarında da badge olarak göster:
- 🌾 Gluten | 🥛 Dairy | 🥚 Eggs | 🥜 Nuts | 🐟 Fish vb.

### Cookie Consent

GDPR + UK PECR gereği:
- Analytics (GA4) kullanmadan önce kullanıcı onayı gerekli
- Basit bir cookie banner yeterli: "We use cookies for analytics. [Accept] [Decline]"
- `localStorage` ile tercih kaydet

### Privacy Policy Sayfası

`/legal/privacy` — en azından şunları içermeli:
- Ne tür veri toplanıyor (sadece analytics)
- GA4 kullanılıyor ve nasıl devre dışı bırakılır
- İletişim email

### Accessibility (WCAG 2.1 AA)

- Tüm görsellerde `alt` text
- Renk kontrastı yeterli olmalı (kırmızı üstüne beyaz ✅)
- Keyboard navigation çalışmalı (Tab tuşu)
- `aria-label` linklerde açıklayıcı olmalı

---

## 11. Performance Hedefleri

### Core Web Vitals Hedefleri

| Metrik | Hedef | Ne Anlama Gelir |
|--------|-------|-----------------|
| **LCP** | < 2.5s | En büyük içerik ne kadar sürede yüklenir |
| **FID/INP** | < 100ms | Tıklamaya tepki süresi |
| **CLS** | < 0.1 | Sayfa yüklenirken ne kadar kayıyor |

### Görsel Optimizasyon Kuralları

- Hero fotoğrafı: **WebP format, max 200kb**, 1920x1080px
- Menü görselleri: **WebP format, max 80kb**, 600x400px
- `next/image` kullan — otomatik WebP dönüştürür, lazy load yapar, srcset ekler
- Kendi fotoğraflarını upload etmeden önce [squoosh.app](https://squoosh.app) ile WebP'ye dönüştür

### next/image Kullanımı (Her yerde böyle yaz)

```tsx
import Image from 'next/image'

// Hero için (above the fold — priority: true)
<Image
  src="/images/hero/cafe-interior.jpg"
  alt="Inside Halfway Cafe — customers enjoying breakfast"
  fill
  priority
  className="object-cover"
/>

// Menü kartı için (lazy load)
<Image
  src={item.image}
  alt={item.name}
  width={600}
  height={400}
  className="object-cover w-full"
/>
```

---

## 12. Analytics Kurulumu

### Google Analytics 4

1. [analytics.google.com](https://analytics.google.com) → Yeni mülk oluştur
2. "Web" seç → URL: halfwaycafe.co.uk
3. Measurement ID al: `G-XXXXXXXXXX`
4. `.env.local` dosyasına ekle:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Takip Edilecek Events (Conversion'lar)

Bunlar en önemli numaralar — ziyaretçi ne yaptı?

| Event | Tetiklenme |
|-------|-----------|
| `view_menu` | Menü sayfasına girildiğinde |
| `click_directions` | "Get Directions" tıklandığında |
| `click_phone` | Telefon numarası tıklandığında |
| `click_whatsapp` | WhatsApp butonu tıklandığında |
| `view_item` | Menü kalemi görüntülendiğinde |
| `dietary_filter` | Vegetarian/Vegan filtresi kullanıldığında |

### Microsoft Clarity (Ücretsiz Heatmap)

[clarity.microsoft.com](https://clarity.microsoft.com) — kurulumu GA4 gibi, ama ziyaretçinin sayfada nereye tıkladığını, nereye kadar scroll ettiğini video olarak görebiliyorsun. Çok değerli.

---

## 13. Deployment

### Vercel ile Deploy (En Kolay Yol)

1. [github.com](https://github.com) — ücretsiz hesap aç
2. VSCode'da terminal:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create halfway-cafe --public --push
```

3. [vercel.com](https://vercel.com) → GitHub ile giriş yap
4. "New Project" → halfway-cafe repo'sunu seç
5. Environment Variables ekle: `NEXT_PUBLIC_GA_ID`
6. Deploy

Her `git push` sonrası Vercel otomatik deploy eder.

### Domain Bağlama

Eğer `halfwaycafe.co.uk` gibi bir domain alırsan:
- Vercel Dashboard → Project → Settings → Domains
- Domain ekle → DNS ayarlarını vercel'in söylediği gibi yap

Domain almak için: [Namecheap](https://namecheap.com) veya [GoDaddy](https://godaddy.com)  
`.co.uk` domain'i yıllık ~£10

---

## 14. Geliştirme Sırası

Kod bilmen olmadan bu sırayı takip et. Her adımda bir sonrakine geç.

### Hafta 1 — Temel Yapı

- [ ] Node.js + VSCode + Git kur
- [ ] `create-next-app` ile projeyi oluştur
- [ ] Klasör yapısını oluştur
- [ ] `types/index.ts` dosyasını yaz
- [ ] `data/menu.ts` dosyasını doldur (tüm menü kalemleri)
- [ ] `data/opening-hours.ts` dosyasını yaz
- [ ] Design tokens'ı `globals.css`'e ekle
- [ ] Font kurulumu (`layout.tsx`)

### Hafta 2 — Ana Sayfa

- [ ] `Navbar.tsx` — scroll effect ile
- [ ] `HeroSection.tsx` — kendi fotoğrafınla
- [ ] `FeaturedSection.tsx` — 4 kart
- [ ] `MenuSection.tsx` — tab sistemi + filtreler
- [ ] `Footer.tsx`

### Hafta 3 — Alt Sayfalar + Detaylar

- [ ] `AboutSection.tsx`
- [ ] `GallerySection.tsx`
- [ ] `LocationSection.tsx`
- [ ] `StickyContactBar.tsx` (mobil)
- [ ] `/menu` sayfası
- [ ] `/contact` sayfası

### Hafta 4 — SEO + Legal + Deploy

- [ ] JSON-LD schema ekle
- [ ] Her sayfaya `metadata` ekle
- [ ] `sitemap.ts` yaz
- [ ] `/legal/allergens` sayfası
- [ ] `/legal/privacy` sayfası
- [ ] Cookie banner
- [ ] GA4 kur
- [ ] Microsoft Clarity kur
- [ ] Vercel deploy
- [ ] Google Business Profile güncelle
- [ ] Google Search Console'a ekle

---

## 15. Claude ve Codex'e Prompt Şablonları

Kod bilmen olmadığı için bunları kopyalayıp kullanabilirsin.

### Yeni Component Oluştururken

```
VSCode'da Claude'a yaz:

"Aşağıdaki bilgilere göre bana [ComponentAdı].tsx dosyasını yaz.

Kullandığım stack: Next.js 14, TypeScript, Tailwind CSS
Design tokens: src/styles/globals.css'de tanımlı (--color-red, --color-ink, vb.)
Fontlar: Playfair Display (başlık), Lora (body), Libre Baskerville (label)

Component'in yapması gerekenler:
- [ne yapacağını yaz]

Props:
- [hangi veriyi alacağını yaz]

Dikkat edilecekler:
- Mobile first (önce telefon görünümü)
- next/image kullan (düz img değil)
- Tailwind class'ları kullan (inline style değil)
- Türkçe yorum satırı koyma, İngilizce olsun"
```

### Hata Aldığında

```
"VSCode terminalinde şu hatayı alıyorum:
[HATA MESAJINI BURAYA YAPISTIR]

Bu hata hangi dosyadan geliyor ve nasıl düzeltirim?
Adım adım anlat."
```

### Mevcut Kodu Değiştirirken

```
"[dosya adı] dosyamda şu şeyi değiştirmek istiyorum:
- Şu an: [ne var şu an]
- İstediğim: [ne olmasını istiyorsun]

Sadece değişmesi gereken kısmı göster, tüm dosyayı yeniden yazma."
```

### Codex İçin

Codex daha çok otomatik tamamlama yapar. Yorum satırı yaz, Codex kodu tamamlar:

```typescript
// Get all menu items filtered by category and dietary preference
// Returns filtered MenuItem array
// If dietaryFilters is empty, return all items in category
```

### Sık Kullanılacak Claude Promptları

**Component'e hover animasyonu ekle:**
```
"[ComponentAdı] dosyamda kartların üstüne gelinince hafif yukarı kalkması ve gölgesi artması efektini Tailwind ile ekle."
```

**Scroll reveal ekle:**
```
"[SectionAdı] section'ına Intersection Observer ile scroll reveal animasyonu ekle. Sayfa aşağı scroll edilince elementler aşağıdan yukarıya doğru fade in yapsın."
```

**Responsive düzelt:**
```
"[ComponentAdı] telefonda iyi görünmüyor. Desktop'ta 4 kolon grid var, telefonda 1 kolon olsun, tablet'te 2 kolon olsun."
```

---

## 16. Sık Karşılaşılan Sorunlar

### "Module not found" Hatası
```
Cannot find module '@/components/...'
```
**Çözüm:** Dosyanın gerçekten o klasörde olup olmadığını kontrol et. `tsconfig.json`'da `paths` ayarı var mı kontrol et.

### Görsel Gözükmüyor
**Çözüm:** `next/image` kullanıyorsan görselin `public/` klasöründe olması gerekir. Path `/images/...` şeklinde başlamalı, `./images/...` değil.

### TypeScript Kırmızı Çizgi
**Çözüm:** Genellikle tip uyuşmazlığı. Claude'a hatayı göster: "Bu TypeScript hatasını nasıl düzeltirim?"

### Tailwind Class'ları Çalışmıyor
**Çözüm:** `tailwind.config.ts`'de `content` array'inde dosya path'ini kontrol et. `src/**/*.{js,ts,jsx,tsx}` olmalı.

### `npm run dev` Çalışmıyor
**Çözüm:** Terminal'de proje klasöründe olduğunu kontrol et. `cd halfway-cafe` yaptın mı?

### Vercel Deploy Hatası
**Çözüm:** Deploy log'una bak (Vercel Dashboard'da). Genellikle ya TypeScript hatası ya da eksik environment variable olur.

---

## Notlar ve Hatırlatmalar

> **Kendi fotoğrafını kullan:** Hero ve gallery bölümlerinde mutlaka kendi mekânının fotoğrafları olsun. Stok fotoğraf kullanma — ziyaretçiler gerçek mekanı görmek ister ve Google Reviews'daki fotoğraflarla eşleşmesini bekler.

> **İçeriği Türkçe yazma:** Site İngilizce — Londra'daki müşterilerin dili. Menü açıklamaları, about metni hepsi İngilizce olsun.

> **Fiyatları güncel tut:** `src/data/menu.ts` dosyasını düzenleyerek fiyatları kolayca güncelleyebilirsin. Kod bilmene gerek yok — sadece rakamı değiştir.

> **Google Business Profile:** Siteyi bitirmeden önce GBP'yi tamamla. Birçok ziyaretçi siteye hiç girmeden GBP'den bilgi alır.

> **Mobil testi:** Her yeni section'dan sonra Chrome'da F12 → toggle device toolbar ile telefon görünümünü kontrol et.

---

*Bu belge projenin her aşamasında referans kaynağın. Bir şey anlamazsan Claude'a bu belgeden ilgili bölümü göstererek sor.*

**İyi kodlamalar. Sorularını sor, takılma.** 🍳
