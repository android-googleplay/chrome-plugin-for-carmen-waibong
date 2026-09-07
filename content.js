(() => {
  "use strict";

  const PANEL_ID = "eskemas-oa-totals";
  const KEYWORD = "eskemas";
  const METRICS = ["服务金额", "收款金额", "服务成本", "服务利润", "分享金额"];
  let updateTimer;

  function normalize(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function parseMoney(value) {
    const text = normalize(value);
    if (!text) return null;

    const numberMatch = text.match(/-?[\d,]+(?:\.\d+)?/);
    if (!numberMatch) return null;

    const currencyMatch = text.match(/[A-Za-z]{3}/);
    return {
      currency: (currencyMatch?.[0] || "HKD").toUpperCase(),
      amount: Number(numberMatch[0].replaceAll(",", ""))
    };
  }

  function findReportTable() {
    const candidates = [...document.querySelectorAll("table")].filter((table) => {
      const headers = [...table.querySelectorAll("thead th, tr:first-child th")]
        .map((cell) => normalize(cell.textContent));
      return headers.includes("Company") && METRICS.every((name) => headers.includes(name));
    });

    // Layui renders a separate #layui-table-header table with no data rows.
    // Prefer the matching table that contains the most body rows.
    return candidates.sort((a, b) =>
      b.querySelectorAll("tbody tr").length - a.querySelectorAll("tbody tr").length
    )[0];
  }

  function collect(table) {
    const headerCells = [...table.querySelectorAll("thead th, tr:first-child th")];
    const headers = headerCells.map((cell) => normalize(cell.textContent));
    const companyIndex = headers.indexOf("Company");
    const indexes = Object.fromEntries(METRICS.map((name) => [name, headers.indexOf(name)]));
    const totals = Object.fromEntries(METRICS.map((name) => [name, new Map()]));
    let matchedRows = 0;

    table.querySelectorAll("tbody tr").forEach((row) => {
      row.classList.remove("eskemas-oa-match");
      const cells = [...row.children].filter((cell) => cell.matches("td, th"));
      if (cells.length <= companyIndex) return;
      const company = normalize(cells[companyIndex]?.textContent).toLowerCase();
      if (!company.includes(KEYWORD)) return;

      matchedRows += 1;
      row.classList.add("eskemas-oa-match");

      for (const metric of METRICS) {
        const money = parseMoney(cells[indexes[metric]]?.textContent);
        if (!money || !Number.isFinite(money.amount)) continue;
        totals[metric].set(money.currency, (totals[metric].get(money.currency) || 0) + money.amount);
      }
    });

    return {matchedRows, totals};
  }

  function formatTotals(currencyTotals) {
    if (!currencyTotals.size) return "HKD 0.00";
    return [...currencyTotals.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([currency, amount]) => `${currency} ${amount.toLocaleString("en-HK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`)
      .join(" / ");
  }

  function render(result) {
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement("aside");
      panel.id = PANEL_ID;
      panel.innerHTML = `
        <div class="eskemas-title">
          <span>Eskemas 合计</span>
          <button type="button" aria-label="折叠">−</button>
        </div>
        <div class="eskemas-body"></div>
      `;
      panel.querySelector("button").addEventListener("click", () => {
        panel.classList.toggle("is-collapsed");
        panel.querySelector("button").textContent = panel.classList.contains("is-collapsed") ? "+" : "−";
      });
      document.body.appendChild(panel);
    }

    panel.querySelector(".eskemas-body").innerHTML = `
      <div class="eskemas-count">找到 <strong>${result.matchedRows}</strong> 条 Company 包含 “${KEYWORD}”</div>
      ${METRICS.map((metric) => `
        <div class="eskemas-total">
          <span>${metric}</span>
          <strong>${formatTotals(result.totals[metric])}</strong>
        </div>
      `).join("")}
    `;
  }

  function update() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(() => {
      const table = findReportTable();
      const existingPanel = document.getElementById(PANEL_ID);
      if (!table) {
        existingPanel?.remove();
        return;
      }
      render(collect(table));
    }, 120);
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.every((mutation) => mutation.target.closest?.(`#${PANEL_ID}`))) return;
    update();
  });

  observer.observe(document.documentElement, {childList: true, subtree: true, characterData: true});
  update();
})();
