const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertToCamelCase = (data) => ({
  playerId: data.player_id,
  playerName: data.player_name,
  jerseyNumber: data.jersey_number,
  role: data.role,
});

// Get PlayersList API

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;
    `;

  const players = await db.all(getPlayersQuery);
  response.send(players.map((each) => convertToCamelCase(each)));
});

// Add Player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );
`;
  const dbResponse = await db.run(addPlayerQuery);
  const bookId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//Get Player API
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT * FROM cricket_team WHERE player_id=${playerId};
    `;
  const player = await db.get(getPlayer);
  response.send(convertToCamelCase(player));
});

//Update Player API
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
  UPDATE cricket_team 
  SET 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
  WHERE 
    player_id=${playerId};
  `;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

// Delete Player API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
  DELETE FROM cricket_team
  WHERE 
    player_id=${playerId};
  `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
