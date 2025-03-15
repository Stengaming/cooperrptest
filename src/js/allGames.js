const TopGamesIds = [
    6431757712, 7016268111, 6789766645, 6614175388, 6528524000,
    6463581673, 7096838238, 7166097502, 7047719588,
    7072328729, 6743843913, 7334543566, 6829990681, 3071634329
];

const proxyUrl = "https://workers-playground-white-credit-775c.bloxyhdd.workers.dev/?url=";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 3, delayMs = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429) {
                console.warn(`Rate limited. Retrying in ${delayMs}ms...`);
                await delay(delayMs);
                continue;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
            await delay(delayMs);
        }
    }
}

function truncateGameName(gameName) {
    const maxLength = 19;
    if (gameName.length > maxLength) {
        return gameName.substring(0, maxLength) + '...';
    }
    return gameName;
}

async function fetchGameIcon(gameId) {
    try {
        const apiUrl = `https://thumbnails.roblox.com/v1/games/icons?universeIds=${gameId}&size=512x512&format=Png&isCircular=false`;
        const data = await fetchWithRetry(proxyUrl + encodeURIComponent(apiUrl), {
            method: "GET",
            headers: {
                "Origin": "null"
            }
        });

        if (data?.data?.length > 0) {
            return data.data[0].imageUrl;
        } else {
            console.error("No image data available for game ID:", gameId);
            return null;
        }
    } catch (error) {
        console.error("Error fetching game icon for game ID:", gameId, error);
        return null;
    }
}

async function getGamesData() {
    let gamesData = [];

    const gameRequests = TopGamesIds.map(async (gameId) => {
        try {
            const apiUrl = `https://games.roblox.com/v1/games?universeIds=${gameId}`;
            const result = await fetchWithRetry(proxyUrl + encodeURIComponent(apiUrl));

            if (result?.data?.length > 0) {
                const gameData = result.data[0];

                const icon = await fetchGameIcon(gameData.id);

                gamesData.push({
                    id: gameData.id,
                    rootPlaceId: gameData.rootPlaceId,
                    name: gameData.name,
                    playing: gameData.playing,
                    visits: gameData.visits.toLocaleString(),
                    icon: icon || `https://www.roblox.com/game-thumbnail/thumbnail/${gameData.id}`,
                });
            }
        } catch (error) {
            console.error("Error fetching game data for game ID:", gameId, error);
        }
    });

    await Promise.all(gameRequests);

    gamesData.sort((a, b) => b.playing - a.playing);

    displayGames(gamesData);
}

function displayGames(gamesData) {
    const gamesList = document.getElementById('games-grid');
    gamesList.innerHTML = '';

    gamesData.forEach((game) => {
        const gameContainer = document.createElement('div');
        gameContainer.classList.add('game-container', 'bg-transparent', 'p-4', 'rounded-lg', 'shadow-lg', 'hover:shadow-xl', 'transition-shadow', 'duration-300', 'scroll');

        const gameLink = document.createElement('a');
        gameLink.href = `https://www.roblox.com/games/${game.rootPlaceId}`;
        gameLink.target = "_blank";
        gameLink.rel = "noopener noreferrer";

        const gameIcon = document.createElement('img');
        gameIcon.src = game.icon;
        gameIcon.alt = game.name;
        gameIcon.classList.add('game-icon2');

        gameLink.appendChild(gameIcon);

        const gameInfo = document.createElement('div');
        gameInfo.classList.add('game-info', 'mt-4');
        gameInfo.innerHTML = `
            <p class="game-name text-xl font-bold">${truncateGameName(game.name)}</p>
            <p class="game-playing text-gray-400">${game.playing.toLocaleString()} Active Players</p>
            <p class="game-visits text-gray-400">${game.visits} Visits</p>
        `;

        gameContainer.appendChild(gameLink);
        gameContainer.appendChild(gameInfo);
        gamesList.appendChild(gameContainer);
    });
}

getGamesData();
