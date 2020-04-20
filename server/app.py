from flask import Flask, request, jsonify
from flask_socketio import SocketIO, send, emit

import json
import time

from jsonmanager import gameManager, respostaManager

app = Flask(__name__)
app.config['SECRET_KEY'] = 'Desafio333'
socketio = SocketIO(app, cors_allowed_origins="*")

json_folder = './json/'
json_games = 'games.json'
json_respostas = 'resposta.json'

games = gameManager(json_folder, json_games)
respostas = respostaManager(json_folder, json_respostas)


@socketio.on('message')
def handleMessage(msg):
    print('Message: ' + msg)
    send(msg, broadcast=True)


@socketio.on('connect')
def enviarDadosJogo():
    emit('jogador_conectado', "")


@socketio.on('sair_do_jogo')
def handleSairJogo(data):
    user_name, room = data.split(';')
    room = int(room)
    gameInfo = games.getGameInfo(room)
    print(gameInfo)
    if len(gameInfo['players']) == 1:
        games.removeGame(room)
    else:
        games.removePlayer(room, '127.0.0.1', user_name)
    emit('jogador_desconectado', user_name, broadcast=True)


@socketio.on('send_coord')
def handleCoord(msg):
    x, y, tentativas, user_name, place, room = msg.split(";")
    x = int(x)
    y = int(y)
    resposta = respostas.getResposta(place)
    print(resposta)
    x_min = int(resposta['x_min'])
    y_min = int(resposta['y_min'])
    x_max = int(resposta['x_max'])
    y_max = int(resposta['y_max'])
    if x > x_min and x < x_max:
        if y > y_min and y < y_max:
            room = int(room)
            gameInfo = games.getGameInfo(room)
            hStart, mStart, sStart = gameInfo['start'].split(':')
            hEnd = str(time.localtime().tm_hour)
            mEnd = str(time.localtime().tm_min)
            sEnd = str(time.localtime().tm_sec)
            hTotal = int(hEnd) - int(hStart)
            mTotal = int(mEnd) - int(mStart)
            sTotal = int(sEnd) - int(sStart)
            games.removeGame(room)
            msg_retorno = str(
                        f"Ganhador é {user_name}. Com as coordernadas X:{x}"
                        + f"e Y:{y}. Ele acertou com {tentativas} tentativas "
                        + f"no tempo de {hTotal}h:{mTotal}m:{sTotal}s."
                        )
            emit(
                'resultado',
                {'room': room, 'msg': msg_retorno},
                broadcast=True
                )


@socketio.on('novo_jogo')
def handleNovoJogo(msg):
    place, user_name = msg.split(";")
    place = int(place)
    gamesInfo = games.creatGame(place, "127.0.0.1", user_name)
    emit('jogo_criado', gamesInfo)


@socketio.on('listar_jogos')
def handleListarJogos(room):
    if room == '-1':
        gamesInfo = games.getGamesInfo()
    else:
        gamesInfo = games.getGameInfo(room)
    emit('lista_de_jogos', gamesInfo)


@socketio.on('entrar_no_jogo')
def handleEntrarNoJogo(data):
    user_name, room = data.split(';')
    room = int(room)
    games.newPlayer(room, '127.0.0.1', user_name)
    gamesInfo = games.getGameInfo(room)
    emit('dados_do_jogo', gamesInfo)


@app.route('/cheats', methods=['POST'])
def cheats():
    if 'place' in request.args:
        place = request.args.get('place', default=0, type=int)
        if place == 0 or place > 6:
            data = {'Mensagem': "Cenário não encontrado."}
            return jsonify(data)
        else:
            resposta = respostas.getResposta(str(place))
            data = {
                'Mensagem': "Aproveite, porem não conte para ninguem.",
                'resposta': resposta
            }
            return jsonify(data)
    else:
        data = {'Mensagem': "tente /cheats?place=[arg]"}
        return jsonify(data)


if __name__ == '__main__':
    socketio.run(app, host="127.0.0.1")
