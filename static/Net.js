class Net {
    // pobranie listy pokoji
    getRooms = () => {
        const options = {
            method: "POST"
        };
        fetch("/GET_ROOMS", options)
            .then(response => response.json()) // konwersja na json
            .then(data => ui.lobby(data)) // dane odpowiedzi z serwera
            .catch(error => console.log(error));
    }
    // wyslanie zapytania odnosne dolaczenia do wybranego pokoju
    enterRoom = (num, name) => {
        const data = JSON.stringify({ roomNumber: num, username: name })
        const options = {
            method: "POST",
            body: data
        };
        fetch("/ENTER_ROOM", options)
            .then(response => response.json()) // konwersja na json
            .then(data => ui.entering(data)) // dane odpowiedzi z serwera
            .catch(error => console.log(error));
    }
    // reset pokoju
    resetRoom = (num) => {
        const data = JSON.stringify({ roomNumber: num })
        const options = {
            method: "POST",
            body: data
        };
        fetch("/RESET_ROOM", options)
            .then(response => response.json()) // konwersja na json
            // .then(data => ui.entering(data)) // dane odpowiedzi z serwera
            .catch(error => console.log(error));
    }
    // wysylanie zapytania sprawdzajacego czy jest dwch graczy w pokoju i czy mozna rozpoczac
    asking = async () => {
        if (document.getElementById("loginWindow")) document.getElementById("loginWindow").remove();

        let div = document.createElement("div")
        div.id = "waitingForEnemy"
        div.innerHTML = "Waiting for Player 2..."
        document.body.appendChild(div)

        let loader = document.createElement("div")
        loader.id = "loader"
        div.appendChild(loader)



        let x = setInterval(() => {
            // console.log("pytam");
            const data = JSON.stringify({ roomNumber: game.roomNumber })
            const options = {
                method: "POST",
                body: data
            };
            fetch("/ASK", options)
                .then(response => response.json()) // konwersja na json
                .then(data => {
                    if (data.status == "start") {

                        game.board = data.board
                        game.turn = data.turn
                        if (game.player == 1) game.enemy = data.player2
                        if (game.player == 2) game.enemy = data.player1
                        ui.changeStatus("Start")
                        game.start()
                        clearInterval(x)
                        document.getElementById("waitingForEnemy").remove()
                    }
                    else ui.changeStatus("waiting")
                }) // dane odpowiedzi z serwera
                .catch(error => console.log(error));

        }, 500);
    }
    updateBoard = (num, board, name, positions) => {
        const data = JSON.stringify({ roomNumber: num, board: board, pawn: name, positions: positions })
        const options = {
            method: "POST",
            body: data
        };
        fetch("/UPDATE_ROOM", options)
            .then(response => response.json()) // konwersja na json
            .then(data => {
                game.turn = data.turn;
                game.board = data.board;
                game.name = data.name;
                game.positions = data.positions;
            }) // ddne odpowiedzi z serwera
            .catch(error => console.log(error));
    }
    waitingForTurn = async () => {
        let div = document.createElement("div")
        div.id = "waitingForTurn"
        document.body.appendChild(div)

        let p = document.createElement("p")
        p.id = "timer"
        p.innerHTML = "Twój przeciwnik ma ruch, zostało mu 60 [s];"
        div.appendChild(p)
        var countDownDate = Date.now() + 61000
        var seconds
        var countDowning = setInterval(function () {
            var now = Date.now();

            var distance = countDownDate - now

            seconds = Math.floor((distance % (1000 * 60)) / 1000);

            p.innerHTML = `Twój przeciwnik ma ruch, zostało mu ${seconds}[s];`

        })

        let x = setInterval(() => {
            const data = JSON.stringify({ roomNumber: game.roomNumber, board: game.board, name: game.name, positions: game.positions })
            const options = {
                method: "POST",
                body: data
            };
            fetch("/ASK_TURN", options)
                .then(response => response.json()) // konwersja na json
                .then(data => {
                    if (data.status == "wait") {
                        if (seconds < 0) {
                            clearInterval(countDowning)
                            document.onmousedown = null
                            ui.changeStatus("Wygrałeś na tego frajera!")
                            if (document.getElementById("waitingForTurn")) document.getElementById("waitingForTurn").remove()
                        }

                        console.log("czekam");
                    } else if (data.status == "move") {
                        game.board = data.board
                        game.turn = data.turn
                        game.name = data.name
                        game.positions = data.positions
                        game.enemyMove();
                        game.jebanaFunkcja();
                        clearInterval(x)
                        clearInterval(countDowning)
                        if (document.getElementById("waitingForTurn")) document.getElementById("waitingForTurn").remove()
                        console.log("move");
                    }
                }) // dane odpowiedzi z serwera
                .catch(error => console.log(error));
        }, 500);
    }
}