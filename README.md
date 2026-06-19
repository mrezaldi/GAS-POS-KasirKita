# **📱 POS Mobile KasirKita – Installation Guide**

This POS system leverages a combination of **Google Sheets** (as a free real‑time cloud database) and **Google Apps Script (GAS)** (as the backend API and web hosting server).

The system includes a **Mutex Lock** mechanism to prevent race conditions when multiple cashiers write to the database simultaneously, ensuring stock levels remain accurate.

---

## **🛠️ Implementation Steps**

### **Step 1: Create a New Google Spreadsheet**

1. Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.  
2. Name the file, for example: **"Database POS KasirKita"**.

### **Step 2: Open the Apps Script Editor**

1. In the spreadsheet’s top menu, click **Extensions** → **Apps Script**.  
2. You will be taken to the integrated Google Workspace code editor.

### **Step 3: Paste the Backend Code (Code.gs)**

1. In the left panel of the Apps Script editor, you will see a file named `Code.gs`.  
2. Delete all the default functions in it.  
3. Copy the complete code from the `Code.gs` file (the second file I provided above) and paste it directly into the editor.  
4. Click the black floppy disk icon (or press `Ctrl+S` / `Cmd+S`) to save.

### **Step 4: Paste the Frontend Code (index.html)**

1. In the left panel, click the **"+" (Add a file)** button, then choose **HTML**.  
2. Name the new file **index** (it will automatically become `index.html`).  
3. Open `index.html` and delete all the default template content.  
4. Copy the complete code from the `index.html` file (the first file I provided above) and paste it into the editor.  
5. Save the file.

### **Step 5: Deploy and Run the Web App**

1. In the top‑right corner of the Apps Script editor, click **Deploy** → **New deployment**.  
2. Click the gear icon (Select type) and choose **Web app**.  
3. Fill in the configuration fields as follows:  
   - **Description:** `KasirKita Mobile POS v1`  
   - **Execute as:** `Me (your email)` – **Required** so the app can write data to the spreadsheet under your account.  
   - **Who has access:** `Anyone` – Best choice so your cashiers/employees can open the app from their phones without needing to log in with a Google account.  
4. Click the **Deploy** button.  
5. If an authorisation window appears (`Authorization required`), grant the necessary permissions: click **Advanced** → **Go to Database POS KasirKita (unsafe)** → **Allow**.  
6. Google will provide a **Web App URL** at the end. **Copy that URL!**

---

## **🔗 Connecting to a Smartphone**

- Open the **Web App URL** you copied on your smartphone (using Chrome, Safari, or any other browser).  
- For a native‑app‑like experience, choose the browser option **"Add to Home Screen"**. The POS app will then launch in full‑screen mode without the browser’s address bar.

---

## **🗄️ Automatically Created Sheet Structure**

After you access the app for the first time (or press the **Sync** button), your Google Sheet will automatically create the following tabs:

### **1. Products Tab (Product List & Stock)**

| ID | Name | Category | Price | Cost | Stock |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | Kopi Susu Gula Aren | Minuman | 18000 | 8000 | 25 |
| 2 | Nasi Goreng Spesial | Makanan | 25000 | 12000 | 15 |

### **2. Transactions Tab (Receipt & Sales History)**

| Transaction ID | Timestamp | Subtotal | Items JSON | Items Text | Total | Paid Amount | Change |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| TRX-10294 | 12/03/2026 15:43 | 43000 | `[{"id":"1", "name":"..."}]` | Kopi Susu (1x), Nasi Goreng (1x) | 47730 | 50000 | 2270 |

---

## **🧠 Advantages of the Full‑Stack GAS Architecture**

1. **Instant Mobile Performance:** The client‑side uses a modern, minimal Tailwind CSS framework. It is extremely lightweight, conserves battery power on cashiers’ phones, and renders quickly.  
2. **Concurrent Transaction Security:** The backend uses `LockService` to prevent data conflicts when multiple cashiers press the payment button at the same millisecond.  
3. **Hybrid Local Storage:** If the cashier’s internet connection drops, the POS app can still process transactions using a local temporary simulator storage, keeping operations running smoothly.
