# Tractor (拖拉机)

## Ran's House Rule
* Compensate: give a 10/15 credit points to the non-declare team, when there are 4/6 players in total
* Boost: 20/30 points per level
* No cap: if a player's rank exceed A, then continue with 2
* Bug1: if first flayer deals QQQA, followers must play 2 pairs if he/she has.
* Bug2: if first player deals 5566, followers can play 99QJ if he/she has 99AAAKQJ.

## Ran's other modification
(1) Bugfix: if the first player is a special play, e.g. spades AK, the following player cannot cover by spades 99
(2) Bugfix: if a special play fails, the player plays the smallest bad component
(3) Change background music to "find a friend".

## Existing bugs and future improvemnts
(1) TRUMP 99 should not cover TRUMP AK
(2) First flayer deals QQQA, follower has to play two pairs 99AA. Ideally, he/she just needs to play one pair.
(3) First flayer deals 5566, follower has 99AAAKQJ and can play 99QJ. Ideally, he/she must play 99AA.
(4) On the UI, the cards should be sorted so that the color is like "black-red-balck-red".

## Introduction
Multiplayer online tractor game. Try it at https://orange-tractor.herokuapp.com/.

![Screenshot](screenshot.png)


## Quickstart

    npm install
    npm run build
    ./gradlew run

Go to http://localhost:8080.

## Start a server on AWS

## Features:

- Engine implements the full ruleset and allows only valid plays
- Supports variable number of players and variable number of decks
- Supports find-a-friend version
- Supports leading with a set of top cards (special "does-it-fly" plays)
- Supports take-backs
- Sound notifications on your turn
- Shows the currently winning player in each trick
- View the most recent trick
- Automatic card drawing during the draw phase
- AI players

The engine follows the ruleset and terminology [here](https://www.pagat.com/kt5/tractor.html).

## Development

### Backend

The backend is a Java Dropwizard server. The files are in the standard Gradle Java layout, with production files in `src/main/java`. Assets are served from `src/main/resources/assets`. The in-game communications are JSON-serialized messages sent to and received from clients via websocket using the Atmosphere framework.

Run either `./gradlew eclipse` or `./gradlew idea` to setup the project in Eclipse or IntelliJ (respectively), and then run the entry point, `TractorServer.java`.

### Frontend

The frontend is a single-page React app in plain Javascript. The assets live in `client/assets`, self-contained React components live in `client/components`, library code (no React) live in `client/lib`, and the top-level view components live in `client/views`.

To start the dev server, run:

    npm install
    npm run start

Then go to http://localhost:3000. The site will auto-refresh after making any frontend changes.

