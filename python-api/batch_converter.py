"""
Toplu Dönüştürme Modülü
Bir klasördeki tüm dosyaları toplu olarak dönüştürür.
"""

import os
import sys
from pathlib import Path
from typing import List, Tuple, Callable, Optional
import traceback

class BatchConverter:
    """Toplu dönüştürme işlemlerini yöneten sınıf"""
    
    def __init__(self, progress_callback: Optional[Callable] = None, log_callback: Optional[Callable] = None):
        """
        Args:
            progress_callback: İlerleme bildirimi için callback fonksiyonu
                              Parametre: (current, total, filename, status)
            log_callback: Log mesajları için callback fonksiyonu
                         Parametre: (message)
        """
        self.progress_callback = progress_callback
        self.log_callback = log_callback
        self.results = {
            'success': [],
            'failed': [],
            'skipped': []
        }
    
    def _log(self, message):
        """Log mesajı gönder"""
        if self.log_callback:
            self.log_callback(message)
        else:
            print(message)
    
    def _report_progress(self, current: int, total: int, filename: str, status: str):
        """İlerleme bilgisini raporla"""
        if self.progress_callback:
            self.progress_callback(current, total, filename, status)
        else:
            print(f"[{current}/{total}] {status}: {filename}")
    
    def convert_docx_to_udf_batch(
        self, 
        input_dir: str, 
        output_dir: Optional[str] = None,
        template_xml_path: str = "calisanudfcontent.xml",
        recursive: bool = False
    ) -> dict:
        """
        Bir klasördeki tüm DOCX dosyalarını UDF formatına dönüştürür.
        
        Args:
            input_dir: Giriş klasörü
            output_dir: Çıkış klasörü (None ise aynı klasör)
            template_xml_path: Şablon XML dosyası
            recursive: Alt klasörleri de tara
            
        Returns:
            Sonuç sözlüğü (success, failed, skipped listeleri)
        """
        from main import convert_docx_to_udf
        
        # Klasör kontrolü
        if not os.path.exists(input_dir):
            raise FileNotFoundError(f"Klasör bulunamadı: {input_dir}")
        
        # Çıkış klasörünü oluştur
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # DOCX dosyalarını bul
        docx_files = self._find_files(input_dir, ['.docx'], recursive)
        
        if not docx_files:
            print("DOCX dosyası bulunamadı.")
            return self.results
        
        total = len(docx_files)
        print(f"\n{total} adet DOCX dosyası bulundu. Dönüştürme başlıyor...\n")
        
        # Her dosyayı dönüştür
        for idx, docx_path in enumerate(docx_files, 1):
            filename = os.path.basename(docx_path)
            
            try:
                # Çıkış dosyası yolunu belirle
                if output_dir:
                    # Orijinal klasör yapısını koru
                    rel_path = os.path.relpath(docx_path, input_dir)
                    out_path = os.path.join(output_dir, rel_path)
                    out_dir = os.path.dirname(out_path)
                    os.makedirs(out_dir, exist_ok=True)
                    udf_path = os.path.splitext(out_path)[0] + '.udf'
                else:
                    udf_path = os.path.splitext(docx_path)[0] + '.udf'
                
                self._report_progress(idx, total, filename, "Dönüştürülüyor")
                
                # Dönüştür
                convert_docx_to_udf(docx_path, udf_path, template_xml_path)
                
                self.results['success'].append({
                    'input': docx_path,
                    'output': udf_path
                })
                self._report_progress(idx, total, filename, "✔ Başarılı")
                
            except Exception as e:
                error_msg = str(e)
                self.results['failed'].append({
                    'input': docx_path,
                    'error': error_msg
                })
                self._report_progress(idx, total, filename, f"✘ Hata: {error_msg}")
        
        # Özet
        self._print_summary()
        return self.results
    
    def convert_udf_to_pdf_batch(
        self, 
        input_dir: str, 
        output_dir: Optional[str] = None,
        recursive: bool = False
    ) -> dict:
        """
        Bir klasördeki tüm UDF dosyalarını PDF formatına dönüştürür.
        
        Args:
            input_dir: Giriş klasörü
            output_dir: Çıkış klasörü (None ise aynı klasör)
            recursive: Alt klasörleri de tara
            
        Returns:
            Sonuç sözlüğü (success, failed, skipped listeleri)
        """
        from udf_to_pdf import udf_to_pdf
        
        # Klasör kontrolü
        if not os.path.exists(input_dir):
            raise FileNotFoundError(f"Klasör bulunamadı: {input_dir}")
        
        # Çıkış klasörünü oluştur
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # UDF dosyalarını bul
        udf_files = self._find_files(input_dir, ['.udf'], recursive)
        
        if not udf_files:
            print("UDF dosyası bulunamadı.")
            return self.results
        
        total = len(udf_files)
        print(f"\n{total} adet UDF dosyası bulundu. Dönüştürme başlıyor...\n")
        
        # Her dosyayı dönüştür
        for idx, udf_path in enumerate(udf_files, 1):
            filename = os.path.basename(udf_path)
            
            try:
                # Çıkış dosyası yolunu belirle
                if output_dir:
                    # Orijinal klasör yapısını koru
                    rel_path = os.path.relpath(udf_path, input_dir)
                    out_path = os.path.join(output_dir, rel_path)
                    out_dir = os.path.dirname(out_path)
                    os.makedirs(out_dir, exist_ok=True)
                    pdf_path = os.path.splitext(out_path)[0] + '.pdf'
                else:
                    pdf_path = os.path.splitext(udf_path)[0] + '.pdf'
                
                self._report_progress(idx, total, filename, "Dönüştürülüyor")
                
                # Dönüştür
                udf_to_pdf(udf_path, pdf_path)
                
                self.results['success'].append({
                    'input': udf_path,
                    'output': pdf_path
                })
                self._report_progress(idx, total, filename, "✔ Başarılı")
                
            except Exception as e:
                error_msg = str(e)
                self.results['failed'].append({
                    'input': udf_path,
                    'error': error_msg
                })
                self._report_progress(idx, total, filename, f"✘ Hata: {error_msg}")
        
        # Özet
        self._print_summary()
        return self.results
    
    def convert_udf_to_docx_batch(
        self, 
        input_dir: str, 
        output_dir: Optional[str] = None,
        recursive: bool = False
    ) -> dict:
        """
        Bir klasördeki tüm UDF dosyalarını DOCX formatına dönüştürür.
        
        Args:
            input_dir: Giriş klasörü
            output_dir: Çıkış klasörü (None ise aynı klasör)
            recursive: Alt klasörleri de tara
            
        Returns:
            Sonuç sözlüğü (success, failed, skipped listeleri)
        """
        from udf_to_docx import main as udf_to_docx_main
        
        # Klasör kontrolü
        if not os.path.exists(input_dir):
            raise FileNotFoundError(f"Klasör bulunamadı: {input_dir}")
        
        # Çıkış klasörünü oluştur
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # UDF dosyalarını bul
        udf_files = self._find_files(input_dir, ['.udf'], recursive)
        
        if not udf_files:
            print("UDF dosyası bulunamadı.")
            return self.results
        
        total = len(udf_files)
        print(f"\n{total} adet UDF dosyası bulundu. Dönüştürme başlıyor...\n")
        
        # Her dosyayı dönüştür
        for idx, udf_path in enumerate(udf_files, 1):
            filename = os.path.basename(udf_path)
            
            try:
                # Çıkış dosyası yolunu belirle
                if output_dir:
                    # Orijinal klasör yapısını koru
                    rel_path = os.path.relpath(udf_path, input_dir)
                    out_path = os.path.join(output_dir, rel_path)
                    out_dir = os.path.dirname(out_path)
                    os.makedirs(out_dir, exist_ok=True)
                    docx_path = os.path.splitext(out_path)[0] + '.docx'
                else:
                    docx_path = os.path.splitext(udf_path)[0] + '.docx'
                
                self._report_progress(idx, total, filename, "Dönüştürülüyor")
                
                # Dönüştür
                udf_to_docx_main(udf_path, docx_path)
                
                self.results['success'].append({
                    'input': udf_path,
                    'output': docx_path
                })
                self._report_progress(idx, total, filename, "✔ Başarılı")
                
            except Exception as e:
                error_msg = str(e)
                self.results['failed'].append({
                    'input': udf_path,
                    'error': error_msg
                })
                self._report_progress(idx, total, filename, f"✘ Hata: {error_msg}")
        
        # Özet
        self._print_summary()
        return self.results
    
    def convert_all_to_pdf_batch(
        self,
        input_dir: str,
        output_dir: Optional[str] = None,
        template_xml_path: str = "calisanudfcontent.xml",
        recursive: bool = False
    ) -> dict:
        """
        Bir klasördeki tüm dönüştürülebilir dosyaları (DOCX, UDF, PDF) PDF formatına dönüştürür.
        PDF dosyaları kopyalanır.
        
        Args:
            input_dir: Giriş klasörü
            output_dir: Çıkış klasörü (None ise aynı klasör)
            template_xml_path: Şablon XML dosyası (DOCX dönüşümü için)
            recursive: Alt klasörleri de tara
            
        Returns:
            Sonuç sözlüğü (success, failed, skipped listeleri)
        """
        from main import convert_docx_to_udf
        from udf_to_pdf import udf_to_pdf
        import shutil
        
        # Klasör kontrolü
        if not os.path.exists(input_dir):
            raise FileNotFoundError(f"Klasör bulunamadı: {input_dir}")
        
        # Çıkış klasörünü oluştur
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # Dönüştürülebilir dosyaları bul
        docx_files = self._find_files(input_dir, ['.docx'], recursive)
        udf_files = self._find_files(input_dir, ['.udf'], recursive)
        pdf_files = self._find_files(input_dir, ['.pdf'], recursive)
        
        all_files = docx_files + udf_files + pdf_files
        
        if not all_files:
            print("Dönüştürülebilir dosya bulunamadı (DOCX, UDF veya PDF).")
            return self.results
        
        total = len(all_files)
        print(f"\n{total} adet dosya bulundu (DOCX: {len(docx_files)}, UDF: {len(udf_files)}, PDF: {len(pdf_files)}). PDF dönüşümü başlıyor...\n")
        
        # Her dosyayı PDF'e dönüştür veya kopyala
        for idx, file_path in enumerate(all_files, 1):
            filename = os.path.basename(file_path)
            ext = os.path.splitext(file_path)[1].lower()
            
            try:
                # Çıkış dosyası yolunu belirle
                if output_dir:
                    rel_path = os.path.relpath(file_path, input_dir)
                    out_path = os.path.join(output_dir, rel_path)
                    out_dir = os.path.dirname(out_path)
                    os.makedirs(out_dir, exist_ok=True)
                    pdf_path = os.path.splitext(out_path)[0] + '.pdf'
                else:
                    pdf_path = os.path.splitext(file_path)[0] + '.pdf'
                
                if ext == '.pdf':
                    # PDF dosyası ise direkt kopyala
                    if output_dir:
                        self._report_progress(idx, total, filename, "Kopyalanıyor")
                        shutil.copy2(file_path, pdf_path)
                        self._report_progress(idx, total, filename, "✔ Kopyalandı")
                    else:
                        # Aynı klasörde zaten var, atla
                        self._report_progress(idx, total, filename, "○ Zaten PDF")
                        self.results['skipped'].append({
                            'input': file_path,
                            'reason': 'Zaten PDF formatında'
                        })
                        continue
                        
                elif ext == '.docx':
                    self._report_progress(idx, total, filename, "PDF'ye dönüştürülüyor")
                    # DOCX → UDF → PDF
                    temp_udf = os.path.splitext(file_path)[0] + '_temp.udf'
                    try:
                        convert_docx_to_udf(file_path, temp_udf, template_xml_path)
                        udf_to_pdf(temp_udf, pdf_path)
                        # Geçici UDF dosyasını sil
                        if os.path.exists(temp_udf):
                            os.remove(temp_udf)
                    except Exception as e:
                        if os.path.exists(temp_udf):
                            os.remove(temp_udf)
                        raise e
                    self._report_progress(idx, total, filename, "✔ Başarılı")
                        
                elif ext == '.udf':
                    self._report_progress(idx, total, filename, "PDF'ye dönüştürülüyor")
                    # UDF → PDF
                    udf_to_pdf(file_path, pdf_path)
                    self._report_progress(idx, total, filename, "✔ Başarılı")
                
                self.results['success'].append({
                    'input': file_path,
                    'output': pdf_path
                })
                
            except Exception as e:
                error_msg = str(e)
                self.results['failed'].append({
                    'input': file_path,
                    'error': error_msg
                })
                self._report_progress(idx, total, filename, f"✘ Hata: {error_msg}")
        
        # Özet
        self._print_summary()
        return self.results
    
    def convert_and_merge_to_pdf(
        self,
        input_dir: str,
        output_pdf: str,
        template_xml_path: str = "calisanudfcontent.xml",
        recursive: bool = False,
        add_bookmarks: bool = True
    ) -> dict:
        """
        Bir klasördeki tüm dosyaları (DOCX, UDF, PDF) PDF'ye dönüştürüp tek bir PDF'de birleştirir.
        PDF dosyaları direkt dahil edilir.
        
        Args:
            input_dir: Giriş klasörü
            output_pdf: Çıkış PDF dosyası
            template_xml_path: Şablon XML dosyası (DOCX dönüşümü için)
            recursive: Alt klasörleri de tara
            add_bookmarks: Her dosya için bookmark ekle
            
        Returns:
            Sonuç sözlüğü (success, failed, skipped listeleri)
        """
        from main import convert_docx_to_udf
        from udf_to_pdf import udf_to_pdf
        from pdf_merger import PDFMerger
        import tempfile
        import shutil
        
        # Klasör kontrolü
        if not os.path.exists(input_dir):
            raise FileNotFoundError(f"Klasör bulunamadı: {input_dir}")
        
        # Dönüştürülebilir dosyaları bul
        docx_files = self._find_files(input_dir, ['.docx'], recursive)
        udf_files = self._find_files(input_dir, ['.udf'], recursive)
        pdf_files = self._find_files(input_dir, ['.pdf'], recursive)
        
        all_files = sorted(docx_files + udf_files + pdf_files)  # Alfabetik sıralama
        
        if not all_files:
            print("Dönüştürülebilir dosya bulunamadı (DOCX, UDF veya PDF).")
            return self.results
        
        total = len(all_files)
        print(f"\n{total} adet dosya bulundu (DOCX: {len(docx_files)}, UDF: {len(udf_files)}, PDF: {len(pdf_files)}). PDF'ye dönüştürülüp birleştiriliyor...\n")
        
        # Geçici klasör oluştur
        temp_dir = tempfile.mkdtemp(prefix="udf_pdf_merge_")
        temp_pdf_files = []
        
        try:
            # Her dosyayı geçici PDF'e dönüştür veya kopyala
            for idx, file_path in enumerate(all_files, 1):
                filename = os.path.basename(file_path)
                ext = os.path.splitext(file_path)[1].lower()
                
                try:
                    # Geçici PDF dosyası - Türkçe karakter sorunlarından kaçınmak için basit isim
                    safe_name = f"temp_{idx:03d}.pdf"
                    temp_pdf = os.path.join(temp_dir, safe_name)
                    print(f"\nİşleniyor: {filename}")
                    print(f"Geçici PDF: {temp_pdf}")
                    
                    if ext == '.pdf':
                        # PDF ise direkt kopyala
                        self._report_progress(idx, total, filename, "Kopyalanıyor")
                        shutil.copy2(file_path, temp_pdf)
                        self._report_progress(idx, total, filename, "✔ Kopyalandı")
                        
                    elif ext == '.docx':
                        # DOCX → UDF → PDF
                        self._report_progress(idx, total, filename, "PDF'ye dönüştürülüyor")
                        temp_udf = os.path.join(temp_dir, f"temp_{idx}.udf")
                        try:
                            convert_docx_to_udf(file_path, temp_udf, template_xml_path)
                            udf_to_pdf(temp_udf, temp_pdf)
                            if os.path.exists(temp_udf):
                                os.remove(temp_udf)
                        except Exception as e:
                            if os.path.exists(temp_udf):
                                os.remove(temp_udf)
                            raise e
                        self._report_progress(idx, total, filename, "✔ Dönüştürüldü")
                            
                    elif ext == '.udf':
                        # UDF → PDF
                        self._report_progress(idx, total, filename, "PDF'ye dönüştürülüyor")
                        udf_to_pdf(file_path, temp_pdf)
                        self._report_progress(idx, total, filename, "✔ Dönüştürüldü")
                    
                    # PDF'in geçerli olduğunu kontrol et
                    if not os.path.exists(temp_pdf):
                        raise ValueError(f"PDF oluşturulamadı: {temp_pdf}")
                    
                    file_size = os.path.getsize(temp_pdf)
                    if file_size == 0:
                        raise ValueError("Oluşturulan PDF boş (0 byte)")
                    
                    print(f"PDF oluşturuldu: {file_size:,} bytes")
                    
                    # PDF'in PyPDF2 ile açılabilir olduğunu test et
                    try:
                        from PyPDF2 import PdfReader
                        test_reader = PdfReader(temp_pdf)
                        num_pages = len(test_reader.pages)
                        print(f"PDF doğrulandı: {num_pages} sayfa")
                        if num_pages == 0:
                            raise ValueError("PDF'de sayfa yok")
                    except Exception as e:
                        print(f"UYARI: PDF PyPDF2 ile okunamadı: {e}")
                        print(f"Dosya yine de ekleniyor (bazı PDF'ler farklı formatda olabilir)...")
                        # Yine de eklemeyi dene
                    
                    temp_pdf_files.append(temp_pdf)
                    print(f"✓ Listeye eklendi: {temp_pdf}")
                    
                    self.results['success'].append({
                        'input': file_path,
                        'output': temp_pdf
                    })
                    
                except Exception as e:
                    error_msg = str(e)
                    self.results['failed'].append({
                        'input': file_path,
                        'error': error_msg
                    })
                    self._report_progress(idx, total, filename, f"✘ Hata: {error_msg}")
            
            # PDF'leri birleştir
            self._log(f"\n{'='*60}")
            self._log(f"BİRLEŞTİRME AŞAMASINA GELİNDİ")
            self._log(f"{'='*60}")
            self._log(f"temp_pdf_files listesi boyutu: {len(temp_pdf_files)}")
            
            if temp_pdf_files:
                self._log(f"temp_pdf_files içeriği ({len(temp_pdf_files)} dosya):")
                for i, f in enumerate(temp_pdf_files, 1):
                    self._log(f"  [{i}] {f}")
                
                self._log(f"\n{len(temp_pdf_files)} PDF birleştiriliyor...")
                
                # Çıkış klasörünün var olduğundan emin ol
                output_dir_path = os.path.dirname(output_pdf)
                if output_dir_path and not os.path.exists(output_dir_path):
                    os.makedirs(output_dir_path, exist_ok=True)
                    print(f"Çıkış klasörü oluşturuldu: {output_dir_path}")
                else:
                    print(f"Çıkış klasörü mevcut: {output_dir_path if output_dir_path else '(root)'}")
                
                # Her geçici PDF'i kontrol et
                self._log("\n" + "="*60)
                self._log("GEÇİCİ PDF KONTROL AŞAMASI")
                self._log("="*60)
                self._log(f"Toplam dönüştürülen dosya: {len(temp_pdf_files)}")
                self._log(f"Geçici klasör: {temp_dir}")
                self._log("\nKontrol ediliyor...")
                
                valid_temp_pdfs = []
                for i, temp_pdf in enumerate(temp_pdf_files, 1):
                    file_exists = os.path.exists(temp_pdf)
                    file_size = os.path.getsize(temp_pdf) if file_exists else 0
                    
                    self._log(f"\n[{i}/{len(temp_pdf_files)}] {os.path.basename(temp_pdf)}")
                    self._log(f"  Yol: {temp_pdf}")
                    self._log(f"  Var mı: {file_exists}")
                    self._log(f"  Boyut: {file_size:,} bytes")
                    
                    if file_exists and file_size > 0:
                        valid_temp_pdfs.append(temp_pdf)
                        self._log(f"  Durum: ✓ GEÇERLİ")
                    else:
                        self._log(f"  Durum: ✗ GEÇERSİZ")
                
                self._log("\n" + "="*60)
                self._log(f"SONUÇ: {len(valid_temp_pdfs)}/{len(temp_pdf_files)} geçerli PDF bulundu")
                self._log("="*60 + "\n")
                
                if not valid_temp_pdfs:
                    raise ValueError(f"Geçerli PDF dosyası bulunamadı. Tüm dönüşümler başarısız oldu. Toplam dosya sayısı: {len(temp_pdf_files)}")
                
                self._log(f"\n{len(valid_temp_pdfs)} geçerli PDF birleştiriliyor...")
                
                try:
                    merger = PDFMerger(log_callback=self._log)  # Log callback'i aktar
                    # merge_pdfs artık exception fırlatır
                    merger.merge_pdfs(valid_temp_pdfs, output_pdf, add_bookmarks=add_bookmarks)
                    
                    # Dosyanın gerçekten oluşturulduğunu doğrula
                    if os.path.exists(output_pdf):
                        file_size = os.path.getsize(output_pdf)
                        self._log(f"\n✔ Başarılı! Tüm dosyalar birleştirildi: {output_pdf}")
                        self._log(f"Dosya boyutu: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB)")
                        
                        # Sonuç listesine ekle
                        self.results['merged_pdf'] = output_pdf
                    else:
                        self._log(f"\n✘ HATA: Birleştirme tamamlandı ama dosya bulunamadı: {output_pdf}")
                        raise ValueError(f"Birleştirilmiş PDF dosyası bulunamadı: {output_pdf}")
                        
                except Exception as merge_err:
                    self._log(f"\n✘ Birleştirme sırasında hata: {merge_err}")
                    self._log(f"Traceback: {traceback.format_exc()}")
                    raise
            else:
                self._log("\n✘ Birleştirilecek PDF bulunamadı.")
                raise ValueError("Dönüştürülen hiçbir PDF dosyası yok")
        
        except Exception as merge_error:
            print(f"\n✘ İşlem hatası: {merge_error}")
            traceback.print_exc()
            raise merge_error
        
        finally:
            # Geçici klasörü temizle (ama sadece birleştirme başarılıysa)
            try:
                import shutil
                # Eğer output_pdf başarıyla oluşturulduysa geçici dosyaları sil
                if os.path.exists(output_pdf) and os.path.getsize(output_pdf) > 0:
                    shutil.rmtree(temp_dir)
                    print(f"Geçici dosyalar temizlendi: {temp_dir}")
                else:
                    print(f"UYARI: Geçici dosyalar korunuyor (hata ayıklama için): {temp_dir}")
            except Exception as e:
                print(f"Geçici dosyalar temizlenemedi: {e}")
        
        # Özet
        self._print_summary()
        return self.results
    
    def _find_files(self, directory: str, extensions: List[str], recursive: bool = False) -> List[str]:
        """
        Belirtilen klasörde belirtilen uzantılara sahip dosyaları bul.
        
        Args:
            directory: Aranacak klasör
            extensions: Dosya uzantıları listesi (örn: ['.docx', '.doc'])
            recursive: Alt klasörleri de ara
            
        Returns:
            Bulunan dosyaların yolları listesi
        """
        files = []
        extensions = [ext.lower() for ext in extensions]
        
        if recursive:
            # Alt klasörleri de ara
            for root, dirs, filenames in os.walk(directory):
                for filename in filenames:
                    if any(filename.lower().endswith(ext) for ext in extensions):
                        files.append(os.path.join(root, filename))
        else:
            # Sadece üst klasörü ara
            try:
                for item in os.listdir(directory):
                    item_path = os.path.join(directory, item)
                    if os.path.isfile(item_path):
                        if any(item.lower().endswith(ext) for ext in extensions):
                            files.append(item_path)
            except PermissionError:
                print(f"Uyarı: {directory} klasörüne erişim izni yok.")
        
        return sorted(files)
    
    def _print_summary(self):
        """Dönüştürme özeti yazdır"""
        print("\n" + "="*60)
        print("DÖNÜŞTÜRME ÖZETİ")
        print("="*60)
        print(f"✔ Başarılı: {len(self.results['success'])}")
        print(f"✘ Başarısız: {len(self.results['failed'])}")
        print(f"○ Atlanan: {len(self.results['skipped'])}")
        print("="*60 + "\n")
        
        if self.results['failed']:
            print("HATALAR:")
            for item in self.results['failed']:
                print(f"  • {os.path.basename(item['input'])}: {item['error']}")
            print()


def main():
    """Komut satırı arayüzü"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='UDF Toolkit - Toplu Dönüştürme Aracı',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Örnekler:
  # Klasördeki tüm DOCX dosyalarını UDF'e çevir
  python batch_converter.py docx-to-udf input_folder -o output_folder
  
  # Klasördeki tüm UDF dosyalarını PDF'e çevir
  python batch_converter.py udf-to-pdf input_folder -o output_folder
  
  # Klasördeki TÜM dosyaları (DOCX, UDF, PDF) PDF'ye çevir
  python batch_converter.py all-to-pdf input_folder -o output_folder
  
  # Tüm dosyaları PDF'ye çevirip birleştir
  python batch_converter.py convert-and-merge input_folder -o merged.pdf
  
  # Alt klasörler dahil (recursive)
  python batch_converter.py docx-to-udf input_folder -o output_folder -r
        """
    )
    
    parser.add_argument(
        'operation',
        choices=['docx-to-udf', 'udf-to-pdf', 'udf-to-docx', 'all-to-pdf', 'convert-and-merge'],
        help='Dönüştürme işlemi'
    )
    parser.add_argument(
        'input_dir',
        help='Giriş klasörü'
    )
    parser.add_argument(
        '-o', '--output',
        dest='output_dir',
        help='Çıkış klasörü (belirtilmezse giriş klasörüyle aynı)'
    )
    parser.add_argument(
        '-t', '--template',
        dest='template',
        default='calisanudfcontent.xml',
        help='Şablon XML dosyası (sadece docx-to-udf için)'
    )
    parser.add_argument(
        '-r', '--recursive',
        action='store_true',
        help='Alt klasörleri de tara'
    )
    
    args = parser.parse_args()
    
    # Dönüştürücüyü oluştur
    converter = BatchConverter()
    
    try:
        if args.operation == 'docx-to-udf':
            converter.convert_docx_to_udf_batch(
                args.input_dir,
                args.output_dir,
                args.template,
                args.recursive
            )
        elif args.operation == 'udf-to-pdf':
            converter.convert_udf_to_pdf_batch(
                args.input_dir,
                args.output_dir,
                args.recursive
            )
        elif args.operation == 'udf-to-docx':
            converter.convert_udf_to_docx_batch(
                args.input_dir,
                args.output_dir,
                args.recursive
            )
        elif args.operation == 'all-to-pdf':
            converter.convert_all_to_pdf_batch(
                args.input_dir,
                args.output_dir,
                args.template,
                args.recursive
            )
        elif args.operation == 'convert-and-merge':
            # convert-and-merge için çıkış bir PDF dosyası olmalı
            if not args.output_dir:
                print("HATA: convert-and-merge için çıkış PDF dosyası belirtilmelidir (-o merged.pdf)")
                sys.exit(1)
            converter.convert_and_merge_to_pdf(
                args.input_dir,
                args.output_dir,  # Bu durumda output_dir aslında output_pdf
                args.template,
                args.recursive
            )
    except Exception as e:
        print(f"\nFATAL HATA: {e}")
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

