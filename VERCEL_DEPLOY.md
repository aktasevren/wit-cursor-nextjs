# Vercel Deployment Rehberi

Bu proje Vercel'e deploy edilmeye hazırdır. Aşağıdaki adımları takip edin:

## 1. Vercel'e Proje Yükleme

### Yöntem 1: Vercel CLI ile
```bash
npm i -g vercel
cd where-is-this-nextjs
vercel
```

### Yöntem 2: GitHub ile (Önerilen)
1. Projeyi GitHub'a push edin
2. Vercel dashboard'a gidin (vercel.com)
3. "New Project" butonuna tıklayın
4. GitHub repo'nuzu seçin
5. Vercel otomatik olarak Next.js projesini algılayacaktır

## 2. Environment Variables Ayarlama

Vercel dashboard'da projenizin **Settings > Environment Variables** bölümüne gidin ve şu değişkenleri ekleyin:

### Zorunlu Environment Variables:

```
MONGODB_URI=mongodb+srv://admin:admin@where-is-this-be.ner2p.mongodb.net/?retryWrites=true&w=majority&appName=where-is-this-be
```

```
TMDB_API_KEY=ed3d6526412667469a4e1a08a88488ef
```

### Opsiyonel (Geocoding için - Client-side'da kullanıldığı için NEXT_PUBLIC_ prefix'i gerekli):

```
NEXT_PUBLIC_GEOAPIFY_API_KEY=a97d941d259f4b42912a28ac3d623d46
```

**Not:** `NEXT_PUBLIC_` prefix'i olmadan client-side'da erişilemez!

**Not:** Environment variables'ları hem **Production**, hem **Preview**, hem de **Development** için ekleyin.

## 3. Build Ayarları

Vercel otomatik olarak Next.js projelerini algılar, ancak manuel ayar yapmak isterseniz:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (otomatik algılanır)
- **Output Directory:** `.next` (otomatik algılanır)
- **Install Command:** `npm install` (otomatik algılanır)

## 4. MongoDB Atlas Ayarları

MongoDB Atlas'da IP whitelist ayarlarını kontrol edin:

1. MongoDB Atlas dashboard'a gidin
2. **Network Access** bölümüne gidin
3. Vercel'in IP adreslerine izin verin veya `0.0.0.0/0` ekleyin (tüm IP'lere izin verir)

**Güvenlik Notu:** Production'da sadece Vercel IP'lerine izin vermek daha güvenlidir.

## 5. Deploy Sonrası Kontrol

Deploy tamamlandıktan sonra:

1. ✅ Ana sayfa yükleniyor mu? (`/`)
2. ✅ API route'lar çalışıyor mu? (`/api/popular-movies`)
3. ✅ Film arama çalışıyor mu?
4. ✅ MongoDB bağlantısı çalışıyor mu? (Film detay sayfasında lokasyonlar görünüyor mu?)

## 6. Troubleshooting

### MongoDB Bağlantı Hatası
- Environment variable'ın doğru eklendiğinden emin olun
- MongoDB Atlas'da IP whitelist kontrolü yapın
- MongoDB connection string'in doğru olduğundan emin olun

### API Key Hatası
- TMDB_API_KEY'in doğru eklendiğinden emin olun
- API key'in geçerli olduğundan emin olun

### Build Hatası
- `npm run build` komutunu local'de çalıştırıp hataları kontrol edin
- Vercel build loglarını kontrol edin

## 7. Custom Domain (Opsiyonel)

Vercel dashboard'da **Settings > Domains** bölümünden custom domain ekleyebilirsiniz.

## Önemli Notlar

- ⚠️ **Güvenlik:** API key'leri ve MongoDB URI'yi asla kod içine hardcode etmeyin
- ✅ Vercel otomatik olarak HTTPS sağlar
- ✅ Serverless functions otomatik olarak scale edilir
- ✅ MongoDB connection pooling Vercel'de otomatik olarak çalışır

## Hızlı Deploy Komutu

```bash
# Vercel CLI ile hızlı deploy
vercel --prod
```

