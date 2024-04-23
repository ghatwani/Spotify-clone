// document.body.querySelector(".card").addEventListener("mouseenter",()=>{
//     document.body.querySelector(".play").style.opacity="1";
//     console.log("hi")
//     // document.body.querySelector(".play").style.transition= "all 1s ease-out";
//     document.body.querySelector(".play").style.top="149px";


// })
// document.body.querySelector(".card").addEventListener("mouseleave",()=>{
//     document.body.querySelector(".play").style.opacity="0";
//     console.log("hi")
//     // document.body.querySelector(".play").style.transition= "all 1s ease-out";
//     document.body.querySelector(".play").style.top="169px";


// })
let currentsong = new Audio();
let songs;
let curr_folder;
let cardsContainer = document.querySelector(".cardsContainer")
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    curr_folder = folder;
    console.log(folder)
    let a = await fetch(`/video_84/song/${folder}/`) //fetch api is used to fetch the particular folder from the server
    // fetch returns a promise that resolves to the response to that request
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    // console.log(as)
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // console.log(element.href)
            songs.push(element.href.split(`song/${folder}/`)[1])
        }

    }
    //get all the songs in Playlist    
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        console.log(song)
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Dibs</div>
        </div>
        <div class="playnow">
            <span>Play Now!</span>
            <img class="invert" src="img/play.svg" alt="">
        </div>
    </li>`
    }

    //attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML).trim()
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/video_84/song/${curr_folder}/` + track
    // let audio=new Audio("/video_84/song/"+ track)
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}
async function displayAlbums() {
    let a = await fetch(`/video_84/song/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let s = div.getElementsByTagName("a")
    let array = Array.from(s)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/song")) {
            let folder = (e.href.split("/").slice(-2)[0])
            console.log(folder)

            //get metadata of the folder
            let a = await fetch(`/video_84/song/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardsContainer.innerHTML = cardsContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="75" height="75">
                    <circle cx="37.5" cy="37.5" r="33.75" fill="green" />
                    <polygon points="26.25,22.5 26.25,52.5 52.5,37.5" fill="black" />
                </svg>
            </div>
            <img src="/video_84/song/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
            
        </div>`
        }
    };

    //load the playlistwhenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item.currentTarget.dataset)
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            console.log(songs)
            playMusic(songs[0])
        })
    })
    // console.log(s)
}

async function main() {
    // get the list of songs 
    await getSongs("ncs");
    playMusic(songs[0],true)

    //display all the albums on the page
    await displayAlbums()

    //attach eventlisteners to play , next and prev
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause();
            play.src = "img/play.svg "
        }
    })

    // listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = ` ${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`

        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    })

    //add an event listener for hanburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //add eventlistener to prev and net song
    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])

        }

    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        // console.log(songs, index) 
        if (index + 1 < songs.length) {

            playMusic(songs[index + 1])
        }
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e.target.value)
        currentsong.volume = parseInt(e.target.value) / 100
    })

    //add event listener to mute the track
    document.querySelector(".volume >img").addEventListener("click",(e)=>{
        console.log(e.target.src)
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg");
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })


}
main()