# Tractor (拖拉机)

## Ran's House Rule
* Compensate: give a 10/15/20 credit points to the non-declare team (find a friend mode only), when there are 4/6/8 players in total.
* Boost: 20/30/40 points per rank when the winning team is promoted.
* No-cap: if a player's rank exceeds A, then continues with 2+.
* Must-play: support an optional must-play feature on rank 5, 10, K.
* Chao-Di-Pi: optional feature
  * Order: ... > 3 big jokers > 3 small jokers > 222 > 2 big jokers > 2 small jokers > 22
  * Suggest to enable the "must-play-on X" feature because the "cook" team may easily get 200+ points.
  * The starter cannot be the first one to "cook" after he/she just makes the kitty
  * A person cannot "cook" his/her own declaration
  * In "find a friend" mode, a cook is not allowed to put the "declaration of friend" card into the kitty, except the starter (having the risk of not finding friends).

## Ran's patch to the bugs or modifications
* Patch 1: if the first player makes a special play, e.g. spades AK, the following player cannot cover by spades 99.
* Patch 2: if the first player makes a special play with singles and the following players cover by TRUMP, the rank of the hand is determined by the max of singles.
* Patch 3: in a 3-deck game, if first player plays 5566, the following player with 2389777 must play 77.
* Patch 4: if a special play fails, the player plays the smallest bad component.
* Patch 5: the bonus for non-declare team is based on the largest component. Single = "*2", double = "*4", triple = "*8". 
* Change the background music to "find a friend".
* Change the background image to a prettier one.

## Bugs and future improvements
* On the UI, the cards should be sorted so that the color is "black-red-black-red".
* First player plays QQQA, the follower with 99AA has to play both pairs, instead of just one. This is because both "99" and "AA" belong to the "must-play" set and the player cannot replace one of them by two singles.

## Introduction
Multiplayer online tractor game. Try it at https://util.in:8096 or https://orange-tractor.herokuapp.com/.

![Screenshot](screenshot.png)

## Quickstart
```
npm install
npm run build
./gradlew run
```
Go to http://localhost:8080.

## Start a game server from any machine with ubuntu OS, public IP address, and port 8080 available
```
# Install nodejs, npm and Java
screen
sudo apt-get update
sudo apt-get install git nodejs npm openjdk-8-jdk
sudo apt install build-essential checkinstall libssl-dev
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.1/install.sh | bash
nvm --version
nvm ls
nvm ls-remote
nvm install 14.15.5

# Download source code, build and run
git clone https://github.com/StarsThu2016/tractor_private.git
cd tractor_private/
npm install
npm run build
./gradlew run
```

Players then can visit http://{ip_address}:8080/#/{room_number}

## Start a game server on the AWS EC2 instance
* Launch a t3a.small on-demand EC2 instance in US East (Ohio) Zone, with AMI ami-05d46f70638444a46, and with 8080 port open. The cost is $0.45/day.

```
# Login the EC2 instance
chmod 400 tractor_share.pem
ssh -i tractor_share.pem ubuntu@{ip_address}

screen
cd tractor_private/
npm run build
./gradlew run
```

Players then can visit http://{ip_address}:8080/#/{room_number}

## Deploy the game server on Heroku (Cloud Application Platform)
### Install Heuroku CLI
[reference](https://phasertutorials.com/hosting-your-multiplayer-phaser-game-on-heroku/)
```
sudo snap install --classic heroku
heroku login --interactive
```

Add
```
{
}
```
to ```.local/share/heroku/config.json```

### Use Gradle Shadow to build the project and then heroku run locally
```
curl -s "https://get.sdkman.io" | bash
sdk install gradle 6.8.2
gradle shadowJar
heroku local web
```

If some apps are using 8080 or 8081 port, find it by ```netstat -nap | grep 8080``` and kill it by ```sudo kill -9 $pid```.
If ```heroku local web``` succeeds, you can visit ```localhost:5000``` for front-end web.

### Deploy the project on Heroku
[create Keroku app](https://devcenter.heroku.com/articles/creating-apps)
```
heroku create sj-cdp
```

## Features:

- Engine implements the full ruleset and allows only valid plays
- Supports variable number of players and variable number of decks
- Supports find-a-friend version
- Supports leading with a set of top cards (special "does-it-fly" plays)
- Supports take-backs
- Sound notifications on your turn
- Shows the currently winning player in each trick
- View the previous trick
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

