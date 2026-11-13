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
    if (data) return data;

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
    return db.stores.filter((s) => !s.isSuspended);
  }

  async getStoreBySlug(slug: string): Promise<Store | null> {
    const db = await this.ensureInitialized();
    return db.stores.find((s) => s.slug === slug && !s.isSuspended) || null;
  }

  async getStoreByNumber(num: number): Promise<Store | null> {
    const db = await this.ensureInitialized();
    return db.stores.find((s) => s.storeNumber === num && !s.isSuspended) || null;
  }

  async getStoreById(id: string): Promise<Store | null> {
    const db = await this.ensureInitialized();
    return db.stores.find((s) => s.id === id) || null;
  }

  async createStore(
    storeData: Omit<Store, 'id' | 'storeNumber' | 'createdAt' | 'isVerified' | 'isSuspended'>
  ): Promise<Store> {
    const db = await this.ensureInitialized();
    const nextStoreNumber = db.stores.length > 0 ? Math.max(...db.stores.map((s) => s.storeNumber || 0)) + 1 : 1;
    const newStore: Store = {
      ...storeData,
      id: 'store-' + Date.now(),
      storeNumber: nextStoreNumber,
      isVerified: false,
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };
    db.stores.push(newStore);
    await this.writeDb(db);
    return newStore;
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store | null> {
    const db = await this.ensureInitialized();
    const index = db.stores.findIndex((s) => s.id === id);
    if (index === -1) return null;

    db.stores[index] = { ...db.stores[index], ...updates };
    await this.writeDb(db);
    return db.stores[index];
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    const db = await this.ensureInitialized();
    return db.products.filter((p) => !p.isArchived);
  }

  async getProductsByStoreId(storeId: string): Promise<Product[]> {
    const db = await this.ensureInitialized();
    return db.products.filter((p) => p.storeId === storeId && !p.isArchived);
  }

  async getProductById(id: string): Promise<Product | null> {
    const db = await this.ensureInitialized();
    return db.products.find((p) => p.id === id && !p.isArchived) || null;
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'isArchived'>): Promise<Product> {
    const db = await this.ensureInitialized();
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      isArchived: false,
      createdAt: new Date().toISOString(),
    };
    db.products.push(newProduct);
    await this.writeDb(db);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const db = await this.ensureInitialized();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    db.products[index] = { ...db.products[index], ...updates };
    await this.writeDb(db);
    return db.products[index];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const db = await this.ensureInitialized();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    db.products[index].isArchived = true;
    await this.writeDb(db);
    return true;
  }

  // Orders
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'orderNumber' | 'status'>): Promise<Order> {
    const db = await this.ensureInitialized();
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...orderData,
      id: 'order-' + Date.now(),
      orderNumber,
      status: 'AWAITING_SELLER_CONFIRMATION',
      createdAt: new Date().toISOString(),
    };
    db.orders.unshift(newOrder);
    await this.writeDb(db);
    return newOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    const db = await this.ensureInitialized();
    return db.orders;
  }

  async getOrdersByStoreId(storeId: string): Promise<Order[]> {
    const db = await this.ensureInitialized();
    return db.orders.filter((o) => o.storeId === storeId);
  }

  async getOrderById(id: string): Promise<Order | null> {
    const db = await this.ensureInitialized();
    return db.orders.find((o) => o.id === id) || null;
  }

  async updateOrderStatus(id: string, status: OrderStatus, sellerNote?: string): Promise<Order | null> {
    const db = await this.ensureInitialized();
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    db.orders[index].status = status;
    if (sellerNote) db.orders[index].sellerNote = sellerNote;
    await this.writeDb(db);
    return db.orders[index];
  }

  // Table Reservations
  async createReservation(
    resData: Omit<Reservation, 'id' | 'createdAt' | 'status'>
  ): Promise<Reservation> {
    const db = await this.ensureInitialized();
    const newRes: Reservation = {
      ...resData,
      id: 'res-' + Date.now(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    db.reservations.unshift(newRes);
    await this.writeDb(db);
    return newRes;
  }

  async getReservationsByStoreId(storeId: string): Promise<Reservation[]> {
    const db = await this.ensureInitialized();
    return db.reservations.filter((r) => r.storeId === storeId);
  }

  async updateReservationStatus(id: string, status: ReservationStatus): Promise<Reservation | null> {
    const db = await this.ensureInitialized();
    const index = db.reservations.findIndex((r) => r.id === id);
    if (index === -1) return null;

    db.reservations[index].status = status;
    await this.writeDb(db);
    return db.reservations[index];
  }
}

export const db = DatabaseManager.getInstance();
