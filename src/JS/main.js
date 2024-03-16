"use strcit"
require('dotenv').config();
import nasdaqData from './nasdaq_screener.js';
/* import testData from './test.js';
import testNews from './testNews.js'; */
import Chart from 'chart.js/auto';
console.log(process.env);

/* const profile = [
    {
      "symbol": "AAPL",
      "price": 174.005,
      "beta": 1.289,
      "volAvg": 58368390,
      "mktCap": 2686967809500,
      "lastDiv": 0.96,
      "range": "151.64-199.62",
      "changes": 2.875,
      "companyName": "Apple Inc.",
      "currency": "USD",
      "cik": "0000320193",
      "isin": "US0378331005",
      "cusip": "037833100",
      "exchange": "NASDAQ Global Select",
      "exchangeShortName": "NASDAQ",
      "industry": "Consumer Electronics",
      "website": "https://www.apple.com",
      "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod. It also provides AppleCare support and cloud services; and operates various platforms, including the App Store that allow customers to discover and download applications and digital content, such as books, music, video, games, and podcasts. In addition, the company offers various services, such as Apple Arcade, a game subscription service; Apple Fitness+, a personalized fitness service; Apple Music, which offers users a curated listening experience with on-demand radio stations; Apple News+, a subscription news and magazine service; Apple TV+, which offers exclusive original content; Apple Card, a co-branded credit card; and Apple Pay, a cashless payment service, as well as licenses its intellectual property. The company serves consumers, and small and mid-sized businesses; and the education, enterprise, and government markets. It distributes third-party applications for its products through the App Store. The company also sells its products through its retail and online stores, and direct sales force; and third-party cellular network carriers, wholesalers, retailers, and resellers. Apple Inc. was incorporated in 1977 and is headquartered in Cupertino, California.",
      "ceo": "Mr. Timothy D. Cook",
      "sector": "Technology",
      "country": "US",
      "fullTimeEmployees": "161000",
      "phone": "408 996 1010",
      "address": "One Apple Park Way",
      "city": "Cupertino",
      "state": "CA",
      "zip": "95014",
      "dcfDiff": 31.28305,
      "dcf": 139.84694950805735,
      "image": "https://financialmodelingprep.com/image-stock/AAPL.png",
      "ipoDate": "1980-12-12",
      "defaultImage": false,
      "isEtf": false,
      "isActivelyTrading": true,
      "isAdr": false,
      "isFund": false
    }
  ];  */
//Roterande logga
window.addEventListener('scroll', () => {
    document.body.style.setProperty('--scroll', window.scrollY  / (document.body.offsetHeight - window.innerHeight))
});

let searchInput = document.getElementById("stock-search"); //input
let autoComplete = document.getElementById("autoComplete"); 
const errorDiv = document.getElementById("errorMsg"); // div för eventuella errors
// const searchText = document.getElementById("stock-search");
const clearButton = document.getElementById("clearBtn");


let activeFetches = 0;
window.onload = clear;

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
//Lägger eventlistener på den skapade li
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
            document.querySelector(".loading").style.display = 'block';

            if(stockSymbol != ""){
                fetchData(stockSymbol, stockName);
                fetchNews(stockSymbol) 
                fetchProfile(stockSymbol)
                stockSymbol = "";
            }
        });
    }
    autoComplete.innerHTML = "";
}


// Anrop till API som hämtar akite historiskapriser
    const priceAPI = process.env.API_KEY;  //Environment key
    async function fetchData(stockSymbol, stockName) {
    try {
        activeFetches++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 skund väntetid bara för att visa annimation
        const response = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${stockSymbol}?apikey=${priceAPI}`);
        const data = await response.json();
        priceChart(data, stockName);
        
    } catch (error) {
        console.error('Fetch error:', error);
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = ` Aktiedata är ej tillgänglig: ${error}`
    } finally{
        const loader = document.getElementsByClassName("loading");
        activeFetches--;
        if (activeFetches === 0) {
            const loader = document.querySelector(".loading");
            loader.style.display = 'none';
        }
        searchInput.value = ""; 
    }  
    
} 


/* priceChart(testData); */  //¤¤¤¤¤¤¤¤¤¤¤¤¤¤
// Chart.js aktie diagram
function priceChart(data, stockName){
document.querySelector(".chart").style.display = 'block';
const priceHistory = data.historical;

const datesArray = priceHistory.map((row) => row.date);
const pricesArray = priceHistory.map((row) => row.close);

//Kontroll vid ett nytt anrop tar bort befintligt diagram för att visa ett nytt 
const existingChart = Chart.getChart('priceChart'); 
if (existingChart) {
    existingChart.destroy(); 
}

new Chart(document.getElementById('priceChart'), {
    type: 'line',
    data: {
        labels: datesArray.reverse(),
        datasets: [
            {
                label: `${stockName}`,
                data: pricesArray.reverse(),
                borderWidth: 1,
                pointRadius: 0.2
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
          scales: {
            x: {
                display: false, 
            },
            y: {
                ticks: {
                    display: true,
                    stepSize: 25, 
                    font: {
                        size: 13,
                        weight: 'bold',
                    },
                },
            },
        },
        interaction: {
            intersect: false, // för interpolation
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



//Anrop till företags profil API
const APIPRICE = process.env.API_KEY; 
async function fetchProfile(stockSymbol) {
    try {
        activeFetches++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 skund väntetid bara för att visa annimation
        const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${stockSymbol}?apikey=${APIPRICE}`);
        const data = await response.json();
        showProfile(data);
        
    } catch (error) {
        console.error('Fetch error:', error);
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = ` Företagets profil kan inte visas: ${error}`
    }    finally{
        const loader = document.getElementsByClassName("loading");
        activeFetches--;
        if (activeFetches === 0) {
            const loader = document.querySelector(".loading");
            loader.style.display = 'none';
        }
    } 
} 


/* showProfile(profile); */
// Skriver ut profile detaljer til DOM
function showProfile(profile){
   const profileDiv = document.getElementById("corpProfile");
   profileDiv.style.display = 'block';
   profileDiv.innerHTML = "";
   for(let item of profile){
    profileDiv.innerHTML += `<p> <span class="label">Symbol:</span> ${item.symbol}</p>`;
    profileDiv.innerHTML += `<p> <span class="label">Price:</span> ${item.price} $</p>`;
    profileDiv.innerHTML += `<p> <span class="label">Industry:</span> ${item.industry}</p>`;
    profileDiv.innerHTML += `<p> <span class="label">Market Cap:</span> ${item.mktCap} $</p>`;
    profileDiv.innerHTML += `<p> <span class="label">CEO:</span> ${item.ceo}</p>`;
    profileDiv.innerHTML += `<p> <span class="label">Description:</span> ${item.description}</p>`;
   }
}

// Anrop till aktienyheters API
const newsAPI = process.env.NEWS_KEY; 
async function fetchNews(stockSymbol) {
    try {
        activeFetches++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 skund väntetid bara för att visa annimation
        const response = await fetch(`https://api.stockdata.org/v1/news/all?symbols=${stockSymbol}&filter_entities=true&language=en&api_token=${newsAPI}`);
        const data = await response.json();
        stockNews(data);
        
    } catch (error) {
        console.error('Fetch error:', error);
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = ` Det gick inte att ladda nyheter: ${error}`
    } finally{
        activeFetches--;
        if (activeFetches === 0) {
            const loader = document.querySelector(".loading");
            loader.style.display = 'none';
        }
    } 
} 

/* stockNews(testNews); */
// Skriver ut aktienyheter till DOM
function stockNews(testNews){
    let newsDiv = document.getElementById("newsDiv");
    newsDiv.style.display = 'block';
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
                newsDiv.innerHTML += `<p> <strong>Highlight:</strong> ${highlight.highlight}</p>`;
            }
            newsDiv.innerHTML += `<a href="${stock.url}">Läs mer här</a>`;
        }
    }
}

//Funktioner som visar clear knappen vid input och får den att rensa input vid click
function clear(){
    searchInput.addEventListener("input", showClearBtn);
    clearButton.addEventListener("click", clearInput);
  }

showClearBtn();
function showClearBtn() {
    if (searchInput.value) {
      clearButton.style.display = 'block';
    } else {
      clearButton.style.display = 'none';
    }
  }
  
  function clearInput() {
    const searchInput = document.getElementById("stock-search");
    searchInput.value = '';
    autoComplete.innerHTML = "";
    showClearBtn();
  }

  
  

