const form = document.getElementById('transaction-form');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const list = document.getElementById('transaction-list');

const incomeDisplay = document.getElementById('total-income');
const expenseDisplay = document.getElementById('total-expense');
const balanceDisplay = document.getElementById('balance');

const chartTypeSelect = document.getElementById('chartType');
const ctx = document.getElementById('expenseChart').getContext('2d');

const darkToggle = document.getElementById('dark-toggle');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chart = null;

function saveAndRender() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  render();
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value;

  if (!desc || isNaN(amount) || amount <= 0) {
    alert('Please enter a valid description and positive amount.');
    return;
  }

  transactions.push({
    id: Date.now(),
    desc,
    amount,
    type,
  });

  form.reset();
  saveAndRender();
});

function render() {
  list.innerHTML = '';

  let totalIncome = 0;
  let totalExpense = 0;

  const expenseCategories = {};

  transactions.forEach(tx => {
    const li = document.createElement('li');
    li.classList.add(tx.type);
    li.innerHTML = `
      <span>${tx.desc}: ₱${tx.amount.toFixed(2)} (${tx.type})</span>
      <button class="remove-btn" data-id="${tx.id}" title="Remove">
        <i class="fa fa-trash"></i>
      </button>
    `;
    list.appendChild(li);

    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
      expenseCategories[tx.desc] = (expenseCategories[tx.desc] || 0) + tx.amount;
    }
  });

  incomeDisplay.textContent = `₱${totalIncome.toFixed(2)}`;
  expenseDisplay.textContent = `₱${totalExpense.toFixed(2)}`;
  balanceDisplay.textContent = `₱${(totalIncome - totalExpense).toFixed(2)}`;

  attachRemoveListeners();
  updateChart(expenseCategories);
}

function attachRemoveListeners() {
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      transactions = transactions.filter(tx => tx.id !== id);
      saveAndRender();
    });
  });
}

function updateChart(data) {
  if (chart) chart.destroy();

  const labels = Object.keys(data);
  const values = Object.values(data);

  if (labels.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  const backgroundColors = [
    '#ff6384',
    '#36a2eb',
    '#ffcd56',
    '#4bc0c0',
    '#9966ff',
    '#ff9f40',
    '#c9cbcf',
    '#8e5ea2',
  ];

  const config = {
    type: chartTypeSelect.value,
    data: {
      labels,
      datasets: [
        {
          label: 'Expenses by Category',
          data: values,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: '#fff',
          borderWidth: chartTypeSelect.value === 'bar' ? 2 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: document.body.classList.contains('dark-mode') ? '#eee' : '#222',
          },
        },
      },
      scales:
        chartTypeSelect.value === 'bar'
          ? {
              y: {
                beginAtZero: true,
                ticks: {
                  color: document.body.classList.contains('dark-mode') ? '#eee' : '#222',
                },
              },
              x: {
                ticks: {
                  color: document.body.classList.contains('dark-mode') ? '#eee' : '#222',
                },
              },
            }
          : {},
      animation: {
        duration: 1000,
        easing: 'easeOutBounce',
      },
    },
  };

  chart = new Chart(ctx, config);
}

chartTypeSelect.addEventListener('change', () => {
  render();
});

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  render();
});

// Initial render
render();
