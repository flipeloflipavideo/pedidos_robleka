import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertOrderSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { z } from "zod";

const formSchema = insertOrderSchema.extend({
  price: z.string().min(1, "Price is required"),
  advanceAmount: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface OrderFormProps {
  onSuccess?: () => void;
}

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const [showAdvanceAmount, setShowAdvanceAmount] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      product: "",
      theme: "",
      description: "",
      price: "",
      paymentMethod: undefined,
      advanceAmount: "0",
      paidAmount: "0",
      deliveryAddress: "",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => api.orders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Pedido creado",
        description: "El pedido se ha creado exitosamente.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el pedido.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const processedData = {
      ...data,
      price: data.price,
      advanceAmount: data.advanceAmount || "0",
      paidAmount: data.paymentMethod === "full" ? data.price : 
                  data.paymentMethod === "advance" ? data.advanceAmount || "0" : "0",
    };

    createOrderMutation.mutate(processedData);
  };

  const handlePaymentMethodChange = (value: string) => {
    form.setValue("paymentMethod", value as any);
    setShowAdvanceAmount(value === "advance");
    
    // Auto-calculate paid amount based on payment method
    const price = form.getValues("price");
    if (value === "full") {
      form.setValue("paidAmount", price);
    } else if (value === "delivery") {
      form.setValue("paidAmount", "0");
    }
  };

  return (
    <div>
      <DialogHeader className="pb-4">
        <DialogTitle className="text-xl font-semibold text-slate-800">Nuevo Pedido</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <div>
          <h4 className="text-lg font-medium text-slate-800 mb-4">Información del Cliente</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Nombre completo *</Label>
              <Input
                id="customerName"
                {...form.register("customerName")}
                placeholder="Ej. María García"
              />
              {form.formState.errors.customerName && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.customerName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="customerPhone">Teléfono *</Label>
              <Input
                id="customerPhone"
                type="tel"
                {...form.register("customerPhone")}
                placeholder="+34 666 123 456"
              />
              {form.formState.errors.customerPhone && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.customerPhone.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                {...form.register("customerEmail")}
                placeholder="maria@email.com"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="deliveryAddress">Dirección de entrega</Label>
              <Textarea
                id="deliveryAddress"
                {...form.register("deliveryAddress")}
                placeholder="Dirección completa (opcional, se puede añadir después)"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div>
          <h4 className="text-lg font-medium text-slate-800 mb-4">Detalles del Producto</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product">Producto *</Label>
              <Input
                id="product"
                {...form.register("product")}
                placeholder="Ej. Agenda personalizada, Libreta, Etiquetas"
              />
              {form.formState.errors.product && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.product.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="theme">Tema/Ocasión</Label>
              <Input
                id="theme"
                {...form.register("theme")}
                placeholder="Ej. Corporativo, Personal, Escolar"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción adicional</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Detalles específicos, diseño, cantidad, colores, etc."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Pricing and Payment */}
        <div>
          <h4 className="text-lg font-medium text-slate-800 mb-4">Precio y Pago</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Precio total *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">€</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register("price")}
                  className="pl-8"
                  placeholder="0.00"
                />
              </div>
              {form.formState.errors.price && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div>
              <Label>Método de pago *</Label>
              <Select onValueChange={handlePaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Contra entrega</SelectItem>
                  <SelectItem value="advance">Anticipo</SelectItem>
                  <SelectItem value="full">Pago completo adelantado</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.paymentMethod && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.paymentMethod.message}</p>
              )}
            </div>
            {showAdvanceAmount && (
              <div>
                <Label htmlFor="advanceAmount">Cantidad del anticipo</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">€</span>
                  <Input
                    id="advanceAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("advanceAmount")}
                    className="pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="deliveryDate">Fecha de entrega</Label>
              <Input
                id="deliveryDate"
                type="date"
                {...form.register("deliveryDate")}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => form.reset()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary-500 hover:bg-primary-600"
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? "Creando..." : "Crear Pedido"}
          </Button>
        </div>
      </form>
    </div>
  );
}
