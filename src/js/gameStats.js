const gameIds = [
    6431757712, 7016268111, 6789766645, 6614175388, 6528524000,
    6463581673, 7096838238, 7166097502, 7047719588,
    7072328729, 6743843913, 7334543566, 6829990681, 3071634329
];
const proxyUrl = "https://workers-playground-white-credit-775c.bloxyhdd.workers.dev/?url=";
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getGameData(gameId) {
    try {
        const apiUrl = `https://games.roblox.com/v1/games?universeIds=${gameId}`;
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));

        if (response.ok) {
            const responseJson = await response.json();
            if (responseJson.data && responseJson.data.length > 0) {
                const gameData = responseJson.data[0];
                return {
                    playing: gameData.playing || 0,
                    visits: gameData.visits || 0
                };
            }
        } else if (response.status === 429) {
            await delay(2000);
            return getGameData(gameId);
        }
    } catch (error) {
        console.error("Error fetching game data:", error);
    }
    return { playing: 0, visits: 0 };
}

function animateCountUp(element, targetValue, duration = 1000) {
    if (!element) {
        console.error("Element not found for count-up animation.");
        return;
    }

    const currentValue = parseInt(element.textContent.replace(/,/g, ''), 10) || 0;

    let start = currentValue;
    const increment = (targetValue - currentValue) / (duration / 16);
    const interval = setInterval(() => {
        start += increment;
        if (start >= targetValue) {
            clearInterval(interval);
            element.innerHTML = `${targetValue.toLocaleString()} <span class="quicksand">${element.getAttribute("data-text")}</span>`;
        } else {
            element.innerHTML = `${Math.floor(start).toLocaleString()} <span class="quicksand">${element.getAttribute("data-text")}</span>`;
        }
    }, 16);
}

async function getTotalActivePlayers() {
    let totalPlayers = 0;
    let totalVisits = 0;

    const playerCountElement = document.getElementById("player-count");
    const visitsCountElement = document.getElementById("visits-count");

    if (!playerCountElement || !visitsCountElement) {
        console.error("HTML elements with the IDs 'player-count' and 'visits-count' not found.");
        return;
    }

    animateCountUp(playerCountElement, 0);
    animateCountUp(visitsCountElement, 0);

    for (let i = 0; i < gameIds.length; i++) {
        const gameId = gameIds[i];
        const gameData = await getGameData(gameId);
        totalPlayers += gameData.playing;
        totalVisits += gameData.visits;

        animateCountUp(playerCountElement, totalPlayers);
        animateCountUp(visitsCountElement, totalVisits);

        if (i < gameIds.length - 1) {
            await delay(200);
        }
    }

    console.log(`Total Players: ${totalPlayers}`);
    console.log(`Total Visits: ${totalVisits}`);
}

getTotalActivePlayers();
