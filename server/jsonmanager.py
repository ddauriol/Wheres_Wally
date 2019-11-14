import json
import time


class gameManager():
    def __init__(self, json_folder, json_game):
        self.json_game = json_game
        self.json_folder = json_folder

    def getGamesInfo(self):
        file = self.json_folder + self.json_game
        with open(file, "r") as f:
            data = json.load(f)
            gameInfo = data
        return gameInfo

    def getGameInfo(self, room):
        games = []
        games = self.getGamesInfo()
        game_info = games[room]
        return game_info

    def creatGame(self, place, ip_client, user_name):
        start = (
            str(time.localtime().tm_hour)
            + ':' + str(time.localtime().tm_min)
            + ':' + str(time.localtime().tm_sec)
            )

        new_game = {
                "place": place,
                "players": [{
                    "ip": ip_client,
                    "user_name": user_name
                }],
                "start": start
                }
        self.saveGame(new_game)
        gameInfo = self.getGamesInfo()
        return gameInfo

    def saveGame(self, game, room='-1'):
        file = self.json_folder + self.json_game
        games = []
        games = self.getGamesInfo()

        if room == '-1':
            games.append(game)
        else:
            games[room] = game

        with open(file, "w") as f:
            json.dump(games, f)

    def newPlayer(self, room, ip_client, user_name):
        game = self.getGameInfo(room)
        players = []
        players = game['players']
        for player in players:
            if str(user_name) == str(player['user_name']):
                return

        players.append({
                    "ip": ip_client,
                    "user_name": user_name
                })
        game['players'] = players
        self.saveGame(game, room)

    def removePlayer(self, room, ip_client, user_name):
        game = self.getGameInfo(room)
        players = []
        players = game['players']

        i = 0
        for player in players:
            if ip_client == player['ip'] and user_name == player['user_name']:
                del players[i]
            i += 1

        game['players'] = players
        self.saveGame(game, room)

    def removeGame(self, room):
        file = self.json_folder + self.json_game
        games = []
        games = self.getGamesInfo()
        room = int(room)
        del games[room]
        with open(file, "w") as f:
            json.dump(games, f)

class respostaManager():
    def __init__(self, json_folder, json_resposta):
        self.json_folder = json_folder
        self.json_resposta = json_resposta

    def getResposta(self, place):
        file = self.json_folder + self.json_resposta
        with open(file, "r") as f:
            data = json.load(f)
            respostas = data
        for resposta in respostas:
            if resposta['place'] == "wally_place_"+place:
                return resposta


# Tests
# json_folder = './json/'
# json_game = 'games.json'
# json_resposta = 'resposta.json'

# WhereWally = gameManager(json_folder, json_game)
# WhereWallyRespostas = respostaManager(json_folder, json_resposta)

# WhereWallyRespostas.getResposta('wally_place_6')

# print(WhereWally.getGameInfo(1))

# print(WhereWally.getGamesInfo())

# WhereWally.creatGame(6,"192.168.0.1","ddauriol")
# print(WhereWally.getGamesInfo())

# print(WhereWally.getGameInfo(6))
# WhereWally.newPlayer(6,'192.168.0.9',"teste")
# print(WhereWally.getGameInfo(6))

# print(WhereWally.getGameInfo(6))
# WhereWally.removePlayer(6,'192.168.0.9',"teste")
# print(WhereWally.getGameInfo(6))
