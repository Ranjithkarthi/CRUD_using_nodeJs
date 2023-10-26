const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const dbPath = (__dirname, "moviesData.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertCaseConversion = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//1 Get all Movie Names
app.get("/movies/", async (request, response) => {
  const dbQuery = `
    SELECT movie_name FROM movie;`;
  const dbResponse = await db.all(dbQuery);
  response.send(
    dbResponse.map((eachArray) => convertCaseConversion(eachArray))
  );
});

//2 Post Movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const dbQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
  const dbResponse = await db.run(dbQuery);
  response.send("Movie Successfully Added");
});

//convertToPascalCase
const convertDbObjToResponseObj = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//3 GET by Id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const dbQuery = `
    SELECT * FROM movie 
    WHERE movie_id = ${movieId};`;
  const dbResponse = await db.get(dbQuery);
  console.log(movieId);
  response.send(convertDbObjToResponseObj(dbResponse));
});

//4 put
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const dbQuery = `
    UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(dbQuery);
  response.send("Movie Details Updated");
});

//5 Delete by movieId
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const dbQuery = `
        DELETE from movie
        WHERE movie_id = ${movieId};`;
  await db.run(dbQuery);
  response.send("Movie Removed");
});

const directorDbObjToResponseObj = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//6 get all Director
app.get("/directors/", async (request, response) => {
  const dbQuery = `
    SELECT * FROM director;`;
  const dbResponse = await db.all(dbQuery);
  response.send(
    dbResponse.map((eachArray) => directorDbObjToResponseObj(eachArray))
  );
});

const movieDbObjToResponseObj = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//7 Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const dbQuery = `
    SELECT movie_name FROM 
    director join movie
    ON director.director_id = movie.director_id
    WHERE director.director_id = ${directorId};`;
  const dbResponse = await db.all(dbQuery);
  response.send(dbResponse.map((eachArr) => movieDbObjToResponseObj(eachArr)));
});

module.exports = app;
