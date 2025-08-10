import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  orderId: string;
  currentImage?: string;
  onSuccess?: () => void;
}

export default function ImageUpload({ orderId, currentImage, onSuccess }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`/api/orders/${orderId}/image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders', orderId] });
      toast({
        title: "Imagen subida",
        description: "La imagen del producto terminado se ha guardado correctamente.",
      });
      setSelectedFile(null);
      setPreview(data.imageUrl);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la imagen.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Archivo muy grande",
          description: "La imagen debe ser menor a 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos de imagen.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(currentImage || null);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Imagen del Producto Terminado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {preview && (
          <div className="relative">
            <img 
              src={preview} 
              alt="Vista previa" 
              className="w-full h-48 object-cover rounded-lg border"
            />
            {selectedFile && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        <div>
          <Label htmlFor="imageFile">Seleccionar imagen</Label>
          <Input
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploadMutation.isPending}
          />
          <p className="text-sm text-slate-500 mt-1">
            Formatos: JPG, PNG, GIF. Máximo 5MB.
          </p>
        </div>
        
        {selectedFile && (
          <div className="flex gap-2">
            <Button 
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="flex-1"
            >
              {uploadMutation.isPending ? (
                "Subiendo..."
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Guardar Imagen
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearSelection}
              disabled={uploadMutation.isPending}
            >
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}