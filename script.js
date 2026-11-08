// Fallback exchange rates relative to USD
const fallbackRates = {
    USD: 1,
    EUR: 0.92,
    INR: 83.5,
    GBP: 0.79,
    JPY: 150.2
};

// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const convertedResult = document.getElementById('convertedResult');
const exchangeRateInfo = document.getElementById('exchangeRateInfo');
const updateTime = document.getElementById('updateTime');
const refreshBtn = document.getElementById('refreshBtn');
const refreshIcon = document.getElementById('refreshIcon');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Currency Symbols
const currencySymbols = {
    USD: '$',
    EUR: '€',
    INR: '₹',
    GBP: '£',
    JPY: '¥'
};

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        document.documentElement.classList.remove('dark');
        themeIcon.className = 'fa-solid fa-moon text-lg';
    } else {
        document.documentElement.classList.add('dark');
        themeIcon.className = 'fa-solid fa-sun text-lg';
    }
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        themeIcon.className = 'fa-solid fa-moon text-lg';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.className = 'fa-solid fa-sun text-lg';
    }
});

// Convert currency with API and fallback support
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;

    if (isNaN(amount) || amount < 0) {
        convertedResult.textContent = 'Invalid amount';
        exchangeRateInfo.textContent = '';
        return;
    }

    if (from === to) {
        const symbol = currencySymbols[to] || '';
        convertedResult.textContent = `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        exchangeRateInfo.textContent = `1 ${from} = 1 ${to}`;
        updateTimestamp();
        return;
    }

    convertedResult.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-purple-400"></i>';

    let rate = null;

    try {
        const response = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
        if (response.ok) {
            const data = await response.json();
            rate = data.rates[to];
        }
    } catch (error) {
        console.warn('API fetch failed, using fallback rates:', error);
    }

    // If API failed, calculate using fallback rates ratio
    if (rate === null || rate === undefined) {
        rate = fallbackRates[to] / fallbackRates[from];
    }

    const result = amount * rate;
    const symbol = currencySymbols[to] || '';

    convertedResult.textContent = `${symbol}${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    exchangeRateInfo.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    updateTimestamp();
}

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    updateTime.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i><span>Updated: ${timeString}</span>`;
}

// Swap currencies
swapBtn.addEventListener('click', () => {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
    convertCurrency();
});

// Refresh button animation & fetch
refreshBtn.addEventListener('click', () => {
    refreshIcon.classList.add('fa-spin');
    convertCurrency();
    setTimeout(() => {
        refreshIcon.classList.remove('fa-spin');
    }, 1000);
});

// Event Listeners
amountInput.addEventListener('input', convertCurrency);
fromCurrencySelect.addEventListener('change', convertCurrency);
toCurrencySelect.addEventListener('change', convertCurrency);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    convertCurrency();
});
