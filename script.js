
const WORD_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_URL = "https://words.dev-apis.com/validate-word"

let gameActive = true;
let keyword = ""; 

let contents = {};

// Fetch daily keyword from API
async function getWord() {
    const promise = await fetch(WORD_URL);
    const processedResponse = await promise.json();
    keyword = processedResponse.word;
}

getWord();

// Parse keyword into an object with the format {"letter": count, [position(s)]}
const parseWord = () => {
    contents = {};
    for (let i = 0; i < keyword.length; i++) {
        const letter = keyword[i].toLowerCase();
        if (contents[letter]) {
            contents[letter].count++;
            contents[letter].positions.push(i);
        }
        else {
            contents[letter] = {
                count: 1,
                positions: [i]
            }
        }
    }
}

// Node list of letter divs
const letters = document.querySelectorAll("div.letter");

let word_index = 1; // Which of the 6 words is the current guess on, from [1 to 6]
let word = ""; // Word inputted by user
let i = 0; // Node (letter) index

// Register inputs using keydown event
const typeLetter = (event) => {
    const value = event.key;
    if (/^[a-z]$/i.test(value)) {
        for (i = 5*word_index-5; i < 5*(word_index+1)-5; i++) {
            if (i % 5 === 4) {
                letters[i].innerHTML = value.toUpperCase();
                break;
            }
            if (letters[i].innerHTML.length === 0) {
                letters[i].innerHTML = value.toUpperCase();
                break;
            }
        }
    }
    else if (value === "Enter") {
        if (i % 5 == 4){
            word = "";
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

// Event listener for keydown
addEventListener("keydown", (event) => {
    if (gameActive) {
        typeLetter(event);
    }
});

// Word verification logic. Green if exact match, yellow if correct letter but wrong location, grey otherwise, and
// then increment word index. If invalid word inputted (not a word), flash row with a red animation, and word index
// remains the same.
const fullWord = async (word) => {
    parseWord();

    if (word.length != 5) {
        return;
    }

    const isValid = await validate(word);

    if (!isValid) {
        // Select all letters in the current row
        const currentRowLetters = Array.from(letters).slice((word_index - 1) * 5, word_index * 5);

        // Function to apply and remove the animation
        const flashAnimation = () => {
            currentRowLetters.forEach(letter => {
                letter.classList.add('incorrect');
                void letter.offsetWidth;
            });

            setTimeout(() => {
                currentRowLetters.forEach(letter => {
                    letter.classList.remove('incorrect');
                });
            }, 1500); // 1500ms = 1.5s, the duration of our animation
        };

        flashAnimation();

        return;
    }


    const wordArray = word.toLowerCase().split('');
    const tempContents = JSON.parse(JSON.stringify(contents));

    // First pass: Mark perfect matches (green)
    for (let i = 0; i < 5; i++) {
        const letter = wordArray[i];
        const letterInfo = tempContents[letter];
        const currentLetter = letters[5 * word_index - 5 + i];

        if (letter === keyword[i].toLowerCase()) {
            currentLetter.classList.add('green');
            if (letterInfo) {
                letterInfo.count--;
            }
        }
    }

    // Second pass: Mark yellow or grey
    for (let i = 0; i < 5; i++) {
        const letter = wordArray[i];
        const letterInfo = tempContents[letter];
        const currentLetter = letters[5 * word_index - 5 + i];

        if (!currentLetter.classList.contains('green')) {
            if (letterInfo && letterInfo.count > 0) {
                currentLetter.classList.add('yellow');
                letterInfo.count--;
            } else {
                currentLetter.classList.add('grey');
            }
        }
    }

    // Win/Lose logic
    if (word.toLowerCase() === keyword.toLowerCase()) {
        alert("You win!");
        gameActive = false;
    }
    else if (word_index >= 6) {
        alert("Game over! The word was: " + keyword);
    }
    else {
        word_index++;
    }

}


// Delete a letter
const del = () => {

    const currentWordStart = 5 * (word_index - 1);
    let lastFilledIndex = currentWordStart + 4;


    while (lastFilledIndex >= currentWordStart && letters[lastFilledIndex].innerHTML === "") {
        lastFilledIndex--;
    }


    if (lastFilledIndex >= currentWordStart) {
        letters[lastFilledIndex].innerHTML = "";
        word = word.slice(0, -1);
    }
}

// Posts inputted word to api to check if valid
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

