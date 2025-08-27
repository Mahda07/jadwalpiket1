
    import { 
      initializeApp 
    } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
    
    import {
      getFirestore,
      collection,
      doc,
      getDocs,
      getDoc,
      addDoc,
      deleteDoc,
      updateDoc,
      query,
      orderBy
    } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js'

    const firebaseConfig = {
      apiKey: "AIzaSyCfqZD7UZZt-GWmtNhfJyksrv3-8ENRjto",
      authDomain: "insan-cemerlang-d5574.firebaseapp.com",
      projectId: "insan-cemerlang-d5574",
      storageBucket: "insan-cemerlang-d5574.appspot.com",
      messagingSenderId: "1035937160050",
      appId: "1:1035937160050:web:6d77d3874c3f78b2811beb",
      measurementId: "G-EVVQ80Q08C"
    };

    // Inisialisasi firebase
    const aplikasi = initializeApp(firebaseConfig)
    const basisdata = getFirestore(aplikasi)
    
    // Fungsi untuk menampilkan hari ini
    function tampilkanHariIni() {
      const hari = new Date().getDay();
      const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      document.getElementById('hari-ini').textContent = namaHari[hari];
    }
    
    // Fungsi untuk menambahkan jadwal piket
    export async function tambahPiket(hari, nama, catatan) {
      try {
        const refDokumen = await addDoc(collection(basisdata, "piket"), {
          hari: hari,
          nama: nama,
          catatan: catatan || ""
        })
        console.log("Berhasil menyimpan jadwal piket")
        return true
      } catch (e) {
        console.log("Gagal menyimpan jadwal piket: " + e)
        return false
      }
    }
    
    // Fungsi untuk menghapus jadwal piket
    export async function hapusPiket(id) {
      try {
        await deleteDoc(doc(basisdata, "piket", id))
        console.log("Berhasil menghapus jadwal piket")
        return true
      } catch (e) {
        console.log("Gagal menghapus jadwal piket: " + e)
        return false
      }
    }
    
    // Fungsi untuk mengambil daftar piket
    export async function ambilDaftarPiket() {
      try {
        const refDokumen = collection(basisdata, "piket");
        const kueri = query(refDokumen, orderBy("hari"));
        const cuplikanKueri = await getDocs(kueri);

        let hasilKueri = [];
        cuplikanKueri.forEach((dokumen) => {
          hasilKueri.push({
            id: dokumen.id,
            hari: dokumen.data().hari,
            nama: dokumen.data().nama,
            catatan: dokumen.data().catatan
          })
        })

        return hasilKueri;
      } catch (e) {
        console.log("Gagal mengambil data piket: " + e)
        return []
      }
    }
    
    // Fungsi untuk mengubah jadwal piket
    export async function ubahPiket(id, hari, nama, catatan) {
      try {
        await updateDoc(
          doc(basisdata, "piket", id),
          {
            hari: hari,
            nama: nama,
            catatan: catatan || ""
          })
        console.log("Berhasil mengubah jadwal piket")
        return true
      } catch (e) {
        console.log("Gagal mengubah jadwal piket: " + e)
        return false
      }
    }
    
    // Fungsi untuk mengambil data piket berdasarkan ID
    export async function ambilPiket(id) {
      try {
        const refDokumen = await doc(basisdata, "piket", id)
        const snapshotDocumen = await getDoc(refDokumen)
        return snapshotDocumen.data()
      } catch (e) {
        console.log("Gagal mengambil data piket: " + e)
        return null
      }
    }
    
    // Inisialisasi halaman
    $(document).ready(async function() {
      tampilkanHariIni();
      await renderDaftarPiket();
      
      // Event listener untuk tombol tambah
      $("#btnTambah").click(function() {
        $("#modalPiketLabel").text("Tambah Jadwal Piket");
        $("#formPiket")[0].reset();
        $("#inputId").val("");
        $("#modalPiket").modal('show');
      });
      
      // Event listener untuk tombol simpan di modal
      $("#tombolSimpan").click(async function() {
        const id = $("#inputId").val();
        const hari = $("#inputHari").val();
        const nama = $("#inputNama").val();
        const catatan = $("#inputCatatan").val();
        
        if (!hari || !nama) {
          alert("Hari dan Nama Siswa harus diisi!");
          return;
        }
        
        let success = false;
        
        if (id) {
          // Edit mode
          success = await ubahPiket(id, hari, nama, catatan);
        } else {
          // Add mode
          success = await tambahPiket(hari, nama, catatan);
        }
        
        if (success) {
          $("#modalPiket").modal('hide');
          await renderDaftarPiket();
        } else {
          alert("Terjadi kesalahan saat menyimpan data.");
        }
      });
      
      // Event delegation untuk tombol hapus dan ubah
      $(document).on('click', '.btn-hapus', async function() {
        const id = $(this).data('id');
        if (confirm("Apakah Anda yakin ingin menghapus jadwal piket ini?")) {
          const success = await hapusPiket(id);
          if (success) {
            await renderDaftarPiket();
          }
        }
      });
      
      $(document).on('click', '.btn-ubah', async function() {
        const id = $(this).data('id');
        const piket = await ambilPiket(id);
        
        if (piket) {
          $("#modalPiketLabel").text("Ubah Jadwal Piket");
          $("#inputId").val(id);
          $("#inputHari").val(piket.hari);
          $("#inputNama").val(piket.nama);
          $("#inputCatatan").val(piket.catatan || "");
          $("#modalPiket").modal('show');
        }
      });
    });
    
    // Fungsi untuk merender daftar piket
    async function renderDaftarPiket() {
      const daftarPiket = await ambilDaftarPiket();
      const elemenDaftarPiket = $("#daftar-piket");
      elemenDaftarPiket.empty();
      
      const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
      
      if (daftarPiket.length === 0) {
        elemenDaftarPiket.append(
          '<tr><td colspan="5" class="text-center">Tidak ada jadwal piket</td></tr>'
        );
      } else {
        daftarPiket.forEach((data, index) => {
          const isHariIni = data.hari === hariIni;
          const rowClass = isHariIni ? 'highlight' : '';
          
          elemenDaftarPiket.append(
            `<tr class="${rowClass}">
              <td>${index + 1}</td>
              <td>${data.hari} ${isHariIni ? '⭐' : ''}</td>
              <td>${data.nama}</td>
              <td>${data.catatan || '-'}</td>
              <td>
                <button class="btn-ubah btn-warning btn-sm" data-id="${data.id}">Ubah</button>
                <button class="btn-hapus btn-danger btn-sm" data-id="${data.id}">Hapus</button>
              </td>
            </tr>`
          );
        });
      }
      
      $("#jumlah").text(`Jumlah jadwal piket: ${daftarPiket.length}`);
    }
  