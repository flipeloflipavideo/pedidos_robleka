import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { z } from "zod";
import type { OrderWithCustomer } from "@shared/schema";
import ImageUpload from "./image-upload";

const editSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed"]),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
  paidAmount: z.string(),
});

type EditFormData = z.infer<typeof editSchema>;

interface OrderEditDialogProps {
  order: OrderWithCustomer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OrderEditDialog({ order, open, onOpenChange }: OrderEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      status: order.status,
      deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : "",
      notes: order.notes || "",
      paidAmount: order.paidAmount || "0",
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: (data: any) => api.orders.update(order.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Pedido actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el pedido.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditFormData) => {
    const processedData = {
      ...data,
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString() : null,
    };
    updateOrderMutation.mutate(processedData);
  };

  const remainingAmount = parseFloat(order.price) - parseFloat(form.watch("paidAmount") || "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pedido</DialogTitle>
          <DialogDescription>
            Actualiza el estado del pedido, fecha de entrega y otros detalles
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Order Details */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-800 mb-2">Información del Pedido</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Cliente:</span> {order.customer.name}</p>
                <p><span className="font-medium">Producto:</span> {order.product}</p>
                <p><span className="font-medium">Precio total:</span> €{order.price}</p>
                <p><span className="font-medium">Método de pago:</span> {
                  order.paymentMethod === 'delivery' ? 'Al recibir' :
                  order.paymentMethod === 'advance' ? 'Adelanto' : 'Pago completo'
                }</p>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="status">Estado del pedido</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En proceso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deliveryDate">Fecha de entrega</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  {...form.register("deliveryDate")}
                />
              </div>

              <div>
                <Label htmlFor="paidAmount">Cantidad pagada (€)</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  step="0.01"
                  {...form.register("paidAmount")}
                />
                <p className="text-sm text-slate-500 mt-1">
                  Restante: €{remainingAmount.toFixed(2)}
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Añade cualquier nota sobre el pedido..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                disabled={updateOrderMutation.isPending}
                className="w-full"
              >
                {updateOrderMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </div>

          {/* Right Column - Image Upload */}
          <div>
            {form.watch("status") === "completed" && (
              <ImageUpload 
                orderId={order.id} 
                currentImage={order.productImage}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
                }}
              />
            )}
            
            {form.watch("status") !== "completed" && (
              <div className="bg-slate-50 p-6 rounded-lg text-center">
                <p className="text-slate-600">
                  La subida de imágenes estará disponible cuando el pedido esté completado.
                </p>
              </div>
            )}
            
            {order.productImage && (
              <div className="mt-4">
                <h4 className="font-medium text-slate-800 mb-2">Imagen actual:</h4>
                <img 
                  src={order.productImage} 
                  alt="Producto terminado" 
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}