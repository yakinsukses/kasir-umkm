const OFFLINE_DB_NAME = "kasir-umkm-offline";
const OFFLINE_DB_VERSION = 1;

function offlineStore(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      ["products", "settings", "transactions", "transaction_items", "queue"].forEach((name) => {
        if (!database.objectStoreNames.contains(name)) database.createObjectStore(name, { keyPath: "id" });
      });
    };
    request.onsuccess = () => resolve(request.result.transaction(storeName, "readwrite").objectStore(storeName));
    request.onerror = () => reject(request.error);
  });
}

async function offlinePut(storeName, value) {
  const store = await offlineStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.put(value);
    request.onsuccess = () => resolve(value);
    request.onerror = () => reject(request.error);
  });
}

async function offlineGetAll(storeName) {
  const store = await offlineStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function offlineClear(storeName) {
  const store = await offlineStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
}

async function queueOfflineAction(action) {
  await offlinePut("queue", { id: crypto.randomUUID(), ...action });
}

function parseRupiah(value) {
  return Number(String(value ?? "").replace(/[^0-9]/g, "")) || 0;
}

function formatInputRupiah(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

window.addEventListener("online", () => window.dispatchEvent(new CustomEvent("kasir-online")));
window.addEventListener("offline", () => window.dispatchEvent(new CustomEvent("kasir-offline")));

async function syncOfflineQueue() {
  if (!navigator.onLine) return;
  const queue = await offlineGetAll("queue");
  for (const action of queue) {
    try {
      if (action.type === "transaction") {
        const { data: trx, error } = await db.from("transactions").insert(action.transaction).select().single();
        if (error) throw error;
        await db.from("transaction_items").insert(action.items.map((item) => ({ ...item, transaction_id: trx.id })));
      }
      if (action.type === "product") {
        const request = action.product.id
          ? db.from("products").update(action.product).eq("id", action.product.id)
          : db.from("products").insert(action.product);
        const { error } = await request;
        if (error) throw error;
      }
      await offlinePut("queue", { ...action, synced: true });
    } catch (error) {
      console.warn("[v0] Offline sync tertunda:", error.message);
      break;
    }
  }
  const synced = (await offlineGetAll("queue")).filter((item) => item.synced);
  for (const item of synced) {
    const store = await offlineStore("queue");
    store.delete(item.id);
  }
}

window.addEventListener("kasir-online", syncOfflineQueue);
setTimeout(syncOfflineQueue, 500);
window.offlinePut = offlinePut;
window.offlineGetAll = offlineGetAll;
window.queueOfflineAction = queueOfflineAction;
window.parseRupiah = parseRupiah;
window.formatInputRupiah = formatInputRupiah;
window.syncOfflineQueue = syncOfflineQueue;

function formatRupiah(angka) {
  return "Rp " + Number(angka || 0).toLocaleString("id-ID");
}
window.formatRupiah = formatRupiah;

function showConnectionStatus() {
  const existing = document.getElementById("connectionStatus");
  if (existing) existing.remove();
  if (navigator.onLine) return;
  const badge = document.createElement("div");
  badge.id = "connectionStatus";
  badge.textContent = "Mode offline — perubahan akan disinkronkan saat internet kembali";
  badge.className = "fixed bottom-3 left-3 right-3 z-50 rounded-lg bg-amber-100 px-3 py-2 text-center text-sm text-amber-900 shadow";
  document.body.appendChild(badge);
}
window.addEventListener("offline", showConnectionStatus);
window.addEventListener("online", () => document.getElementById("connectionStatus")?.remove());
showConnectionStatus();

function normalizeEmail(value) {
  const email = value.trim();
  return email.includes("@") ? email : `${email}@gmail.com`;
}
window.normalizeEmail = normalizeEmail;

function uploadImage(file, folder) {
  const path = `${folder}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  return db.storage.from("kasir-images").upload(path, file, { upsert: false }).then(({ data, error }) => {
    if (error) throw error;
    return db.storage.from("kasir-images").getPublicUrl(data.path).data.publicUrl;
  });
}
window.uploadImage = uploadImage;

function registerServiceWorker() {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
}
registerServiceWorker();

function cacheData(store, rows) {
  return Promise.all(rows.map((row) => offlinePut(store, row)));
}
window.cacheData = cacheData;
