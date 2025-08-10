import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertCustomerSchema, updateOrderSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import cloudinary from "./cloudinary";

// Configure multer for file uploads (in memory for Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Get all orders with optional filters
  app.get("/api/orders", async (req, res) => {
    try {
      const { status, paymentMethod, search, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (status && status !== 'all') filters.status = status;
      if (paymentMethod && paymentMethod !== 'all') filters.paymentMethod = paymentMethod;
      if (search) filters.search = search;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const orders = await storage.getAllOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Create new order
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Update order
  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      res.json(order);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Upload product image to Cloudinary
  app.post("/api/orders/:id/image", upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'robleka-pedidos',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto:good' }
            ]
          },
          (error: any, result: any) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      const imageUrl = (result as any).secure_url;
      const order = await storage.updateOrder(req.params.id, { productImage: imageUrl });
      res.json({ imageUrl, order });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Delete order
  app.delete("/api/orders/:id", async (req, res) => {
    try {
      await storage.deleteOrder(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Get all customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Create customer
  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error('Error creating customer:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Get monthly revenue data
  app.get("/api/dashboard/revenue", async (req, res) => {
    try {
      const revenue = await storage.getMonthlyRevenue();
      res.json(revenue);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      res.status(500).json({ message: "Failed to fetch revenue data" });
    }
  });

  // Get order status distribution
  app.get("/api/dashboard/status-distribution", async (req, res) => {
    try {
      const distribution = await storage.getOrderStatusDistribution();
      res.json(distribution);
    } catch (error) {
      console.error('Error fetching status distribution:', error);
      res.status(500).json({ message: "Failed to fetch status distribution" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
