// 側邊欄切換功能
document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const toggleIcon = sidebarToggle.querySelector('i');

  sidebarToggle.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    toggleIcon.classList.toggle('fa-chevron-left');
    toggleIcon.classList.toggle('fa-chevron-right');
  });

  // 啟用所有工具提示
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      placement: 'top',
      trigger: 'hover focus',
      html: true
    });
  });

  // 設定計算按鈕事件
  document.getElementById('calculate-bep').addEventListener('click', calculateBreakEven);
  document.getElementById('calculate-gpm').addEventListener('click', calculateGrossProfitMargin);
  document.getElementById('calculate-npm').addEventListener('click', calculateNetProfitMargin);
  
  // 設定Tab切換時的說明更新
  const pillsTab = document.getElementById('v-pills-tab');
  const triggerTabList = [].slice.call(pillsTab.querySelectorAll('button'));
  
  triggerTabList.forEach(function(triggerEl) {
    triggerEl.addEventListener('click', function(event) {
      updateCalculationInfo(event.target.id);
    });
  });
  
  // 即時計算貢獻毛利率
  const unitPrice = document.getElementById('unit-price');
  const unitVariableCost = document.getElementById('unit-variable-cost');
  const contributionMarginRatio = document.getElementById('contribution-margin-ratio');
  
  [unitPrice, unitVariableCost].forEach(input => {
    input.addEventListener('input', function() {
      calculateContributionMarginRatio();
    });
  });
  
  // 初始化
  calculateContributionMarginRatio();
  updateCalculationInfo('v-pills-bep-tab');
});

// 更新計算說明
function updateCalculationInfo(tabId) {
  const infoElement = document.getElementById('calculation-info');
  
  switch(tabId) {
    case 'v-pills-bep-tab':
      infoElement.innerHTML = `
        <p>📌 <strong>損益平衡點</strong>是告訴你<span class="text-warning">「要賣多少東西才不會賠錢」</span>的數字。</p>
        <p>就像賣檸檬汁的小朋友需要知道：賣幾杯檸檬汁才能賺回買材料和攤位的錢呢？</p>
      `;
      break;
    case 'v-pills-gpm-tab':
      infoElement.innerHTML = `
        <p>📌 <strong>毛利率</strong>告訴你<span class="text-warning">「每賣100元的東西，扣掉材料成本後能賺多少」</span>。</p>
        <p>例如：賣100元的餅乾，如果材料花了40元，毛利率就是60%，表示你賺了60元！</p>
      `;
      break;
    case 'v-pills-npm-tab':
      infoElement.innerHTML = `
        <p>📌 <strong>淨利率</strong>告訴你<span class="text-warning">「每賺100元，最後真正能放進口袋的錢有多少」</span>。</p>
        <p>例如：賣100元的玩具，扣掉所有成本（材料、房租、人工...）後，如果剩15元，淨利率就是15%！</p>
      `;
      break;
  }
}

// 格式化貨幣顯示
function formatCurrency(number) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// 格式化百分比顯示
function formatPercentage(number) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number) + '%';
}

// 計算貢獻毛利率
function calculateContributionMarginRatio() {
  const unitPrice = parseFloat(document.getElementById('unit-price').value) || 0;
  const unitVariableCost = parseFloat(document.getElementById('unit-variable-cost').value) || 0;
  
  if (unitPrice > 0) {
    const ratio = ((unitPrice - unitVariableCost) / unitPrice) * 100;
    document.getElementById('contribution-margin-ratio').value = ratio.toFixed(2);
  } else {
    document.getElementById('contribution-margin-ratio').value = '0';
  }
}

// 計算損益平衡點
function calculateBreakEven() {
  // 獲取輸入值
  const fixedCost = parseFloat(document.getElementById('fixed-cost').value) || 0;
  const unitPrice = parseFloat(document.getElementById('unit-price').value) || 0;
  const unitVariableCost = parseFloat(document.getElementById('unit-variable-cost').value) || 0;
  
  // 計算貢獻毛利
  const contributionMargin = unitPrice - unitVariableCost;
  
  // 計算貢獻毛利率
  let contributionMarginRatio = 0;
  if (unitPrice > 0) {
    contributionMarginRatio = (contributionMargin / unitPrice) * 100;
  }
  
  // 計算損益平衡點 (單位)
  let breakEvenUnits = 0;
  if (contributionMargin > 0) {
    breakEvenUnits = fixedCost / contributionMargin;
  }
  
  // 計算損益平衡點 (金額)
  let breakEvenRevenue = 0;
  if (contributionMarginRatio > 0) {
    breakEvenRevenue = fixedCost / (contributionMarginRatio / 100);
  }
  
  // 更新結果
  document.getElementById('contribution-margin').textContent = formatCurrency(contributionMargin) + ' 元';
  document.getElementById('contribution-ratio-result').textContent = formatPercentage(contributionMarginRatio);
  document.getElementById('break-even-units').textContent = Math.ceil(breakEvenUnits) + ' 單位';
  document.getElementById('break-even-revenue').textContent = formatCurrency(breakEvenRevenue) + ' 元';
  
  // 產生分析
  generateBreakEvenAnalysis(fixedCost, unitPrice, unitVariableCost, breakEvenUnits, breakEvenRevenue);
}

// 產生損益平衡分析
function generateBreakEvenAnalysis(fixedCost, unitPrice, unitVariableCost, breakEvenUnits, breakEvenRevenue) {
  const analysisElement = document.getElementById('bep-analysis-text');
  const contributionMargin = unitPrice - unitVariableCost;
  
  let analysis = '';
  
  if (contributionMargin <= 0) {
    analysis = `<span class="text-danger">😕 你的產品賣價太低了！每個產品的售價（${unitPrice}元）必須要高於成本（${unitVariableCost}元），否則每賣一個就會賠錢。</span>`;
  } else {
    analysis = `
      <p>🏠 你每個月的固定支出是 <strong>${formatCurrency(fixedCost)}</strong> 元。</p>
      <p>🍰 每賣出一個產品，你可以賺 <strong>${formatCurrency(contributionMargin)}</strong> 元。</p>
      <p>🎯 你需要每月賣出 <strong>${Math.ceil(breakEvenUnits)}</strong> 個產品才能不賠錢！</p>
      <p>💰 這相當於每月至少要有 <strong>${formatCurrency(breakEvenRevenue)}</strong> 元的銷售額。</p>
    `;
    
    // 安全邊際分析（假設目前銷售為BEP的120%，更容易理解）
    const currentSales = breakEvenUnits * 1.2;
    const extraProfit = (currentSales - breakEvenUnits) * contributionMargin;
    
    analysis += `
      <p>📊 如果你能賣出 <strong>${Math.ceil(currentSales)}</strong> 個產品（多賣 ${Math.ceil(currentSales - breakEvenUnits)} 個），
      你會額外賺到 <strong>${formatCurrency(extraProfit)}</strong> 元！</p>
    `;
  }
  
  analysisElement.innerHTML = analysis;
}

// 計算毛利率
function calculateGrossProfitMargin() {
  // 獲取輸入值
  const totalRevenue = parseFloat(document.getElementById('total-revenue').value) || 0;
  const cogs = parseFloat(document.getElementById('cogs').value) || 0;
  
  // 計算毛利和毛利率
  const grossProfit = totalRevenue - cogs;
  let grossProfitMargin = 0;
  
  if (totalRevenue > 0) {
    grossProfitMargin = (grossProfit / totalRevenue) * 100;
  }
  
  // 更新結果
  document.getElementById('gross-profit').textContent = formatCurrency(grossProfit) + ' 元';
  document.getElementById('gross-profit-margin').textContent = formatPercentage(grossProfitMargin);
  
  // 產生分析
  generateGrossProfitAnalysis(totalRevenue, cogs, grossProfit, grossProfitMargin);
}

// 產生毛利率分析
function generateGrossProfitAnalysis(totalRevenue, cogs, grossProfit, grossProfitMargin) {
  const analysisElement = document.getElementById('gpm-analysis-text');
  
  let analysis = '';
  let emojiRating = '';
  let simpleExplanation = '';
  
  // 根據毛利率評級用表情符號和簡單語言表達
  if (grossProfitMargin < 0) {
    emojiRating = '😱';
    simpleExplanation = '賣得越多虧得越多！每賣出100元的產品，你會賠掉一些錢。';
  } else if (grossProfitMargin < 15) {
    emojiRating = '😟';
    simpleExplanation = '不太好！每賣出100元，只能賺到很少的錢。嘗試提高售價或降低成本。';
  } else if (grossProfitMargin < 30) {
    emojiRating = '😐';
    simpleExplanation = '還可以！每賣出100元，能賺到一些錢。但還有改進空間。';
  } else if (grossProfitMargin < 50) {
    emojiRating = '😊';
    simpleExplanation = '很好！每賣出100元，能賺到不少錢。你的產品定價不錯！';
  } else {
    emojiRating = '🤩';
    simpleExplanation = '太棒了！每賣出100元，能賺到很多錢。你的產品非常有價值！';
  }
  
  // 成本佔比以簡單方式表達
  const cogsRatio = (cogs / totalRevenue) * 100;
  
  analysis = `
    <p>💰 你總共賣出了 <strong>${formatCurrency(totalRevenue)}</strong> 元的商品。</p>
    <p>💸 製作這些商品花了你 <strong>${formatCurrency(cogs)}</strong> 元。</p>
    <p>🤑 所以你賺到了 <strong>${formatCurrency(grossProfit)}</strong> 元！</p>
    <p>📊 你的毛利率是 <strong>${formatPercentage(grossProfitMargin)}</strong>，這表示每賺100元，你能留下${grossProfitMargin.toFixed(0)}元。</p>
    <p>${emojiRating} <strong>簡單評價：</strong> ${simpleExplanation}</p>
  `;
  
  analysisElement.innerHTML = analysis;
}

// 計算淨利率
function calculateNetProfitMargin() {
  // 獲取輸入值
  const netRevenue = parseFloat(document.getElementById('net-revenue').value) || 0;
  const totalCost = parseFloat(document.getElementById('total-cost').value) || 0;
  
  // 計算淨利和淨利率
  const netProfit = netRevenue - totalCost;
  let netProfitMargin = 0;
  
  if (netRevenue > 0) {
    netProfitMargin = (netProfit / netRevenue) * 100;
  }
  
  // 更新結果
  document.getElementById('net-profit').textContent = formatCurrency(netProfit) + ' 元';
  document.getElementById('net-profit-margin').textContent = formatPercentage(netProfitMargin);
  
  // 產生分析
  generateNetProfitAnalysis(netRevenue, totalCost, netProfit, netProfitMargin);
}

// 產生淨利率分析
function generateNetProfitAnalysis(netRevenue, totalCost, netProfit, netProfitMargin) {
  const analysisElement = document.getElementById('npm-analysis-text');
  
  let analysis = '';
  let emojiRating = '';
  let simpleExplanation = '';
  
  // 根據淨利率評級用表情符號和簡單語言表達
  if (netProfitMargin < 0) {
    emojiRating = '😱';
    simpleExplanation = '你在賠錢！支出比收入還多，需要調整你的生意模式。';
  } else if (netProfitMargin < 5) {
    emojiRating = '😕';
    simpleExplanation = '你賺的錢很少。每賣100元，扣掉所有成本後只剩下不到5元。';
  } else if (netProfitMargin < 10) {
    emojiRating = '🙂';
    simpleExplanation = '還可以！每賣100元，最後能留在口袋的錢不多不少。';
  } else if (netProfitMargin < 20) {
    emojiRating = '😄';
    simpleExplanation = '很好！每賣100元，有不少錢能留在口袋裡。你的生意經營得不錯！';
  } else {
    emojiRating = '🥳';
    simpleExplanation = '太棒了！每賣100元，有很多錢能留在口袋裡。你的生意非常成功！';
  }
  
  analysis = `
    <p>💰 你總共賣出了 <strong>${formatCurrency(netRevenue)}</strong> 元的商品。</p>
    <p>💸 所有支出加起來花了你 <strong>${formatCurrency(totalCost)}</strong> 元。</p>
    <p>🤑 最終你賺到了 <strong>${formatCurrency(netProfit)}</strong> 元！</p>
    <p>📊 你的淨利率是 <strong>${formatPercentage(netProfitMargin)}</strong>，這表示每賺100元，最後能留在口袋的有${netProfitMargin.toFixed(0)}元。</p>
    <p>${emojiRating} <strong>簡單評價：</strong> ${simpleExplanation}</p>
  `;
  
  // 如果是賠錢的，給個簡單建議
  if (netProfitMargin < 0) {
    analysis += `
      <p>💡 <strong>小建議：</strong></p>
      <ul>
        <li>試著減少一些不必要的支出</li>
        <li>考慮提高你的產品價格</li>
        <li>想辦法賣更多產品</li>
      </ul>
    `;
  }
  
  analysisElement.innerHTML = analysis;
} 