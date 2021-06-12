/*jslint browser this */
/*global _, player, computer, utils */

(function () {
    "use strict";

    var game = {
        PHASE_INIT_PLAYER: "PHASE_INIT_PLAYER",
        PHASE_INIT_OPPONENT: "PHASE_INIT_OPPONENT",
        PHASE_PLAY_PLAYER: "PHASE_PLAY_PLAYER",
        PHASE_PLAY_OPPONENT: "PHASE_PLAY_OPPONENT",
        PHASE_GAME_OVER: "PHASE_GAME_OVER",
        PHASE_WAITING: "waiting",

        currentPhase: "",
        phaseOrder: [],
        // garde une référence vers l'indice du tableau phaseOrder qui correspond à la phase de jeu pour le joueur humain
        playerTurnPhaseIndex: 2,

        // l'interface utilisateur doit-elle être bloquée ?
        waiting: false,

        // garde une référence vers les noeuds correspondant du dom
        grid: null,
        miniGrid: null,

        // liste des joueurs
        players: [],
        statusOver: false,

        // lancement du jeu
        init: function () {


            // initialisation
            this.grid = document.querySelector('.board .main-grid');
            this.miniGrid = document.querySelector('.mini-grid');// mauvaise class ciblé .board

            // défini l'ordre des phase de jeu




            this.playerTurnPhaseIndex = 0;

            // initialise les joueurs
            this.setupPlayers();

            // ajoute les écouteur d'événement sur la grille
            this.addListeners();
            var modalDepart = document.getElementById('init__modal');
            modalDepart.style.display = 'flex';
            var self = this;
            document.querySelector('.computer').addEventListener('click', function () {
                self.phaseOrder = [
                    self.PHASE_INIT_OPPONENT,
                    self.PHASE_INIT_PLAYER,
                    self.PHASE_PLAY_OPPONENT,
                    self.PHASE_PLAY_PLAYER,
                    self.PHASE_GAME_OVER
                ];
                modalDepart.style.display = 'none';
                self.goNextPhase();
            });
            document.querySelector('.player').addEventListener('click', function () {
                self.phaseOrder = [
                    self.PHASE_INIT_PLAYER,
                    self.PHASE_INIT_OPPONENT,
                    self.PHASE_PLAY_PLAYER,
                    self.PHASE_PLAY_OPPONENT,
                    self.PHASE_GAME_OVER
                ];
                modalDepart.style.display = 'none';
                self.goNextPhase();
            });
            document.querySelector('.random').addEventListener('click', function () {
                var randStart = (Math.floor(Math.random() * 2));
                if (randStart === 0) {
                    self.phaseOrder = [
                        self.PHASE_INIT_OPPONENT,
                        self.PHASE_INIT_PLAYER,
                        self.PHASE_PLAY_OPPONENT,
                        self.PHASE_PLAY_PLAYER,
                        self.PHASE_GAME_OVER
                    ];
                    modalDepart.style.display = 'none';
                    self.goNextPhase();
                } else {
                    self.phaseOrder = [
                        self.PHASE_INIT_PLAYER,
                        self.PHASE_INIT_OPPONENT,
                        self.PHASE_PLAY_PLAYER,
                        self.PHASE_PLAY_OPPONENT,
                        self.PHASE_GAME_OVER
                    ];
                    modalDepart.style.display = 'none';
                    self.goNextPhase();
                }
            });
            // c'est parti !
            // this.goNextPhase();
        },
        setupPlayers: function () {
            // donne aux objets player et computer une réference vers l'objet game
            player.setGame(this);
            computer.setGame(this);

            // todo : implémenter le jeu en réseaux
            this.players = [player, computer];

            this.players[0].init();
            this.players[1].init();
        },
        goNextPhase: function () {
            // récupération du numéro d'index de la phase courante


            var ci = this.phaseOrder.indexOf(this.currentPhase);
            var self = this;

            if (ci !== this.phaseOrder.length - 1) {
                this.currentPhase = this.phaseOrder[ci + 1];
            } else {
                this.currentPhase = this.phaseOrder[0];
            }
            switch (this.currentPhase) {
                case this.PHASE_GAME_OVER:
                    // detection de la fin de partie
                    if (!this.gameIsOver()) {
                        // le jeu n'est pas terminé on recommence un tour de jeu
                        this.currentPhase = this.phaseOrder[this.playerTurnPhaseIndex + 1];
                        utils.info("A vous de jouer, choisissez une case !");
                        self.goNextPhase();
                    }
                    break;
                case this.PHASE_INIT_PLAYER:
                    utils.info("Placez vos bateaux");
                    break;
                case this.PHASE_INIT_OPPONENT:
                    this.wait();
                    utils.info("En attente de votre adversaire");
                    this.players[1].isShipOk(function ($var) {
                        self.stopWaiting();
                        self.goNextPhase();
                    });
                    break;
                case this.PHASE_PLAY_PLAYER:
                    utils.info("A vous de jouer, choisissez une case !");
                    break;
                case this.PHASE_PLAY_OPPONENT:
                    utils.info("A votre adversaire de jouer...");
                    this.players[1].play();
                    break;
            }

        },
        isGameOver: function (player1) {
            let player = player1;
            let playerGrid = player.grid;
            let allValues = [];
            let health = [];
            let allBoats = player.fleet;
            let modal = document.querySelector('#win__modal');

            /*Parcours de tableau pour récupérer valeur des cell*/
            const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
            playerGrid.forEach(function (row, rid) {
                row.forEach(function (val, col) {
                    allValues.push(val);
                })
            })

            /*Mis à jour de la vie des bateau via le count du tableau allValues*/
            for (let i = 0; i < allBoats.length; i++) {
                /*Remplace la vie du bateau par le count de l'identifiant dans le tableau*/
                allBoats[i].life = countOccurrences(allValues, allBoats[i].id);

                /*Exo 9 : Ajoute une classe disabled ==> "sunk",  à l'image apercu correspondent au bateau*/
                if (allBoats[i].life === 0) {
                    console.log(allBoats[i].dom);
                    let currentClassName = "." + allBoats[i].name.toLowerCase();
                    let currentBoat = document.querySelector(currentClassName);
                    if (allBoats[i].id === 1 || allBoats[i].id === 2 || allBoats[i].id === 3 || allBoats[i].id === 4) {
                        currentBoat.classList.add("sunk");
                    }
                    health.push(true);
                }
            }
            /*Si tout nos bateau on une vie à 0 === Game Over*/

            if (health.length === 4) {
                if (allBoats[0].id === 1) {
                    alert('game Over');
                    modal.addEventListener("click",function(){
                        this.fadeIn(modal, 600);
                    });
                    modal.style.display = 'flex';
                    document.querySelector('.modal-header').innerHTML = 'Game Over !';
                    document.querySelector('#winner').innerHTML = 'Vous avez perdu !';
                } else {
                    console.log("your win");
                    modal.addEventListener("click",function(){
                        this.fadeIn(modal, 600);
                    });
                    modal.style.display = 'flex';
                    document.querySelector('.modal-header').innerHTML = 'Victoire !';
                    document.querySelector('#winner').innerHTML = 'Vous avez gagnez !';
                }

                this.statusOver = true;
            }
            console.log(allBoats);
        },
        gameIsOver: function () {
            return this.statusOver;
        },
        getPhase: function () {
            if (this.waiting) {
                return this.PHASE_WAITING;
            }
            return this.currentPhase;
        },
        // met le jeu en mode "attente" (les actions joueurs ne doivent pas être pris en compte si le jeu est dans ce mode)
        wait: function () {
            this.waiting = true;
        },
        // met fin au mode mode "attente"
        stopWaiting: function () {
            this.waiting = false;
        },
        addListeners: function () {
            // on ajoute des acouteur uniquement sur la grid (délégation d'événement)
            this.grid.addEventListener('mousemove', _.bind(this.handleMouseMove, this));
            this.grid.addEventListener('click', _.bind(this.handleClick, this));
            this.grid.addEventListener('contextmenu', _.bind(this.RightClick, this));
        },


        RightClick: function (e) {
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];
                if (ship.dom.parentNode) {
                    ship.changerOrientation();
                    let gridShift = utils.calculateGridShift(this.players[0]);
                    ship.followCursor(gridShift, e.target.parentNode, e.target);
                }
            }
        },
        handleMouseMove: function (e) {
            // on est dans la phase de placement des bateau
            if (this.getPhase() === this.PHASE_INIT_PLAYER && e.target.classList.contains('cell')) {
                var ship = this.players[0].fleet[this.players[0].activeShip];

                // si on a pas encore affiché (ajouté aux DOM) ce bateau
                if (!ship.dom.parentNode) {
                    this.grid.appendChild(ship.dom);
                    // passage en arrière plan pour ne pas empêcher la capture des événements sur les cellules de la grille
                    ship.dom.style.zIndex = -1;
                }

                // décalage visuelle, le point d'ancrage du curseur est au milieu du bateau
                let gridShift = utils.calculateGridShift(this.players[0]);
                ship.followCursor(gridShift, e.target.parentNode, e.target);
            }
        },

        fadeIn: function (element, duration = 600) {
            element.style.display = '';
            element.style.opacity = 0;
            let last = +new Date();
            const tick = function () {
                element.style.opacity = + element.style.opacity + (new Date() - last) / duration;
                last = +new Date();
                if (+element.style.opacity < 1) {
                    (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                }
            };
            tick();
        },
        handleClick: function (e) {
            // self garde une référence vers "this" en cas de changement de scope
            var self = this;

            // si on a cliqué sur une cellule (délégation d'événement)
            if (e.target.classList.contains('cell')) {
                // si on est dans la phase de placement des bateau
                if (this.getPhase() === this.PHASE_INIT_PLAYER) {
                    // on enregistre la position du bateau, si cela se passe bien (la fonction renvoie true) on continue
                    if (this.players[0].setActiveShipPosition(utils.eq(e.target), utils.eq(e.target.parentNode))) {
                        // et on passe au bateau suivant (si il n'y en plus la fonction retournera false)
                        if (!this.players[0].activateNextShip()) {
                            this.wait();
                            utils.confirm("Confirmez le placement ?", function () {
                                // si le placement est confirmé
                                self.stopWaiting();
                                self.renderMiniMap();
                                //self.players[0].clearPreview();
                                self.goNextPhase();
                            }, function () {
                                self.stopWaiting();
                                // sinon, on efface les bateaux (les positions enregistrées), et on recommence
                                self.players[0].resetShipPlacement();
                            });
                        }
                    }
                    // si on est dans la phase de jeu (du joueur humain)
                } else if (this.getPhase() === this.PHASE_PLAY_PLAYER) {
                    this.players[0].play(utils.eq(e.target), utils.eq(e.target.parentNode));
                }
            }
        },
        // fonction utilisée par les objets représentant les joueurs (ordinateur ou non)
        // pour placer un tir et obtenir de l'adversaire l'information de réussite ou non du tir
        fire: function (from, col, line, callback) {
            this.wait();
            var self = this;
            var msg = "";

            // determine qui est l'attaquant et qui est attaqué
            var target = this.players.indexOf(from) === 0
                ? this.players[1]
                : this.players[0];
            var target1 = this.players.indexOf(from) === 0
                ? this.players[0]
                : this.players[1];

            if (this.currentPhase === this.PHASE_PLAY_OPPONENT) {
                msg += "Votre adversaire vous a... ";
            }

            // on demande à l'attaqué si il a un bateaux à la position visée
            // le résultat devra être passé en paramètre à la fonction de callback (3e paramètre)
            target.receiveAttack(col, line, target1, function (hasSucceed, isFire) {
                if (hasSucceed) {
                    if (isFire === true) {
                        msg += "Vous avez déjà touché a cette position !!!";
                        const audio = new Audio('assets/audio/goodShot.mp3');
                        audio.play();
                        self.renderMap(true);
                    } else {
                        msg += "Touché !";
                        const audio = new Audio('assets/audio/goodShot.mp3');
                        audio.play();
                        self.renderMap(true);
                    }
                } else {
                    if (isFire === true) {
                        msg += "Vous avez déjà manqué votre tir à cette position !!!";
                        const audio = new Audio('assets/audio/badShot.mp3');
                        audio.play();
                        self.renderMap(false);
                    } else {
                        msg += "Manqué...";
                        const audio = new Audio('assets/audio/badShot.mp3');
                        audio.play();
                        self.renderMap(false);
                    }
                }


                utils.info(msg);

                // on invoque la fonction callback (4e paramètre passé à la méthode fire)
                // pour transmettre à l'attaquant le résultat de l'attaque
                callback(hasSucceed);

                // on fait une petite pause avant de continuer...
                // histoire de laisser le temps au joueur de lire les message affiché
                setTimeout(function () {
                    self.stopWaiting();
                    self.goNextPhase();
                }, 1000);
            });

        },
        renderMap: function (status) {
            this.isGameOver(this.players[0]);
            this.isGameOver(this.players[1]);
            if (this.currentPhase === 'PHASE_PLAY_PLAYER') {
                this.players[0].renderTries(this.grid);
            } else {
                this.players[1].renderTries(this.miniGrid, 'bot');
            }
        },
        renderMiniMap: function () {

            var ships = this.players[0].fleet;

            ships.forEach((ship) => {
                this.miniGrid.appendChild(ship.dom);
            });
        }
    };

    // point d'entrée
    document.addEventListener('DOMContentLoaded', function () {
        game.init();
    });

    document.querySelector('.newGame').addEventListener('click', function () {
        location.reload();
    });

}());