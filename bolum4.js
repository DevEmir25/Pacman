const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const puanElementi = document.querySelector('#puanElementi');
canvas.width = innerWidth;
canvas.height = innerHeight;

const guclendirmeSuresi = 2400; //ms
const surat = 2; //oyuncunun sürati
const dusmanSurat = 1; //düşmanın sürati
const dusmanYaricap = 19; //düşmanın yarıçapı
const yaricap = 18; //oyuncunun yarıçapı
const yemYaricap = yaricap / 6;
const guclendirmeYaricap = yaricap / 2.5;
const kenarUzunluk = 40; //duvarın kenar uzunluğu

class Duvar {
    static en = kenarUzunluk;
    static boy = kenarUzunluk;
    constructor({ konum, resim }) {
        this.konum = konum;
        this.en = kenarUzunluk;
        this.boy = kenarUzunluk;
        this.resim = resim;
    }

    ciz() {
        c.drawImage(this.resim, this.konum.x, this.konum.y);
    }
}

class Oyuncu {
    constructor({ konum, hiz }) {
        this.konum = konum;
        this.hiz = hiz;
        this.yaricap = yaricap;
        this.agizAcikligi = 0.77;
        this.isirmaHizi = 0.042;
        this.donmeAcisi = 0;
    }

    ciz() {
        c.save();
        c.translate(this.konum.x, this.konum.y);
        c.rotate(this.donmeAcisi);
        c.translate(-this.konum.x, -this.konum.y);
        c.beginPath();
        c.arc(
            this.konum.x,
            this.konum.y,
            this.yaricap,
            this.agizAcikligi,
            Math.PI * 2 - this.agizAcikligi
        )
        c.lineTo(this.konum.x, this.konum.y);
        c.fillStyle = 'yellow';
        c.fill();
        c.closePath();
        c.restore();
    }

    guncelle() {
        this.ciz();
        this.konum.x += this.hiz.x;
        this.konum.y += this.hiz.y;
        if (this.agizAcikligi < 0 || this.agizAcikligi > 0.77) {
            this.isirmaHizi = -this.isirmaHizi;
        }
        this.agizAcikligi += this.isirmaHizi;

        if (this.hiz.x > 0) //sağa gidiyorum
            this.donmeAcisi = 0;
        else if (this.hiz.x < 0) //sola gidiyorum
            this.donmeAcisi = -Math.PI;
        else if (this.hiz.y < 0) //yukarı gidiyorum
            this.donmeAcisi = -Math.PI / 2;
        else if (this.hiz.y > 0) //aşağı gidiyorum
            this.donmeAcisi = Math.PI / 2;
    }
}
class Dusman {
    constructor({ konum, hiz, renk = 'red' }) {
        this.konum = konum;
        this.hiz = hiz;
        this.yaricap = dusmanYaricap;
        this.renk = renk;
        this.sonCarpmalar = [];
        this.korktu = false;
    }

    ciz() {
        c.beginPath();
        c.arc(
            this.konum.x,
            this.konum.y,
            this.yaricap,
            0,
            Math.PI * 2
        )
        c.fillStyle = this.korktu ? 'blue' : this.renk;
        c.fill();
        c.closePath();
    }

    guncelle() {
        this.ciz();
        this.konum.x += this.hiz.x;
        this.konum.y += this.hiz.y;
    }
}

class Yem {
    constructor({ konum }) {
        this.konum = konum;
        this.yaricap = yemYaricap;
    }

    ciz() {
        c.beginPath();
        c.arc(
            this.konum.x,
            this.konum.y,
            this.yaricap,
            0,
            Math.PI * 2
        )
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }
}
class Guclendirme {
    constructor({ konum }) {
        this.konum = konum;
        this.yaricap = guclendirmeYaricap;
    }

    ciz() {
        c.beginPath();
        c.arc(
            this.konum.x,
            this.konum.y,
            this.yaricap,
            0,
            Math.PI * 2
        )
        c.fillStyle = 'white';
        c.fill();
        c.closePath();
    }
}
const duvarlar = [];
const yemler = [];
const guclendirmeler = [];
const dusmanlar = [
    new Dusman({
        konum: {
            x: kenarUzunluk * 9.5,
            y: kenarUzunluk * 2.5
        },
        hiz: {
            x: -dusmanSurat,
            y: 0
        },
        renk: 'red'
    }),
    new Dusman({
        konum: {
            x: kenarUzunluk * 2.5,
            y: kenarUzunluk * 11.5
        },
        hiz: {
            x: 0,
            y: -dusmanSurat
        },
        renk: 'pink'
    }),
    new Dusman({
        konum: {
            x: kenarUzunluk * 9.5,
            y: kenarUzunluk * 10.5
        },
        hiz: {
            x: -dusmanSurat,
            y: 0
        },
        renk: 'green'
    })
];
const oyuncu = new Oyuncu({
    konum: {
        x: kenarUzunluk * 2.5,
        y: kenarUzunluk * 2.5
    },
    hiz: {
        x: 0,
        y: 0
    }
});
const tuslar = { //kontrol tuşları
    w: { basildi: false },
    a: { basildi: false },
    s: { basildi: false },
    d: { basildi: false },
    ArrowUp: { basildi: false },
    ArrowLeft: { basildi: false },
    ArrowDown: { basildi: false },
    ArrowRight: { basildi: false },

}

function hareket() {
    if ((tuslar.w.basildi || tuslar.ArrowUp.basildi) || sonTus === 'w') {      //
        for (let i = 0; i < duvarlar.length; i++) { //YUKARI                  //
            const duvar = duvarlar[i];                                       //
            if (carpismaKosulu({                                            //
                oyuncu: {                                                  //  
                    ...oyuncu, hiz: { x: 0, y: -surat }                   //  
                },                                                       //     oyuncunun sonraki adımını aklında tutan ve
                duvar: duvar                                            //    komut mümkün olduğunda otomatik gerçekleştiren kod
            })) {                                                      //   
                oyuncu.hiz.y = 0;                                     //
                break;                                               //
            }                                                       //
            else { oyuncu.hiz.y = -surat; }                        //
        }                                                         //
    }
    else if ((tuslar.a.basildi || tuslar.ArrowLeft.basildi) || sonTus === 'a') { //SOL
        for (let i = 0; i < duvarlar.length; i++) {
            const duvar = duvarlar[i];
            if (carpismaKosulu({
                oyuncu: {
                    ...oyuncu, hiz: { x: -surat, y: 0 } //... sayesinde parametre olarak yollayacağımız nesneyi yollamadan önce düzenleyebiliyoruz.
                },
                duvar: duvar
            })) {
                oyuncu.hiz.x = 0;
                break;
            }
            else { oyuncu.hiz.x = -surat; }
        }
    }
    else if ((tuslar.s.basildi || tuslar.ArrowDown.basildi) || sonTus === 's') { //AŞAĞI
        for (let i = 0; i < duvarlar.length; i++) {
            const duvar = duvarlar[i];
            if (carpismaKosulu({
                oyuncu: {
                    ...oyuncu, hiz: { x: 0, y: surat }
                },
                duvar: duvar
            })) {
                oyuncu.hiz.y = 0;
                break;
            }
            else { oyuncu.hiz.y = surat; }
        }
    }
    else if ((tuslar.d.basildi || tuslar.ArrowRight.basildi) || sonTus === 'd') { //SAĞ
        for (let i = 0; i < duvarlar.length; i++) {
            const duvar = duvarlar[i];
            if (carpismaKosulu({
                oyuncu: {
                    ...oyuncu, hiz: { x: surat, y: 0 }
                },
                duvar: duvar
            })) {
                oyuncu.hiz.x = 0;
                break;
            }
            else { oyuncu.hiz.x = surat; }
        }
    }

    duvarlar.forEach((duvar) => {
        duvar.ciz();
        if (carpismaKosulu({ oyuncu: oyuncu, duvar: duvar })) {
            oyuncu.hiz.x = 0;
            oyuncu.hiz.y = 0;
        }
    });
}

function carpismaKosulu({ oyuncu, duvar }) {
    return (oyuncu.konum.y - oyuncu.yaricap + oyuncu.hiz.y <= duvar.konum.y + duvar.boy &&//YUKARI
        oyuncu.konum.x - oyuncu.yaricap + oyuncu.hiz.x <= duvar.konum.x + duvar.en &&//SOL
        oyuncu.konum.y + oyuncu.yaricap + oyuncu.hiz.y >= duvar.konum.y &&//AŞAĞI
        oyuncu.konum.x + oyuncu.yaricap + oyuncu.hiz.x >= duvar.konum.x);//SAĞ
}

var puan = 0;
function yemleriGuncelle() {
    for (let i = yemler.length - 1; 0 <= i; i--) {
        const yem = yemler[i];
        yem.ciz();
        //yemler ile oyuncu arasındaki çarpışmaları algılar
        if (Math.hypot(yem.konum.x - oyuncu.konum.x, yem.konum.y - oyuncu.konum.y) < yem.yaricap + oyuncu.yaricap) {
            yemler.splice(i, 1);
            puan += 10;
            puanElementi.innerHTML = puan;
        }
    }
}

function dusmanlariGuncelle() {
    dusmanlar.forEach((dusman, i) => {
        dusman.guncelle();
        // düşman ile oyuncu çarpıştı
        if (Math.hypot(dusman.konum.x - oyuncu.konum.x, dusman.konum.y - oyuncu.konum.y) < dusman.yaricap + oyuncu.yaricap) { //oyunu kaybetme koşulu
            if (dusman.korktu) {
                dusmanlar.splice(i, 1);
            }
            else {
                kaybettin();
            }
        }
        const carpmalar = [];
        duvarlar.forEach(duvar => {
            if (!carpmalar.includes('yukari') && carpismaKosulu({           //
                oyuncu: {                                                  // carpmaların içinde yukarı yoksa ve 
                    ...dusman, hiz: { x: 0, y: -dusmanSurat }             //  yukarı gitse çarpacaksa şu an yukarı çarptığını belirtiyor.
                },                                                       //
                duvar: duvar                                            //
            })) {                                                      //
                carpmalar.push('yukari');                             //
            }                                                        //
            if (!carpmalar.includes('sol') && carpismaKosulu({
                oyuncu: {
                    ...dusman, hiz: { x: -dusmanSurat, y: 0 }
                },
                duvar: duvar
            })) {
                carpmalar.push('sol');
            }
            if (!carpmalar.includes('asagi') && carpismaKosulu({
                oyuncu: {
                    ...dusman, hiz: { x: 0, y: dusmanSurat }
                },
                duvar: duvar
            })) {
                carpmalar.push('asagi');
            }
            if (!carpmalar.includes('sag') && carpismaKosulu({
                oyuncu: {
                    ...dusman, hiz: { x: dusmanSurat, y: 0 }
                },
                duvar: duvar
            })) {
                carpmalar.push('sag');
            }
        })
        if (carpmalar.length > dusman.sonCarpmalar.length)
            dusman.sonCarpmalar = carpmalar;

        if (JSON.stringify(carpmalar) !== JSON.stringify(dusman.sonCarpmalar)) {

            if (dusman.hiz.x > 0)
                dusman.sonCarpmalar.push('sag');
            else if (dusman.hiz.x < 0)
                dusman.sonCarpmalar.push('sol');
            else if (dusman.hiz.y > 0)
                dusman.sonCarpmalar.push('asagi');
            else if (dusman.hiz.y < 0)
                dusman.sonCarpmalar.push('yukari');

            const olasiYollar = dusman.sonCarpmalar.filter((carpma) => { //olası gidilebilecek yolları hesaplar
                return !carpmalar.includes(carpma);
            })

            const gidilecekYol = olasiYollar[Math.floor(Math.random() * olasiYollar.length)]; //hangi yoldan gideceğine karar verir

            switch (gidilecekYol) {
                case 'sag':
                    dusman.hiz.x = dusmanSurat;
                    dusman.hiz.y = 0;
                    break;
                case 'sol':
                    dusman.hiz.x = -dusmanSurat;
                    dusman.hiz.y = 0;
                    break;
                case 'asagi':
                    dusman.hiz.x = 0;
                    dusman.hiz.y = dusmanSurat;
                    break;
                case 'yukari':
                    dusman.hiz.x = 0;
                    dusman.hiz.y = -dusmanSurat;
                    break;
            }
            dusman.sonCarpmalar = [];

        }

        for (let i = guclendirmeler.length - 1; 0 <= i; i--) {
            const guclendirme = guclendirmeler[i];
            guclendirme.ciz();
            //güçlendirme ile oyuncu çarpıştı
            if (Math.hypot(guclendirme.konum.x - oyuncu.konum.x, guclendirme.konum.y - oyuncu.konum.y) < guclendirme.yaricap + oyuncu.yaricap) {
                guclendirmeler.splice(i, 1);
                puan += 30;
                dusmanlar.forEach((dusman) => {
                    dusman.korktu = true;
                    setTimeout(() => {
                        dusman.korktu = false;
                    }, guclendirmeSuresi
                    )
                })
            }
        }
    });
    if (puan == 620) {
        kazandin();
    }
}
function kaybettin() {
    cancelAnimationFrame(animasyonId);
    window.location.href = "yenidenBaslaEkrani4.html"

}
function kazandin() {
    setTimeout(() => { cancelAnimationFrame(animasyonId), window.location.href = "bitisEkrani.html" }, 40)
}

let animasyonId
function oynat() {
    animasyonId = requestAnimationFrame(oynat);
    c.clearRect(0, 0, canvas.width, canvas.height);
    hareket();
    yemleriGuncelle();
    dusmanlariGuncelle();
    oyuncu.guncelle();
}

oynat(); //oyunun her karesini çizen fonksiyon
setTimeout(() => { oynat()}, 8000)  //oyunun her karesini çizen fonksiyon

var sonTus = '';
addEventListener('keydown', ({ key }) => { //hangi tuşa basıldığını algılar
    switch (key) {
        case 'w': tuslar.w.basildi = true; sonTus = 'w';
            break;
        case 'a': tuslar.a.basildi = true; sonTus = 'a';
            break;
        case 's': tuslar.s.basildi = true; sonTus = 's';
            break;
        case 'd': tuslar.d.basildi = true; sonTus = 'd';
            break;
        case 'W': tuslar.w.basildi = true; sonTus = 'w';
            break;
        case 'A': tuslar.a.basildi = true; sonTus = 'a';
            break;
        case 'S': tuslar.s.basildi = true; sonTus = 's';
            break;
        case 'D': tuslar.d.basildi = true; sonTus = 'd';
            break;
        case 'ArrowUp': tuslar.ArrowUp.basildi = true; sonTus = 'w';
            break;
        case 'ArrowLeft': tuslar.ArrowLeft.basildi = true; sonTus = 'a';
            break;
        case 'ArrowDown': tuslar.ArrowDown.basildi = true; sonTus = 's';
            break;
        case 'ArrowRight': tuslar.ArrowRight.basildi = true; sonTus = 'd';
            break;
        case 'Escape': window.location.href = "cikisEkrani.html"
            break;
    }
})
addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'w': tuslar.w.basildi = false;
            break;
        case 'a': tuslar.a.basildi = false;
            break;
        case 's': tuslar.s.basildi = false;
            break;
        case 'd': tuslar.d.basildi = false;
            break;
        case 'W': tuslar.w.basildi = false;
            break;
        case 'A': tuslar.a.basildi = false;
            break;
        case 'S': tuslar.s.basildi = false;
            break;
        case 'D': tuslar.d.basildi = false;
            break;
        case 'ArrowUp': tuslar.ArrowUp.basildi = false;
            break;
        case 'ArrowLeft': tuslar.ArrowLeft.basildi = false;
            break;
        case 'ArrowDown': tuslar.ArrowDown.basildi = false;
            break;
        case 'ArrowRight': tuslar.ArrowRight.basildi = false;
            break;
    }
})
const harita = [ //bölüm tasarımı
    ['', 'r', '-', '-', '-', 'T', '-', '-', '-', '7', ''],
    ['r', '/', ' ', ' ', ' ', 'u', ' ', ' ', ' ', 'L', '7'],
    ['|', ' ', ' ', 'n', ' ', ' ', ' ', 'n', ' ', ' ', '|'],
    ['|', ' ', '<', 'A', '>', ' ', '<', 'x', '>', ' ', '|'],
    ['|', ' ', ' ', ' ', ' ', ' ', ' ', '|', ' ', ' ', '|'],
    ['L', '7', ' ', 'n', ' ', 'n', ' ', '|', ' ', 'r', '/'],
    ['', '|', ' ', '|', ' ', '|', ' ', '|', ' ', '|', ''],
    ['r', '/', ' ', '|', ' ', 'u', ' ', 'u', ' ', 'L', '7'],
    ['|', ' ', ' ', '|', ' ', ' ', ' ', ' ', ' ', ' ', '|'],
    ['|', ' ', '<', 'x', '>', ' ', '<', 'T', '>', ' ', '|'],
    ['|', ' ', ' ', 'u', ' ', ' ', ' ', 'u', '*', ' ', '|'],
    ['L', '7', ' ', ' ', ' ', 'n', ' ', ' ', ' ', 'r', '/'],
    ['', 'L', '-', '-', '-', 'A', '-', '-', '-', '/', '']
]

function resimCagir(kaynak) {
    const resim = new Image();
    resim.src = kaynak;
    return resim;
}

harita.forEach((satir, i) => { //haritayı inşa eder
    satir.forEach((sembol, j) => {
        switch (sembol) {
            case ' ': yemler.push(
                new Yem({
                    konum: {
                        x: kenarUzunluk * j + kenarUzunluk / 2,
                        y: kenarUzunluk * i + kenarUzunluk / 2,
                    }
                })
            ); break;
            case '*': guclendirmeler.push(
                new Guclendirme({
                    konum: {
                        x: kenarUzunluk * j + kenarUzunluk / 2,
                        y: kenarUzunluk * i + kenarUzunluk / 2,
                    }
                })
            ); break;
            case 'x': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeCross.png')
                })
            ); break;
            case 'o': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/block.png')
                })
            ); break;
            case 'u': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/capBottom.png')
                })
            ); break;
            case '<': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/capLeft.png')
                })
            ); break;
            case '>': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/capRight.png')
                })
            ); break;
            case 'n': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/capTop.png')
                })
            ); break;
            case 'T': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeConnectorBottom.png')
                })
            ); break;
            case 'd': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeConnectorLeft.png')
                })
            ); break;
            case 'b': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeConnectorRight.png')
                })
            ); break;
            case 'A': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeConnectorTop.png')
                })
            ); break;
            case 'r': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeCorner1.png')
                })
            ); break;
            case '7': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeCorner2.png')
                })
            ); break;
            case '/': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeCorner3.png')
                })
            ); break;
            case 'L': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeCorner4.png')
                })
            ); break;
            case '-': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeHorizontal.png')
                })
            ); break;
            case '|': duvarlar.push(
                new Duvar({
                    konum: {
                        x: Duvar.en * j,
                        y: Duvar.boy * i,
                    },
                    resim: resimCagir('resimler/pipeVertical.png')
                })
            ); break;
        }
    })
})
