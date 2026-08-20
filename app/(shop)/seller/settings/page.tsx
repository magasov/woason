"use client";

import { AddressSuggest } from "@/components/address-suggest";
import { FileDrop } from "@/components/file-drop";
import { FormEvent, useEffect, useState } from "react";
import { deliveryLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { DeliveryMethod } from "@/lib/types";
import { uploadFiles } from "@/lib/upload";

const methods: DeliveryMethod[] = ["cdek", "pochta", "pickup"];

export default function SellerSettingsPage() {
  const { user, updateShop } = useStore();
  const shop = user?.seller;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Москва");
  const [banner, setBanner] = useState("");
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState<File[]>([]);
  const [bannerFile, setBannerFile] = useState<File[]>([]);
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<DeliveryMethod[]>(["cdek", "pochta"]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shop) return;
    setName(shop.shopName);
    setDescription(shop.description);
    setCity(shop.city);
    setBanner(shop.banner ?? "");
    setLogo(shop.logo);
    setPhone(shop.phone ?? user?.phone ?? "");
    setDelivery(shop.delivery.length ? shop.delivery : ["cdek", "pochta"]);
  }, [shop, user?.phone]);

  if (!shop) return null;

  function toggle(m: DeliveryMethod) {
    setDelivery((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!shop || !delivery.length) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      let nextLogo = logo.trim() || shop.logo;
      let nextBanner = banner.trim();
      if (logoFile[0]) {
        const [url] = await uploadFiles(logoFile, "avatar");
        if (url) nextLogo = url;
      }
      if (bannerFile[0]) {
        const [url] = await uploadFiles(bannerFile, "banner");
        if (url) nextBanner = url;
      }
      await updateShop({
        shopName: name.trim() || shop.shopName,
        description: description.trim(),
        city,
        banner: nextBanner,
        logo: nextLogo,
        phone: phone.trim(),
        delivery,
      });
      setLogo(nextLogo);
      setBanner(nextBanner);
      setLogoFile([]);
      setBannerFile([]);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Настройки магазина</h1>
      <p className="mt-1 text-sm text-muted">Название, баннер, город и способы доставки — всё на витрине.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4 rounded-2xl bg-paper p-5">
        <label className="block text-xs font-medium text-muted">Название</label>
        <input className="field" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="block text-xs font-medium text-muted">Описание витрины</label>
        <textarea
          className="field min-h-28 py-3"
          placeholder="Описание витрины"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <FileDrop
          files={logoFile}
          onChange={setLogoFile}
          max={1}
          variant="avatar"
          existingUrl={logo}
          label="Аватар магазина"
          hint="Перетащите файл или нажмите. Квадрат, до 10 МБ."
        />
        <FileDrop
          files={bannerFile}
          onChange={setBannerFile}
          max={1}
          variant="banner"
          existingUrl={banner}
          label="Баннер витрины"
          hint="Широкое фото, до 10 МБ."
        />
        <label className="block text-xs font-medium text-muted">Телефон</label>
        <input className="field" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label className="block text-xs font-medium text-muted">Город магазина</label>
        <AddressSuggest
          kind="city"
          value={city}
          onChange={setCity}
          placeholder="Город магазина"
          inputClassName="field"
        />
        <p className="pt-1 text-sm font-medium">Доставка</p>
        {methods.map((m) => (
          <label key={m} className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-3 text-sm">
            <input type="checkbox" checked={delivery.includes(m)} onChange={() => toggle(m)} />
            {deliveryLabel[m]}
          </label>
        ))}
        {saved && <p className="text-sm text-ember">Сохранено — обновится на публичной странице.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-xl bg-ink font-semibold text-paper disabled:opacity-60"
        >
          {busy ? "Сохраняем…" : "Сохранить"}
        </button>
      </form>
      <style>{`.field{height:44px;width:100%;border-radius:12px;background:#f3f1eb;padding:0 12px;outline:none}`}</style>
    </div>
  );
}
