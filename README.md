# Waibong Company Totals

呢個係畀 Carmen 喺 `oa.waibong.net` 按關鍵字篩選同查看數據嘅 Chrome 擴充功能。用戶可以輸入文字，篩選並計算收入同成本嘅總額。

A local Chrome extension for `oa.waibong.net`. On the Income Report page it:

- lets the user enter any **Company contains** text (for example, `xx` matches `abc xx company`);
- remembers the chosen text in that browser;
- matches case-insensitively;
- highlights matched rows;
- totals 服务金额, 收款金额, 服务成本, 服务利润, and 分享金额;
- recalculates automatically after a query or date change;
- keeps different currencies separate.

## Install locally

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this `eskemas-oa-totals` folder.
5. Refresh the Waibong OA page and open 收支管理 → 收入列表.

No data is sent anywhere. The extension only reads the visible report table in the current OA page.
