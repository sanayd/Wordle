
const WORD_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_URL = "https://words.dev-apis.com/validate-word"

let keyword = ""; 

let contents = {}; 

const parseWord = () => {
    for (c = 0; c < 5; c++) {
        for (d = 0; d < Object.keys(contents).length; d++) {
            if (keyword[c] == Object.keys(contents)[d]) {
                contents[keyword[c]][0] += 1;
                contents[keyword[c]].push(c);
                break;
            }
            else {
                contents[keyword[c]] = [1, c];
                break;
            }
        }
    }
}
parseWord();

async function getWord() {
    const promise = await fetch(WORD_URL);
    const processedResponse = await promise.json();
    keyword = processedResponse.word;
}

const letters = document.querySelectorAll("div.letter");

let word_index = 1;
let word = "";
let arr = [];
let i = 0;

const typeLetter = (event) => {
    const value = event.key;
    if (/^[a-zA-z]$/.test(value)) {
        for (i = 5*word_index-5; i < 5*(word_index+1)-5; i++) {
            if (i % 5 == 4) {
                letters[i].innerHTML = value.toUpperCase();
                break;
            }
            if (letters[i].innerHTML.length == 0) {
                letters[i].innerHTML = value.toUpperCase();
                break;
            }
        }
    }
    else if (value === "Enter") {
        if (i % 5 == 4){
            for (i = 5*word_index-5; i < 5*(word_index+1)-5; i++) {
                word += letters[i].innerHTML;
            }
            fullWord(word);

        }
    }
    else {
        if (value === 'Backspace') {
            del();
        }
    }
}

addEventListener("keydown", (event) => {typeLetter(event);});

const fullWord = (word) => {
    if (i % 4 == 0) {
        let validWord = validate(word);
        if (validWord) {
            if (word == keyword){
                //alert "you win"
                //make row green
                //stop all JS

                for (a = 5*word_index-5; a < 5*(word_index+1)-5; a++) {
                    letters[a].style.background = "green cover"
                }
            }
            else {
                /*
                for (a = 5*word_index-5; a < 5*(word_index+1)-5; a++) {
                    for (b = 0; b < 5; b++) {
                        if (letters[a].innerHTML == keyword[b].toUpperCase) {
                            if (a == b) {
                                // make node green
                            }
                            else {
                                // make node yellow
                            }
                        }
                    }
                }*/
                const keys = Object.keys[contents];
                for (a = 5*word_index-5; a < 5*(word_index+1)-5; a++) {
                    for (b = 0; b < keys.length; b++){
                        if (letters[a].innerHTML.toLowerCase() == keys[b]) {
                            let key = keys[b];
                            key.value[0] -= 1;
                            for (k = 1; k < key.value.length; k++) {
                                if (a % 5 == key.value[k]) {
                                    // make a green
                                    letters[a].style.background = "green cover"
                                    key.value.splice(k, 1);
                                    break;
                                }
                                else {
                                    // make yellow;
                                    letters[a].style.background = "yellow cover"
                                    break;
                                }
                            }
                            // make grey
                            letters[a].style.background = "grey cover"
                            continue;
                        }
                    }
                }
                i++;
                word_index++;
            }
        }
        else {
            // not a word animation
        }
    }
}

const del = () => {
    if (i % 5 == 0) {
        letters[i].innerHTML ="";
        return;
    }
    
    letters[i].innerHTML = "";
    i--;
}

async function validate(toValidate) {

    const promise = await fetch(VALIDATE_URL, {
        method: "POST",
        body: JSON.stringify({
            word: toValidate,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    const processedResponse = await promise.json();
    return processedResponse.validWord;

}

