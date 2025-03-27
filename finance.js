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
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl, {
      placement: 'top',
      trigger: 'hover focus'
    });
  });

  // 設定計算按鈕事件
  const bepCalcButton = document.getElementById('calculate-bep');
  if (bepCalcButton) {
    bepCalcButton.addEventListener('click', calculateBreakEven);
  }
  
  const gpmCalcButton = document.getElementById('calculate-gpm');
  if (gpmCalcButton) {
    gpmCalcButton.addEventListener('click', calculateGPM);
  }
  
  const npmCalcButton = document.getElementById('calculate-npm');
  if (npmCalcButton) {
    npmCalcButton.addEventListener('click', calculateNPM);
  }
  
  const forexBepCalcButton = document.getElementById('calculate-forex-bep');
  if (forexBepCalcButton) {
    forexBepCalcButton.addEventListener('click', calculateForexBreakEven);
  }
  
  // 計算固定成本總額
  calculateForexFixedCost();
  
  // 監聽固定成本輸入變化
  const platformSubscriptionInput = document.getElementById('platform-subscription');
  const dataFeedsInput = document.getElementById('data-feeds');
  const toolsSoftwareInput = document.getElementById('tools-software');
  const otherFixedCostInput = document.getElementById('other-fixed-cost');
  
  if (platformSubscriptionInput) platformSubscriptionInput.addEventListener('input', calculateForexFixedCost);
  if (dataFeedsInput) dataFeedsInput.addEventListener('input', calculateForexFixedCost);
  if (toolsSoftwareInput) toolsSoftwareInput.addEventListener('input', calculateForexFixedCost);
  if (otherFixedCostInput) otherFixedCostInput.addEventListener('input', calculateForexFixedCost);

  // 設定Tab切換時的說明更新
  const pillsTab = document.getElementById('v-pills-tab');
  if (pillsTab) {
    pillsTab.addEventListener('click', function(event) {
      if (event.target.id) {
        updateCalculationInfo(event.target.id);
      }
    });
    
    // 初始化計算說明
    updateCalculationInfo('v-pills-bep-tab');
  }
  
  // 即時計算貢獻毛利率
  const unitPriceInput = document.getElementById('unit-price');
  const unitVariableCostInput = document.getElementById('unit-variable-cost');
  
  if (unitPriceInput) unitPriceInput.addEventListener('input', updateContributionMarginRatio);
  if (unitVariableCostInput) unitVariableCostInput.addEventListener('input', updateContributionMarginRatio);
  
  // 初始化
  updateContributionMarginRatio();
  updateCalculationInfo('v-pills-bep-tab');

  // 如果在外匯交易損益平衡頁面，則立即計算
  if (document.getElementById('v-pills-trade-bep') && document.getElementById('v-pills-trade-bep').classList.contains('active')) {
    calculateForexFixedCost();
    calculateForexBreakEven();
  }
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
    case 'v-pills-trade-bep-tab':
      infoElement.innerHTML = `
        <p>📌 <strong>交易損益平衡點</strong>告訴你<span class="text-warning">「需要多少成功交易才能開始獲利」</span>。</p>
        <p>考慮到辦公室租金、員工薪資等固定成本，以及你的交易勝率和風險報酬比，計算每月至少需要進行多少筆交易才能不賠錢！</p>
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
  const lossAmount = parseFloat(document.getElementById('loss-amount').value) || 0;
  
  // 計算貢獻毛利
  const contributionMargin = unitPrice - unitVariableCost;
  
  // 計算貢獻毛利率
  let contributionMarginRatio = 0;
  if (unitPrice > 0) {
    contributionMarginRatio = (contributionMargin / unitPrice) * 100;
  }
  
  // 計算損益平衡點 (單位) - 包含虧損
  let breakEvenUnits = 0;
  if (contributionMargin > 0) {
    breakEvenUnits = (fixedCost + lossAmount) / contributionMargin;
  }
  
  // 計算損益平衡點 (金額) - 包含虧損
  let breakEvenRevenue = 0;
  if (contributionMarginRatio > 0) {
    breakEvenRevenue = (fixedCost + lossAmount) / (contributionMarginRatio / 100);
  }
  
  // 更新結果
  document.getElementById('contribution-margin').textContent = formatCurrency(contributionMargin) + ' 元';
  document.getElementById('contribution-ratio-result').textContent = formatPercentage(contributionMarginRatio);
  document.getElementById('break-even-units').textContent = Math.ceil(breakEvenUnits) + ' 單位';
  document.getElementById('break-even-revenue').textContent = formatCurrency(breakEvenRevenue) + ' 元';
  
  // 產生分析
  generateBreakEvenAnalysis(fixedCost, unitPrice, unitVariableCost, lossAmount, breakEvenUnits, breakEvenRevenue);
}

// 產生損益平衡分析
function generateBreakEvenAnalysis(fixedCost, unitPrice, unitVariableCost, lossAmount, breakEvenUnits, breakEvenRevenue) {
  const analysisElement = document.getElementById('bep-analysis-text');
  const contributionMargin = unitPrice - unitVariableCost;
  const totalCostToRecover = fixedCost + lossAmount;
  
  let analysis = '';
  let emoji = '';
  
  if (unitVariableCost >= unitPrice) {
    analysis = `<div class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>警告：</strong> 你的產品成本 (${formatCurrency(unitVariableCost)} 元) 大於或等於售價 (${formatCurrency(unitPrice)} 元)。
      這樣每賣出一個產品都會虧錢，無法達到損益平衡點。請提高售價或降低成本！
    </div>`;
  } else {
    if (breakEvenUnits <= 100) {
      emoji = '🎉';
    } else if (breakEvenUnits <= 500) {
      emoji = '😊';
    } else if (breakEvenUnits <= 1000) {
      emoji = '🙂';
    } else {
      emoji = '😕';
    }
    
    analysis = `
      <p>${emoji} <strong>損益平衡分析:</strong> 您需要賣出 <strong>${Math.ceil(breakEvenUnits)}</strong> 個產品才能達到損益平衡（包含回收虧損）。</p>
      <p>🔹 每月固定成本: <strong>${formatCurrency(fixedCost)}</strong> 元</p>
      <p>🔹 需要彌補的虧損: <strong>${formatCurrency(lossAmount)}</strong> 元</p>
      <p>🔹 總需回收金額: <strong>${formatCurrency(totalCostToRecover)}</strong> 元</p>
      <p>🔹 每個產品賺: <strong>${formatCurrency(contributionMargin)}</strong> 元</p>
      <p>🔹 每賣出一個產品，就能減少 ${formatCurrency(contributionMargin)} 元的虧損</p>
      <p>🔹 當您賣出 ${Math.ceil(breakEvenUnits)} 個產品後，總收入將達到 <strong>${formatCurrency(breakEvenRevenue)}</strong> 元，此時收支平衡並回收所有虧損</p>
      
      <p class="mt-3"><strong>建議行動:</strong></p>
      <ul>
    `;
    
    if (unitVariableCost > unitPrice * 0.7) {
      analysis += `<li>您的產品成本偏高 (佔售價的 ${((unitVariableCost/unitPrice)*100).toFixed(1)}%)，可以考慮降低成本或提高售價</li>`;
    }
    
    if (breakEvenUnits > 1000) {
      analysis += `<li>您的損益平衡點較高，可以考慮：
        <ul>
          <li>降低固定成本</li>
          <li>提高產品售價</li>
          <li>尋找更便宜的供應商降低成本</li>
          <li>考慮分期回收虧損而非一次性回收</li>
        </ul>
      </li>`;
    } else {
      analysis += `<li>設立銷售目標：每月銷售 ${Math.ceil(breakEvenUnits * 1.2)} 個產品，這樣可以獲得 ${formatCurrency(contributionMargin * Math.ceil(breakEvenUnits * 0.2))} 元利潤</li>`;
    }
    
    // 虧損回收期分析
    const monthlySurplus = contributionMargin * (breakEvenUnits / 3);
    const lossRecoveryMonths = lossAmount / monthlySurplus;
    
    analysis += `<li>如果每月平均銷售 ${Math.ceil(breakEvenUnits / 3)} 個產品，需要約 ${Math.ceil(lossRecoveryMonths)} 個月才能回收虧損</li>`;
    
    analysis += `</ul>`;
  }
  
  analysisElement.innerHTML = analysis;
}

// 計算毛利率
function calculateGPM() {
  // 獲取輸入值
  const totalRevenue = parseFloat(document.getElementById('total-revenue').value) || 0;
  const cogs = parseFloat(document.getElementById('cogs').value) || 0;
  const previousLoss = parseFloat(document.getElementById('previous-loss').value) || 0;
  
  // 計算毛利
  const grossProfit = totalRevenue - cogs;
  
  // 計算實際毛利 (扣除前期虧損)
  const actualGrossProfit = grossProfit - previousLoss;
  
  // 計算毛利率
  let grossProfitMargin = 0;
  if (totalRevenue > 0) {
    grossProfitMargin = (grossProfit / totalRevenue) * 100;
  }
  
  // 計算實際毛利率 (扣除前期虧損)
  let actualGrossProfitMargin = 0;
  if (totalRevenue > 0) {
    actualGrossProfitMargin = (actualGrossProfit / totalRevenue) * 100;
  }
  
  // 更新結果
  document.getElementById('gross-profit').textContent = formatCurrency(grossProfit) + ' 元';
  document.getElementById('gross-profit-margin').textContent = formatPercentage(grossProfitMargin);
  
  // 產生分析
  generateGPMAnalysis(totalRevenue, cogs, grossProfit, grossProfitMargin, previousLoss, actualGrossProfit, actualGrossProfitMargin);
}

// 產生毛利率分析
function generateGPMAnalysis(totalRevenue, cogs, grossProfit, grossProfitMargin, previousLoss, actualGrossProfit, actualGrossProfitMargin) {
  const analysisElement = document.getElementById('gpm-analysis-text');
  
  let analysis = '';
  let emoji = '';
  let color = '';
  
  if (grossProfitMargin <= 0) {
    emoji = '😨';
    color = 'danger';
    analysis = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>警告：</strong> 你的毛利率為 ${formatPercentage(grossProfitMargin)}，這表示你賣的東西連材料成本都收不回來！
        請立即調整產品售價或尋找更便宜的材料供應商。
      </div>
    `;
  } else {
    if (grossProfitMargin >= 50) {
      emoji = '🎉';
      color = 'success';
    } else if (grossProfitMargin >= 30) {
      emoji = '😊';
      color = 'success';
    } else if (grossProfitMargin >= 15) {
      emoji = '🙂';
      color = 'warning';
    } else {
      emoji = '😕';
      color = 'danger';
    }
    
    analysis = `
      <p>${emoji} <strong>毛利率分析:</strong> 你的毛利率是 <strong class="text-${color}">${formatPercentage(grossProfitMargin)}</strong>。</p>
      <p>🔹 總銷售額: <strong>${formatCurrency(totalRevenue)}</strong> 元</p>
      <p>🔹 總材料成本: <strong>${formatCurrency(cogs)}</strong> 元</p>
      <p>🔹 毛利: <strong>${formatCurrency(grossProfit)}</strong> 元</p>
    `;
    
    if (previousLoss > 0) {
      const lossEmoji = actualGrossProfit < 0 ? '😰' : '😌';
      const lossColor = actualGrossProfit < 0 ? 'danger' : 'warning';
      
      analysis += `
        <p>🔹 前期虧損: <strong class="text-danger">-${formatCurrency(previousLoss)}</strong> 元</p>
        <p>🔹 扣除虧損後實際毛利: <strong class="text-${lossColor}">${formatCurrency(actualGrossProfit)}</strong> 元</p>
        <p>🔹 扣除虧損後實際毛利率: <strong class="text-${lossColor}">${formatPercentage(actualGrossProfitMargin)}</strong></p>
        <p>${lossEmoji} <strong>虧損回收狀況:</strong> ${actualGrossProfit < 0 ? '還不足以回收前期虧損' : '已部分回收前期虧損'}</p>
      `;
    }
    
    analysis += `<p>🔹 這表示每賣出 100 元的商品，扣除材料成本後你能賺 <strong>${Math.round(grossProfitMargin)}</strong> 元</p>
      
      <p class="mt-3"><strong>毛利率評估:</strong></p>
    `;
    
    if (grossProfitMargin >= 50) {
      analysis += `<p class="text-success">太棒了！你的毛利率非常優秀，表示你的產品有很高的價值或很低的材料成本。</p>`;
    } else if (grossProfitMargin >= 30) {
      analysis += `<p class="text-success">很好！你的毛利率健康，有足夠的利潤空間支付其他費用並獲利。</p>`;
    } else if (grossProfitMargin >= 15) {
      analysis += `<p class="text-warning">注意！你的毛利率偏低，可能難以支付所有經營費用並獲利。</p>`;
    } else {
      analysis += `<p class="text-danger">警告！你的毛利率過低，很可能無法支付所有費用，導致虧損。</p>`;
    }
    
    // 考慮虧損回收的建議
    if (previousLoss > 0) {
      analysis += `
        <p class="mt-3"><strong>虧損回收建議:</strong></p>
        <ul>
      `;
      
      if (actualGrossProfit <= 0) {
        analysis += `
          <li class="text-danger">當前毛利不足以回收虧損，需要提高毛利率</li>
          <li>考慮顯著提高售價或大幅降低成本</li>
          <li>評估是否繼續現有業務模式，或考慮轉型</li>
        `;
      } else {
        const recoveryMonths = Math.ceil(previousLoss / actualGrossProfit);
        
        analysis += `
          <li>按目前毛利水平，預計需要 <strong>${recoveryMonths}</strong> 個月才能完全回收虧損</li>
          <li>考慮增加銷售量或提高毛利率以加速回收</li>
          <li>密切關注現金流，確保運營期間有足夠資金</li>
        `;
      }
      
      analysis += `</ul>`;
    }
    
    analysis += `
      <p class="mt-3"><strong>一般建議行動:</strong></p>
      <ul>
    `;
    
    if (grossProfitMargin < 30) {
      analysis += `
        <li>考慮提高產品售價</li>
        <li>尋找更便宜的供應商降低材料成本</li>
        <li>優化產品設計，減少材料使用</li>
      `;
    } else {
      analysis += `
        <li>維持現有的定價策略</li>
        <li>考慮推出高價值產品線，進一步提高毛利</li>
      `;
    }
    
    analysis += `</ul>`;
  }
  
  analysisElement.innerHTML = analysis;
}

// 計算淨利率
function calculateNPM() {
  // 獲取輸入值
  const netRevenue = parseFloat(document.getElementById('net-revenue').value) || 0;
  const totalCost = parseFloat(document.getElementById('total-cost').value) || 0;
  const accumulatedLoss = parseFloat(document.getElementById('accumulated-loss').value) || 0;
  
  // 計算淨利
  const netProfit = netRevenue - totalCost;
  
  // 計算實際淨利 (扣除累計虧損)
  const actualNetProfit = netProfit - accumulatedLoss;
  
  // 計算淨利率
  let netProfitMargin = 0;
  if (netRevenue > 0) {
    netProfitMargin = (netProfit / netRevenue) * 100;
  }
  
  // 計算實際淨利率 (扣除累計虧損)
  let actualNetProfitMargin = 0;
  if (netRevenue > 0) {
    actualNetProfitMargin = (actualNetProfit / netRevenue) * 100;
  }
  
  // 更新結果
  document.getElementById('net-profit').textContent = formatCurrency(netProfit) + ' 元';
  document.getElementById('net-profit-margin').textContent = formatPercentage(netProfitMargin);
  
  // 產生分析
  generateNPMAnalysis(netRevenue, totalCost, netProfit, netProfitMargin, accumulatedLoss, actualNetProfit, actualNetProfitMargin);
}

// 產生淨利率分析
function generateNPMAnalysis(netRevenue, totalCost, netProfit, netProfitMargin, accumulatedLoss, actualNetProfit, actualNetProfitMargin) {
  const analysisElement = document.getElementById('npm-analysis-text');
  
  let analysis = '';
  let emoji = '';
  let color = '';
  
  if (netProfitMargin <= 0) {
    emoji = '😨';
    color = 'danger';
    analysis = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>警告：</strong> 你的淨利率為 ${formatPercentage(netProfitMargin)}，這表示你的生意正在虧損！
        所有收入都不足以支付所有成本。請立即檢討你的定價策略和成本結構。
      </div>
    `;
  } else {
    if (netProfitMargin >= 20) {
      emoji = '🎉';
      color = 'success';
    } else if (netProfitMargin >= 10) {
      emoji = '😊';
      color = 'success';
    } else if (netProfitMargin >= 5) {
      emoji = '🙂';
      color = 'warning';
    } else {
      emoji = '😕';
      color = 'danger';
    }
    
    analysis = `
      <p>${emoji} <strong>淨利率分析:</strong> 你的淨利率是 <strong class="text-${color}">${formatPercentage(netProfitMargin)}</strong>。</p>
      <p>🔹 總收入: <strong>${formatCurrency(netRevenue)}</strong> 元</p>
      <p>🔹 總成本: <strong>${formatCurrency(totalCost)}</strong> 元</p>
      <p>🔹 淨利: <strong>${formatCurrency(netProfit)}</strong> 元</p>
    `;
    
    if (accumulatedLoss > 0) {
      const lossEmoji = actualNetProfit < 0 ? '😰' : '😌';
      const lossColor = actualNetProfit < 0 ? 'danger' : 'warning';
      
      analysis += `
        <p>🔹 累計虧損: <strong class="text-danger">-${formatCurrency(accumulatedLoss)}</strong> 元</p>
        <p>🔹 扣除累計虧損後實際淨利: <strong class="text-${lossColor}">${formatCurrency(actualNetProfit)}</strong> 元</p>
        <p>🔹 扣除累計虧損後實際淨利率: <strong class="text-${lossColor}">${formatPercentage(actualNetProfitMargin)}</strong></p>
        <p>${lossEmoji} <strong>虧損回收狀況:</strong> ${actualNetProfit < 0 ? '還不足以回收累計虧損' : '已部分回收累計虧損'}</p>
      `;
    }
    
    analysis += `<p>🔹 這表示每賺進 100 元，扣除所有成本後，你能放進口袋 <strong>${Math.round(netProfitMargin)}</strong> 元</p>
      
      <p class="mt-3"><strong>淨利率評估:</strong></p>
    `;
    
    if (netProfitMargin >= 20) {
      analysis += `<p class="text-success">太棒了！你的淨利率非常優秀，表示你的生意非常健康且有很強的獲利能力。</p>`;
    } else if (netProfitMargin >= 10) {
      analysis += `<p class="text-success">很好！你的淨利率健康，生意能夠產生穩定的利潤。</p>`;
    } else if (netProfitMargin >= 5) {
      analysis += `<p class="text-warning">注意！你的淨利率稍低，雖然有獲利但利潤空間較小。</p>`;
    } else {
      analysis += `<p class="text-danger">警告！你的淨利率過低，利潤很微薄，任何成本上升都可能導致虧損。</p>`;
    }
    
    // 考慮虧損回收的建議
    if (accumulatedLoss > 0) {
      analysis += `
        <p class="mt-3"><strong>虧損回收建議:</strong></p>
        <ul>
      `;
      
      if (actualNetProfit <= 0) {
        analysis += `
          <li class="text-danger">當前淨利不足以回收累計虧損，需要顯著提高淨利</li>
          <li>考慮大幅削減非必要支出</li>
          <li>重新評估產品線，可能需要放棄低利潤產品</li>
          <li>尋求財務重組或外部融資以解決累計虧損問題</li>
        `;
      } else {
        const recoveryMonths = Math.ceil(accumulatedLoss / actualNetProfit);
        
        analysis += `
          <li>按目前淨利水平，預計需要 <strong>${recoveryMonths}</strong> 個月才能完全回收累計虧損</li>
          <li>制定明確的虧損回收計劃，設定階段性目標</li>
          <li>暫時避免大額投資或擴張，優先處理累計虧損</li>
          <li>考慮向股東/投資者提交虧損回收時間表，保持透明度</li>
        `;
      }
      
      analysis += `</ul>`;
    }
    
    analysis += `
      <p class="mt-3"><strong>一般建議行動:</strong></p>
      <ul>
    `;
    
    if (netProfitMargin < 10) {
      analysis += `
        <li>檢討並減少營運成本</li>
        <li>提高產品售價</li>
        <li>考慮增加更高利潤的產品或服務</li>
      `;
    } else {
      analysis += `
        <li>維持現有的經營策略</li>
        <li>考慮擴大規模，增加總利潤</li>
        <li>探索新市場或新產品線</li>
      `;
    }
    
    analysis += `</ul>`;
  }
  
  analysisElement.innerHTML = analysis;
}

// 計算固定成本總額
function calculateForexFixedCost() {
  const platformSubscription = parseFloat(document.getElementById('platform-subscription').value) || 0;
  const dataFeeds = parseFloat(document.getElementById('data-feeds').value) || 0;
  const toolsSoftware = parseFloat(document.getElementById('tools-software').value) || 0;
  const otherFixedCost = parseFloat(document.getElementById('other-fixed-cost').value) || 0;
  
  const totalFixedCost = platformSubscription + dataFeeds + toolsSoftware + otherFixedCost;
  document.getElementById('total-fixed-cost').value = totalFixedCost.toFixed(0);
  
  return totalFixedCost;
}

// 計算外匯交易損益平衡點
function calculateForexBreakEven() {
  // 獲取固定成本
  const platformSubscription = parseFloat(document.getElementById('platform-subscription').value) || 0;
  const dataFeeds = parseFloat(document.getElementById('data-feeds').value) || 0;
  const toolsSoftware = parseFloat(document.getElementById('tools-software').value) || 0;
  const otherFixedCost = parseFloat(document.getElementById('other-fixed-cost').value) || 0;
  const totalFixedCost = platformSubscription + dataFeeds + toolsSoftware + otherFixedCost;
  
  // 獲取交易參數
  const avgWinAmount = parseFloat(document.getElementById('avg-win-amount').value) || 0;
  const avgLossAmount = parseFloat(document.getElementById('avg-loss-amount').value) || 0;
  const winPercentage = parseFloat(document.getElementById('win-percentage').value) || 0;
  const commissionFee = parseFloat(document.getElementById('commission-fee').value) || 0;
  const exchangeRate = parseFloat(document.getElementById('exchange-rate').value) || 31.5;
  
  // 獲取交易頻率
  const tradesPerDay = parseFloat(document.getElementById('trades-per-day').value) || 3;
  const TRADING_DAYS_MONTHLY = 20; // 假設每月固定20個交易日
  
  // 獲取目標設定
  const targetProfit = parseFloat(document.getElementById('target-profit').value) || 0;
  
  // 計算每筆成功交易的實際淨利 (扣除手續費)
  const netWinAmount = avgWinAmount - commissionFee;
  
  // 計算每筆虧損交易的實際淨虧損 (加上手續費)
  const netLossAmount = avgLossAmount + commissionFee;
  
  // 顯示總固定成本
  document.getElementById('total-fixed-cost').value = totalFixedCost.toFixed(2);
  document.getElementById('monthly-fixed-cost').textContent = `${totalFixedCost.toFixed(2)} 美元`;
  
  // 計算需要贏多少次才能覆蓋一次虧損
  let winsNeededPerLoss = 0;
  if (netWinAmount > 0) {
    winsNeededPerLoss = Math.ceil(netLossAmount / netWinAmount);
  } else {
    winsNeededPerLoss = Infinity;
  }
  
  // 計算一組交易（包含贏和輸）的淨利
  // 例如：需要2次獲利才能覆蓋1次虧損，則一組交易是3筆（2贏1輸）
  const tradesPerGroup = winsNeededPerLoss + 1; // 贏的次數 + 輸的次數(1)
  const profitPerGroup = (netWinAmount * winsNeededPerLoss) - netLossAmount;
  
  // 計算損益平衡所需的交易組數
  let breakEvenGroups = 0;
  if (profitPerGroup > 0) {
    breakEvenGroups = Math.ceil(totalFixedCost / profitPerGroup);
  } else {
    breakEvenGroups = Infinity;
  }
  
  // 計算損益平衡所需的總交易次數
  const breakEvenTrades = breakEvenGroups * tradesPerGroup;
  
  // 計算損益平衡所需的贏輸次數
  const breakEvenWins = breakEvenGroups * winsNeededPerLoss;
  const breakEvenLosses = breakEvenGroups;
  
  // 計算目標利潤所需的交易組數
  let targetGroups = 0;
  if (profitPerGroup > 0) {
    targetGroups = Math.ceil((totalFixedCost + targetProfit) / profitPerGroup);
  } else {
    targetGroups = Infinity;
  }
  
  // 計算目標利潤所需的總交易次數
  const targetTrades = targetGroups * tradesPerGroup;
  
  // 計算目標利潤所需的贏輸次數
  const targetWins = targetGroups * winsNeededPerLoss;
  const targetLosses = targetGroups;
  
  // 計算每月可進行的交易次數
  const monthlyTrades = TRADING_DAYS_MONTHLY * tradesPerDay;
  
  // 計算每日、每週所需交易次數
  const dailyTradesNeeded = (breakEvenTrades / TRADING_DAYS_MONTHLY).toFixed(1);
  
  // 計算月淨利 (假設每月完成monthlyTrades次交易)
  const monthlyTradeGroups = Math.floor(monthlyTrades / tradesPerGroup);
  const monthlyNetProfitUSD = (profitPerGroup * monthlyTradeGroups - totalFixedCost).toFixed(2);
  const monthlyNetProfitTWD = (parseFloat(monthlyNetProfitUSD) * exchangeRate).toFixed(0);
  
  // 計算平均每筆交易淨利
  // 基於交易組的計算方式
  const avgTradeProfit = profitPerGroup / tradesPerGroup;

  // 基於勝率的計算方式 (期望值)
  const avgTradeProfitByWinRate = (netWinAmount * (winPercentage / 100)) - (netLossAmount * (1 - winPercentage / 100));

  // 顯示交易模式和效益
  document.getElementById('avg-trade-profit').innerHTML = `${avgTradeProfit.toFixed(2)} 美元 <small class="text-muted">(組合計算)</small><br><small class="text-info">${avgTradeProfitByWinRate.toFixed(2)} 美元 (勝率計算)</small>`;
  document.getElementById('trade-pattern').textContent = `每 ${tradesPerGroup} 筆交易: ${winsNeededPerLoss} 贏 + 1 輸`;
  document.getElementById('daily-trades-needed').textContent = `${dailyTradesNeeded} 筆`;
  document.getElementById('actual-daily-trades').textContent = `${tradesPerDay} 筆`;
  document.getElementById('total-monthly-trades').textContent = `${monthlyTrades} 筆`;
  
  // 顯示財務分析結果
  document.getElementById('break-even-trades').textContent = `${breakEvenTrades} 筆 (${breakEvenGroups} 組)`;
  document.getElementById('break-even-win-loss').textContent = `${breakEvenWins} 贏 + ${breakEvenLosses} 輸`;
  document.getElementById('target-trades').textContent = `${targetTrades} 筆 (${targetGroups} 組)`;
  document.getElementById('target-win-loss').textContent = `${targetWins} 贏 + ${targetLosses} 輸`;
  document.getElementById('monthly-net-profit-usd').textContent = `${monthlyNetProfitUSD} 美元`;
  document.getElementById('monthly-net-profit-twd').textContent = `${monthlyNetProfitTWD} 元`;
  
  // 生成敏感性分析
  generateDirectSensitivityAnalysis(totalFixedCost, netWinAmount, netLossAmount, targetProfit);
  
  // 生成分析文字
  generateDirectForexAnalysis(netWinAmount, netLossAmount, winsNeededPerLoss, breakEvenTrades, breakEvenWins, breakEvenLosses, monthlyTrades, targetTrades, targetWins, targetLosses, monthlyNetProfitUSD, exchangeRate);
  
  // 生成圖表
  generateDirectProfitChart(totalFixedCost, profitPerGroup, tradesPerGroup, monthlyTrades, targetTrades, breakEvenTrades);
}

function generateDirectSensitivityAnalysis(totalFixedCost, netWinAmount, netLossAmount, targetProfit) {
  // 清除舊有樣式
  const cells = document.querySelectorAll('#sensitivity-table td[class^="win-rate-"], #sensitivity-table td[class^="profit-"], #sensitivity-table td[class^="loss-"]');
  cells.forEach(cell => {
    cell.classList.remove('text-danger', 'text-warning', 'text-success');
    cell.textContent = '--';
  });
  
  // 計算基準值
  const baseWinsNeeded = Math.ceil(netLossAmount / netWinAmount);
  const baseTradesPerGroup = baseWinsNeeded + 1;
  const baseProfitPerGroup = (netWinAmount * baseWinsNeeded) - netLossAmount;
  const baseTargetGroups = baseProfitPerGroup > 0 ? Math.ceil((totalFixedCost + targetProfit) / baseProfitPerGroup) : Infinity;
  const baseTargetTrades = baseTargetGroups * baseTradesPerGroup;
  
  // 勝率變化 (這裡改為贏/輸比例變化)
  // 由於不再使用勝率，但保留UI元素，我們轉為計算"每次虧損所需的獲利次數"的變化
  const ratioVariations = [-30, -20, -10, 0, 10, 20, 30];
  for (let i = 0; i < ratioVariations.length; i++) {
    const variation = ratioVariations[i];
    
    // 調整後的贏/輸比例
    let adjustedWinsNeeded = baseWinsNeeded;
    if (variation < 0) {
      // 負變化，需要更多贏來抵消一次輸
      adjustedWinsNeeded = Math.ceil(baseWinsNeeded * (1 + Math.abs(variation) / 100));
    } else if (variation > 0) {
      // 正變化，需要更少贏來抵消一次輸
      adjustedWinsNeeded = Math.max(1, Math.floor(baseWinsNeeded * (1 - variation / 100)));
    }
    
    const adjustedTradesPerGroup = adjustedWinsNeeded + 1;
    const adjustedProfitPerGroup = (netWinAmount * adjustedWinsNeeded) - netLossAmount;
    let tradesNeeded = Infinity;
    
    if (adjustedProfitPerGroup > 0) {
      const groupsNeeded = Math.ceil((totalFixedCost + targetProfit) / adjustedProfitPerGroup);
      tradesNeeded = groupsNeeded * adjustedTradesPerGroup;
    }
    
    let cellClass;
    if (variation < 0) {
      cellClass = `win-rate-minus-${Math.abs(variation)}`;
    } else if (variation === 0) {
      cellClass = 'win-rate-base';
    } else {
      cellClass = `win-rate-plus-${variation}`;
    }
    
    const cell = document.querySelector(`#sensitivity-table td.${cellClass}`);
    if (cell) {
      if (tradesNeeded === Infinity) {
        cell.textContent = '∞';
        cell.classList.add('text-danger');
      } else {
        cell.textContent = tradesNeeded + ' 筆';
        
        if (tradesNeeded <= baseTargetTrades * 0.8) {
          cell.classList.add('text-success');
        } else if (tradesNeeded >= baseTargetTrades * 1.2) {
          cell.classList.add('text-danger');
        } else {
          cell.classList.add('text-warning');
        }
      }
    }
  }
  
  // 獲利金額變化
  const profitVariations = [-30, -20, -10, 0, 10, 20, 30];
  for (let i = 0; i < profitVariations.length; i++) {
    const variation = profitVariations[i];
    const adjustedNetWinAmount = netWinAmount * (1 + variation / 100);
    const adjustedWinsNeeded = Math.ceil(netLossAmount / adjustedNetWinAmount);
    const adjustedTradesPerGroup = adjustedWinsNeeded + 1;
    const adjustedProfitPerGroup = (adjustedNetWinAmount * adjustedWinsNeeded) - netLossAmount;
    let tradesNeeded = Infinity;
    
    if (adjustedProfitPerGroup > 0) {
      const groupsNeeded = Math.ceil((totalFixedCost + targetProfit) / adjustedProfitPerGroup);
      tradesNeeded = groupsNeeded * adjustedTradesPerGroup;
    }
    
    let cellClass;
    if (variation < 0) {
      cellClass = `profit-minus-${Math.abs(variation)}`;
    } else if (variation === 0) {
      cellClass = 'profit-base';
    } else {
      cellClass = `profit-plus-${variation}`;
    }
    
    const cell = document.querySelector(`#sensitivity-table td.${cellClass}`);
    if (cell) {
      if (tradesNeeded === Infinity) {
        cell.textContent = '∞';
        cell.classList.add('text-danger');
      } else {
        cell.textContent = tradesNeeded + ' 筆';
        
        if (tradesNeeded <= baseTargetTrades * 0.8) {
          cell.classList.add('text-success');
        } else if (tradesNeeded >= baseTargetTrades * 1.2) {
          cell.classList.add('text-danger');
        } else {
          cell.classList.add('text-warning');
        }
      }
    }
  }
  
  // 虧損金額變化
  const lossVariations = [-30, -20, -10, 0, 10, 20, 30];
  for (let i = 0; i < lossVariations.length; i++) {
    const variation = lossVariations[i];
    const adjustedNetLossAmount = netLossAmount * (1 + variation / 100);
    const adjustedWinsNeeded = Math.ceil(adjustedNetLossAmount / netWinAmount);
    const adjustedTradesPerGroup = adjustedWinsNeeded + 1;
    const adjustedProfitPerGroup = (netWinAmount * adjustedWinsNeeded) - adjustedNetLossAmount;
    let tradesNeeded = Infinity;
    
    if (adjustedProfitPerGroup > 0) {
      const groupsNeeded = Math.ceil((totalFixedCost + targetProfit) / adjustedProfitPerGroup);
      tradesNeeded = groupsNeeded * adjustedTradesPerGroup;
    }
    
    let cellClass;
    if (variation < 0) {
      cellClass = `loss-minus-${Math.abs(variation)}`;
    } else if (variation === 0) {
      cellClass = 'loss-base';
    } else {
      cellClass = `loss-plus-${variation}`;
    }
    
    const cell = document.querySelector(`#sensitivity-table td.${cellClass}`);
    if (cell) {
      if (tradesNeeded === Infinity) {
        cell.textContent = '∞';
        cell.classList.add('text-danger');
      } else {
        cell.textContent = tradesNeeded + ' 筆';
        
        // 對於虧損，減少是好事，增加是壞事
        if (variation < 0 && tradesNeeded <= baseTargetTrades * 0.8) {
          cell.classList.add('text-success');
        } else if (variation > 0 && tradesNeeded >= baseTargetTrades * 1.2) {
          cell.classList.add('text-danger');
        } else {
          cell.classList.add('text-warning');
        }
      }
    }
  }
}

function generateDirectForexAnalysis(netWinAmount, netLossAmount, winsNeededPerLoss, breakEvenTrades, breakEvenWins, breakEvenLosses, monthlyTrades, targetTrades, targetWins, targetLosses, monthlyNetProfit, exchangeRate) {
  const analysisElement = document.getElementById('forex-bep-analysis-text');
  let analysisText = '';
  
  if (netWinAmount <= 0 || winsNeededPerLoss === Infinity) {
    analysisText = `<strong class="text-danger">❌ 交易系統問題!</strong> 目前的交易參數顯示每筆獲利交易扣除手續費後的淨利 ${netWinAmount.toFixed(2)} 美元不足以覆蓋虧損 ${netLossAmount.toFixed(2)} 美元。<br><br>
    <strong>改善建議:</strong><br>
    1. 提高每筆獲利金額<br>
    2. 降低每筆虧損金額<br>
    3. 減少手續費支出`;
  } else {
    const dailyTradeCount = monthlyTrades / TRADING_DAYS_MONTHLY;
    const dailyBreakEvenCount = breakEvenTrades / TRADING_DAYS_MONTHLY;
    
    if (monthlyTrades < breakEvenTrades) {
      const deficit = Math.ceil(breakEvenTrades - monthlyTrades);
      const dailyDeficit = (deficit / TRADING_DAYS_MONTHLY).toFixed(1);
      
      analysisText = `<strong class="text-warning">⚠️ 未達損益平衡:</strong> 按照目前每天 ${dailyTradeCount} 筆交易（每月共 ${monthlyTrades} 筆）的頻率，尚未達到損益平衡所需的 ${breakEvenTrades} 筆交易。<br><br>
      每天需要交易 <strong>${dailyBreakEvenCount.toFixed(1)} 筆</strong>才能達到損益平衡，您需要每天再增加 ${dailyDeficit} 筆交易。<br><br>
      具體來說，達到損益平衡需要 <strong>${breakEvenWins} 筆獲利交易</strong> 和 <strong>${breakEvenLosses} 筆虧損交易</strong>。<br><br>
      <strong>建議:</strong><br>
      1. 增加每日交易頻率，從目前的 ${dailyTradeCount} 筆提高到至少 ${dailyBreakEvenCount.toFixed(1)} 筆<br>
      2. 提高每筆獲利金額 (目前為 ${netWinAmount.toFixed(2)} 美元)<br>
      3. 降低每筆虧損金額 (目前為 ${netLossAmount.toFixed(2)} 美元)`;
    } else if (monthlyTrades < targetTrades) {
      const remainingTrades = Math.ceil(targetTrades - monthlyTrades);
      const dailyTarget = targetTrades / TRADING_DAYS_MONTHLY;
      const currentProfit = parseFloat(monthlyNetProfit);
      
      analysisText = `<strong class="text-success">✅ 已達損益平衡</strong> 但尚未達到目標利潤。<br><br>
      目前每天 ${dailyTradeCount} 筆交易（每月共 ${monthlyTrades} 筆）可產生約 ${currentProfit.toFixed(2)} 美元的月淨利（約 ${(currentProfit * exchangeRate).toFixed(0)} 台幣）。<br><br>
      要達到目標利潤，每天需要交易 <strong>${dailyTarget.toFixed(1)} 筆</strong>，目前還差 ${(remainingTrades / TRADING_DAYS_MONTHLY).toFixed(1)} 筆/天。<br><br>
      您的交易模式表明：每 ${winsNeededPerLoss+1} 筆交易中需有 ${winsNeededPerLoss} 筆獲利、1筆虧損才能獲利。<br><br>
      <strong>要達到目標:</strong> 您需要 <strong>${targetWins} 筆獲利交易</strong> 和 <strong>${targetLosses} 筆虧損交易</strong>才能達到設定的月度目標利潤。<br><br>
      <strong>建議行動:</strong><br>
      1. 保持現有的交易效率，稍微增加每日交易次數<br>
      2. 嘗試提升每筆獲利金額`;
    } else {
      const excessTrades = Math.floor(monthlyTrades - targetTrades);
      const dailyExcess = (excessTrades / TRADING_DAYS_MONTHLY).toFixed(1);
      const currentProfit = parseFloat(monthlyNetProfit);
      
      analysisText = `<strong class="text-success">🎉 達成目標!</strong> 您的交易系統每月可產生約 ${currentProfit.toFixed(2)} 美元的淨利（約 ${(currentProfit * exchangeRate).toFixed(0)} 台幣）。<br><br>
      目前每天 ${dailyTradeCount} 筆交易（每月共 ${monthlyTrades} 筆）已超過達到目標所需的 ${(targetTrades / TRADING_DAYS_MONTHLY).toFixed(1)} 筆/天（每月共 ${targetTrades} 筆），每天多出 ${dailyExcess} 筆交易的獲利空間。<br><br>
      您的交易效率顯示：每 ${winsNeededPerLoss+1} 筆交易中有 ${winsNeededPerLoss} 筆獲利、1筆虧損，這是一個健康的交易比例。<br><br>
      <strong>後續優化:</strong><br>
      1. 考慮增加資金規模<br>
      2. 進一步優化交易系統，提高每筆獲利<br>
      3. 設定更高的利潤目標`;
    }
  }
  
  analysisElement.innerHTML = analysisText;
}

function generateDirectProfitChart(totalFixedCost, profitPerGroup, tradesPerGroup, monthlyTrades, targetTrades, breakEvenTrades) {
  const chartCanvas = document.getElementById('profit-chart');
  
  // 確保 Chart.js 已載入
  if (typeof Chart === 'undefined') {
    console.error('Chart.js not loaded');
    return;
  }
  
  // 如果已存在圖表，先銷毀
  if (chartCanvas.chart) {
    chartCanvas.chart.destroy();
  }
  
  // 計算一些基準值
  const maxTrades = Math.max(monthlyTrades, targetTrades) * 1.5;
  const winsPerGroup = tradesPerGroup - 1; // 每組中的獲利交易數
  
  // 建立交易次數陣列
  const trades = [];
  const grossProfits = [];
  const netProfits = [];
  
  const step = Math.max(tradesPerGroup, Math.floor(maxTrades / 20)); // 確保不超過20個數據點且是交易組的倍數
  
  for (let i = 0; i <= maxTrades; i += step) {
    trades.push(i);
    const groups = Math.floor(i / tradesPerGroup);
    const grossProfit = groups * profitPerGroup;
    grossProfits.push(grossProfit);
    netProfits.push(grossProfit - totalFixedCost);
  }
  
  // 創建圖表
  const ctx = chartCanvas.getContext('2d');
  chartCanvas.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trades,
      datasets: [
        {
          label: '毛利潤',
          data: grossProfits,
          borderColor: 'rgba(255, 215, 0, 0.8)',
          backgroundColor: 'rgba(255, 215, 0, 0.1)',
          borderWidth: 2,
          fill: false
        },
        {
          label: '淨利潤',
          data: netProfits,
          borderColor: 'rgba(46, 204, 113, 0.8)',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          borderWidth: 2,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '交易次數與利潤關係',
          color: '#ffffff'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            footer: function(tooltipItems) {
              const dataIndex = tooltipItems[0].dataIndex;
              const tradeCount = trades[dataIndex];
              
              // 計算贏輸次數
              const groups = Math.floor(tradeCount / tradesPerGroup);
              const wins = groups * winsPerGroup;  // 使用正確的winsPerGroup變數
              const losses = groups;
              
              return `贏輸次數: ${wins} 贏 ${losses} 輸`;
            }
          }
        },
        legend: {
          labels: {
            color: '#ffffff'
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '交易次數',
            color: '#ffffff'
          },
          ticks: {
            color: '#cccccc'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        y: {
          title: {
            display: true,
            text: '利潤 (美元)',
            color: '#ffffff'
          },
          ticks: {
            color: '#cccccc'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      },
      annotation: {
        annotations: {
          breakEvenLine: {
            type: 'line',
            mode: 'horizontal',
            scaleID: 'y',
            value: 0,
            borderColor: 'rgba(255, 99, 132, 0.7)',
            borderWidth: 2,
            label: {
              enabled: true,
              content: '損益平衡點',
              position: 'left',
              backgroundColor: 'rgba(255, 99, 132, 0.7)'
            }
          },
          breakEvenTradesLine: {
            type: 'line',
            mode: 'vertical',
            scaleID: 'x',
            value: breakEvenTrades,
            borderColor: 'rgba(255, 99, 132, 0.7)',
            borderWidth: 2,
            label: {
              enabled: true,
              content: `損益平衡: ${breakEvenTrades} 筆`,
              position: 'top',
              backgroundColor: 'rgba(255, 99, 132, 0.7)'
            }
          },
          currentTrades: {
            type: 'line',
            mode: 'vertical',
            scaleID: 'x',
            value: monthlyTrades,
            borderColor: 'rgba(54, 162, 235, 0.7)',
            borderWidth: 2,
            label: {
              enabled: true,
              content: `當前月交易: ${monthlyTrades} 筆`,
              position: 'top',
              backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }
          },
          targetTrades: {
            type: 'line',
            mode: 'vertical',
            scaleID: 'x',
            value: targetTrades,
            borderColor: 'rgba(46, 204, 113, 0.7)',
            borderWidth: 2,
            label: {
              enabled: true,
              content: `目標: ${targetTrades} 筆`,
              position: 'top',
              backgroundColor: 'rgba(46, 204, 113, 0.7)'
            }
          }
        }
      }
    }
  });
} 