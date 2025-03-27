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

  // 計算Kelly值
  const calculateKelly = document.getElementById('calculate-kelly');
  calculateKelly.addEventListener('click', calculateKellyValue);

  // 輸入欄位變更時也計算
  document.getElementById('win-rate').addEventListener('input', calculateKellyValue);
  document.getElementById('reward').addEventListener('input', calculateKellyValue);
  document.getElementById('risk').addEventListener('input', calculateKellyValue);
  document.getElementById('capital').addEventListener('input', calculateKellyValue);

  // 初始計算
  calculateKellyValue();
});

// 格式化貨幣顯示
function formatCurrency(number) {
  return new Intl.NumberFormat('zh-TW', { 
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// 計算Kelly值
function calculateKellyValue() {
  // 獲取輸入值
  const winRate = parseFloat(document.getElementById('win-rate').value) || 0;
  const reward = parseFloat(document.getElementById('reward').value) || 0;
  const risk = parseFloat(document.getElementById('risk').value) || 1; // 防止除以零
  const capital = parseFloat(document.getElementById('capital').value) || 0;

  // 計算參數
  const p = winRate / 100; // 勝率
  const q = 1 - p; // 敗率
  const b = reward / risk; // 獲利與虧損比率（風險報酬比）

  // Kelly公式：f* = (bp - q) / b
  let kellyValue = (b * p - q) / b;

  // 處理負值或異常情況
  if (kellyValue < 0 || isNaN(kellyValue)) {
    kellyValue = 0;
  }

  // 建議下注比例（通常使用Kelly的一半，降低風險）
  const suggestedBet = kellyValue / 2;
  
  // 建議下注金額
  const betAmount = capital * suggestedBet;

  // 更新顯示結果
  document.getElementById('risk-reward-ratio').textContent = b.toFixed(2);
  document.getElementById('kelly-value').textContent = (kellyValue * 100).toFixed(2) + '%';
  document.getElementById('suggested-bet').textContent = (suggestedBet * 100).toFixed(2) + '%';
  document.getElementById('bet-amount').textContent = formatCurrency(betAmount);

  // 根據Kelly值添加提示
  const kellyValueElement = document.getElementById('kelly-value');
  
  if (kellyValue <= 0) {
    kellyValueElement.className = 'red-text';
    kellyValueElement.parentElement.title = '此交易無獲利期望值，不建議交易';
  } else if (kellyValue < 0.1) {
    kellyValueElement.className = 'white-text';
    kellyValueElement.parentElement.title = '此交易獲利期望較低';
  } else if (kellyValue < 0.25) {
    kellyValueElement.className = 'white-text';
    kellyValueElement.parentElement.title = '此交易獲利期望適中';
  } else {
    kellyValueElement.className = 'gold-text';
    kellyValueElement.parentElement.title = '此交易獲利期望很高';
  }
} 