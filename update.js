const fs = require('fs');

// ========== НАСТРОЙКИ (можешь менять) ==========
const LOCATIONS = ["Caerleon","Bridgewatch","Lymhurst","Martlock","Fort Sterling","Thetford"];
const QUALITY = 2; // 2 = Normal (обычное качество)
const PREMIUM = true; // true – налог 4%, false – 8%
// ===============================================

(async () => {
  console.log("Используем встроенный список предметов (API временно недоступен)...");
  // Временный список популярных предметов T5–T8
  const highTier = [
    "T5_HEAD_PLATE_SET1", "T5_ARMOR_PLATE_SET1", "T5_SHOES_PLATE_SET1",
    "T5_2H_SWORD", "T5_2H_AXE", "T5_BAG",
    "T6_HEAD_PLATE_SET1", "T6_ARMOR_PLATE_SET1", "T6_SHOES_PLATE_SET1",
    "T6_2H_SWORD", "T6_2H_AXE", "T6_BAG",
    "T7_HEAD_PLATE_SET1", "T7_ARMOR_PLATE_SET1", "T7_SHOES_PLATE_SET1",
    "T7_2H_SWORD", "T7_2H_AXE", "T7_BAG",
    "T8_HEAD_PLATE_SET1", "T8_ARMOR_PLATE_SET1", "T8_SHOES_PLATE_SET1",
    "T8_2H_SWORD", "T8_2H_AXE", "T8_BAG"
  ];

  console.log(`Будет проверено ${highTier.length} предметов.`);

  const deals = [];
  const BATCH = 50;

  for (let i = 0; i < highTier.length; i += BATCH) {
    const batch = highTier.slice(i, i + BATCH);
    const url = `https://www.albion-online-data.com/api/v2/stats/view/${batch.join(',')}?locations=${LOCATIONS.join(',')}&qualities=${QUALITY}`;
    console.log(`Запрос батча ${Math.floor(i / BATCH) + 1}...`);
    const res = await fetch(url);
    const data = await res.json();

    // Группируем по предмету
    const byItem = {};
    data.forEach(entry => {
      if (!entry.sell_price_min || !entry.buy_price_max) return;
      if (!byItem[entry.item_id]) byItem[entry.item_id] = [];
      byItem[entry.item_id].push(entry);
    });

    // Считаем прибыль для каждой пары городов
    for (const item in byItem) {
      const cities = byItem[item];
      for (const buy of cities) {
        const buyPrice = buy.sell_price_min;
        for (const sell of cities) {
          if (buy.city === sell.city) continue;
          const sellPrice = sell.buy_price_max;
          const buyFee = buyPrice * 0.025;
          const sellFee = sellPrice * 0.025;
          const taxRate = PREMIUM ? 0.04 : 0.08;
          const salesTax = sellPrice * taxRate;
          const netProfit = sellPrice - sellFee - salesTax - (buyPrice + buyFee);
          if (netProfit > 0) {
            deals.push({
              item: item,
              buyCity: buy.city,
              buyPrice: buyPrice,
              sellCity: sell.city,
              sellPrice: sellPrice,
              profit: Math.round(netProfit)
            });
          }
        }
      }
    }
    // Маленькая пауза, чтобы не перегрузить API
    await new Promise(r => setTimeout(r, 200));
  }

  // Сортируем по убыванию прибыли
  deals.sort((a, b) => b.profit - a.profit);
  console.log(`Найдено ${deals.length} выгодных маршрутов.`);

  // Сохраняем в файл deals.json – его и будет читать сайт
  fs.writeFileSync('deals.json', JSON.stringify(deals, null, 2));
  console.log('deals.json обновлён.');
})();
