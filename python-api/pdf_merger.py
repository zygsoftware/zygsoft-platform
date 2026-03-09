"""
PDF Birleştirme Modülü
Birden fazla PDF dosyasını tek bir PDF dosyasında birleştirir.
"""

import os
import sys
from typing import List, Optional, Callable
from PyPDF2 import PdfMerger, PdfReader
import traceback


class PDFMerger:
    """PDF dosyalarını birleştiren sınıf"""
    
    def __init__(self, progress_callback: Optional[Callable] = None, log_callback: Optional[Callable] = None):
        """
        Args:
            progress_callback: İlerleme bildirimi için callback fonksiyonu
                              Parametre: (current, total, filename, status)
            log_callback: Log mesajları için callback
                         Parametre: (message)
        """
        self.progress_callback = progress_callback
        self.log_callback = log_callback
    
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
    
    def merge_pdfs(
        self, 
        pdf_files: List[str], 
        output_path: str,
        add_bookmarks: bool = True
    ):
        """
        Birden fazla PDF dosyasını birleştirir.
        
        Args:
            pdf_files: Birleştirilecek PDF dosyalarının yolları
            output_path: Çıkış PDF dosyasının yolu
            add_bookmarks: Her dosya için bookmark ekle
            
        Raises:
            Exception: Birleştirme başarısız olursa
        """
        if not pdf_files:
            raise ValueError("En az bir PDF dosyası belirtilmelidir.")
        
        # Dosyaları kontrol et
        valid_files = []
        for pdf_path in pdf_files:
            if not os.path.exists(pdf_path):
                print(f"Uyarı: Dosya bulunamadı, atlanıyor: {pdf_path}")
                continue
            
            if not pdf_path.lower().endswith('.pdf'):
                print(f"Uyarı: PDF dosyası değil, atlanıyor: {pdf_path}")
                continue
            
            valid_files.append(pdf_path)
        
        if not valid_files:
            raise ValueError("Geçerli PDF dosyası bulunamadı.")
        
        total = len(valid_files)
        self._log(f"\n{total} adet PDF dosyası birleştiriliyor...")
        
        merger = None
        try:
            merger = PdfMerger()
            successful_merges = 0
            
            for idx, pdf_path in enumerate(valid_files, 1):
                filename = os.path.basename(pdf_path)
                
                try:
                    self._report_progress(idx, total, filename, "Ekleniyor")
                    
                    # Dosya boyutu kontrolü
                    if not os.path.exists(pdf_path):
                        raise ValueError(f"Dosya bulunamadı")
                    
                    file_size = os.path.getsize(pdf_path)
                    if file_size == 0:
                        raise ValueError("Dosya boş")
                    
                    self._log(f"  [{idx}/{total}] Ekleniyor: {filename} ({file_size:,} bytes)")
                    
                    # PDF'i ekle
                    try:
                        if add_bookmarks:
                            bookmark_name = os.path.splitext(filename)[0]
                            # PyPDF2 3.0+ için outline_item kullan
                            merger.append(pdf_path, outline_item=bookmark_name)
                        else:
                            merger.append(pdf_path)
                        
                        successful_merges += 1
                        self._report_progress(idx, total, filename, "✔ Eklendi")
                        self._log(f"  ✓ {filename} başarıyla eklendi!")
                        
                    except Exception as append_err:
                        # PyPDF2 hatası
                        error_detail = str(append_err)
                        self._log(f"  ✗ PyPDF2 hatası: {error_detail}")
                        raise ValueError(f"PDF eklenemedi: {error_detail}")
                    
                except Exception as e:
                    error_detail = str(e)
                    self._report_progress(idx, total, filename, f"✘ Hata")
                    self._log(f"  ✗ {filename} ATLANADI: {error_detail}")
                    continue
            
            if successful_merges == 0:
                raise ValueError("Hiçbir PDF başarıyla eklenemedi. Tüm PDF'ler bozuk veya geçersiz olabilir.")
            
            # Birleştirilmiş PDF'i kaydet
            self._log(f"\nKaydediliyor: {output_path}")
            
            # Çıkış klasörünün var olduğundan emin ol
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir, exist_ok=True)
                self._log(f"Çıkış klasörü oluşturuldu: {output_dir}")
            
            # PDF'i kaydet
            try:
                merger.write(output_path)
                self._log(f"✅ PDF yazıldı: {output_path}")
            except Exception as write_err:
                self._log(f"❌ PDF yazma hatası: {write_err}")
                raise ValueError(f"PDF yazılamadı: {write_err}")
            finally:
                # Merger'ı kapat
                try:
                    merger.close()
                    self._log("Merger kapatıldı")
                except Exception as close_err:
                    self._log(f"Uyarı: {close_err}")
            
            # Doğrula
            if not os.path.exists(output_path):
                raise ValueError(f"PDF oluşturulamadı: {output_path}")
            
            file_size = os.path.getsize(output_path)
            if file_size == 0:
                raise ValueError("PDF boş (0 byte)")
            
            self._log(f"\n✅ BAŞARILI! {successful_merges}/{total} PDF birleştirildi")
            self._log(f"📊 Boyut: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB)")
            
        except Exception as e:
            error_msg = str(e)
            print(f"\n✘ Birleştirme hatası: {error_msg}")
            traceback.print_exc()
            
            # Merger'ı kapat (hata durumunda)
            if merger:
                try:
                    merger.close()
                except:
                    pass
            
            # Hata durumunda bozuk dosyayı sil
            if output_path and os.path.exists(output_path):
                try:
                    file_size = os.path.getsize(output_path)
                    if file_size == 0:
                        os.remove(output_path)
                        print(f"Boş PDF dosyası silindi: {output_path}")
                except Exception as del_err:
                    print(f"Dosya silme hatası: {del_err}")
            
            # Exception'ı yukarı fırlat
            raise
    
    def merge_pdfs_from_directory(
        self,
        input_dir: str,
        output_path: str,
        recursive: bool = False,
        add_bookmarks: bool = True,
        sort_alphabetically: bool = True
    ):
        """
        Bir klasördeki tüm PDF dosyalarını birleştirir.
        
        Args:
            input_dir: Giriş klasörü
            output_path: Çıkış PDF dosyasının yolu
            recursive: Alt klasörleri de dahil et
            add_bookmarks: Her dosya için bookmark ekle
            sort_alphabetically: Dosyaları alfabetik sırala
            
        Raises:
            Exception: Birleştirme başarısız olursa
        """
        if not os.path.exists(input_dir):
            raise FileNotFoundError(f"Klasör bulunamadı: {input_dir}")
        
        # PDF dosyalarını bul
        pdf_files = self._find_pdf_files(input_dir, recursive)
        
        if not pdf_files:
            raise ValueError(f"Klasörde PDF dosyası bulunamadı: {input_dir}")
        
        # Sırala
        if sort_alphabetically:
            pdf_files = sorted(pdf_files)
        
        print(f"{len(pdf_files)} adet PDF dosyası bulundu.")
        
        # Birleştir (exception fırlatabilir)
        self.merge_pdfs(pdf_files, output_path, add_bookmarks)
    
    def _find_pdf_files(self, directory: str, recursive: bool = False) -> List[str]:
        """
        Klasördeki PDF dosyalarını bul.
        
        Args:
            directory: Aranacak klasör
            recursive: Alt klasörleri de ara
            
        Returns:
            Bulunan PDF dosyalarının yolları
        """
        pdf_files = []
        
        if recursive:
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file.lower().endswith('.pdf'):
                        pdf_files.append(os.path.join(root, file))
        else:
            try:
                for item in os.listdir(directory):
                    item_path = os.path.join(directory, item)
                    if os.path.isfile(item_path) and item.lower().endswith('.pdf'):
                        pdf_files.append(item_path)
            except PermissionError:
                print(f"Uyarı: {directory} klasörüne erişim izni yok.")
        
        return pdf_files
    
    def get_pdf_info(self, pdf_path: str) -> dict:
        """
        PDF dosyası hakkında bilgi al.
        
        Args:
            pdf_path: PDF dosyasının yolu
            
        Returns:
            PDF bilgileri (sayfa sayısı, boyut, vb.)
        """
        try:
            reader = PdfReader(pdf_path)
            info = {
                'path': pdf_path,
                'filename': os.path.basename(pdf_path),
                'pages': len(reader.pages),
                'size_bytes': os.path.getsize(pdf_path),
                'size_mb': round(os.path.getsize(pdf_path) / (1024 * 1024), 2)
            }
            
            # Metadata varsa ekle
            if reader.metadata:
                info['title'] = reader.metadata.get('/Title', '')
                info['author'] = reader.metadata.get('/Author', '')
                info['creator'] = reader.metadata.get('/Creator', '')
            
            return info
        except Exception as e:
            return {
                'path': pdf_path,
                'filename': os.path.basename(pdf_path),
                'error': str(e)
            }
    
    def split_pdf(
        self,
        pdf_path: str,
        output_dir: str,
        pages_per_file: int = 1,
        prefix: str = "page"
    ) -> List[str]:
        """
        PDF dosyasını parçalara ayır.
        
        Args:
            pdf_path: Bölünecek PDF dosyası
            output_dir: Çıkış klasörü
            pages_per_file: Her dosyada kaç sayfa olacak
            prefix: Çıkış dosyası öneki
            
        Returns:
            Oluşturulan dosyaların yolları
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF bulunamadı: {pdf_path}")
        
        os.makedirs(output_dir, exist_ok=True)
        
        reader = PdfReader(pdf_path)
        total_pages = len(reader.pages)
        output_files = []
        
        print(f"\n{total_pages} sayfalık PDF bölünüyor...\n")
        
        page_num = 0
        file_num = 1
        
        while page_num < total_pages:
            merger = PdfMerger()
            
            # Belirtilen sayıda sayfayı ekle
            end_page = min(page_num + pages_per_file, total_pages)
            
            for i in range(page_num, end_page):
                merger.append(pdf_path, pages=(i, i + 1))
            
            # Dosyayı kaydet
            output_file = os.path.join(
                output_dir, 
                f"{prefix}_{file_num:03d}.pdf"
            )
            merger.write(output_file)
            merger.close()
            
            output_files.append(output_file)
            print(f"Oluşturuldu: {output_file} (sayfa {page_num + 1}-{end_page})")
            
            page_num = end_page
            file_num += 1
        
        print(f"\n✔ Başarılı! {len(output_files)} dosya oluşturuldu.\n")
        return output_files


def main():
    """Komut satırı arayüzü"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='UDF Toolkit - PDF Birleştirme Aracı',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Örnekler:
  # Belirli PDF dosyalarını birleştir
  python pdf_merger.py merge file1.pdf file2.pdf file3.pdf -o merged.pdf
  
  # Klasördeki tüm PDF'leri birleştir
  python pdf_merger.py merge-dir input_folder -o merged.pdf
  
  # Alt klasörler dahil (recursive)
  python pdf_merger.py merge-dir input_folder -o merged.pdf -r
  
  # PDF'i böl (her sayfayı ayrı dosya)
  python pdf_merger.py split input.pdf -o output_folder
  
  # PDF'i böl (her 5 sayfada bir dosya)
  python pdf_merger.py split input.pdf -o output_folder -p 5
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Komutlar')
    
    # Birleştirme komutu (dosya listesi)
    merge_parser = subparsers.add_parser('merge', help='PDF dosyalarını birleştir')
    merge_parser.add_argument(
        'files',
        nargs='+',
        help='Birleştirilecek PDF dosyaları'
    )
    merge_parser.add_argument(
        '-o', '--output',
        required=True,
        help='Çıkış PDF dosyası'
    )
    merge_parser.add_argument(
        '--no-bookmarks',
        action='store_true',
        help='Bookmark ekleme'
    )
    
    # Birleştirme komutu (klasör)
    merge_dir_parser = subparsers.add_parser('merge-dir', help='Klasördeki PDF\'leri birleştir')
    merge_dir_parser.add_argument(
        'input_dir',
        help='Giriş klasörü'
    )
    merge_dir_parser.add_argument(
        '-o', '--output',
        required=True,
        help='Çıkış PDF dosyası'
    )
    merge_dir_parser.add_argument(
        '-r', '--recursive',
        action='store_true',
        help='Alt klasörleri de dahil et'
    )
    merge_dir_parser.add_argument(
        '--no-bookmarks',
        action='store_true',
        help='Bookmark ekleme'
    )
    merge_dir_parser.add_argument(
        '--no-sort',
        action='store_true',
        help='Alfabetik sıralama yapma'
    )
    
    # Bölme komutu
    split_parser = subparsers.add_parser('split', help='PDF\'i böl')
    split_parser.add_argument(
        'input_file',
        help='Bölünecek PDF dosyası'
    )
    split_parser.add_argument(
        '-o', '--output',
        required=True,
        help='Çıkış klasörü'
    )
    split_parser.add_argument(
        '-p', '--pages',
        type=int,
        default=1,
        help='Her dosyada kaç sayfa olacak (varsayılan: 1)'
    )
    split_parser.add_argument(
        '--prefix',
        default='page',
        help='Çıkış dosyası öneki (varsayılan: page)'
    )
    
    # Bilgi komutu
    info_parser = subparsers.add_parser('info', help='PDF bilgisini göster')
    info_parser.add_argument(
        'file',
        help='PDF dosyası'
    )
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # PDF birleştirici oluştur
    merger = PDFMerger()
    
    try:
        if args.command == 'merge':
            # Dosya listesinden birleştir
            success = merger.merge_pdfs(
                args.files,
                args.output,
                add_bookmarks=not args.no_bookmarks
            )
            sys.exit(0 if success else 1)
            
        elif args.command == 'merge-dir':
            # Klasörden birleştir
            success = merger.merge_pdfs_from_directory(
                args.input_dir,
                args.output,
                recursive=args.recursive,
                add_bookmarks=not args.no_bookmarks,
                sort_alphabetically=not args.no_sort
            )
            sys.exit(0 if success else 1)
            
        elif args.command == 'split':
            # PDF'i böl
            output_files = merger.split_pdf(
                args.input_file,
                args.output,
                pages_per_file=args.pages,
                prefix=args.prefix
            )
            sys.exit(0)
            
        elif args.command == 'info':
            # PDF bilgisi göster
            info = merger.get_pdf_info(args.file)
            
            print("\n" + "="*50)
            print("PDF BİLGİSİ")
            print("="*50)
            
            if 'error' in info:
                print(f"Hata: {info['error']}")
            else:
                print(f"Dosya: {info['filename']}")
                print(f"Yol: {info['path']}")
                print(f"Sayfa Sayısı: {info['pages']}")
                print(f"Boyut: {info['size_mb']} MB ({info['size_bytes']:,} bytes)")
                
                if 'title' in info and info['title']:
                    print(f"Başlık: {info['title']}")
                if 'author' in info and info['author']:
                    print(f"Yazar: {info['author']}")
                if 'creator' in info and info['creator']:
                    print(f"Oluşturan: {info['creator']}")
            
            print("="*50 + "\n")
            sys.exit(0)
            
    except Exception as e:
        print(f"\nFATAL HATA: {e}")
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()

