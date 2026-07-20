document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'sideHustleBusinessPlan';

  let savedPlan = {};
  try {
    savedPlan = JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
  const ledgerNumber = savedPlan.ledgerNo || String(Math.floor(1000 + Math.random()*9000));
  document.getElementById('ledgerNo').textContent = ledgerNumber;
  const dateDisplay = document.getElementById('ledgerDateDisplay');
  const today = new Date();
  dateDisplay.textContent = savedPlan.savedDate || today.toLocaleDateString('en-ZA', { year:'numeric', month:'short', day:'numeric' });

  const fmt = (n) => 'R' + (Math.round(n*100)/100).toLocaleString('en-ZA', {minimumFractionDigits:0, maximumFractionDigits:2});

  const tbody = document.getElementById('costRows');
  const saveStatus = document.getElementById('saveStatus');
  let saveTimer;
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function addRow(item = '', amount = '') {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" class="item-input" placeholder="e.g. Stock, flyers, chair rental" value="${escapeHtml(item)}"></td>
      <td class="amt"><input type="number" class="amt-input" min="0" step="1" placeholder="0" value="${escapeHtml(amount)}"></td>
      <td class="rm"><button type="button" class="row-remove" aria-label="Remove row">×</button></td>
    `;
    tbody.appendChild(tr);
    tr.querySelector('.amt-input').addEventListener('input', updateAll);
    tr.querySelector('.item-input').addEventListener('input', updateAll);
    tr.querySelector('.row-remove').addEventListener('click', () => { tr.remove(); updateAll(); });
  }

  const savedRows = Array.isArray(savedPlan.costRows) && savedPlan.costRows.length
    ? savedPlan.costRows
    : [
      { item: 'Stock / materials', amount: '' },
      { item: 'Marketing (flyers, data, airtime)', amount: '' },
      { item: 'Transport / delivery', amount: '' }
    ];
  savedRows.forEach(row => addRow(row.item, row.amount));

  document.getElementById('addCostRow').addEventListener('click', () => { addRow(); updateAll(); });

  const startupTotalEl = document.getElementById('startupTotal');
  const costPerUnitEl = document.getElementById('costPerUnit');
  const pricePerUnitEl = document.getElementById('pricePerUnit');
  const profitPerUnitEl = document.getElementById('profitPerUnit');
  const monthlyCostsEl = document.getElementById('monthlyCosts');
  const breakEvenUnitsEl = document.getElementById('breakEvenUnits');
  const breakEvenWeeklyEl = document.getElementById('breakEvenWeekly');
  const recoupMonthsEl = document.getElementById('recoupMonths');
  const trackedIds = [
    'bizName', 'ownerName', 'hustleType', 'startDate', 'whoPaysFirst', 'whatYouSell',
    'costPerUnit', 'pricePerUnit', 'monthlyCosts', 'expectedSales', 'extraMonthlyCosts',
    'saMaterialCost', 'saHours', 'saHourlyRate', 'saMarkup', 'quizBudget', 'nameKeyword', 'nameVibe'
  ];

  trackedIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && savedPlan[id] !== undefined) el.value = savedPlan[id];
  });
  if (savedPlan.quizStyle) {
    const style = document.querySelector(`input[name="quizStyle"][value="${savedPlan.quizStyle}"]`);
    if (style) style.checked = true;
  }

  function getCostRows() {
    return Array.from(tbody.querySelectorAll('tr')).map(row => ({
      item: row.querySelector('.item-input').value,
      amount: row.querySelector('.amt-input').value
    }));
  }

  function collectPlan() {
    const plan = {
      ledgerNo: ledgerNumber,
      savedDate: dateDisplay.textContent,
      costRows: getCostRows(),
      quizStyle: document.querySelector('input[name="quizStyle"]:checked')?.value || 'hands'
    };
    trackedIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) plan[id] = el.value;
    });
    return plan;
  }

  function savePlan() {
    clearTimeout(saveTimer);
    saveStatus.textContent = 'Saving...';
    saveTimer = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(collectPlan()));
      saveStatus.textContent = 'Saved locally';
    }, 180);
  }

  function updateCharts(total, cost, price, profit) {
    const costChart = document.getElementById('costChart');
    const rows = getCostRows().filter(row => row.item || Number(row.amount));
    const visibleRows = rows.length ? rows : [{ item: 'No costs yet', amount: 0 }];
    costChart.innerHTML = visibleRows.slice(0, 6).map(row => {
      const value = parseFloat(row.amount) || 0;
      const pct = total > 0 ? Math.max(4, (value / total) * 100) : 0;
      return `
        <div class="chart-row">
          <span>${escapeHtml(row.item || 'Cost').slice(0, 12)}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          <span>${fmt(value)}</span>
        </div>
      `;
    }).join('');

    const max = Math.max(price, cost, profit, 1);
    document.getElementById('costBar').style.width = `${Math.max(0, cost / max * 100)}%`;
    document.getElementById('profitBar').style.width = `${Math.max(0, profit / max * 100)}%`;
    document.getElementById('priceBar').style.width = `${Math.max(0, price / max * 100)}%`;
    document.getElementById('costBarLabel').textContent = fmt(cost);
    document.getElementById('profitBarLabel').textContent = fmt(Math.max(0, profit));
    document.getElementById('priceBarLabel').textContent = fmt(price);
  }

  function updateProfitCalculator(profit) {
    const expectedSales = parseFloat(document.getElementById('expectedSales').value) || 0;
    const extraCosts = parseFloat(document.getElementById('extraMonthlyCosts').value) || 0;
    const monthly = (profit * expectedSales) - extraCosts;
    document.getElementById('monthlyProfitResult').innerHTML = `Monthly profit estimate: <strong>${fmt(monthly)}</strong>`;
  }

  function updateSaPricing() {
    const materials = parseFloat(document.getElementById('saMaterialCost').value) || 0;
    const hours = parseFloat(document.getElementById('saHours').value) || 0;
    const rate = parseFloat(document.getElementById('saHourlyRate').value) || 0;
    const markup = parseFloat(document.getElementById('saMarkup').value) || 0;
    const base = materials + (hours * rate);
    const price = base * (1 + markup / 100);
    document.getElementById('saPriceResult').innerHTML = `Suggested price: <strong>${fmt(price)}</strong> <span style="opacity:.7;">(base ${fmt(base)})</span>`;
  }

  function updateQuiz() {
    const budget = document.getElementById('quizBudget').value;
    const style = document.querySelector('input[name="quizStyle"]:checked')?.value || 'hands';
    let result = 'Hair & styling';
    if (style === 'people') result = 'Tutoring & lessons';
    if (style === 'selling') result = 'Reselling & thrifting';
    if (style === 'hands' && budget === 'high') result = 'Event decor setup or home catering';
    if (style === 'hands' && budget === 'low') result = 'Tutoring or hair services with deposits';
    document.getElementById('quizResult').innerHTML = `Best fit: <strong>${result}</strong>`;
  }

  function updateAll() {
    let total = 0;
    tbody.querySelectorAll('.amt-input').forEach(inp => { total += parseFloat(inp.value) || 0; });
    startupTotalEl.textContent = fmt(total);

    const cost = parseFloat(costPerUnitEl.value) || 0;
    const price = parseFloat(pricePerUnitEl.value) || 0;
    const profit = price - cost;
    profitPerUnitEl.textContent = fmt(profit);
    profitPerUnitEl.style.color = profit > 0 ? 'var(--jade)' : 'var(--rust)';

    const monthly = parseFloat(monthlyCostsEl.value) || 0;
    if (profit > 0 && monthly > 0) {
      const units = Math.ceil(monthly / profit);
      breakEvenUnitsEl.textContent = units + ' sales';
      breakEvenWeeklyEl.textContent = Math.ceil(units / 4.3) + ' sales';
    } else {
      breakEvenUnitsEl.textContent = '—';
      breakEvenWeeklyEl.textContent = '—';
    }

    if (profit > 0 && total > 0) {
      const extraSalesPerMonth = 30;
      const netMonthlyProfit = profit * extraSalesPerMonth;
      const months = total / netMonthlyProfit;
      recoupMonthsEl.textContent = (months < 1 ? '<1' : Math.ceil(months)) + ' month' + (months >= 2 ? 's' : '');
      recoupMonthsEl.title = 'Estimated at one extra sale a day, on top of your break-even pace.';
    } else {
      recoupMonthsEl.textContent = '—';
    }
    updateCharts(total, cost, price, profit);
    updateProfitCalculator(profit);
    updateSaPricing();
    updateQuiz();
    savePlan();
  }

  document.querySelectorAll('input, textarea, select').forEach(el => el.addEventListener('input', updateAll));
  document.querySelectorAll('input[name="quizStyle"]').forEach(el => el.addEventListener('change', updateAll));
  updateAll();

  document.getElementById('printBtn').addEventListener('click', () => window.print());
  document.getElementById('clearPlanBtn').addEventListener('click', () => {
    if (confirm('Clear the saved business plan on this browser?')) {
      localStorage.removeItem(storageKey);
      location.reload();
    }
  });

  function generateNames() {
    const rawKeyword = document.getElementById('nameKeyword').value.trim();
    const keyword = rawKeyword || document.getElementById('hustleType').value || 'Hustle';
    const vibe = document.getElementById('nameVibe').value;
    const localWords = ['Mzansi', 'Kasi', 'Ubuntu', 'Street', 'Jozi', 'Cape'];
    const premiumWords = ['Prime', 'Signature', 'Studio', 'Collective', 'Select', 'Craft'];
    const friendlyWords = ['Aunty', 'Neighbour', 'Happy', 'Easy', 'Care', 'Home'];
    const boldWords = ['Boss', 'Fire', 'Sharp', 'Next', 'Rise', 'Level'];
    const banks = { Local: localWords, Premium: premiumWords, Friendly: friendlyWords, Bold: boldWords };
    const words = banks[vibe] || localWords;
    const names = [
      `${words[0]} ${keyword}`,
      `${keyword} ${words[1]}`,
      `${words[2]} ${keyword} Co.`,
      `${keyword} by ${document.getElementById('ownerName').value.trim() || 'You'}`,
      `${words[3]} ${keyword} Studio`,
      `${keyword} ${words[4]}`
    ];
    document.getElementById('nameList').innerHTML = names.map(name => `<span class="name-chip">${escapeHtml(name)}</span>`).join('');
    savePlan();
  }

  document.getElementById('generateNamesBtn').addEventListener('click', generateNames);
  generateNames();

  document.getElementById('wordBtn').addEventListener('click', () => {
    const sheet = document.getElementById('ledgerSheet').cloneNode(true);
    sheet.querySelectorAll('input, textarea').forEach(el => {
      const span = document.createElement('span');
      span.textContent = el.value || '________________';
      el.replaceWith(span);
    });
    sheet.querySelectorAll('select').forEach(el => {
      const span = document.createElement('span');
      span.textContent = el.value || '________________';
      el.replaceWith(span);
    });
    sheet.querySelectorAll('.row-remove, .add-row-btn').forEach(el => el.remove());

    const bizName = document.getElementById('bizName').value || 'business-plan';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Business Plan</title></head>
      <body style="font-family:Calibri, sans-serif;">
      <h1 style="font-family:Calibri;">Business Plan Ledger</h1>
      ${sheet.innerHTML}
      </body></html>`;

    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = bizName.replace(/[^a-z0-9\-_ ]/gi,'').trim().replace(/\s+/g,'-').toLowerCase() + '-business-plan.doc';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
});
