# Tractor (拖拉机)

## House Rules and Features
* Mobile UI: Optimized for mobile phones with numerous improvements.
* No-cap: If a player's rank exceeds A, they continue with 2+.
* Compensation in Find-a-Friend Mode: Award 10/15/20 points to the non-declare team in 2/3/4 deck settings if the number of players is even.
* Boost (optional): 20/40 points per rank.
* Must-play (optional): Players must play on ranks 5, 10, and K. They can pass these ranks only if they are at these ranks, in the declare team, and win.
* Chao-Di-Pi mode (optional):
  * Cook Ordering: ... > 3 big jokers > 3 small jokers > 222 > 2 big jokers > 2 small jokers > 22.
  * Must-play-on X: Recommended to enable this feature as the non-declare team, if cooked, may easily get 200+ points.
  * Starter Rule: The starter cannot be the first to "cook" after making the kitty.
  * Self-Cook Rule: A player cannot "cook" their own declaration.
  * Find-a-Friend Mode: A cook cannot insert the "declaration of friend" card into the kitty, except for the starter (risking not finding friends).

## Ran's Patch to the Bugs and Ran's Modifications
* Patch 1: if the first player makes a special play, e.g. spades AK, the following player cannot cover by spades 99.
* Patch 2: if the first player makes a special play with singles and the following players cover by TRUMP, the rank of the hand is determined by the max of singles.
* Patch 3: in a 3-deck game, if first player plays 5566, the following player with 2389777 must play 77.
* Patch 4: if a special play fails, the player plays the smallest bad component.
* Patch 4: 2-2-small joker-small joker is a tractor in the non-trump mode.
* Patch 5: the bonus for non-declare team is based on the largest component. Single = "*2", double = "*4", triple = "*8". 
* Change the background music to "find a friend".
* Change the background image to a prettier one.

## Bugs and Future Improvements
* If nobody claims and a trump is determined by uncovering the kitty, somebody other than the kitty owner may be able to see the kitty. Refreshing the webpage can fix the bug. 
* First game with rank modifications, the union of all ranks is declarable for every one. But one should only decalre his/her own rank.
* Allow ordered Chao-Di-Pi, optionally.
* First player plays QQQA, the follower with 99AA has to play both pairs, instead of just one. This is because both "99" and "AA" belong to the "must-play" set and the player cannot replace one of them by two singles.
* Occationally, players get cards with face down due to unknown communication errors.
* Occationally, players get disconnected due to unknown communication errors.
* When some people leaves the game, the game room may stuck in a wrong status. Everybody gets a write screen when it happens and has to restart a game.

## Introduction
Multiplayer online tractor game. Public game server at https://util.in:8096 or https://orange-tractor.herokuapp.com/.

![Screenshot](screenshot.png)

## Launch a Game Server from a ubuntu OS, Public IP Address, and Port 8080 Available
Players can play at http://{ip_address}:8080/#/{room_number} after finishing the following steps.
```
# Install nodejs, npm and Java
screen
sudo apt-get update
sudo apt-get install git nodejs npm openjdk-8-jdk
sudo apt install build-essential checkinstall libssl-dev
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.1/install.sh | bash
nvm --version; nvm ls; nvm ls-remote
nvm install 14.15.5

# Download source code, build and run
git clone https://github.com/StarsThu2016/tractor_private.git
cd tractor_private/
npm install
npm run build
./gradlew run
```

## Launch a Game Server on an AWS EC2 Instance
Players can play at http://{ip_address}:8080/#/{room_number} after finishing the following steps.  
Launch an on-demand t3a.small EC2 instance in US East (Ohio) Zone, with AMI ami-05d46f70638444a46 and port 8080 open. The cost is $0.45/day.
```
# Login the EC2 instance
chmod 400 tractor_share.pem
ssh -i tractor_share.pem ubuntu@{ip_address}

screen
cd tractor_private/
npm run build
./gradlew run
```

## Launch a Game Server on Heroku (Cloud Application Platform)
### [Install Heuroku CLI](https://phasertutorials.com/hosting-your-multiplayer-phaser-game-on-heroku/)
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

### Use Gradle Shadow to Build the Project and then "heroku run" Locally
```
curl -s "https://get.sdkman.io" | bash
sdk install gradle 6.8.2
gradle shadowJar
heroku local web
```

If some apps are using 8080 or 8081 port, find it by ```netstat -nap | grep 8080``` and kill it by ```sudo kill -9 $pid```.
If ```heroku local web``` succeeds, you can visit ```localhost:5000``` to play the game.

### Deploy the Project on Heroku
[Create a Keroku app](https://devcenter.heroku.com/articles/creating-apps)
```
heroku create sj-cdp
heroku buildpacks:set heroku/nodejs
heroku buildpacks:add heroku/jvm
git push heroku master
heroku ps:scale web=1
```
Note: remember to push ```build/libs/tractor-all.jar``` to the git repo, and set "Config Vars": KEY=NODE_OPTIONS, VALUE=--openssl-legacy-provider.

## Development Steps
* Modify the source code.
* Validate locally with ```npm run build && ./gradlew run```.
* Build with ```gradle shadowJar```.
* Validate the jar file with ```java -Ddw.server.applicationConnectors[0].port=9090 -Dserver.port=9090 -jar build/libs/tractor-all.jar```.
* Push to the github repo ```git add . && git commit; git push```.
* Check auto-deploy.
* Validate on the cloud.

## Basic Features:

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

## Development Notes

### Backend

The backend is a Java Dropwizard server. The files are in the standard Gradle Java layout, with production files in `src/main/java`. Assets are served from `src/main/resources/assets`. The in-game communications are JSON-serialized messages sent to and received from clients via websocket using the Atmosphere framework.

Run either `./gradlew eclipse` or `./gradlew idea` to setup the project in Eclipse or IntelliJ (respectively), and then run the entry point, `TractorServer.java`.

### Frontend

The frontend is a single-page React app in plain Javascript. The assets live in `client/assets`, self-contained React components live in `client/components`, library code (no React) live in `client/lib`, and the top-level view components live in `client/views`.

To start the dev server, run:

    npm install
    npm run start

Then go to http://localhost:3000. The site will auto-refresh after making any frontend changes.

