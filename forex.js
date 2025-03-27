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

  // 設定事件監聽器
  document.getElementById('calculate-forex').addEventListener('click', calculateForex);
  document.getElementById('refresh-rate').addEventListener('click', fetchExchangeRates);
  
  // 手數增減按鈕
  document.getElementById('decrease-lot-large').addEventListener('click', () => adjustLotSize(-0.1));
  document.getElementById('decrease-lot-small').addEventListener('click', () => adjustLotSize(-0.01));
  document.getElementById('increase-lot-small').addEventListener('click', () => adjustLotSize(0.01));
  document.getElementById('increase-lot-large').addEventListener('click', () => adjustLotSize(0.1));
  
  // 輸入欄位變更時也計算
  document.getElementById('currency-pair').addEventListener('change', calculateForex);
  document.getElementById('lot-size').addEventListener('input', calculateForex);
  document.getElementById('pips').addEventListener('input', calculateForex);
  
  // 初始化
  fetchExchangeRates();
  
  // 設置自動更新匯率，每5秒更新一次
  setInterval(fetchExchangeRates, 5000);
});

// 全局匯率變數
let exchangeRates = {
  USDTWD: 31.5 // 預設值
};

// 格式化貨幣顯示 (USD)
function formatUSD(number) {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}

// 格式化貨幣顯示 (TWD)
function formatTWD(number) {
  return 'NT' + new Intl.NumberFormat('zh-TW', { 
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number).replace('$', '$');
}

// 從API獲取最新匯率
async function fetchExchangeRates() {
  try {
    // 顯示載入狀態
    const usdtwdValue = document.getElementById('usdtwd-value');
    const lastUpdated = document.getElementById('last-updated');
    const refreshButton = document.getElementById('refresh-rate');
    
    usdtwdValue.textContent = '載入中...';
    usdtwdValue.parentElement.classList.add('updating');
    refreshButton.disabled = true;
    refreshButton.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> 更新中';
    
    // API Key 需要在實際部署時設置，這裡使用免費公開的API
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    
    if (!response.ok) {
      throw new Error('無法獲取匯率數據');
    }
    
    const data = await response.json();
    
    // 獲取台幣匯率
    if (data.rates && data.rates.TWD) {
      exchangeRates.USDTWD = data.rates.TWD;
      
      // 更新UI
      usdtwdValue.textContent = exchangeRates.USDTWD.toFixed(4);
      
      // 更新時間
      const now = new Date();
      lastUpdated.textContent = now.toLocaleString('zh-TW');
      
      // 重新計算
      calculateForex();
    } else {
      throw new Error('無法找到TWD匯率數據');
    }
  } catch (error) {
    console.error('獲取匯率錯誤:', error);
    document.getElementById('usdtwd-value').textContent = '獲取失敗，使用預設值';
    
    // 使用默認匯率
    exchangeRates.USDTWD = 31.5;
    
    // 更新時間為錯誤提示
    document.getElementById('last-updated').textContent = '獲取失敗';
  } finally {
    // 恢復按鈕狀態
    const refreshButton = document.getElementById('refresh-rate');
    refreshButton.disabled = false;
    refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> 立即更新';
    
    // 移除更新中狀態
    const usdtwdValue = document.getElementById('usdtwd-value');
    usdtwdValue.parentElement.classList.remove('updating');
  }
}

// 計算每點價值
function calculatePipValue(currencyPair, lotSize) {
  // 標準手 (1.0) 的點值表 (USD)
  const standardPipValues = {
    EURUSD: 10,
    GBPUSD: 10,
    USDJPY: 9.35,  // 假設USD/JPY匯率為107，則100000/107 ≈ 935美元
    AUDUSD: 10,
    USDCHF: 10.5,  // 假設USD/CHF匯率為0.95，則10/0.95 ≈ 10.5
    USDCAD: 7.5,   // 假設USD/CAD匯率為1.33，則10/1.33 ≈ 7.5
    NZDUSD: 10,
    XAUUSD: 10     // 黃金的點值通常為每點10美元
  };
  
  // 乘以手數
  return standardPipValues[currencyPair] * parseFloat(lotSize);
}

// 計算外匯
function calculateForex() {
  // 獲取輸入值
  const currencyPair = document.getElementById('currency-pair').value;
  const lotSize = document.getElementById('lot-size').value;
  const pips = parseFloat(document.getElementById('pips').value) || 0;
  
  // 計算每點價值 (USD)
  const pipValueUSD = calculatePipValue(currencyPair, lotSize);
  
  // 計算總損益 (USD)
  let totalPnlUSD = pips * pipValueUSD;
  
  // 計算台幣價值
  const totalPnlTWD = totalPnlUSD * exchangeRates.USDTWD;
  
  // 獲利/風險比率 (假設風險為總損益的一半)
  const riskRewardRatio = Math.abs(totalPnlUSD / (pipValueUSD * 5)); // 假設停損為5點
  
  // 更新UI
  document.getElementById('pip-value').textContent = formatUSD(pipValueUSD);
  document.getElementById('total-pnl-usd').textContent = formatUSD(totalPnlUSD);
  document.getElementById('total-pnl-twd').textContent = formatTWD(totalPnlTWD);
  document.getElementById('risk-reward').textContent = riskRewardRatio.toFixed(2);
  
  // 更新顏色
  const totalPnlUsdElement = document.getElementById('total-pnl-usd');
  const totalPnlTwdElement = document.getElementById('total-pnl-twd');
  
  if (totalPnlUSD > 0) {
    totalPnlUsdElement.className = 'gold-text';
    totalPnlTwdElement.className = 'gold-text';
  } else if (totalPnlUSD < 0) {
    totalPnlUsdElement.className = 'red-text';
    totalPnlTwdElement.className = 'red-text';
  } else {
    totalPnlUsdElement.className = 'white-text';
    totalPnlTwdElement.className = 'white-text';
  }
  
  // 更新詳細資訊
  document.getElementById('detail-currency-pair').textContent = currencyPair;
  document.getElementById('detail-lot-size').textContent = lotSize;
  document.getElementById('detail-pips').textContent = pips;
  document.getElementById('detail-pip-value').textContent = formatUSD(pipValueUSD);
  document.getElementById('detail-exchange-rate').textContent = exchangeRates.USDTWD.toFixed(4);
}

// 調整手數大小
function adjustLotSize(amount) {
  const lotSizeInput = document.getElementById('lot-size');
  const currentValue = parseFloat(lotSizeInput.value) || 0;
  let newValue = currentValue + amount;
  
  // 確保不小於最小值 0.01
  if (newValue < 0.01) {
    newValue = 0.01;
  }
  
  // 保留到小數點後兩位
  newValue = Math.round(newValue * 100) / 100;
  
  // 更新輸入框
  lotSizeInput.value = newValue;
  
  // 添加高亮效果
  lotSizeInput.classList.add('highlight');
  setTimeout(() => {
    lotSizeInput.classList.remove('highlight');
  }, 300);
  
  // 執行計算
  calculateForex();
} 