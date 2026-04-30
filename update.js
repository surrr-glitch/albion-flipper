const fs = require('fs');

// ========== НАСТРОЙКИ ==========
const LOCATIONS = ["Caerleon","Bridgewatch","Lymhurst","Martlock","Fort Sterling","Thetford"];
const QUALITY = 2;
const PREMIUM = true;
// ===============================

(async () => {
  // Расширенный список топовых предметов, которые люди сканируют чаще всего
  const highTier = [
    "T5_ORE", "T5_WOOD", "T5_ROCK", "T5_HIDE", "T5_FIBER",
    "T6_ORE", "T6_WOOD", "T6_ROCK", "T6_HIDE", "T6_FIBER",
    "T7_ORE", "T7_WOOD", "T7_ROCK", "T7_HIDE", "T7_FIBER",
    "T5_BAG", "T6_BAG", "T7_BAG", "T8_BAG",
    "T5_HEAD_PLATE_SET1", "T5_ARMOR_PLATE_SET1", "T5_SHOES_PLATE_SET1",
    "T6_HEAD_PLATE_SET1", "T6_ARMOR_PLATE_SET1", "T6_SHOES_PLATE_SET1",
    "T5_2H_SWORD", "T5_2H_AXE", "T6_2H_SWORD", "T6_2H_AXE"
  ];

  console.log(`Проверяем ${highTier.length} предметов...`);

  const deals = [];
  const BATCH = 50;

  for (let i = 0; i < highTier.length; i += BATCH) {
    const batch = highTier.slice(i, i + BATCH);
    const url = `https://www.albion-online-data.com/api/v2/stats/view/${batch.join(',')}?locations=${LOCATIONS.join(',')}&qualities=${QUALITY}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();

      const byItem = {};
      data.forEach(entry => {
        if (!entry.sell_price_min || !entry.buy_price_max) return;
        if (!byItem[entry.item_id]) byItem[entry.item_id] = [];
        byItem[entry.item_id].push(entry);
      });

      for (const item in byItem) {
        const cities = byItem[item];
        for (const buy of cities) {
          const buyPrice = buy.sell_price_min;
          for (const sell of cities)

