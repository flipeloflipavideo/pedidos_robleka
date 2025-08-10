import { 
  customers, 
  orders, 
  type Customer, 
  type InsertCustomer, 
  type Order, 
  type InsertOrder,
  type OrderWithCustomer,
  type User,
  type InsertUser,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, gte, lte, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer methods
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  getAllCustomers(): Promise<Customer[]>;
  
  // Order methods
  getOrder(id: string): Promise<OrderWithCustomer | undefined>;
  getAllOrders(filters?: {
    status?: string;
    paymentMethod?: string;
    customerId?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<OrderWithCustomer[]>;
  createOrder(order: InsertOrder): Promise<OrderWithCustomer>;
  updateOrder(id: string, order: Partial<Order>): Promise<OrderWithCustomer>;
  deleteOrder(id: string): Promise<void>;
  
  // Analytics methods
  getOrderStats(): Promise<{
    activeOrders: number;
    completedOrders: number;
    monthlyRevenue: number;
    activeCustomers: number;
  }>;
  getMonthlyRevenue(): Promise<{ month: string; revenue: number }[]>;
  getOrderStatusDistribution(): Promise<{ status: string; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods (legacy)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, phone));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values(customer)
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  // Order methods
  async getOrder(id: string): Promise<OrderWithCustomer | undefined> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, id));
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].orders,
      customer: result[0].customers!,
    };
  }

  async getAllOrders(filters?: {
    status?: string;
    paymentMethod?: string;
    customerId?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<OrderWithCustomer[]> {
    let query = db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id));

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(orders.status, filters.status as any));
    }

    if (filters?.paymentMethod) {
      conditions.push(eq(orders.paymentMethod, filters.paymentMethod as any));
    }

    if (filters?.customerId) {
      conditions.push(eq(orders.customerId, filters.customerId));
    }

    if (filters?.search) {
      conditions.push(
        sql`(${customers.name} ILIKE ${'%' + filters.search + '%'} OR ${orders.product} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    if (filters?.startDate) {
      conditions.push(gte(orders.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(orders.createdAt, filters.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(orders.createdAt));

    return result.map(row => ({
      ...row.orders,
      customer: row.customers!,
    }));
  }

  async createOrder(orderData: InsertOrder): Promise<OrderWithCustomer> {
    // First, find or create customer
    let customer = await this.getCustomerByPhone(orderData.customerPhone);
    
    if (!customer) {
      customer = await this.createCustomer({
        name: orderData.customerName,
        phone: orderData.customerPhone,
        email: orderData.customerEmail || undefined,
      });
    }

    // Create the order
    const { customerName, customerPhone, customerEmail, ...orderFields } = orderData;
    
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...orderFields,
        customerId: customer.id,
        updatedAt: new Date(),
      })
      .returning();

    return {
      ...newOrder,
      customer,
    };
  }

  async updateOrder(id: string, orderData: Partial<Order>): Promise<OrderWithCustomer> {
    // Clean orderData to remove undefined values and handle dates properly
    const cleanData: any = {};
    Object.entries(orderData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'deliveryDate' && value && typeof value === 'string') {
          cleanData[key] = new Date(value);
        } else {
          cleanData[key] = value;
        }
      }
    });

    const [updatedOrder] = await db
      .update(orders)
      .set({
        ...cleanData,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    const customer = await this.getCustomer(updatedOrder.customerId);
    
    return {
      ...updatedOrder,
      customer: customer!,
    };
  }

  async deleteOrder(id: string): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async getOrderStats(): Promise<{
    activeOrders: number;
    completedOrders: number;
    monthlyRevenue: number;
    activeCustomers: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Active orders (pending + in_progress)
    const [activeOrdersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`${orders.status} IN ('pending', 'in_progress')`);

    // Completed orders
    const [completedOrdersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, 'completed'));

    // Monthly revenue
    const [monthlyRevenueResult] = await db
      .select({ 
        revenue: sql<number>`COALESCE(SUM(CAST(${orders.paidAmount} AS DECIMAL)), 0)` 
      })
      .from(orders)
      .where(gte(orders.createdAt, startOfMonth));

    // Active customers (customers with orders in last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const [activeCustomersResult] = await db
      .select({ count: sql<number>`count(DISTINCT ${orders.customerId})` })
      .from(orders)
      .where(gte(orders.createdAt, threeMonthsAgo));

    return {
      activeOrders: Number(activeOrdersResult.count),
      completedOrders: Number(completedOrdersResult.count),
      monthlyRevenue: Number(monthlyRevenueResult.revenue),
      activeCustomers: Number(activeCustomersResult.count),
    };
  }

  async getMonthlyRevenue(): Promise<{ month: string; revenue: number }[]> {
    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        revenue: sql<number>`COALESCE(SUM(CAST(${orders.paidAmount} AS DECIMAL)), 0)`,
      })
      .from(orders)
      .where(gte(orders.createdAt, sql`NOW() - INTERVAL '6 months'`))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);

    return result.map(row => ({
      month: row.month,
      revenue: Number(row.revenue),
    }));
  }

  async getOrderStatusDistribution(): Promise<{ status: string; count: number }[]> {
    const result = await db
      .select({
        status: orders.status,
        count: sql<number>`count(*)`,
      })
      .from(orders)
      .groupBy(orders.status);

    return result.map(row => ({
      status: row.status,
      count: Number(row.count),
    }));
  }
}

export const storage = new DatabaseStorage();
