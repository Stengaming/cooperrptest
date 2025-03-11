const discordIds = ["222446629117100033", "559373029675630602"];

discordIds.forEach((id, index) => {
    fetch(`https://api.lanyard.rest/v1/users/${id}`)
        .then((res) => res.json())
        .then((data) => {
            const user = data.data;
            const pfpElement = document.getElementById(`pfp-${index + 1}`);
            const statusElement = document.getElementById(`status-${index + 1}`);
            const usernameElement = document.getElementById(`username-${index + 1}`);

            pfpElement.src = `https://cdn.discordapp.com/avatars/${id}/${user.discord_user.avatar}.png`;

            usernameElement.textContent = user.discord_user.username;

            if (user.discord_status === "online" || user.discord_status === "dnd" || user.discord_status === "idle") {
                statusElement.style.backgroundColor = "#00ff00";
            } else {
                statusElement.style.backgroundColor = "#808080";
            }
        })
        .catch((error) => {
            console.error(`Error fetching data for Discord ID ${id}:`, error);
        });
});
