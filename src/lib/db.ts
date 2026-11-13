import fs from 'fs/promises';
import path from 'path';
import {
  Store,
  Product,
  Order,
  Reservation,
  OrderStatus,
  ReservationStatus,
} from './types';

export interface DatabaseSchema {
  stores: Store[];
  products: Product[];
  orders: Order[];
  reservations: Reservation[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

// Pristine pre-release initial state: zero false stores or mock products.
// Stores and catalogs are created authentically by users & sellers.
const INITIAL_DATA: DatabaseSchema = {
  stores: [],
  products: [],
  orders: [],
  reservations: [],
};

export class DatabaseManager {
  private static instance: DatabaseManager;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private async ensureDataDir(): Promise<void> {
    const dir = path.dirname(DB_PATH);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async readDb(): Promise<DatabaseSchema | null> {
    try {
      await this.ensureDataDir();
      const raw = await fs.readFile(DB_PATH, 'utf-8');
      return JSON.parse(raw) as DatabaseSchema;
    } catch {
      return null;
    }
  }

  async ensureInitialized(): Promise<DatabaseSchema> {
    const data = await this.readDb();
    if (data && typeof data === 'object') {
      const sanitized: DatabaseSchema = {
        stores: Array.isArray(data.stores) ? data.stores : [],
        products: Array.isArray(data.products) ? data.products : [],
        orders: Array.isArray(data.orders) ? data.orders : [],
        reservations: Array.isArray(data.reservations) ? data.reservations : [],
      };
      if (!Array.isArray(data.stores) || !Array.isArray(data.products) || !Array.isArray(data.orders) || !Array.isArray(data.reservations)) {
        await this.writeDb(sanitized);
      }
      return sanitized;
    }

    await this.writeDb(INITIAL_DATA);
    return INITIAL_DATA;
  }

  async writeDb(data: DatabaseSchema): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Stores
  async getAllStores(): Promise<Store[]> {
    const db = await this.ensureInitialized();
    const stores = Array.isArray(db?.stores) ? db.stores : [];
    return stores.filter((s) => s && !s.isSuspended);
  }

  async getStoreBySlug(slug: string): Promise<Store | null> {
    const db = await this.ensureInitialized();
    const stores = Array.isArray(db?.stores) ? db.stores : [];
    return stores.find((s) => s && s.slug?.toLowerCase() === slug.toLowerCase() && !s.isSuspended) || null;
  }

  async getStoreByNumber(num: number): Promise<Store | null> {
    const db = await this.ensureInitialized();
    const stores = Array.isArray(db?.stores) ? db.stores : [];
    return stores.find((s) => s && s.storeNumber === num && !s.isSuspended) || null;
  }

  async getStoreById(id: string): Promise<Store | null> {
    const db = await this.ensureInitialized();
    const stores = Array.isArray(db?.stores) ? db.stores : [];
    return stores.find((s) => s && s.id === id) || null;
  }

  async createStore(
    storeData: Omit<Store, 'id' | 'storeNumber' | 'createdAt' | 'isVerified' | 'isSuspended'>
  ): Promise<Store> {
    const db = await this.ensureInitialized();
    const stores = Array.isArray(db?.stores) ? db.stores : [];
    const nextStoreNumber = stores.length > 0 ? Math.max(...stores.map((s) => s.storeNumber || 0)) + 1 : 1;
    const newStore: Store = {
      ...storeData,
      id: 'store-' + Date.now(),
      storeNumber: nextStoreNumber,
      isVerified: false,
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };
    stores.push(newStore);
    db.stores = stores;
    await this.writeDb(db);
    return newStore;
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store | null> {
    const db = await this.ensureInitialized();
    const stores = Array.isArray(db?.stores) ? db.stores : [];
    const index = stores.findIndex((s) => s && s.id === id);
    if (index === -1) return null;

    stores[index] = { ...stores[index], ...updates };
    db.stores = stores;
    await this.writeDb(db);
    return stores[index];
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    const db = await this.ensureInitialized();
    const products = Array.isArray(db?.products) ? db.products : [];
    return products.filter((p) => p && !p.isArchived);
  }

  async getProductsByStoreId(storeId: string): Promise<Product[]> {
    const db = await this.ensureInitialized();
    const products = Array.isArray(db?.products) ? db.products : [];
    return products.filter((p) => p && p.storeId === storeId && !p.isArchived);
  }

  async getProductById(id: string): Promise<Product | null> {
    const db = await this.ensureInitialized();
    const products = Array.isArray(db?.products) ? db.products : [];
    return products.find((p) => p && p.id === id && !p.isArchived) || null;
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'isArchived'>): Promise<Product> {
    const db = await this.ensureInitialized();
    const products = Array.isArray(db?.products) ? db.products : [];
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    db.products = products;
    await this.writeDb(db);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const db = await this.ensureInitialized();
    const products = Array.isArray(db?.products) ? db.products : [];
    const index = products.findIndex((p) => p && p.id === id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updates };
    db.products = products;
    await this.writeDb(db);
    return products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const db = await this.ensureInitialized();
    const products = Array.isArray(db?.products) ? db.products : [];
    const index = products.findIndex((p) => p && p.id === id);
    if (index === -1) return false;

    products[index].isArchived = true;
    db.products = products;
    await this.writeDb(db);
    return true;
  }

  // Orders
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'orderNumber' | 'status'>): Promise<Order> {
    const db = await this.ensureInitialized();
    const orders = Array.isArray(db?.orders) ? db.orders : [];
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...orderData,
      id: 'order-' + Date.now(),
      orderNumber,
      status: 'AWAITING_SELLER_CONFIRMATION',
      createdAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    db.orders = orders;
    await this.writeDb(db);
    return newOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    const db = await this.ensureInitialized();
    return Array.isArray(db?.orders) ? db.orders : [];
  }

  async getOrdersByStoreId(storeId: string): Promise<Order[]> {
    const db = await this.ensureInitialized();
    const orders = Array.isArray(db?.orders) ? db.orders : [];
    return orders.filter((o) => o && o.storeId === storeId);
  }

  async getOrderById(id: string): Promise<Order | null> {
    const db = await this.ensureInitialized();
    const orders = Array.isArray(db?.orders) ? db.orders : [];
    return orders.find((o) => o && (o.id === id || o.orderNumber === id)) || null;
  }

  async updateOrderStatus(id: string, status: OrderStatus, sellerNote?: string): Promise<Order | null> {
    const db = await this.ensureInitialized();
    const orders = Array.isArray(db?.orders) ? db.orders : [];
    const index = orders.findIndex((o) => o && o.id === id);
    if (index === -1) return null;

    orders[index].status = status;
    if (sellerNote) orders[index].sellerNote = sellerNote;
    db.orders = orders;
    await this.writeDb(db);
    return orders[index];
  }

  // Table Reservations
  async createReservation(
    resData: Omit<Reservation, 'id' | 'createdAt' | 'status'>
  ): Promise<Reservation> {
    const db = await this.ensureInitialized();
    const reservations = Array.isArray(db?.reservations) ? db.reservations : [];
    const newRes: Reservation = {
      ...resData,
      id: 'res-' + Date.now(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    reservations.unshift(newRes);
    db.reservations = reservations;
    await this.writeDb(db);
    return newRes;
  }

  async getReservationsByStoreId(storeId: string): Promise<Reservation[]> {
    const db = await this.ensureInitialized();
    const reservations = Array.isArray(db?.reservations) ? db.reservations : [];
    return reservations.filter((r) => r && r.storeId === storeId);
  }

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation | null> {
    const db = await this.ensureInitialized();
    const reservations = Array.isArray(db?.reservations) ? db.reservations : [];
    const index = reservations.findIndex((r) => r && r.id === id);
    if (index === -1) return null;

    reservations[index].status = status;
    db.reservations = reservations;
    await this.writeDb(db);
    return reservations[index];
  }
}

export const db = DatabaseManager.getInstance();
