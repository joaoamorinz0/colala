"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { FormField, LoadingSpinner } from "@/components/admin";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { uploadImage } from "@/services/admin.service";
import type { Place } from "@/types/place";
import type { Category } from "@/types/category";
import { getAllCategories } from "@/services/admin.service";
import { Loader2, MapPin, Upload, X } from "lucide-react";
import { placeSchema } from "@/lib/validators/admin";

type ExtractedData = {
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  phone: string;
  website: string;
  opening_hours: Record<string, string[]> | null;
};

interface PlaceFormProps {
  initialData?: Place;
  onSubmit: (data: Omit<Place, "id" | "created_at">) => Promise<void>;
  isLoading?: boolean;
}

export function PlaceForm({
  initialData,
  onSubmit,
  isLoading,
}: PlaceFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    city: initialData?.city || "",
    price_level: initialData?.price_level?.toString() || "",
    instagram: initialData?.instagram || "",
    category_id: initialData?.category_id?.toString() || "",
  });

  const [extraData, setExtraData] = useState({
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    website: initialData?.website || "",
    latitude: initialData?.latitude?.toString() || "",
    longitude: initialData?.longitude?.toString() || "",
    opening_hours: initialData?.opening_hours || "",
    neighborhood: initialData?.neighborhood || "",
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingCoverImage, setExistingCoverImage] = useState<string | null>(
    initialData?.cover_image || null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Google Maps import state
  const [mapsUrl, setMapsUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showExtraFields, setShowExtraFields] = useState(
    !!initialData?.address ||
      !!initialData?.phone ||
      !!initialData?.website ||
      !!initialData?.latitude,
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error("Supabase não configurado");
        const data = await getAllCategories(client);
        setCategories(data);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
      }
    };

    loadCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExtraChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setExtraData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImportFromMaps = async () => {
    if (!mapsUrl.trim()) {
      setImportError("Cole um link do Google Maps primeiro.");
      return;
    }

    setImporting(true);
    setImportError(null);

    try {
      const resp = await fetch("/api/admin/extract-place-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: mapsUrl.trim() }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Erro ao extrair dados do Google Maps.");
      }

      const extracted = data as ExtractedData;

      setFormData((prev) => ({
        ...prev,
        name: extracted.name || prev.name,
        city: extracted.city || prev.city,
      }));

      setExtraData((prev) => ({
        ...prev,
        address: extracted.address || prev.address,
        phone: extracted.phone || prev.phone,
        website: extracted.website || prev.website,
        latitude: extracted.lat ? extracted.lat.toString() : prev.latitude,
        longitude: extracted.lng ? extracted.lng.toString() : prev.longitude,
        opening_hours: extracted.opening_hours
          ? JSON.stringify(extracted.opening_hours)
          : prev.opening_hours,
      }));

      setShowExtraFields(true);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Erro ao importar do Google Maps.",
      );
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const parsed = placeSchema.safeParse({
        ...formData,
        ...extraData,
        cover_image: existingCoverImage,
      });

      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || "Dados inválidos");
      }

      let coverImageUrl = existingCoverImage;

      if (coverImage) {
        setUploadingImage(true);
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error("Supabase não configurado");
        coverImageUrl = await uploadImage(client, coverImage);
      }

      let parsedOpeningHours: string | null = extraData.opening_hours;
      if (extraData.opening_hours) {
        try {
          const parsed = JSON.parse(extraData.opening_hours);
          parsedOpeningHours = JSON.stringify(parsed);
        } catch {
          parsedOpeningHours = extraData.opening_hours;
        }
      }

      const submitData: Omit<Place, "id" | "created_at"> = {
        name: formData.name,
        description: formData.description || null,
        city: formData.city || null,
        neighborhood: extraData.neighborhood || null,
        address: extraData.address || null,
        price_level: formData.price_level
          ? parseInt(formData.price_level)
          : null,
        instagram: formData.instagram || null,
        phone: extraData.phone || null,
        website: extraData.website || null,
        cover_image: coverImageUrl || null,
        gallery: null,
        category_id: formData.category_id || null,
        rating: null,
        latitude: extraData.latitude ? parseFloat(extraData.latitude) : null,
        longitude: extraData.longitude ? parseFloat(extraData.longitude) : null,
        opening_hours: parsedOpeningHours,
        featured: null,
        work_friendly: null,
        pet_friendly: null,
        wifi: null,
        sunset: null,
        status: initialData?.status ?? "published",
      };

      await onSubmit(submitData);
      toast.show("Local salvo com sucesso.", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar formulário";
      setError(message);
      toast.show(message, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Google Maps Import */}
      <div className="border-primary/20 bg-primary/5 mb-8 rounded-lg border-2 border-dashed p-6">
        <h3 className="text-primary mb-2 flex items-center gap-2 text-base font-semibold">
          <MapPin className="size-5" />
          Importar do Google Maps
        </h3>
        <p className="text-foreground/70 mb-4 text-sm">
          Cole o link do Google Maps para preencher automaticamente os dados do
          local.
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={mapsUrl}
            onChange={(e) => {
              setMapsUrl(e.target.value);
              setImportError(null);
            }}
            placeholder="https://maps.app.goo.gl/... ou google.com/maps/place/..."
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex-1 rounded-lg border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
          <button
            type="button"
            onClick={handleImportFromMaps}
            disabled={importing}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Importando...
              </>
            ) : (
              "Extrair Dados"
            )}
          </button>
        </div>
        {importError && (
          <p className="mt-2 text-sm text-red-600">{importError}</p>
        )}
        {importing && (
          <div className="text-primary mt-3 flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Buscando dados do local...
          </div>
        )}
      </div>

      <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
        {/* Image Upload */}
        <div className="mb-6">
          <label className="text-foreground block text-sm font-medium">
            Imagem de Capa
          </label>
          {(imagePreview || existingCoverImage) && (
            <div className="relative mt-2 mb-4 inline-block">
              <img
                src={imagePreview || existingCoverImage || ""}
                alt="Preview"
                className="h-40 w-40 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setCoverImage(null);
                  setImagePreview(null);
                  setExistingCoverImage(null);
                }}
                className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 rounded-full p-1 transition-colors hover:opacity-90"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <label className="border-muted-foreground/25 hover:border-primary hover:bg-primary/5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors">
            <Upload size={20} className="text-muted-foreground" />
            <div>
              <p className="text-foreground text-sm font-medium">
                {coverImage ? coverImage.name : "Clique para fazer upload"}
              </p>
              <p className="text-muted-foreground text-xs">PNG, JPG até 5MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
        </div>

        {/* Name */}
        <FormField
          label="Nome do Local *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Digite o nome do local"
        />

        {/* Description */}
        <div className="mb-4">
          <label className="text-foreground block text-sm font-medium">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Digite a descrição do local"
            rows={4}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>

        {/* City */}
        <FormField
          label="Cidade"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Digite a cidade"
        />

        {/* Category */}
        <div className="mb-4">
          <label className="text-foreground block text-sm font-medium">
            Categoria
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="border-input bg-background text-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Level */}
        <FormField
          label="Nível de Preço (1-4)"
          name="price_level"
          type="number"
          min="1"
          max="4"
          value={formData.price_level}
          onChange={handleChange}
          placeholder="1"
        />

        {/* Instagram */}
        <FormField
          label="Instagram"
          name="instagram"
          value={formData.instagram}
          onChange={handleChange}
          placeholder="@usuario_instagram"
        />

        {/* Toggle extra fields */}
        <button
          type="button"
          onClick={() => setShowExtraFields(!showExtraFields)}
          className="text-primary hover:text-primary/80 mt-4 mb-2 text-sm font-medium"
        >
          {showExtraFields
            ? "Ocultar campos extras"
            : "Mostrar campos extras (endereço, telefone, site, etc.)"}
        </button>

        {showExtraFields && (
          <div className="border-border mt-4 space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Endereço"
                name="address"
                value={extraData.address}
                onChange={handleExtraChange}
                placeholder="Endereço completo"
              />
              <FormField
                label="Bairro"
                name="neighborhood"
                value={extraData.neighborhood}
                onChange={handleExtraChange}
                placeholder="Bairro"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Telefone"
                name="phone"
                value={extraData.phone}
                onChange={handleExtraChange}
                placeholder="(XX) XXXXX-XXXX"
              />
              <FormField
                label="Website"
                name="website"
                value={extraData.website}
                onChange={handleExtraChange}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                label="Latitude"
                name="latitude"
                type="number"
                step="any"
                value={extraData.latitude}
                onChange={handleExtraChange}
                placeholder="-23.5505"
              />
              <FormField
                label="Longitude"
                name="longitude"
                type="number"
                step="any"
                value={extraData.longitude}
                onChange={handleExtraChange}
                placeholder="-46.6333"
              />
            </div>

            <div className="mb-4">
              <label className="text-foreground block text-sm font-medium">
                Horários de Funcionamento (JSON)
              </label>
              <textarea
                name="opening_hours"
                value={extraData.opening_hours}
                onChange={handleExtraChange}
                placeholder='{"weekdays": ["Seg: 08:00–18:00", "Ter: 08:00–18:00"]}'
                rows={3}
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 font-mono text-sm focus-visible:ring-2 focus-visible:outline-none"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={isLoading || uploadingImage}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading || uploadingImage ? (
              <>
                <LoadingSpinner />
                Processando...
              </>
            ) : (
              "Salvar Local"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
