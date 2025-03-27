// 初始設定
let principal = 0; // 本金
let rate = 0; // 月報酬率
let salary = 0; // 月薪
const expenses = {
  食: 0,
  衣: 0,
  住: 0,
  行: 0,
  育: 0,
  樂: 0,
  社交: 0
};

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
});

// 格式化貨幣顯示
function formatCurrency(number) {
  return new Intl.NumberFormat('zh-TW', { 
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

// 更新結果
function updateResults() {
  const monthlyProfit = (principal * rate) / 100; // 月報酬
  const yearlyProfit = monthlyProfit * 12; // 年報酬
  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0); // 總消費
  const monthlyIncome = salary + monthlyProfit; // 月收入
  const yearlyIncome = monthlyIncome * 12; // 年收入
  const monthlySurplus = monthlyIncome - totalExpenses; // 月盈餘
  const yearlySurplus = monthlySurplus * 12; // 年盈餘

  // 更新顯示
  document.getElementById('monthly-income').textContent = formatCurrency(monthlyIncome);
  document.getElementById('yearly-income').textContent = formatCurrency(yearlyIncome);
  document.getElementById('monthly-expenses').textContent = formatCurrency(totalExpenses);
  document.getElementById('yearly-expenses').textContent = formatCurrency(totalExpenses * 12);
  document.getElementById('monthly-surplus').textContent = formatCurrency(monthlySurplus);
  document.getElementById('yearly-surplus').textContent = formatCurrency(yearlySurplus);
}

// 動態生成消費欄位
function renderExpenses() {
  const expensesDiv = document.getElementById('expenses');
  expensesDiv.innerHTML = ''; // 清空原有內容

  for (const [key, value] of Object.entries(expenses)) {
    const row = document.createElement('div');
    row.className = 'expense-row';
    row.innerHTML = `
      <div class="expense-title">${key}</div>
      <div class="expense-controls">
        <button class="btn btn-gray btn-sm btn-decrease" onclick="adjustExpense('${key}', -1000)">-</button>
        <input type="number" class="form-control expense-input text-center" id="expense-${key}" value="${value}" min="0" onchange="updateExpense('${key}', this.value)">
        <button class="btn btn-gray btn-sm btn-increase" onclick="adjustExpense('${key}', 1000)">+</button>
      </div>
    `;
    expensesDiv.appendChild(row);
  }
}

// 調整消費金額
function adjustExpense(key, amount) {
  expenses[key] = Math.max(0, (expenses[key] || 0) + amount);
  
  // 更新輸入框的值
  const inputElement = document.getElementById(`expense-${key}`);
  inputElement.value = expenses[key];
  
  // 短暫突出顯示變化
  inputElement.classList.add('highlight');
  setTimeout(() => {
    inputElement.classList.remove('highlight');
  }, 300);
  
  updateResults();
}

// 更新消費金額
function updateExpense(key, value) {
  expenses[key] = parseFloat(value) || 0;
  updateResults();
}

// 本金調整按鈕
document.getElementById('decrease-100k').addEventListener('click', () => {
  principal = Math.max(0, principal - 100000);
  document.getElementById('principal').value = principal;
  updateResults();
});

document.getElementById('decrease-10k').addEventListener('click', () => {
  principal = Math.max(0, principal - 10000);
  document.getElementById('principal').value = principal;
  updateResults();
});

document.getElementById('increase-10k').addEventListener('click', () => {
  principal += 10000;
  document.getElementById('principal').value = principal;
  updateResults();
});

document.getElementById('increase-100k').addEventListener('click', () => {
  principal += 100000;
  document.getElementById('principal').value = principal;
  updateResults();
});

// 本金輸入框
document.getElementById('principal').addEventListener('input', (e) => {
  principal = parseFloat(e.target.value) || 0;
  updateResults();
});

// 月報酬率輸入框
document.getElementById('rate').addEventListener('input', (e) => {
  rate = parseFloat(e.target.value) || 0;
  updateResults();
});

// 月薪輸入框
document.getElementById('salary').addEventListener('input', (e) => {
  salary = parseFloat(e.target.value) || 0;
  updateResults();
});

// 初始化
renderExpenses();
updateResults();
