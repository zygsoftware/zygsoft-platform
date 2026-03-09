# UDF Toolkit
 UYAP UDF dosya formatı ile ilgili çalışmalar

[![Star History Chart](https://api.star-history.com/svg?repos=saidsurucu/udf-toolkit&type=Date)](https://www.star-history.com/#saidsurucu/udf-toolkit&Date)

## 🎉 Yeni Özellikler

### ✨ Toplu Dönüştürme
Bir klasördeki tüm dosyaları toplu olarak dönüştürün!
- 📦 Klasördeki tüm DOCX dosyalarını UDF'e çevir
- 📑 Klasördeki tüm UDF dosyalarını PDF'e çevir
- 📝 Klasördeki tüm UDF dosyalarını DOCX'e çevir
- 🔥 **YENİ:** Klasördeki tüm dosyaları (DOCX + UDF) PDF'ye çevir
- 📚 **YENİ:** Klasördeki tüm dosyaları PDF'ye çevirip tek PDF'de birleştir
- 🔄 Alt klasörleri de dahil edebilme (recursive)
- ✅ Detaylı ilerleme takibi ve hata raporlama

### 🔗 PDF Birleştirme
Birden fazla PDF dosyasını tek bir dosyada birleştirin!
- 📚 Manuel dosya seçimi ile birleştirme
- 📁 Klasördeki tüm PDF'leri otomatik birleştirme
- 🔖 Otomatik yer imi (bookmark) ekleme
- ↕️ Dosya sıralamasını değiştirme
- 🔀 Alt klasörlerdeki PDF'leri de dahil edebilme

## Tekli Dönüştürme İşlemleri

### UDF dosyasını DOCX formatına çevirmek için
```bash
python udf_to_docx.py input.udf
```

### UDF dosyasını PDF formatına çevirmek için
```bash
python udf_to_pdf.py input.udf
```

### DOCX dosyasını UDF formatına çevirmek için
```bash
python docx_to_udf.py input.docx
```
**Not:** En iyi sonucu almak için Windows'ta çalıştırılmalıdır. Bazı DOCX özelliklerini dönüştürmek için Windows kütüphaneleri gereklidir. MacOS ve Linux'ta sonuçlar farklı olabilir.

### PDF dosyasını (imaj olarak) UDF formatına çevirmek için
```bash
python scanned_pdf_to_udf.py input.pdf
```

## Toplu Dönüştürme İşlemleri

### Klasördeki tüm DOCX dosyalarını UDF'e çevirmek için
```bash
# Temel kullanım
python batch_converter.py docx-to-udf input_folder

# Çıkış klasörü belirterek
python batch_converter.py docx-to-udf input_folder -o output_folder

# Alt klasörler dahil (recursive)
python batch_converter.py docx-to-udf input_folder -o output_folder -r

# Özel şablon kullanarak
python batch_converter.py docx-to-udf input_folder -t my_template.xml
```

### Klasördeki tüm UDF dosyalarını PDF'e çevirmek için
```bash
# Temel kullanım
python batch_converter.py udf-to-pdf input_folder

# Çıkış klasörü ve recursive
python batch_converter.py udf-to-pdf input_folder -o output_folder -r
```

### Klasördeki tüm UDF dosyalarını DOCX'e çevirmek için
```bash
python batch_converter.py udf-to-docx input_folder -o output_folder
```

## PDF Birleştirme İşlemleri

### Belirli PDF dosyalarını birleştirmek için
```bash
python pdf_merger.py merge file1.pdf file2.pdf file3.pdf -o merged.pdf
```

### Klasördeki tüm PDF'leri birleştirmek için
```bash
# Temel kullanım
python pdf_merger.py merge-dir input_folder -o merged.pdf

# Alt klasörler dahil
python pdf_merger.py merge-dir input_folder -o merged.pdf -r

# Bookmark olmadan
python pdf_merger.py merge-dir input_folder -o merged.pdf --no-bookmarks

# Alfabetik sıralama olmadan
python pdf_merger.py merge-dir input_folder -o merged.pdf --no-sort
```

### PDF dosyasını bölmek için
```bash
# Her sayfayı ayrı dosya olarak
python pdf_merger.py split input.pdf -o output_folder

# Her 5 sayfada bir dosya
python pdf_merger.py split input.pdf -o output_folder -p 5

# Özel dosya öneki ile
python pdf_merger.py split input.pdf -o output_folder --prefix bolum
```

### PDF bilgilerini görüntülemek için
```bash
python pdf_merger.py info document.pdf
```
# Teknik Bilgiye Sahip Olmayanlar İçin Windows'ta Kullanım Talimatları

Bu scriptlerin düzgün çalışabilmesi için Python'un sisteminizde kurulu olması gerekmektedir. Aşağıdaki adımları takip ederek Python'u yükleyebilirsiniz:

1. [Python'un resmi web sitesine](https://www.python.org/downloads/) gidin.
2. Sisteminizin işletim sistemine uygun Python sürümünü indirin (genellikle en son sürüm önerilir).
3. Kurulum sırasında "Add Python to PATH" seçeneğini işaretleyin.

## Kodu İndirmek
Sağ üstteki yeşil renkli `Code` butonuna tıklayın. `Download ZIP`'e tıklayın. İnen sıkıştırılmış ZIP dosyasını bir klasöre çıkartın.

## 🖥️ Grafik Arayüz (GUI)

En kolay kullanım için grafik arayüzü kullanın:

```bash
python udf_toolkit_gui.py
```

GUI Özellikleri:
- 🎯 **Sürükle & Bırak** desteği
- 📑 **3 Sekme** ile organize edilmiş arayüz:
  - Tekli Dönüştürme (DOCX ↔ UDF ↔ PDF)
  - Toplu Dönüştürme (klasör işlemleri)
  - PDF Birleştirme
- 📊 **İlerleme takibi** ve detaylı loglar
- ⚙️ **Şablon yönetimi** - bir kez seçin, sürekli kullanın
- 💾 Ayarlar otomatik kaydedilir

## Windows Kullanıcıları İçin BAT Dosyaları

### Kurulum
#### `install_reqs.bat`
- **Amaç**: `requirements.txt` dosyasında listelenen gerekli Python paketlerini yükler.
- **Nasıl Kullanılır**: `install_reqs.bat` scriptine çift tıklayın. Bu, `requirements.txt` dosyasında belirtilen tüm gerekli bağımlılıkları yükleyecektir.

### Tekli Dönüştürme

#### `udf_to_docx.bat`
- **Amaç**: UDF dosyasını DOCX formatına dönüştürür.
- **Nasıl Kullanılır**: `.udf` dosyasını `udf_to_docx.bat` scriptinin üzerine sürükleyin. Script çalışacak ve girdi ile aynı dizinde bir `.docx` dosyası oluşturacaktır.

#### `udf_to_pdf.bat`
- **Amaç**: UDF dosyasını PDF formatına dönüştürür.
- **Nasıl Kullanılır**: `.udf` dosyasını `udf_to_pdf.bat` scriptinin üzerine sürükleyin. Script çalışacak ve girdi ile aynı dizinde bir `.pdf` dosyası oluşturacaktır.

#### `docx_to_udf.bat`
- **Amaç**: DOCX dosyasını UDF formatına dönüştürür.
- **Nasıl Kullanılır**: `.docx` dosyasını `docx_to_udf.bat` scriptinin üzerine sürükleyin. Script çalışacak ve girdi ile aynı dizinde bir `.udf` dosyası oluşturacaktır.

#### `scanned_pdf_to_udf.bat`
- **Amaç**: Tarama yapılmış bir PDF dosyasını UDF formatına dönüştürür.
- **Nasıl Kullanılır**: `.pdf` dosyasını `scanned_pdf_to_udf.bat` scriptinin üzerine sürükleyin. Script çalışacak ve girdi ile aynı dizinde bir `.udf` dosyası oluşturacaktır.

### 🆕 Toplu Dönüştürme BAT Dosyaları

#### `batch_docx_to_udf.bat`
- **Amaç**: Bir klasördeki tüm DOCX dosyalarını UDF formatına dönüştürür.
- **Nasıl Kullanılır**: Klasörü `batch_docx_to_udf.bat` scriptinin üzerine sürükleyin. Alt klasörleri dahil etmek isteyip istemediğiniz sorulacaktır.

#### `batch_udf_to_pdf.bat`
- **Amaç**: Bir klasördeki tüm UDF dosyalarını PDF formatına dönüştürür.
- **Nasıl Kullanılır**: Klasörü `batch_udf_to_pdf.bat` scriptinin üzerine sürükleyin. Alt klasörleri dahil etmek isteyip istemediğiniz sorulacaktır.

#### `batch_udf_to_docx.bat`
- **Amaç**: Bir klasördeki tüm UDF dosyalarını DOCX formatına dönüştürür.
- **Nasıl Kullanılır**: Klasörü `batch_udf_to_docx.bat` scriptinin üzerine sürükleyin. Alt klasörleri dahil etmek isteyip istemediğiniz sorulacaktır.

### 🆕 PDF Birleştirme BAT Dosyası

#### `merge_pdfs.bat`
- **Amaç**: Bir klasördeki tüm PDF dosyalarını tek bir PDF'de birleştirir.
- **Nasıl Kullanılır**: Klasörü `merge_pdfs.bat` scriptinin üzerine sürükleyin. Çıkış dosya adı ve alt klasörleri dahil etme seçenekleri sorulacaktır.


## UDF Formatı Dokümantasyonu
[Docs.md](./Docs.md)
