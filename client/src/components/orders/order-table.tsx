import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Check, Trash2, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { OrderWithCustomer } from "@shared/schema";
import OrderEditDialog from "./order-edit-dialog";

interface OrderTableProps {
  orders: OrderWithCustomer[];
  isLoading: boolean;
  onUpdate: () => void;
}

export default function OrderTable({ orders, isLoading, onUpdate }: OrderTableProps) {
  const [editingOrder, setEditingOrder] = useState<OrderWithCustomer | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrderWithCustomer> }) =>
      api.orders.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Pedido actualizado",
        description: "El pedido se ha actualizado exitosamente.",
      });
      setEditingOrder(null);
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el pedido.",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => api.orders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Pedido eliminado",
        description: "El pedido se ha eliminado exitosamente.",
      });
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el pedido.",
        variant: "destructive",
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      api.orders.uploadImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Imagen subida",
        description: "La imagen del producto se ha subido exitosamente.",
      });
      setUploadingImage(null);
      onUpdate();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la imagen.",
        variant: "destructive",
      });
      setUploadingImage(null);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "in_progress":
        return "En proceso";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "delivery":
        return "Contra entrega";
      case "advance":
        return "Anticipo";
      case "full":
        return "Pago completo";
      default:
        return method;
    }
  };

  const handleCompleteOrder = (order: OrderWithCustomer) => {
    updateOrderMutation.mutate({
      id: order.id,
      data: {
        status: "completed",
        paidAmount: order.price, // Mark as fully paid when completed
      },
    });
  };

  const handleImageUpload = (orderId: string, file: File) => {
    setUploadingImage(orderId);
    uploadImageMutation.mutate({ id: orderId, file });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No se encontraron pedidos
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Pago</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Precio</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Entrega</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-4 px-6 font-mono text-sm">#{order.id.slice(-3)}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-800">{order.customer.name}</p>
                        <p className="text-sm text-slate-600">{order.customer.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-slate-800">{order.product}</p>
                      {order.theme && <p className="text-sm text-slate-600">{order.theme}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <Badge variant="outline" className="mb-1">
                          {getPaymentMethodText(order.paymentMethod)}
                        </Badge>
                        <p className="text-slate-600">
                          €{order.paidAmount} de €{order.price}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800">€{order.price}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString()
                        : "Sin fecha"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingOrder(order);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Editar Pedido</h3>
                              <div className="space-y-3">
                                <div>
                                  <Label>Estado</Label>
                                  <Select
                                    value={editingOrder?.status}
                                    onValueChange={(value) =>
                                      setEditingOrder(prev => prev ? { ...prev, status: value as any } : null)
                                    }
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
                                  <Label>Cantidad Pagada</Label>
                                  <Input
                                    type="number"
                                    value={editingOrder?.paidAmount}
                                    onChange={(e) =>
                                      setEditingOrder(prev => prev ? { ...prev, paidAmount: e.target.value } : null)
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Dirección de Entrega</Label>
                                  <Input
                                    value={editingOrder?.deliveryAddress || ""}
                                    onChange={(e) =>
                                      setEditingOrder(prev => prev ? { ...prev, deliveryAddress: e.target.value } : null)
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Fecha de Entrega</Label>
                                  <Input
                                    type="date"
                                    value={editingOrder?.deliveryDate ? new Date(editingOrder.deliveryDate).toISOString().split('T')[0] : ""}
                                    onChange={(e) =>
                                      setEditingOrder(prev => prev ? { ...prev, deliveryDate: new Date(e.target.value) } : null)
                                    }
                                  />
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingOrder(null)}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() => editingOrder && updateOrderMutation.mutate({
                                    id: editingOrder.id,
                                    data: editingOrder
                                  })}
                                  disabled={updateOrderMutation.isPending}
                                >
                                  Guardar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteOrder(order)}
                          disabled={order.status === "completed"}
                        >
                          <Check className="h-4 w-4" />
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Upload className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Subir Imagen del Producto</h3>
                              <div>
                                <Label>Seleccionar imagen</Label>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(order.id, file);
                                    }
                                  }}
                                  disabled={uploadingImage === order.id}
                                />
                              </div>
                              {order.productImage && (
                                <div>
                                  <Label>Imagen actual</Label>
                                  <img
                                    src={order.productImage}
                                    alt="Product"
                                    className="max-w-xs rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOrderMutation.mutate(order.id)}
                          disabled={deleteOrderMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      
      {/* New Edit Dialog */}
      {editingOrder && (
        <OrderEditDialog
          order={editingOrder}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) setEditingOrder(null);
          }}
        />
      )}
    </Card>
  );
}
