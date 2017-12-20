const { db } = require('../database/index.js');
const bodyParser = require('body-parser');
const express = require('express');
const Promise = require('bluebird');
const faker = require('faker');
const app = express();
// app.use(express.static(`${__dirname}/../database`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.options('/', (request, response) => {
//
//   response.json('GET,POST,PUT,PATCH,DELETE');
// });

/*####################### GLOBAL VARIABLES #######################*/

//GETS CURRENT DATE VALUES TO QUERY CALENDAR FOR THE DATE ID
let CurrentDateObj = new Date();
var CurrentDay = CurrentDateObj.getUTCDate();
var CurrentMonth = CurrentDateObj.getUTCMonth() + 1; //months from 1-12
var CurrentYear = CurrentDateObj.getUTCFullYear();
// let currentDateId = db.query(`SELECT date_id FROM calendar WHERE day = ${CurrentDay} AND month = ${CurrentMonth} AND year = ${CurrentYear}`);

//GLOBAL USER STORAGE FOR INSTANT CHECK IF USER EXISTS;
// let userStorage = {};



/*####################### GLOBAL VARIABLES #######################*/







app.get('/', (req, res) => {
  res.status(200);
  res.send('Welcome to some random ass home page');
  res.end();
});


app.get('/users', (req, res) => {
  let id = 11;
  db.query(`SELECT shuffle_play_count FROM userSongStatistics WHERE user_id_users = ${id}`)
    .then((data) => {
      res.status(200);
      res.json(data);
    });
});
/*####################### PLAY CLICK #######################
Need to fill in user info
Need to fill in date
update songStatistics

####################### PLAY CLICK #######################*/

/*
Take object from Will
{userId: Value, SongID, ShufflePlay, SkipPlay}

On a Play Click the following can happen

// If new  user
//   Insert user info into DB
NO NEW USERS(apparently)

Update userSongStatistics table
  select Table based on user_id and date_id
  UPDATE any of the counts

Update songSessionTable
  select table based on user_id and date_id
  LOOKS LIKE THERE WILL BE DUPLICATES

*/

//example object {userId: value, songId, shufle: bool, skip:bool}
app.get('/playClick', (req, res) => {
  /*############################### MOCK DATA ###############################*/
  let fakeData = {
    user: (Math.floor(Math.random() * (1000)) + 1),
    song: (Math.floor(Math.random() * (500)) + 1),
    shuffle: Math.round(Math.random()),
    skip: Math.round(Math.random()),
    songLength: (Math.floor((Math.random() * 3) + 1)) * 100
  };
  /*############################### MOCK DATA ###############################*/
  let date = {};

  let user = fakeData.user;
  let song = fakeData.song;
  let shuffle = fakeData.shuffle;
  let skip = fakeData.skip;
  let songLength = fakeData.songLength;
  // USER TABLE INFORMATION

  // let user = (Math.floor(Math.random() * (1000)) + 1);
  // let song = (Math.floor(Math.random() * (500)) + 1);
  // let shuffle = Math.round(Math.random());
  // let skip = Math.round(Math.random());
  // let songLength = (Math.floor((Math.random() * 3) + 1)) * 100;


  if (shuffle === 1 && skip === 0) {
    db.query(`SELECT date_id FROM calendar WHERE day = ${CurrentDay} AND month = ${CurrentMonth} AND year = ${CurrentYear}`)
      .then((data) => {
        let currentDateId = data[0].date_id;
        db.query(`SELECT * FROM userSongStatistics
          WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
          .then((data) => {
            // console.log(data);
            if (data.length === 0) {
              db.query(`INSERT INTO userSongStatistics (user_id_users, date_id, shuffle_play_count, regular_play_count, shuffle_skip_count, regular_skip_count) VALUES (${user}, ${currentDateId}, 1, 0, 0, 0)`)
                .catch(err => console.log(err))
                .then(() => {
                  res.status(201);
                  res.json();
                });
            } else {
              db.query(
                `UPDATE userSongStatistics
                SET shuffle_play_count = shuffle_play_count + 1
                WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
                .catch(() => console.log('ERROR HERE'))
                .then(() => {
                  db.query(`INSERT INTO songSession (user_id_users, date_id, song_id, song_length) VALUES (${user}, ${currentDateId}, ${song}, ${songLength})`);
                })
                .catch(() => console.log('ERROR IN SONGSESSION'))
                .then(() => {
                  res.status(201);
                  res.json();
                })
                .catch(() => console.log('ERROR AFTER STATUS'));
            }
          });
      });
  } else if (shuffle === 1 && skip === 1) {
    db.query(`SELECT date_id FROM calendar WHERE day = ${CurrentDay} AND month = ${CurrentMonth} AND year = ${CurrentYear}`)
      .then((data) => {
        currentDateId = data[0].date_id;
        db.query(`SELECT * FROM userSongStatistics
          WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
          .then((data) => {
            // console.log(data);
            if (data.length === 0) {
              db.query(`INSERT INTO userSongStatistics (user_id_users, date_id, shuffle_play_count, regular_play_count, shuffle_skip_count, regular_skip_count) VALUES (${user}, ${currentDateId}, 0, 0, 1, 0)`)
                .catch(err => console.log(err))
                .then(() => {
                  res.status(201);
                  res.json();
                });
            } else {
              db.query(
                `UPDATE userSongStatistics
                SET shuffle_skip_count = shuffle_skip_count + 1
                WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
                .catch(() => console.log('ERROR HERE'))
                .then(() => {
                  db.query(`INSERT INTO songSession (user_id_users, date_id, song_id, song_length) VALUES (${user}, ${currentDateId}, ${song}, ${songLength})`);
                })
                .catch(() => console.log('ERROR IN SONGSESSION'))
                .then(() => {
                  res.status(201);
                  res.json();
                })
                .catch(() => console.log('ERROR AFTER STATUS'));
            }
          });
      });
  } else if (shuffle === 0 && skip === 0) {
    db.query(`SELECT date_id FROM calendar WHERE day = ${CurrentDay} AND month = ${CurrentMonth} AND year = ${CurrentYear}`)
      .then((data) => {
        currentDateId = data[0].date_id;
        db.query(`SELECT * FROM userSongStatistics
          WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
          .then((data) => {
            if (data.length === 0) {
              db.query(`INSERT INTO userSongStatistics
                      (user_id_users, date_id, shuffle_play_count, regular_play_count, shuffle_skip_count, regular_skip_count)
                      VALUES (${user}, ${currentDateId}, 0, 1, 0, 0)`)
                .catch(err => console.log(err))
                .then(() => {
                  res.status(201);
                  res.json();
                });
            } else {
              db.query(
                `UPDATE userSongStatistics
                SET regular_play_count = regular_play_count + 1
                WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
                .catch(() => console.log('ERROR HERE'))
                .then(() => {
                  db.query(`INSERT INTO songSession
                          (user_id_users, date_id, song_id, song_length)
                          VALUES (${user}, ${currentDateId}, ${song}, ${songLength})`);
                })
                .catch(() => console.log('ERROR IN SONGSESSION'))
                .then(() => {
                  res.status(201);
                  res.json();
                })
                .catch(() => console.log('ERROR AFTER STATUS'));
            }
          });
      });
  } else {
    db.query(`SELECT date_id FROM calendar
              WHERE day = ${CurrentDay}
              AND month = ${CurrentMonth}
              AND year = ${CurrentYear}`)
      .then((data) => {
        currentDateId = data[0].date_id;
        db.query(`SELECT * FROM userSongStatistics
          WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
          .then((data) => {
            // console.log(data);
            if (data.length === 0) {
              db.query(`INSERT INTO userSongStatistics
                      (user_id_users, date_id, shuffle_play_count, regular_play_count, shuffle_skip_count, regular_skip_count)
                      VALUES (${user}, ${currentDateId}, 0, 0, 0, 1)`)
                .catch(err => console.log(err))
                .then(() => {
                  res.status(201);
                  res.json();
                });
            } else {
              db.query(
                `UPDATE userSongStatistics
                 SET regular_skip_count = regular_skip_count + 1
                 WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
                .catch(() => console.log('ERROR HERE'))
                .then(() => {
                  db.query(`INSERT INTO songSession
                          (user_id_users, date_id, song_id, song_length)
                          VALUES (${user}, ${currentDateId}, ${song}, ${songLength})`);
                })
                .catch(() => console.log('ERROR IN SONGSESSION'))
                .then(() => {
                  res.status(201);
                  res.json();
                })
                .catch(() => console.log('ERROR AFTER STATUS'));
            }
          });
      });
  }
});

/*####################### SEARCH QUERIES #######################*/


/*
on query get user id and date

*/

app.get('/searchQueries', (req, res) => {

  let fakeData = {
    user: (Math.floor(Math.random() * (1000)) + 1),
    query: faker.internet.domainWord()
  };

  let user = fakeData.user;
  let song = fakeData.song;
  let query = fakeData.query;

  db.query(`SELECT date_id FROM calendar
            WHERE day = ${CurrentDay}
            AND month = ${CurrentMonth}
            AND year = ${CurrentYear}`)
    .then((data) => {
      let currentDateId = data[0].date_id;

      db.query(`SELECT * FROM userQueryStatistics
        WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
        .then((data) => {
          if (data.length === 0) {
            db.query(`INSERT INTO userQueryStatistics
                          (user_id_users, date_id, query_string)
                          VALUES (${user}, ${currentDateId}, ${query})`)
              .catch(err => console.log(err))
              .then(() => {
                res.status(201);
                res.json();
              });
          } else {
            db.query(
              `UPDATE userQueryStatistics
               SET query_count = query_count + 1
               WHERE user_id_users = ${user}
               AND date_id = ${currentDateId}`)
              .then(() => {
                res.status(201);
                res.json();
              })
              .catch(err => console.log(err));
          }
        });
    });
});


app.get('/songChunks', (req, res) => {

  let fakeData = {
    user: (Math.floor(Math.random() * (1000)) + 1),
    chunkLength: 10
  };

  let user = fakeData.user;
  let length = fakeData.chunkLength;

  db.query(`SELECT date_id FROM calendar
            WHERE day = ${CurrentDay}
            AND month = ${CurrentMonth}
            AND year = ${CurrentYear}`)
    .then((data) => {

      let currentDateId = data[0].date_id;

      db.query(`SELECT * FROM songSession WHERE user_id_users = 1 AND date_id = ${currentDateId}`)
        .then((data) => {
          let currentSongId = data[data.length - 1].id;

          db.query(`INSERT INTO songChunks (song_session_id, chunk_length) VALUES (${currentSongId}, ${length})`)
            .then(() => {
              res.status(200);
              res.json();
            });
        });
    });
});

// `UPDATE userSongStatistics
// SET regular_skip_count = regular_skip_count + 1
// WHERE user_id_users = ${user} AND date_id = ${currentDateId}`)
// .catch(() => console.log('ERROR HERE'))


/*
#########################Types of Queries#########################
Get shufflePlays for a day
Get regularPlays for a day
Shuffle Vs RegularPlays?

Get shufflePlays for a week
ShuffleOlays for a week
Shuffle Vs Regular for a week




##################################################################
*/



app.listen(3000);
