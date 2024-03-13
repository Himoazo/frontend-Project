"use strcit"
import nasdaqData from './nasdaq_screener.js'
import testData from './test.js'
import Chart from 'chart.js/auto'

let searchInput = document.getElementById("stock-search");
let autoComplete = document.getElementById("autoComplete"); 
//Matchar den sökta aktien med aktierna i nasdaq
searchInput.addEventListener("input", function() {
    let result = [];
    let searchKey = searchInput.value.trim();
    if (searchKey.length) {
        result = nasdaqData.filter((stock) => {
            return stock.Name.toLowerCase().includes(searchKey.toLowerCase());
        });
    }
    showSuggestions(result);
});

//Visar förslag på aktienamn som matchar sökordet
function showSuggestions(result) {
    let content = "";
    result.forEach((stock) => {
        content += `<li>${stock.Name}</li>`;
    });
    autoComplete.innerHTML = `<ul>${content}</ul>`;
}

autoComplete.addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
        selectKeyWord(event.target);
    }
});

// Gör att det går att klicka på/välja en aktie från resultatslistan, tar from Symbl och skickar den med fetchData
function selectKeyWord(stock) {
    searchInput.value = stock.innerHTML;

    const chosenStock = nasdaqData.find((stock) => stock.Name === searchInput.value);
    
    if (chosenStock) {
        let stockSymbol = chosenStock.Symbol;
        document.getElementById("search-button").addEventListener("click", function () {
            if(stockSymbol != ""){
                fetchData(stockSymbol);
                stockSymbol = "";
            }
        });
    }
    autoComplete.innerHTML = "";
}



/* async function fetchData(stockSymbol) {
    try {
        const response = await fetch();
        const data = await response.json();
        console.log(data);
        
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    } 
    console.log(stockSymbol);  
    searchInput.value = ""; 
}
 */



const priceHistory = testData.historical;

// Assuming you've extracted the data into these arrays
const datesArray = priceHistory.map((row) => row.date);
const pricesArray = priceHistory.map((row) => row.close);

new Chart(document.getElementById('priceChart'), {
    type: 'line',
    data: {
        labels: datesArray,
        datasets: [
            {
                label: 'Stock',
                data: pricesArray,
                borderWidth: 0.1
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
          scales: {
            y: {
                ticks: {
                    stepSize: 50, 
                    font: {
                        size: 13,
                        weight: 'bold',
                    },
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 20,
                        weight: 'bolder',
                    },
                },
            },
        },
    },
});
