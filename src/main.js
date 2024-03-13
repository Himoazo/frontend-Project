"use strcit"
import nasdaQdata from './nasdaq_screener.js'
/* async function fetchData() {
    try {
        const response = await fetch('');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

fetchData(); */


let searchInput = document.getElementById("stock-search");

searchInput.addEventListener("input", function() {
    let searchKey = searchInput.value.trim();
    console.log(searchKey);
});

console.log(nasdaQdata.length);