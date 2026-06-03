const API_URL =
    "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json";

let currencies = [];

// елементи сторінки

const currencyList =
    document.getElementById("currency-list");

const currentDate =
    document.getElementById("current-date");

// конвертер 1

const amountForeign =
    document.getElementById("amount-foreign");

const currencyInput1 =
    document.getElementById("currency-input1");

const amountUAH =
    document.getElementById("amount-uah");

// конвертер 2

const amountUAH2 =
    document.getElementById("amount-uah2");

const currencyInput2 =
    document.getElementById("currency-input2");

const amountForeign2 =
    document.getElementById("amount-foreign2");

// дата

currentDate.textContent =
    new Date().toLocaleDateString("uk-UA");

// завантаження даних

fetch(API_URL)
    .then(response => response.json())
    .then(data => {

        currencies = data;

        renderCurrencies();
        fillDatalists();

    })
    .catch(error => {
        console.error(error);
    });

// список валют

function renderCurrencies() {

    currencyList.innerHTML = "";

    currencies.forEach(currency => {

        const li =
            document.createElement("li");

        li.textContent =
            `${currency.cc} - ${currency.txt}: ${currency.rate}`;

        currencyList.appendChild(li);
    });
}

// datalist

function fillDatalists() {

    const list1 =
        document.getElementById("currency-list1");

    const list2 =
        document.getElementById("currency-list2");

    currencies.forEach(currency => {

        const option1 =
            document.createElement("option");

        option1.value = currency.cc;

        list1.appendChild(option1);

        const option2 =
            document.createElement("option");

        option2.value = currency.cc;

        list2.appendChild(option2);
    });
}

// знайти курс

function getRate(code) {

    const currency =
        currencies.find(item => item.cc === code);

    return currency ? currency.rate : null;
}

// валюта -> грн

function convertToUAH() {

    const amount =
        Number(amountForeign.value);

    const rate =
        getRate(currencyInput1.value);

    if (!amount || !rate) {

        amountUAH.value = "";
        return;
    }

    amountUAH.value =
        (amount * rate).toFixed(2);
}

// грн -> валюта

function convertFromUAH() {

    const amount =
        Number(amountUAH2.value);

    const rate =
        getRate(currencyInput2.value);

    if (!amount || !rate) {

        amountForeign2.value = "";
        return;
    }

    amountForeign2.value =
        (amount / rate).toFixed(2);
}

const historyOutput =
    document.getElementById("history-output");

const historyTitle =
    document.getElementById("history-title");

let selectedCurrency = "USD";

// події

amountForeign.addEventListener(
    "input",
    convertToUAH
);

currencyInput1.addEventListener(
    "input",
    convertToUAH
);

amountUAH2.addEventListener(
    "input",
    convertFromUAH
);

currencyInput2.addEventListener(
    "input",
    convertFromUAH
);

document.addEventListener("DOMContentLoaded", () => {
    currentDate.textContent =
        new Date().toLocaleDateString("uk-UA");

    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            currencies = data;

            renderCurrencies();
            fillDatalists();

            // стартова історія USD
            loadCurrencyHistory("USD");
        })
        .catch(err => console.error(err));
});

function getDates(days) {
    const dates = [];

    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");

        dates.push(`${yyyy}${mm}${dd}`);
    }

    return dates;
}

async function fetchRates(valcode, date) {
    const url =
        `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=${valcode}&date=${date}&json`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        return data[0];
    } catch (err) {
        console.error("Помилка запиту:", err);
        throw err;
    }
}

async function loadCurrencyHistory(currencyCode) {

    const dates = getDates(7);

    try {
        const promises = dates.map(date =>
            fetchRates(currencyCode, date)
        );

        let results = await Promise.all(promises);

        // сортування (від нових до старих)
        results.sort((a, b) =>
            b.exchangedate.localeCompare(a.exchangedate)
        );

        console.log(results);

        renderHistory(results);

    } catch (err) {
        console.error("Помилка історії:", err);
    }
}

function renderHistory(data) {

    historyOutput.innerHTML = "";

    const ul = document.createElement("ul");

    data.forEach(item => {

        const li = document.createElement("li");

        li.textContent =
            `${item.exchangedate} → ${item.rate.toFixed(2)} грн`;

        ul.appendChild(li);
    });

    historyOutput.appendChild(ul);
}

function renderCurrencies() {

    currencyList.innerHTML = "";

    currencies.forEach(currency => {

        const li = document.createElement("li");

        li.textContent =
            `${currency.cc} - ${currency.txt}: ${currency.rate}`;

        li.style.cursor = "pointer";

        li.addEventListener("click", () => {

            selectedCurrency = currency.cc;

            historyTitle.textContent =
                `Курс ${currency.txt} (${currency.cc}) за тиждень`;

            loadCurrencyHistory(currency.cc);
        });

        currencyList.appendChild(li);
    });
}