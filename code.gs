/**
 * =========================================================================
 * ARCHITECTURALLY SECURED GOOGLE APPS SCRIPT BACKEND
 * =========================================================================
 * Backend POS KasirKita - Mengatur database dan relasi stok di Google Sheets.
 * Database ini mendesetup dirinya sendiri secara otomatis jika lembar kerja kosong.
 */

const APP_ID = "kasirkita-pos-v1";

// 1. Hook untuk Serving Web App
function doGet(e) {
  const htmlOutput = HtmlService.createHtmlOutputFromFile('index')
    .setTitle('KasirKita Mobile POS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  return htmlOutput;
}

// 2. Mendapatkan seluruh data Master Produk dan Riwayat Transaksi
function getPOSData() {
  autoInitializeSheets();
  return {
    products: fetchProducts(),
    transactions: fetchTransactions()
  };
}

// 3. Mengambil baris data master produk dari Sheets
function fetchProducts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Products");
  const data = sheet.getDataRange().getValues();
  
  const products = [];
  // Skip Header Row (Row 0)
  for (let i = 1; i < data.length; i++) {
    products.push({
      id: String(data[i][0]),
      name: String(data[i][1]),
      category: String(data[i][2]),
      price: Number(data[i][3]),
      cost: Number(data[i][4]),
      stock: Number(data[i][5])
    });
  }
  return products;
}

// 4. Mengambil baris data transaksi dari Sheets
function fetchTransactions() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Transactions");
  const data = sheet.getDataRange().getValues();
  
  const transactions = [];
  // Skip Header Row
  for (let i = 1; i < data.length; i++) {
    // Parse nested items from serialized string
    let parsedItems = [];
    try {
      parsedItems = JSON.parse(data[i][3]);
    } catch(e) {
      parsedItems = [];
    }
    
    transactions.push({
      id: String(data[i][0]),
      timestamp: String(data[i][1]),
      subtotal: Number(data[i][2]),
      items: parsedItems,
      itemsText: String(data[i][4]),
      total: Number(data[i][5]),
      paid: Number(data[i][6]),
      change: Number(data[i][7])
    });
  }
  return transactions;
}

// 5. Menyimpan Transaksi Baru & Mengurangi Stok Otomatis (Atomic Transaction)
function saveTransaction(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const trxSheet = ss.getSheetByName("Transactions");
  const prodSheet = ss.getSheetByName("Products");
  
  // Ambil Lock untuk mencegah penulisan bersamaan yang berakibat desinkronisasi stok (Race Conditions)
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Tunggu maksimal 10 detik jika ada lock aktif
    
    // Simpan Baris Transaksi
    trxSheet.appendRow([
      payload.id,
      payload.timestamp,
      payload.subtotal,
      JSON.stringify(payload.items),
      payload.itemsText,
      payload.total,
      payload.paid,
      payload.change
    ]);
    
    // Sinkronkan Pengurangan Stok Barang
    const prodData = prodSheet.getDataRange().getValues();
    payload.items.forEach(soldItem => {
      for (let i = 1; i < prodData.length; i++) {
        // Mencari ID produk yang cocok
        if (String(prodData[i][0]) === String(soldItem.id)) {
          let currentStock = Number(prodData[i][5]);
          let newStock = Math.max(0, currentStock - soldItem.qty);
          // Update Cell Stok (Kolom F / Indeks 6 di Google Sheets)
          prodSheet.getRange(i + 1, 6).setValue(newStock);
          break;
        }
      }
    });
    
    SpreadsheetApp.flush(); // Eksekusi penulisan sheet seketika
  } finally {
    lock.releaseLock();
  }
  
  return getPOSData();
}

// 6. Menyimpan Produk Baru atau Melakukan Update pada Informasi Produk Lama
function updateProduct(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Products");
  
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = sheet.getDataRange().getValues();
    let foundIndex = -1;
    
    if (payload.id) {
      // Cari baris jika id sudah ditentukan sebelumnya (Edit Mode)
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(payload.id)) {
          foundIndex = i + 1; // Konversi ke baris Google Sheets (1-based)
          break;
        }
      }
    }
    
    if (foundIndex !== -1) {
      // Update produk lama
      sheet.getRange(foundIndex, 2).setValue(payload.name);
      sheet.getRange(foundIndex, 3).setValue(payload.category);
      sheet.getRange(foundIndex, 4).setValue(payload.price);
      sheet.getRange(foundIndex, 5).setValue(payload.cost);
      sheet.getRange(foundIndex, 6).setValue(payload.stock);
    } else {
      // Tambah produk baru dengan Auto-incremental ID
      let maxId = 0;
      for (let i = 1; i < data.length; i++) {
        let currentId = parseInt(data[i][0]) || 0;
        if (currentId > maxId) maxId = currentId;
      }
      const newId = maxId + 1;
      
      sheet.appendRow([
        newId,
        payload.name,
        payload.category,
        payload.price,
        payload.cost,
        payload.stock
      ]);
    }
    
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  
  return getPOSData();
}

// 7. Auto Initialize database jika sheet masih kosong atau baru dibuat
function autoInitializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 7a. Setup Sheet Products
  let prodSheet = ss.getSheetByName("Products");
  if (!prodSheet) {
    prodSheet = ss.insertSheet("Products");
    prodSheet.appendRow(["ID", "Name", "Category", "Price", "Cost", "Stock"]);
    
    // Masukkan data awal (Dummy Products)
    prodSheet.appendRow([1, "Kopi Susu Gula Aren", "Minuman", 18000, 8000, 25]);
    prodSheet.appendRow([2, "Nasi Goreng Spesial", "Makanan", 25000, 12000, 15]);
    prodSheet.appendRow([3, "Roti Bakar Cokelat", "Snack", 15000, 6000, 8]);
    prodSheet.appendRow([4, "Es Teh Manis", "Minuman", 6000, 1500, 50]);
    prodSheet.appendRow([5, "Keripik Singkong Pedas", "Snack", 12000, 5000, 3]);
  }
  
  // 7b. Setup Sheet Transactions
  let trxSheet = ss.getSheetByName("Transactions");
  if (!trxSheet) {
    trxSheet = ss.insertSheet("Transactions");
    trxSheet.appendRow(["Transaction ID", "Timestamp", "Subtotal", "Items JSON", "Items Text", "Total", "Paid Amount", "Change"]);
  }
  
  // Hapus sheet bawaan "Sheet1" jika masih ada agar bersih
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch(e) {}
  }
}
