document.addEventListener('DOMContentLoaded', function () {
  var costRowsEl = document.getElementById('costRows');
  var addRowBtn = document.getElementById('addCostRow');
  var costTotalEl = document.getElementById('costTotal');
  var unitCostEl = document.getElementById('unitCost');
  var unitPriceEl = document.getElementById('unitPrice');
  var marginAmtEl = document.getElementById('marginAmt');
  var marginPctEl = document.getElementById('marginPct');
  var breakEvenEl = document.getElementById('breakEven');
  var monthlyTargetEl = document.getElementById('monthlyTarget');
  var monthlyRevenueEl = document.getElementById('monthlyRevenue');
  var monthlyProfitEl = document.getElementById('monthlyProfit');
  var monthsToRecoupEl = document.getElementById('monthsToRecoup');
  var dateEl = document.getElementById('ledgerDate');
  var resetBtn = document.getElementById('resetPlan');
  var downloadBtn = document.getElementById('downloadWord');
  var printBtn = document.getElementById('printBtn');
  var ledgerForm = document.getElementById('ledgerForm');

  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
  if (ledgerForm) ledgerForm.addEventListener('submit', function (e) { e.preventDefault(); });

  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function fmtR(n) {
    if (isNaN(n)) n = 0;
    return 'R' + n.toLocaleString('en-ZA', { maximumFractionDigits: 0 });
  }

  function makeCostRow(name, amount) {
    var row = document.createElement('div');
    row.className = 'cost-row row-3';
    row.innerHTML =
      '<input type="text" class="cost-name" placeholder="Item, e.g. Braiding hair" value="' + (name || '') + '">' +
      '<input type="number" class="amount" min="0" step="1" placeholder="0" value="' + (amount || '') + '">' +
      '<span class="mono" style="font-size:0.8rem; color:var(--ink-soft);">R</span>' +
      '<button type="button" class="remove-row" aria-label="Remove item">✕</button>';
    return row;
  }

  function addCostRow(name, amount) {
    var row = makeCostRow(name, amount);
    costRowsEl.appendChild(row);
    bindRow(row);
    recalc();
  }

  function bindRow(row) {
    row.querySelector('.amount').addEventListener('input', recalc);
    row.querySelector('.remove-row').addEventListener('click', function () {
      row.remove();
      recalc();
    });
  }

  function recalc() {
    // Cost total
    var total = 0;
    costRowsEl.querySelectorAll('.amount').forEach(function (input) {
      var v = parseFloat(input.value);
      if (!isNaN(v)) total += v;
    });
    costTotalEl.textContent = fmtR(total);

    // Margin
    var uc = parseFloat(unitCostEl.value) || 0;
    var up = parseFloat(unitPriceEl.value) || 0;
    var margin = up - uc;
    var marginPct = up > 0 ? (margin / up) * 100 : 0;
    marginAmtEl.textContent = fmtR(margin);
    marginPctEl.textContent = Math.round(marginPct) + '%';

    var breakEven = margin > 0 ? Math.ceil(total / margin) : 0;
    breakEvenEl.textContent = breakEven > 0 ? breakEven : '—';

    // Monthly
    var target = parseFloat(monthlyTargetEl.value) || 0;
    var monthlyRevenue = target * up;
    var monthlyProfit = target * margin;
    monthlyRevenueEl.textContent = fmtR(monthlyRevenue);
    monthlyProfitEl.textContent = fmtR(monthlyProfit);
    var monthsToRecoup = monthlyProfit > 0 ? Math.ceil(total / monthlyProfit) : 0;
    monthsToRecoupEl.textContent = monthsToRecoup > 0 ? monthsToRecoup : '—';
  }

  // Initial rows
  ['', '', ''].forEach(function () { addCostRow('', ''); });

  addRowBtn.addEventListener('click', function () { addCostRow('', ''); });

  [unitCostEl, unitPriceEl, monthlyTargetEl].forEach(function (el) {
    el.addEventListener('input', recalc);
  });

  resetBtn.addEventListener('click', function () {
    if (!confirm('Clear everything on this plan? This can\'t be undone.')) return;
    document.getElementById('ledgerForm').reset();
    costRowsEl.innerHTML = '';
    ['', '', ''].forEach(function () { addCostRow('', ''); });
    recalc();
  });

  recalc();

  // ---- Word export ----
  downloadBtn.addEventListener('click', function () {
    var val = function (id) { return (document.getElementById(id).value || '').trim(); };

    var costItems = [];
    costRowsEl.querySelectorAll('.cost-row').forEach(function (row) {
      var name = row.querySelector('.cost-name').value.trim();
      var amt = row.querySelector('.amount').value;
      if (name || amt) {
        costItems.push('<tr><td style="padding:6px 10px;border:1px solid #ccc;">' + escapeHtml(name || '(unnamed item)') + '</td><td style="padding:6px 10px;border:1px solid #ccc;text-align:right;">' + fmtR(parseFloat(amt) || 0) + '</td></tr>');
      }
    });

    function escapeHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function line(label, id) {
      var v = val(id);
      return '<p><b>' + label + ':</b> ' + (v ? escapeHtml(v) : '—') + '</p>';
    }

    var html = '' +
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head><meta charset="utf-8"><title>Business Plan</title></head><body style="font-family:Calibri,Arial,sans-serif;">' +
      '<h1 style="color:#15181B;">Business Plan — ' + escapeHtml(val('bizName') || 'Untitled Hustle') + '</h1>' +
      '<p style="color:#555;">MordecaiTechSolutions — Side Hustle Starter Guide · ' + (dateEl ? dateEl.textContent : '') + '</p>' +
      '<hr>' +
      '<h2>1. The idea</h2>' +
      line('Business/hustle name', 'bizName') +
      line('Type of hustle', 'hustleType') +
      line('One-liner', 'oneLiner') +
      '<h2>2. Who it\'s for</h2>' +
      '<p>' + (escapeHtml(val('audience')) || '—') + '</p>' +
      '<h2>3. Start-up costs</h2>' +
      '<table style="border-collapse:collapse;width:100%;">' +
      '<tr><th style="padding:6px 10px;border:1px solid #ccc;text-align:left;background:#eee;">Item</th><th style="padding:6px 10px;border:1px solid #ccc;text-align:right;background:#eee;">Cost</th></tr>' +
      (costItems.length ? costItems.join('') : '<tr><td style="padding:6px 10px;border:1px solid #ccc;" colspan="2">No items added</td></tr>') +
      '<tr><td style="padding:6px 10px;border:1px solid #ccc;"><b>Total</b></td><td style="padding:6px 10px;border:1px solid #ccc;text-align:right;"><b>' + costTotalEl.textContent + '</b></td></tr>' +
      '</table>' +
      '<h2>4. Pricing</h2>' +
      line('Cost per sale/booking', 'unitCost') +
      line('Price per sale/booking', 'unitPrice') +
      '<p><b>Profit per sale:</b> ' + marginAmtEl.textContent + ' (' + marginPctEl.textContent + ' margin)</p>' +
      '<p><b>Sales needed to cover start-up cost:</b> ' + breakEvenEl.textContent + '</p>' +
      '<h2>5. Monthly target</h2>' +
      line('Target sales/bookings per month', 'monthlyTarget') +
      '<p><b>Estimated monthly revenue:</b> ' + monthlyRevenueEl.textContent + '</p>' +
      '<p><b>Estimated monthly profit:</b> ' + monthlyProfitEl.textContent + '</p>' +
      '<p><b>Months to recoup start-up cost:</b> ' + monthsToRecoupEl.textContent + '</p>' +
      '<h2>6. How I\'ll save my start-up money</h2>' +
      '<p>' + (escapeHtml(val('savingPlan')) || '—') + '</p>' +
      '<h2>7. Getting my first 3 clients</h2>' +
      '<p>' + (escapeHtml(val('marketing')) || '—') + '</p>' +
      '<h2>8. My 90-day goals</h2>' +
      '<ol>' +
      '<li>' + (escapeHtml(val('goal1')) || '—') + '</li>' +
      '<li>' + (escapeHtml(val('goal2')) || '—') + '</li>' +
      '<li>' + (escapeHtml(val('goal3')) || '—') + '</li>' +
      '</ol>' +
      '</body></html>';

    var blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var fileName = (val('bizName') || 'business-plan').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'business-plan';
    a.href = url;
    a.download = fileName + '.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
