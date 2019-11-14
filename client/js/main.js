// Configuração do servidor
var ip_servidor = '127.0.0.1'
var port_servidor = '5000'
// Estabelecendo uma conexão
var socket = io.connect('http://' + ip_servidor + ':' + port_servidor);
// Returno da confirmação da conexão, mostra um alerta na tela.
socket.on('connect', function () {
    $("#success-alert").fadeTo(5000, 500).slideUp(500, function(){
        $("#success-alert").slideUp(500);
    });
});

// Declarando as variaveis
var numero_tentativas = 0;
var cenario_atual = 0;
var inicio_jogo = 0;
var sala_atual = -1

// Elemento que ira receber a imagem do jogo
var myImg = document.getElementById("img_place_wally");
myImg.onmousedown = GetCoordinates;

// Elemento que irá receber a mensagem final do servidor
var resultadoOut = document.getElementById("resultado_out"); 

// Elemento que contem os cards dos jogos atuais
var divListaJogos = document.getElementById("div_lista_de_jogos"); 

// Elementos auxiliares, janelas posicionaveis do Chat, Zoom e Infomações.
var divChat = document.getElementById("div_chat"); 
var divZoom = document.getElementById("draggableZoom"); 
var divInfo = document.getElementById("draggableInfo"); 

// Declarando o user_name para controle de conexão
var user_name = '';

// Elemento que receberam as informações do Cenário e UserName
var userNameLabel = document.getElementById("username");
var cenarioSelect = document.getElementById("cenario_select"); 

// Textarea do chat, controle do posição da barra de rolagem
var outChatMensagem = document.getElementById("textarea_chat_mensagem");

// Monitoramento do input do chat para auto enviar mensagem após apertar o enter.
var chatInput = document.getElementById("chat_input");
chatInput.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("button_chat").click();
    }
});

// Função que coleta a posição do mause sobre a imagem.
function FindPosition(oElement) {
    if (typeof (oElement.offsetParent) != "undefined") {
        for (var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent) {
            posX += oElement.offsetLeft;
            posY += oElement.offsetTop;
        }
        return [posX, posY];
    } else {
        return [oElement.x, oElement.y];
    }
}

// Função que envia ao servidor as coordernadas do click.
function GetCoordinates(e) {
    var PosX = 0;
    var PosY = 0;
    var ImgPos;
    ImgPos = FindPosition(myImg);
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) {
        PosX = e.pageX;
        PosY = e.pageY;
    } else if (e.clientX || e.clientY) {
        PosX = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        PosY = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }
    PosX = PosX - ImgPos[0];
    PosY = PosY - ImgPos[1];
    numero_tentativas = numero_tentativas + 1

    // Envio dos dados - socket.emit
    socket.emit('send_coord', PosX + ';' + PosY + ';' + numero_tentativas + ';' + user_name + ';' + cenario_atual + ';' + sala_atual);

    document.getElementById("x").innerHTML = PosX;
    document.getElementById("y").innerHTML = PosY;
    document.getElementById("n_tentativas").innerHTML = numero_tentativas;
}

// Função que carrega a imagem do jogo
function LoadImageWally(place_jogo_atual) {
    var folder_img_place_wally = './img/places/'
    var image_name = "wally_place_" + place_jogo_atual + '.jpg'
    var large = folder_img_place_wally + image_name
    document.getElementById("img_place_wally").src = large
    if (place_jogo_atual !== 0){
        var evt = new Event(),
            m = new Magnifier(evt);
        ActiveZoon(m, large)
    }
}

// Função que ativa o modo Zoom do Magnifier
function ActiveZoon(m, large) {
    m.attach({
        thumb: '#img_place_wally',
        large: large,
        largeWrapper: 'preview',
        zoom: 6,
        lens: false
    });
}

// Posicionamento do scroll automaticamente
function InsertChatMessage(msg) {
    outChatMensagem.value += msg
    outChatMensagem.scrollTop = outChatMensagem.scrollHeight
}

// Envio de mensagem no chat geral - se conectado ao servidor
function SendMessageChat() {
    if (user_name === ''){
        $("#user-alert").fadeTo(2000, 500).slideUp(500, function(){
            $("#user-alert").slideUp(500);
        });
    }else{
        msg = user_name + " : " + chatInput.value + '\n'
        socket.send(msg);
        chatInput.value = '';
    }
}

// Controle dos DIV Chat, Zoom e Info
function ShowDivChat(){
    if (divChat.style.display === 'block'){
        divChat.style.display = 'none'
    }else{
        divChat.style.display = 'block'
    }
}
function ShowDivZoom(){
    if (divZoom.style.display === 'block'){
        divZoom.style.display = 'none'
    }else{
        divZoom.style.display = 'block'
    }
}
function ShowDivInfo(){
    if (divInfo.style.display === 'block'){
        divInfo.style.display = 'none'
    }else{
        divInfo.style.display = 'block'
    }
}

// Envia a solicitação de criação de jogo ao servidor.
function CriarJogo(){
    user_name = document.getElementById("userName").value
    if (user_name === ''){
        $("#user-alert-modal").fadeTo(2000, 500).slideUp(500, function(){
            $("#user-alert-modal").slideUp(500);
        });
        $('#modal_conectar').modal('show')
    }else{
        var cenario = cenarioSelect.options[cenarioSelect.selectedIndex].value
        var msg =  cenario + ";" + user_name
        socket.emit('novo_jogo', msg );
    }
}

// Solicita a lista de jogos em aberto
function ListarJogosAtuais(room){
    socket.emit('listar_jogos', room );
}

// Cria os cards dos jogos em aberto
function CriarCardsGamesInfo(data){
    htmlOut = ''
    for (room in data){
        htmlOut += `
        <div class='card m-2 card-sala'>
            <div class='card-header'>
                <h6>Sala 
                    <span id='room_${room}' class='badge badge-info'>${data[room].place}</span></h6>
                <h6>Criada por 
                    <span id='criador_room_${room}' class='badge badge-info'>${data[room].players[0].user_name}</span></h6>
            </div>
            <div class='card-body'>
                <h6>Jogadores 
                        <span id='n_jogadores_room_${room}' class='badge badge-danger'>${data[room].players.length}</span></h6>
                <h6>Cenário
                        <span id='cenario_atual_room_${room}' class='badge badge-info'>${data[room].place}</span></h6>
                <div class='col-12 text-center'>
                    <button type='button' class='btn btn-raised btn-primary mt-2'
                    id='button_conectar_room_${room}' onclick='ConnectarJogo(${room})'>Entrar</button>
                </div>
            </div>
        </div>
        `    
    }
    divListaJogos.innerHTML = htmlOut
}

// Envia a solicitação de entrar no jogo já existente.
function ConnectarJogo(room){
    user_name = document.getElementById("userName").value
    if (user_name === ''){
        $("#user-alert-modal").fadeTo(2000, 500).slideUp(500, function(){
            $("#user-alert-modal").slideUp(500);
        });
        $('#modal_conectar').modal('show')
    }else{
        var data =  user_name + ";" + room
        sala_atual = room
        socket.emit('entrar_no_jogo', data );
    }
}

// Desconecta do servidor.
function Desconectar(){
    data = user_name + ";" + sala_atual
    document.getElementById("button_conectar").style.display = 'block'
    document.getElementById("button_desconectar").style.display = 'none'
    socket.emit('sair_do_jogo', data);
    io.disconnect()
}
