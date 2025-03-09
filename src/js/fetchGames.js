const TopGamesIds = [
    6431757712, 7016268111, 6789766645, 6614175388, 6528524000,
    6463581673, 7096838238, 6885335644, 7166097502, 7047719588,
    7072328729, 6743843913
];

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
        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
            method: "GET",
            headers: {
                "Origin": "null"
            }
        });

        const data = await response.json();

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
            const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
            const result = await response.json();

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
    gamesData = gamesData.slice(0, 5);

    const arrangedGames = [
        gamesData[3],
        gamesData[1],
        gamesData[0],
        gamesData[2],
        gamesData[4]
    ];

    displayGames(arrangedGames);
}

function displayGames(gamesData) {
    const gamesList = document.getElementById('games-list');
    gamesList.innerHTML = '';

    gamesData.forEach((game, index) => {
        const gameContainer = document.createElement('div');
        gameContainer.classList.add('game-container');

        const gameLink = document.createElement('a');
        gameLink.href = `https://www.roblox.com/games/${game.rootPlaceId}`;
        gameLink.target = "_blank";
        gameLink.rel = "noopener noreferrer";

        const gameIcon = document.createElement('img');
        gameIcon.src = game.icon;
        gameIcon.alt = game.name;
        gameIcon.classList.add('game-icon');

        gameLink.appendChild(gameIcon);

        const gameInfo = document.createElement('div');
        gameInfo.classList.add('game-info');
        gameInfo.innerHTML = `
            <p class="game-name">${truncateGameName(game.name)}</p>
            <p class="game-playing">${game.playing.toLocaleString()} Active Players</p>
            <p class="game-visits">${game.visits} Visits</p>
        `;

        gameContainer.appendChild(gameLink);
        gameContainer.appendChild(gameInfo);
        gamesList.appendChild(gameContainer);
    });
}

getGamesData();
