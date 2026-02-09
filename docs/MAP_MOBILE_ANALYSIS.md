# Harita: 758px Altında Görüntülenmeme Analizi

## Özet
758px ve altında (yani `max-width: 768px` mobil breakpoint’i içinde) **harita ekranında** harita görünmüyor. Bu dosyada sadece **sebep analizi** var; kod değişikliği yapılmadı.

---

## 1. Breakpoint ve “mobil” davranış

- Tüm mobil mantık **768px** ile tetikleniyor:
  - `window.matchMedia('(max-width: 768px)')` → `isMobileView`
  - CSS: `@media (max-width: 768px)` (`.map-screen`, `.leaflet-container`, vb.)
- **758px** kodda geçmiyor; 758px = 768px breakpoint’inin içi. Yani sorun “758’e özel” değil, **768 ve altındaki tüm genişliklerde** harita ekranında yaşanıyor olmalı.

---

## 2. Haritanın gösterilmesi iki aşamada

### A) Haritanın mount olması: `canMountMap`

- **Masaüstü (genişlik > 768px):** `isMobileView === false` → effect içinde `setCanMountMap(true)` → harita hemen mount.
- **Mobil (≤ 768px):** `isMobileView === true` → harita sadece şu durumlarda mount oluyor:
  1. `mapSectionRef.current` veya `mapWrapperRef.current` ile **ResizeObserver** tetiklenip `el.clientHeight >= 250` olunca `setCanMountMap(true)`, **veya**
  2. Bu ref’ler **null** ise **600ms** sonra `setCanMountMap(true)`, **veya**
  3. **900ms** fallback ile `setCanMountMap(true)`.

Olası sorunlar:

- **Ref’lerin o an null olması:** Map view ilk kez render edildiğinde section ve wrapper div DOM’da; ref’ler commit sonrası set edilir, effect ise daha sonra çalışır. Normalde effect çalıştığında ref’ler dolu olmalı. Ama ilk frame’de bazen ref veya `clientHeight` gecikmeli olabilir.
- **`clientHeight`’ın 0 gelmesi:** ResizeObserver ve `check()` sadece `el.clientHeight >= 250` görünce `canMountMap = true` yapıyor. Mobil CSS’te `.map-screen-map` ve section için `height: 380px` veriliyor; yine de üst container’da flex / `min-height: 0` zinciri yüzünden ilk layout’ta section’a 0 height hesaplanıyorsa, `check()` hiç true dönmez. O zaman sadece **900ms fallback** kalır.
- **Effect cleanup:** Effect dependency’leri (`showMap`, `coordinates.length`, `isMobileView`) değişince cleanup çalışıyor ve **900ms timeout iptal ediliyor**. Örneğin 900ms dolmadan `isMobileView` veya başka state değişirse, fallback hiç tetiklenmeden iptal olur. Bu durumda, eğer ref’ler null ya da `clientHeight < 250` ise, **canMountMap hiç true olmaz** ve harita hiç mount olmaz (ekranda sadece “Harita yükleniyor…” kalır).

Yani 758px altında harita “hiç gelmiyorsa” (placeholder’da takılıyorsa), büyük olasılıkla:

- Mobil branch’te `canMountMap` bir türlü `true` olmuyor: ya ref/height koşulu hiç sağlanmıyor hem de 900ms fallback cleanup yüzünden iptal ediliyor.

---

### B) Harita mount olduktan sonra görünürlük (siyah ekran)

- Tile istekleri network’te görünüyorsa, Leaflet mount olmuş ve tile’ları istiyor demektir. Buna rağmen ekran siyahsa sorun **görünürlük / katman** tarafındadır.
- Olası nedenler:
  - **`.leaflet-container::after`** (genel kuralda `z-index: 1000`) tile pane’in üstünde kalıp tile’ları kapatıyor olabilir. Harita ekranında bunu hafifletmek için `.map-screen-leaflet .leaflet-container::after { z-index: 0 }` konmuş; yine de başka sayfalardaki genel `.leaflet-container` kuralları harita ekranını etkileyebilir.
  - **Genel mobil `.leaflet-container` kuralı:** `@media (max-width: 768px)` içinde `.leaflet-container { height: 55vh; ... }` var. Harita ekranında daha spesifik selector ve `height: 380px !important` ile eziliyor olmalı; yine de CSS sırası / spesifikite karışırsa mobilde yanlış height (veya başka bir özellik) uygulanıp container 0 veya çok küçük kalabilir.
  - **overflow: hidden** (genel `.leaflet-container`’da var) + yanlış boyut veya pozisyon, tile’ları kesip siyah gösterebilir.
  - Mobilde **stacking context** (transform, z-index, isolation) tile pane’i “görünmez” katmanda bırakıyor olabilir.

---

## 3. CSS zinciri (mobil, 768px ve altı)

- **`.map-screen`:** `flex-direction: column`, `min-height: 100vh`
- **`.map-screen-sidebar`:** `max-height: 40vh`, `flex-shrink: 0`
- **`.map-screen-map` (section):** `height: 380px`, `flex: 1 1 auto`, `flex-shrink: 0`
- **`.map-screen-map-sticky`:** `height: 380px`, `position: relative`
- **`.map-screen-map-inner`:** `position: absolute`, `inset: 0`, `height: 380px`
- **`.map-screen-leaflet` / `.leaflet-container`:** `height: 380px !important`, `min-height: 380px !important`

Teoride section ve içi 380px almalı. Ama:

- **Parent:** `.selected-movie-container--map` → `display: flex`, `flex-direction: column`, `min-height: 100vh`. İçinde tek flex child `.map-screen` (flex: 1, min-height: 0). Bu min-height: 0, flex child’ın içeriğe göre küçülebileceği anlamına gelir; içerik (sidebar + 380px section) toplamı 100vh’dan küçükse layout doğru çalışır. Büyükse scroll çıkar. Bu zincir tek başına section’ı 0 yapmaz, ama **ilk hesaplamada** bir yerde height 0 veya çok küçük kalıyorsa ResizeObserver ilk birkaç frame’de `clientHeight < 250` görebilir; o sırada 900ms de cleanup ile iptal edilirse harita hiç açılmaz.

---

## 4. Özet: Olası kök nedenler (758px altı, harita ekranı)

| # | Neden | Açıklama |
|---|--------|----------|
| 1 | **canMountMap hiç true olmuyor** | Mobilde ref’ler null veya `el.clientHeight` sürekli &lt; 250; aynı anda effect cleanup 900ms (ve gerekirse 600ms) timeout’unu iptal ediyor. Sonuç: MapContainer hiç render edilmiyor, sadece “Harita yükleniyor…” görünüyor. |
| 2 | **İlk frame’de height 0** | Flex/layout gecikmesiyle section veya wrapper ilk an 0 height alıyor; ResizeObserver bir süre hep 0 (veya &lt; 250) görüyor. 900ms fallback yine de haritayı açmalı; fallback iptal ediliyorsa yine (1) ile birleşir. |
| 3 | **Harita mount oluyor, ekran siyah** | Tile’lar yükleniyor ama görünmüyor: `.leaflet-container::after` veya başka bir katman tile’ların üstünde; veya genel mobil `.leaflet-container` kuralları harita ekranında yanlış boyut/overflow uyguluyor. |
| 4 | **Genel .leaflet-container mobil kuralı** | `@media (max-width: 768px)` içindeki `.leaflet-container { height: 55vh; ... }` kuralı, harita ekranındaki container’a da (spesifikite veya sıra nedeniyle) uygulanıp 380px’i eziyor olabilir; buna bağlı overflow/visibility sorunu. |

---

## 5. Ne yapılabilir (doğrulama, henüz kod değişikliği yok)

- **Tarayıcıda 758px (veya 768px altı) ile:**
  - “Harita yükleniyor…” yazısı **sürekli** kalıyorsa → sorun büyük ihtimalle **canMountMap** (1–2).
  - Bir süre sonra siyah kutu geliyorsa / tile istekleri gidiyorsa → sorun büyük ihtimalle **görünürlük** (3–4).
- **Console’da:** `document.querySelector('.map-screen-leaflet')` ve `document.querySelector('.map-screen-map')` ile element var mı, `clientHeight` / `offsetHeight` değerleri ne, kontrol edilebilir.
- **React state:** `canMountMap` ve `isMobileView` değerlerini (geçici log veya React DevTools ile) 758px’te izleyerek haritanın mount edilip edilmediği netleştirilebilir.

Bu analiz, “758 pixelden aşağıya doğru harita görüntülenmiyor” davranışının olası sebeplerini topluyor; bir sonraki adımda hangi senaryonun geçerli olduğu bu kontrollerle netleştirilebilir.
