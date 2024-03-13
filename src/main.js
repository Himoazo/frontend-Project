"use strcit"

async function fetchData() {
    try {
        const response = await fetch('');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

fetchData();
console.log("test");

/* DON*T FORGET TO PRELOAD TICKERS */