# Tractor (拖拉机)

## Ran's House Rule
* Compensate: give a 10/15 credit points to the non-declare team (find a friend mode only), when there are 4/6 players in total
* Boost: 20/30 points per level
* No cap: if a player's rank exceed A, then continue with 2
* Bug1: if first flayer deals QQQA, followers must play 2 pairs if he/she has.
* Bug2: if first player deals 5566, followers can play 99QJ if he/she has 99AAAKQJ.

## Ran's other modifications
* Bugfix: if the first player is a special play, e.g. spades AK, the following player cannot cover by spades 99
* Bugfix: if a special play fails, the player plays the smallest bad component
* Change background music to "find a friend".

## Bugs and future improvemnts
* TRUMP 99 should not cover TRUMP AK
* In a 3-deck game, if first player plays 5566, the following player with 777 can play 2389. Ideally, he/she must play 77.
* First flayer palys QQQA, follower has to play two pairs 99AA. Ideally, he/she just needs to play one pair.
* On the UI, the cards should be sorted so that the color is like "black-red-balck-red".

## Introduction
Multiplayer online tractor game. Try it at https://orange-tractor.herokuapp.com/.

![Screenshot](screenshot.png)


## Quickstart

    npm install
    npm run build
    ./gradlew run

Go to http://localhost:8080.

## Start a game server from any machine with ubuntu OS, public IP address, and port 8080 available
```
# Install nodejs, npm and Java
screen
sudo apt-get update
sudo apt-get install git nodejs npm openjdk-8-jdk

# Download source code, build and run
git clone https://github.com/StarsThu2016/tractor_private.git
cd tractor_private/
npm install
npm run build
./gradlew run
```

Players then can visit http://{ip_address}:8080/#/{room_number}

## Start a game server on the AWS EC2 instance
* Launch a m5.large on-demand EC2 instance in US East (Ohio) Zone, with AMI ami-05d46f70638444a46, and with 8080 port open.

```
# Login the EC2 instance
chmod 400 tractor_share.pem
ssh -i tractor_share.pem ubuntu@{ip_address}

# Start the game server in the screen session
screen
cd tractor_private/
npm run build
./gradlew run
```

Players then can visit http://{ip_address}:8080/#/{room_number}

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

