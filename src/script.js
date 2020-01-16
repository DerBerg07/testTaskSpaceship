let width = 1280; //шырина экрана
let height = 720; // высота экрана
let app; //переменная приложения
let background;
let gameStatus = 1; //1 - игра 2 - конец
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

const bulletSpeed = 7,
      asteroidsCount = 5;

let spaceship,
    bulletsLeft = 10,
    posSituation = 0,
    asteroids = [],
    timeText,
    bullets = [],
    timeLeft = 60;

let loseText = 'You Lose',
    winText = 'You win';

let model = {

    keyboardEvents: () => {
        let left = keyboard('ArrowLeft'),
            right = keyboard('ArrowRight'),
            fire = keyboard(" ");

        fire.press = () => {
            if (bulletsLeft > 0) {
                model.createBullet();
                bulletsLeft--;
            }

        };

        left.press = () => {
            spaceship.mx = -7;
        };

        left.release = () => {
            if (spaceship.mx < 0 && right.isDown) {
                spaceship.mx = 7;
            }else if ( spaceship.mx < 0){
                spaceship.mx = 0;
            }
        };

        right.press = () => {
            spaceship.mx = 7;
        };

        right.release = function () {
            if (spaceship.mx > 0 && left.isDown) {
                spaceship.mx = -7;
            }else if ( spaceship.mx > 0){
                spaceship.mx = 0;
            }

        };
    },

    createCanvas: () => {
        app = new Application({
            width: width,
            height: height
        });
        app.renderer.backgroundColor = 0x061639;
        document.body.appendChild(app.view);

    },

    loadTextures: () => {
        loader
            .add([
                "images/asteroid.png",
                "images/background.png",
                "images/spaceship.png"
            ]).load(spriteinit);

        function spriteinit() {
            background = new Sprite(resources["images/background.png"].texture);
            app.stage.addChild(background);

            let style = new PIXI.TextStyle({
                fill: '0xffffff',
                fontSize: 36,
            });
            timeText = new PIXI.Text('time left-'+ timeLeft , style);
            timeText.x = 50;
            timeText.y = 50;
            timeText.pivot.x = 50;
            timeText.pivot.y = 50;
            app.stage.addChild(timeText);

            spaceship = new Sprite(resources["images/spaceship.png"].texture);
            spaceship.anchor.x = 0.5;
            spaceship.anchor.y = 1;
            spaceship.x = width / 2;
            spaceship.y = height - 15;
            spaceship.mx = 0;
            app.stage.addChild(spaceship);


            for (let i = 0; i < asteroidsCount; i++) {
                let asteroid = new Sprite(resources["images/asteroid.png"].texture);
                asteroid.x = Math.random() * (width - asteroid.width);
                asteroid.y = Math.random() * height * 0.4;
                asteroid.mover = Math.random() * 10; //для рандомного движения
                asteroids.push(asteroid);
                app.stage.addChild(asteroid);
            }

        }


    },

    createBullet: () => {
        let radius = 10;
        let bulletX = spaceship.x;
        let bulletY = spaceship.y - spaceship.height;
        let bullet = new PIXI.Graphics();
        bullet.lineStyle(0);
        bullet.beginFill(0xe07722, 1);
        bullet.drawCircle(bulletX, bulletY, radius);
        bullet.endFill();
        bullet.interactive = true;
        bullets.push(bullet);
        app.stage.addChild(bullet);

    },

    gameEnd: (Text) => {
        let style = new PIXI.TextStyle({
            fill: '0xffffff',
            fontSize: 36,
        });
        let gameEndText = new PIXI.Text(Text, style);
        gameEndText.x = width / 2;
        gameEndText.y = height / 2;
        gameEndText.pivot.x = 50;
        gameEndText.pivot.y = 50;
        app.stage.addChild(gameEndText);
    }

};

let view = {

    loadGame: function () {
        model.keyboardEvents();
        model.createCanvas();
        model.loadTextures();
        //таймер конца времени
        let Timer = setInterval(()=>{
                timeLeft--;
                timeText.text = "time left-"+timeLeft ;
                if(timeLeft<=0){
                    model.gameEnd(loseText);
                    clearInterval(Timer);
                    gameStatus = 2;
                }
        }, 1000);
        app.ticker.add(function () {
            if (gameStatus === 1){
            posSituation += 0.1;
            //случайные движения
            asteroids.map(asteroid =>{
                asteroid.x = asteroid.x +Math.sin(posSituation + asteroid.mover)*10;

            });
                // Ограничение по ширине
                if (spaceship) {
                    if ((spaceship.x < (spaceship.width / 2)) && spaceship.mx < 0) {
                        spaceship.mx = 0;
                    } else if ((spaceship.x > (width - spaceship.width / 2)) && spaceship.mx > 0) {
                        spaceship.mx = 0;
                    }
                    spaceship.x += spaceship.mx;
                }
                //Снаряд
                if (bullets[0]) {
                    for (let i = 0; i < bullets.length; i++) {
                        bullets[i].y -= bulletSpeed;
                        if (bullets[i].y < (-height + spaceship.height)) {
                            bullets[i].destroy();
                            bullets.splice(bullets.indexOf(bullets[i]), 1);
                        }
                        for (let k = 0; k < asteroids.length; k++) {
                            //проверка попадание
                            if (controller.checkCollision(bullets[i], asteroids[k])) {
                                //удаление снаряда и астероида
                                bullets[i].destroy();
                                asteroids[k].destroy();
                                bullets.splice(bullets.indexOf(bullets[i]), 1);
                                asteroids.splice(asteroids.indexOf(asteroids[k]), 1);
                                //проверка победы
                                if (!asteroids[0]) {
                                    model.gameEnd(winText);
                                    gameStatus = 2;
                                    return false;
                                }
                            }
                        }
                    }
                }

                //Пвроерка проиграша
                if (asteroids.length > 0 && bulletsLeft <= 0 && bullets.length <= 0) {
                    model.gameEnd(loseText);
                    gameStatus = 2;
                    return false;
                }

            }
        }
        )

    }
};


var controller = {
    checkCollision: function (obj1, obj2) {
        if (obj1 && obj2) {
            var ab = obj1.getBounds();
            var bb = obj2.getBounds();
            return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
        }
    }
};


view.loadGame();

