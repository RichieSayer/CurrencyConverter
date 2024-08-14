const API_KEY = 'fca_live_v81q2pEdSNUd6bhCHiBJ30ZdjGZ2x2rZ07v5rZlA';

const state = {
    openedDrawer: null,
    currencies: [],
    filteredCurrencies: [],
    base: "USD",
    target: "EUR",
    rates: {},
    baseValue: 1,
};

const ui = {
    controls: document.getElementById("controls"),
    drawer: document.getElementById("drawer"),
    dismissBtn: document.getElementById("dismiss-btn"),
    currencyList: document.getElementById("currency-list"),
    searchInput: document.getElementById("search"),
    baseBtn: document.getElementById("base"),
    targetBtn: document.getElementById("target"),
    exchangeRate: document.getElementById("exchange-rate"),
    baseInput: document.getElementById("base-input"),
    targetInput: document.getElementById("target-input"),
    swapBtn: document.getElementById("swap-btn"),
};

const setupEventListeners = () => {
    document.addEventListener("DOMContentLoaded", initApp);
    ui.controls.addEventListener("click", showDrawer);
    ui.dismissBtn.addEventListener("click", hideDrawer);
    ui.searchInput.addEventListener("input", filterCurrency);
    ui.currencyList.addEventListener("click", selectPair);
    ui.baseInput.addEventListener("change", convertInput);
    ui.swapBtn.addEventListener("click", switchPair);
};

const initApp = () => {
    fetchCurrencies();
    fetchExchangeRate();
};

const showDrawer = (e) => {
    if (e.target.hasAttribute("data-drawer")) {
        state.openedDrawer = e.target.id;
        ui.drawer.classList.add("show");
    }
};

const hideDrawer = () => {
    clearSearchInput();
    state.openedDrawer = null;
    ui.drawer.classList.remove("show");
};

const filterCurrency = () => {
    const keyword = ui.searchInput.value.trim().toLowerCase();

    state.filteredCurrencies = getAvailableCurrencies().filter(({ code, name }) => {
        return code.toLowerCase().includes(keyword) || name.toLowerCase().includes(keyword);
    });

    displayCurrencies();
};

const selectPair = (e) => {
    if (e.target.hasAttribute("data-code")) {
        const { openedDrawer } = state;
        state[openedDrawer] = e.target.dataset.code;
        loadExchangeRate();
        hideDrawer();
    }
};

const convertInput = () => {
    state.baseValue = parseFloat(ui.baseInput.value) || 1;
    loadExchangeRate();
};

const switchPair = () => {
    const { base, target } = state;
    state.base = target;
    state.target = base;
    state.baseValue = parseFloat(ui.targetInput.value) || 1;
    loadExchangeRate();
};

const displayCurrencies = () => {
    ui.currencyList.innerHTML = state.filteredCurrencies.map(({ code, name }) => {
        return `
            <li data-code="${code}">
                <img src="${getImageURL(code)}" alt="${name}" />
                <div>
                    <h4>${code}</h4>
                    <p>${name}</p>
                </div>
            </li>
        `;
    }).join("");
};

const displayConversion = () => {
    updateButtons();
    updateInputs();
    updateExchangeRate();
};

const showLoading = () => {
    ui.controls.classList.add("skeleton");
    ui.exchangeRate.classList.add("skeleton");
};

const hideLoading = () => {
    ui.controls.classList.remove("skeleton");
    ui.exchangeRate.classList.remove("skeleton");
};

const updateButtons = () => {
    [ui.baseBtn, ui.targetBtn].forEach((btn) => {
        const code = state[btn.id];
        btn.textContent = code;
        btn.style.setProperty("--image", `url(${getImageURL(code)})`);
    });
};

const updateInputs = () => {
    const { base, baseValue, target, rates } = state;
    const result = baseValue * rates[base][target];
    ui.targetInput.value = result.toFixed(4);
    ui.baseInput.value = baseValue;
};

const updateExchangeRate = () => {
    const { base, target, rates } = state;
    const rate = rates[base][target].toFixed(4);
    ui.exchangeRate.textContent = `1 ${base} = ${rate} ${target}`;
};

const getAvailableCurrencies = () => {
    return state.currencies.filter(({ code }) => {
        return state.base !== code && state.target !== code;
    });
};

const clearSearchInput = () => {
    ui.searchInput.value = "";
    ui.searchInput.dispatchEvent(new Event("input"));
};

const getImageURL = (code) => {
    const flag = `https://wise.com/public-resources/assets/flags/rectangle/${code.toLowerCase()}.png`;
    return flag;
};

const loadExchangeRate = () => {
    const { base, rates } = state;
    if (typeof rates[base] !== "undefined") {
        displayConversion();
    } else {
        fetchExchangeRate();
    }
};

const fetchCurrencies = () => {
    fetch(`https://api.freecurrencyapi.com/v1/currencies?apikey=${API_KEY}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch currencies');
            }
            return response.json();
        })
        .then(({ data }) => {
            state.currencies = Object.values(data);
            state.filteredCurrencies = getAvailableCurrencies();
            displayCurrencies();
        })
        .catch((error) => {
            console.error('Error fetching currencies:', error);
        });
};

const fetchExchangeRate = () => {
    const { base } = state;
    showLoading();
    fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&base_currency=${base}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }
            return response.json();
        })
        .then(({ data }) => {
            state.rates[base] = data;
            displayConversion();
        })
        .catch((error) => {
            console.error('Error fetching exchange rates:', error);
        })
        .finally(hideLoading);
};

setupEventListeners();