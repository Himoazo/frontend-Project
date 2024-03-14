"use strcit"
import nasdaqData from './nasdaq_screener.js';
import testData from './test.js';
import testNews from './testNews.js';
import Chart from 'chart.js/auto';

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
        let stockName = chosenStock.Name;
        document.getElementById("search-button").addEventListener("click", function () {
            if(stockSymbol != ""){
                fetchData(stockSymbol, stockName);
                fetchNews(stockSymbol)
                stockSymbol = "";
            }
        });
    }
    autoComplete.innerHTML = "";
}



 /*    async function fetchData(stockSymbol, stockName) {
    try {
        const response = await fetch(``);
        const data = await response.json();
        priceChart(data, stockName);
        
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }   
    searchInput.value = ""; 
} 
 */

priceChart(testData);  //¤¤¤¤¤¤¤¤¤¤¤¤¤¤
function priceChart(data/* , stockName */){
const priceHistory = data.historical;

const datesArray = priceHistory.map((row) => row.date);
const pricesArray = priceHistory.map((row) => row.close);

const existingChart = Chart.getChart('priceChart'); // Get existing chart instance

if (existingChart) {
    existingChart.destroy(); // Destroy existing chart if it exists
}

new Chart(document.getElementById('priceChart'), {
    type: 'line',
    data: {
        labels: datesArray.reverse(),
        datasets: [
            {
                label: `${stockName}`,
                data: pricesArray.reverse(),
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
}


/* async function fetchNews(stockSymbol) {
    try {
        const response = await fetch(``);
        const data = await response.json();
        stockNews(data);
        
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    } 
}  */

stockNews(testNews);
function stockNews(testNews){
    let newsDiv = document.getElementById("newsDiv");
    newsDiv.innerHTML= "";
    const news = testNews.data;
    
    if (news.length === 0) {
        // No news available
        newsDiv.innerHTML = "<p>No news available for this stock.</p>";
    } else {
        // Display news for each stock
        for (let stock of news) {
            newsDiv.innerHTML += `<h2>${stock.title}</h2>`;
            newsDiv.innerHTML += `<p>${stock.description}</p>`;
            for (let highlight of stock.entities[0].highlights) {
                newsDiv.innerHTML += `<p>${highlight.highlight}</p>`;
            }
            newsDiv.innerHTML += `<a href="${stock.url}">Läs mer här</a>`;
        }
    }
}