// 初始設定
let principal = 200000; // 本金 20萬
let rate = 7; // 月報酬率 7%
let salary = 0; // 月薪
let currentDeleteKey = null; // 全局變量，用於存儲要刪除的項目
let deleteModal; // 全局 Modal 實例
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

  // 初始化 Modal
  deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  const addModal = new bootstrap.Modal(document.getElementById('addExpenseModal'));

  // 新增項目按鈕
  document.getElementById('add-expense').addEventListener('click', function() {
    document.getElementById('newExpenseName').value = '';
    addModal.show();
  });

  // 確認新增按鈕事件
  document.getElementById('confirmAdd').addEventListener('click', function() {
    const newExpenseName = document.getElementById('newExpenseName').value.trim();
    if (newExpenseName) {
      expenses[newExpenseName] = 0;
      renderExpenses();
      addModal.hide();
    }
  });

  // 確認刪除按鈕事件
  document.getElementById('confirmDelete').addEventListener('click', function() {
    if (currentDeleteKey) {
      delete expenses[currentDeleteKey];
      renderExpenses();
      updateResults();
      deleteModal.hide();
      currentDeleteKey = null; // 重置刪除鍵
    }
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

  // 更新基本收支顯示
  document.getElementById('monthly-income').textContent = formatCurrency(monthlyIncome);
  document.getElementById('yearly-income').textContent = formatCurrency(yearlyIncome);
  document.getElementById('monthly-expenses').textContent = formatCurrency(totalExpenses);
  document.getElementById('yearly-expenses').textContent = formatCurrency(totalExpenses * 12);
  document.getElementById('monthly-surplus').textContent = formatCurrency(monthlySurplus);
  document.getElementById('yearly-surplus').textContent = formatCurrency(yearlySurplus);

  // 計算複利 (使用本金，每月7%報酬率)
  calculateCompoundInterest(principal, rate);
}

// 計算複利
function calculateCompoundInterest(initialAmount, monthlyRate) {
  let currentAmount = initialAmount;
  
  // 計算未來每五年的複利
  for (let year = 1; year <= 5; year++) {
    let yearStartAmount = currentAmount;
    
    // 每年12個月的複利計算
    for (let month = 1; month <= 12; month++) {
      // 每月複利計算
      currentAmount = currentAmount * (1 + monthlyRate / 100);
      
      // 更新每月複利顯示
      document.getElementById(`year-${year}-month-${month}`).textContent = formatCurrency(currentAmount);
    }
    
    // 更新年度複利顯示
    document.getElementById(`year-${year}-compound`).textContent = formatCurrency(currentAmount);
  }
}

// 切換年度詳細資訊顯示
function toggleYearDetails(year) {
  const detailsDiv = document.getElementById(`year-${year}-details`);
  const button = detailsDiv.previousElementSibling.querySelector('button');
  const icon = button.querySelector('i');
  
  if (detailsDiv.style.display === 'none') {
    detailsDiv.style.display = 'block';
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
  } else {
    detailsDiv.style.display = 'none';
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
  }
}

// 動態生成消費欄位
function renderExpenses() {
  const expensesDiv = document.getElementById('expenses');
  expensesDiv.innerHTML = ''; // 清空原有內容

  for (const [key, value] of Object.entries(expenses)) {
    const row = document.createElement('div');
    row.className = 'expense-row d-flex justify-content-between align-items-center mb-2 position-relative';
    row.innerHTML = `
      <div class="expense-title">${key}</div>
      <div class="expense-controls d-flex align-items-center">
        <button class="btn btn-gray btn-sm btn-decrease me-2" onclick="adjustExpense('${key}', -1000)">-</button>
        <input type="number" class="form-control expense-input text-center" id="expense-${key}" value="${value}" min="0" onchange="updateExpense('${key}', this.value)">
        <button class="btn btn-gray btn-sm btn-increase ms-2" onclick="adjustExpense('${key}', 1000)">+</button>
      </div>
      <button class="btn btn-gray btn-sm position-absolute top-0 end-0" style="font-size: 0.8rem; padding: 0.2rem 0.4rem;" onclick="showDeleteModal('${key}')" title="刪除項目">
        <i class="fas fa-times"></i>
      </button>
    `;
    expensesDiv.appendChild(row);
  }
}

// 顯示刪除確認 Modal
function showDeleteModal(key) {
  document.getElementById('deleteItemName').textContent = key;
  currentDeleteKey = key;
  deleteModal.show();
}

// 直接刪除項目
function deleteExpense(key) {
  delete expenses[key];
  renderExpenses();
  updateResults();
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
