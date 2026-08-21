"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { FormField, LoadingSpinner } from "@/components/admin";
import { Switch } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import {
  uploadImage,
  getAllCategories,
  getAllPlaces,
} from "@/services/admin.service";
import { eventSchema } from "@/lib/validators/event";
import type { Event } from "@/types/event";
import type { Category } from "@/types/category";
import { Upload, X } from "lucide-react";

const WEEKDAY_OPTIONS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
] as const;

type LocationMode = "place" | "free";

type EventFormState = {
  name: string;
  description: string;
  category_id: string;
  locationMode: LocationMode;
  place_id: string;
  location_name: string;
  address: string;
  city: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_frequency: "weekly" | "biweekly" | "monthly";
  recurrence_day_of_week: string;
  recurrence_day_of_month: string;
  recurrence_end_date: string;
  price: string;
  is_free: boolean;
  organizer_name: string;
  organizer_instagram: string;
  instagram: string;
  website: string;
  phone: string;
  additional_info: string;
  status: "draft" | "published";
};

function toDateInputValue(dateStr: string | null | undefined): string {
  return dateStr ? dateStr.slice(0, 10) : "";
}

function toTimeInputValue(timeStr: string | null | undefined): string {
  return timeStr ? timeStr.slice(0, 5) : "";
}

function buildInitialState(event?: Event | null): EventFormState {
  const hasPlace = Boolean(event?.place_id);

  return {
    name: event?.name ?? "",
    description: event?.description ?? "",
    category_id: event?.category_id ?? "",
    locationMode: hasPlace ? "place" : "free",
    place_id: event?.place_id ?? "",
    location_name: event?.location_name ?? "",
    address: event?.address ?? "",
    city: event?.city ?? "",
    start_date: toDateInputValue(event?.start_date),
    start_time: toTimeInputValue(event?.start_time),
    end_date: toDateInputValue(event?.end_date),
    end_time: toTimeInputValue(event?.end_time),
    is_recurring: event?.is_recurring ?? false,
    recurrence_frequency: event?.recurrence_frequency ?? "weekly",
    recurrence_day_of_week:
      event?.recurrence_day_of_week !== null &&
      event?.recurrence_day_of_week !== undefined
        ? String(event.recurrence_day_of_week)
        : "",
    recurrence_day_of_month:
      event?.recurrence_day_of_month !== null &&
      event?.recurrence_day_of_month !== undefined
        ? String(event.recurrence_day_of_month)
        : "",
    recurrence_end_date: toDateInputValue(event?.recurrence_end_date),
    price: event?.price != null ? String(event.price) : "",
    is_free: event?.is_free ?? false,
    organizer_name: event?.organizer_name ?? "",
    organizer_instagram: event?.organizer_instagram ?? "",
    instagram: event?.instagram ?? "",
    website: event?.website ?? "",
    phone: event?.phone ?? "",
    additional_info: event?.additional_info ?? "",
    status: event?.status ?? "draft",
  };
}

export type EventFormSubmitPayload = {
  name: string;
  description: string | null;
  cover_image: string | null;
  category_id: string;
  place_id: string | null;
  location_name: string | null;
  address: string | null;
  city: string | null;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  is_recurring: boolean;
  recurrence_frequency: "weekly" | "biweekly" | "monthly" | null;
  recurrence_day_of_week: number | null;
  recurrence_day_of_month: number | null;
  recurrence_end_date: string | null;
  price: number | null;
  is_free: boolean;
  organizer_name: string | null;
  organizer_instagram: string | null;
  instagram: string | null;
  website: string | null;
  phone: string | null;
  additional_info: string | null;
  status: "draft" | "published";
};

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: EventFormSubmitPayload) => Promise<void>;
  isLoading?: boolean;
}

export function EventForm({
  initialData,
  onSubmit,
  isLoading,
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormState>(() =>
    buildInitialState(initialData),
  );
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingCoverImage, setExistingCoverImage] = useState<string | null>(
    initialData?.cover_image || null,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<{ id: string; name: string }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const isRecurring = formData.is_recurring;

  useEffect(() => {
    const loadData = async () => {
      try {
        const client = createSupabaseBrowserClient();
        if (!client) throw new Error("Supabase não configurado");

        const [categoryData, placeData] = await Promise.all([
          getAllCategories(client),
          getAllPlaces(client),
        ]);

        setCategories(categoryData);
        setPlaces(
          placeData.map((place) => ({ id: place.id, name: place.name })),
        );
      } catch (err) {
        console.error("Erro ao carregar dados do formulário:", err);
      }
    };

    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearCoverImage = () => {
    setCoverImage(null);
    setImagePreview(null);
    setExistingCoverImage(null);
  };

  const setLocationMode = (mode: LocationMode) => {
    setFormData((prev) => ({
      ...prev,
      locationMode: mode,
      // Limpa o modo oposto — mutuamente exclusivos.
      ...(mode === "place"
        ? { location_name: "", address: "", city: "" }
        : { place_id: "" }),
    }));
  };

  const mainCategories = useMemo(
    () => categories.filter((category) => category.parent_id === null),
    [categories],
  );

  const subcategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.parent_id !== null &&
          category.parent_id === formData.category_id,
      ),
    [categories, formData.category_id],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const parsed = eventSchema.safeParse({
        ...formData,
        place_id: formData.locationMode === "place" ? formData.place_id : "",
        cover_image: existingCoverImage,
        recurrence_frequency: isRecurring
          ? formData.recurrence_frequency
          : null,
        recurrence_day_of_week:
          isRecurring && formData.recurrence_day_of_week
            ? Number(formData.recurrence_day_of_week)
            : null,
        recurrence_day_of_month:
          isRecurring && formData.recurrence_day_of_month
            ? Number(formData.recurrence_day_of_month)
            : null,
        recurrence_end_date: isRecurring ? formData.recurrence_end_date : "",
        price: formData.is_free ? null : formData.price,
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

      const isPlaceMode = formData.locationMode === "place";

      const payload: EventFormSubmitPayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        cover_image: coverImageUrl || null,
        category_id: formData.category_id,
        place_id: isPlaceMode ? formData.place_id : null,
        location_name: isPlaceMode
          ? null
          : formData.location_name.trim() || null,
        address: isPlaceMode ? null : formData.address.trim() || null,
        city: isPlaceMode ? null : formData.city.trim() || null,
        start_date: formData.start_date,
        start_time: formData.start_time || null,
        end_date: formData.end_date || null,
        end_time: formData.end_time || null,
        is_recurring: formData.is_recurring,
        recurrence_frequency: formData.is_recurring
          ? formData.recurrence_frequency
          : null,
        recurrence_day_of_week:
          formData.is_recurring &&
          formData.recurrence_frequency !== "monthly" &&
          formData.recurrence_day_of_week
            ? Number(formData.recurrence_day_of_week)
            : null,
        recurrence_day_of_month:
          formData.is_recurring &&
          formData.recurrence_frequency === "monthly" &&
          formData.recurrence_day_of_month
            ? Number(formData.recurrence_day_of_month)
            : null,
        recurrence_end_date:
          formData.is_recurring && formData.recurrence_end_date
            ? formData.recurrence_end_date
            : null,
        price: formData.is_free ? null : (parsed.data.price ?? null),
        is_free: formData.is_free,
        organizer_name: formData.organizer_name.trim() || null,
        organizer_instagram: formData.organizer_instagram.trim() || null,
        instagram: formData.instagram.trim() || null,
        website: formData.website.trim() || null,
        phone: formData.phone.trim() || null,
        additional_info: formData.additional_info.trim() || null,
        status: formData.status,
      };

      await onSubmit(payload);
      toast.show("Evento salvo com sucesso.", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar formulário";
      setError(message);
      toast.show(message, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const inputClassName =
    "border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring mt-2 w-full rounded-lg border px-4 py-2 focus-visible:ring-2 focus-visible:outline-none";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
        {/* Imagem de capa */}
        <div className="mb-6">
          <label className="text-foreground block text-sm font-medium">
            Imagem de Capa
          </label>
          {(imagePreview || existingCoverImage) && (
            <div className="relative mt-2 mb-4 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview || existingCoverImage || ""}
                alt="Preview da capa"
                className="h-40 w-40 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={clearCoverImage}
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

        <FormField
          label="Nome do Evento *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Digite o nome do evento"
        />

        {/* Descrição */}
        <div className="mb-4">
          <label className="text-foreground block text-sm font-medium">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva o evento"
            rows={4}
            className={inputClassName}
          />
        </div>

        {/* Categoria */}
        <div className="mb-4">
          <label className="text-foreground block text-sm font-medium">
            Categoria *
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className={inputClassName}
          >
            <option value="">Selecione uma categoria</option>
            {mainCategories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {subcategories.length > 0 && (
          <div className="mb-4">
            <label className="text-foreground block text-sm font-medium">
              Subcategoria
            </label>
            <select
              name="subcategory_id"
              value=""
              onChange={(event) => {
                if (event.target.value) {
                  setFormData((prev) => ({
                    ...prev,
                    category_id: event.target.value,
                  }));
                }
              }}
              className={inputClassName}
            >
              <option value="">Manter categoria atual</option>
              {subcategories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-muted-foreground mt-1 text-xs">
              Opcional — refina a categoria do evento.
            </p>
          </div>
        )}

        {/* Local: 2 modos mutuamente exclusivos */}
        <div className="border-border mt-6 mb-4 border-t pt-4">
          <label className="text-foreground block text-sm font-medium">
            Local *
          </label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setLocationMode("place")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                formData.locationMode === "place"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Vincular a estabelecimento
            </button>
            <button
              type="button"
              onClick={() => setLocationMode("free")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                formData.locationMode === "free"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Endereço livre
            </button>
          </div>

          {formData.locationMode === "place" ? (
            <div className="mt-4">
              <select
                name="place_id"
                value={formData.place_id}
                onChange={handleChange}
                className={inputClassName}
              >
                <option value="">Selecione um estabelecimento</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormField
                  label="Nome do local *"
                  name="location_name"
                  value={formData.location_name}
                  onChange={handleChange}
                  placeholder="Ex.: Quadra da 308 Sul"
                />
              </div>
              <FormField
                label="Endereço"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Endereço completo"
              />
              <FormField
                label="Cidade"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Brasília"
              />
            </div>
          )}
        </div>

        {/* Data e horário */}
        <div className="border-border mt-6 mb-4 border-t pt-4">
          <label className="text-foreground block text-sm font-medium">
            Data e horário *
          </label>
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="Data de início *"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
            <FormField
              label="Horário de início"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleChange}
            />
            <FormField
              label="Data de término"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
            />
            <FormField
              label="Horário de término"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Recorrência */}
        <div className="border-border mt-6 mb-4 border-t pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-foreground text-sm font-medium">
                Evento recorrente
              </p>
              <p className="text-muted-foreground text-xs">
                Ex.: toda quinta-feira, quinzenal, mensal.
              </p>
            </div>
            <Switch
              checked={formData.is_recurring}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_recurring: checked }))
              }
            />
          </div>

          {isRecurring && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-foreground block text-sm font-medium">
                  Frequência *
                </label>
                <select
                  name="recurrence_frequency"
                  value={formData.recurrence_frequency}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>

              {formData.recurrence_frequency !== "monthly" ? (
                <div>
                  <label className="text-foreground block text-sm font-medium">
                    Dia da semana *
                  </label>
                  <select
                    name="recurrence_day_of_week"
                    value={formData.recurrence_day_of_week}
                    onChange={handleChange}
                    className={inputClassName}
                  >
                    <option value="">Selecione</option>
                    {WEEKDAY_OPTIONS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <FormField
                  label="Dia do mês *"
                  name="recurrence_day_of_month"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.recurrence_day_of_month}
                  onChange={handleChange}
                  placeholder="1–31"
                />
              )}

              <FormField
                label="Repete até (opcional)"
                name="recurrence_end_date"
                type="date"
                value={formData.recurrence_end_date}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        {/* Preço */}
        <div className="border-border mt-6 mb-4 border-t pt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-foreground text-sm font-medium">
                Evento gratuito
              </p>
            </div>
            <Switch
              checked={formData.is_free}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_free: checked }))
              }
            />
          </div>

          {!formData.is_free && (
            <div className="mt-4">
              <FormField
                label="Preço (R$)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0,00"
              />
            </div>
          )}
        </div>

        {/* Organizador */}
        <div className="border-border mt-6 mb-4 grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
          <FormField
            label="Organizador"
            name="organizer_name"
            value={formData.organizer_name}
            onChange={handleChange}
            placeholder="Nome do organizador"
          />
          <FormField
            label="Instagram do organizador"
            name="organizer_instagram"
            value={formData.organizer_instagram}
            onChange={handleChange}
            placeholder="@organizador"
          />
        </div>

        {/* Redes do evento */}
        <div className="border-border mt-6 mb-4 grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
          <FormField
            label="Instagram do evento"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            placeholder="@evento"
          />
          <FormField
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://..."
          />
          <FormField
            label="Telefone / WhatsApp"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(XX) XXXXX-XXXX"
          />
        </div>

        {/* Informações adicionais */}
        <div className="mb-4">
          <label className="text-foreground block text-sm font-medium">
            Informações adicionais
          </label>
          <textarea
            name="additional_info"
            value={formData.additional_info}
            onChange={handleChange}
            placeholder="Estacionamento, idade mínima, etc."
            rows={3}
            className={inputClassName}
          />
        </div>

        {/* Status de publicação */}
        <div className="border-border mt-6 mb-4 border-t pt-4">
          <label className="text-foreground block text-sm font-medium">
            Publicação
          </label>
          <div className="mt-2 flex gap-2">
            {(["draft", "published"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status }))}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  formData.status === status
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {status === "draft" ? "Rascunho" : "Publicado"}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Eventos publicados aparecem na listagem pública.
          </p>
        </div>

        {/* Submit */}
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
              "Salvar Evento"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
