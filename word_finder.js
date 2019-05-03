let POPULATION_SIZE = null;
let WORD_TO_FIND = null;
let WORD_SIZE = null;
let POPULATION = []
let FITNESS_TEST = []
let GENERATION = 0;
let MUTATION_RATE = 0.01;
let IS_RUNNING = false;

window.onload = () => {
    document.querySelector('#restart_search').addEventListener('click', start);
    document.querySelector('#start_search').addEventListener('click', start);
    document.querySelector('#next_gen').addEventListener('click', nextGeneration);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function getRandomChar(){
    let char = String.fromCharCode(Math.ceil(Math.random() * 27) + 'a'.charCodeAt(0) - 1);
    return char > 'z'? ' ': char;
}

function generateNewPopulation() {
    POPULATION = [];

    for (let i = 0; i < POPULATION_SIZE; i++) {
        let word = '';
        for (let j = 0; j < WORD_SIZE; j++) {
            word += getRandomChar();
        }

        POPULATION.push(word);
    }

    return POPULATION;
}

function setup() {
    WORD_TO_FIND = document.querySelector('#word_to_find').value.trim();
    POPULATION_SIZE = document.querySelector('#num_population').value;
    MUTATION_RATE = eval(document.querySelector('#mutation_rate').value);
    WORD_SIZE = WORD_TO_FIND.length;
    GENERATION = 1;
    
    generateNewPopulation();
    FITNESS_TEST = getFitnessPopulation();

    buildPopulationWrapper();
}

function clearSearchButton(){
    document.querySelector('#start_search').removeEventListener('click', start);
    document.querySelector('#start_search').removeEventListener('click', stop);
    document.querySelector('#start_search').removeEventListener('click', continueGenerations);
}

function start() {
    setup();

    setTimeout(() => {
        continueGenerations();
    }, 0);
}


function stop(){
    IS_RUNNING = false;
    clearSearchButton();
    
    document.querySelector('#start_search').value = 'Continue';
    document.querySelector('#start_search').className = 'flex_elem continue';
    document.querySelector('#start_search').addEventListener('click', continueGenerations);
}

function continueGenerations(){
    IS_RUNNING = true;
    clearSearchButton();
    
    document.querySelector('#start_search').value = 'Stop';
    document.querySelector('#start_search').className = 'flex_elem stop';
    document.querySelector('#start_search').addEventListener('click', stop)
    
    runGenerations(() => {
        clearSearchButton();

        document.querySelector('#start_search').value = 'Start';
        document.querySelector('#start_search').className = 'flex_elem start';
        document.querySelector('#start_search').addEventListener('click', start);
    });

}

function buildPopulationWrapper() {
    document.querySelector('#population_wrapper').innerHTML = '';
    for (let i = 0; i < POPULATION_SIZE; i++) {
        let default_elem = document.createElement('div');

        default_elem.className = 'flex_elem'

        document.querySelector('#population_wrapper').append(default_elem);
    }

    showPopulation();
}

function showPopulation() {
    document.querySelectorAll('#population_wrapper div').forEach((e, i) => {
        e.textContent = POPULATION[i];
    })

    document.querySelector('#generation').value = GENERATION;
    document.querySelector('#avgfitness').value = FITNESS_TEST.fit_avg;
    document.querySelector('#fittest').value = POPULATION[FITNESS_TEST.arr[0].index];
}

function calculateFitness(n) {
    let occ = 0;
    for (let i = 0; i < WORD_SIZE; i++) {
        if (POPULATION[n][i] === WORD_TO_FIND[i]) occ++;
    }

    return occ;
}

function highlightSolved() {
    document.querySelectorAll('#population_wrapper div').forEach((e, i) => {
        if (e.textContent == WORD_TO_FIND)
            e.style.fontWeight = 'bold'
        else
            e.style.fontWeight = 'normal'
    })
}

function isFinished() {
    for (let i = 0; i < POPULATION_SIZE; i++) {
        if (POPULATION[i] === WORD_TO_FIND) return true;
    }
    return false;
}

function getFitnessPopulation() {
    let fit_arr = [];
    let fit_not_zero = 0;
    let fit_sum = 0;

    for (let i = 0; i < POPULATION_SIZE; i++) {
        let f = calculateFitness(i);
        let object = {
            'index': i,
            'fitness': f,
        }

        fit_sum += f;
        fit_arr.push(object);
    }

    fit_arr.sort((a, b) => {
        if (b.fitness > a.fitness)
            return 1;
        return -1;
    })

    return {
        'fit_sum': fit_sum,
        'fit_avg': fit_sum / POPULATION_SIZE,
        'arr': fit_arr
    };
}

function findParent(value, ft) {
    let n = value;
    let index = 0;
    let arr = ft.arr;

    while (n > 0 && index < POPULATION_SIZE - 1) {
        if (arr[index].fitness > n) break;
        n -= arr[index].fitness;
        index++;
    }

    return POPULATION[arr[index].index];
}

function generatePopulation(FITNESS_TEST) {
    let new_population = [];

    while (new_population.length < POPULATION_SIZE) {
        let p1 = findParent(Math.round(Math.random() * FITNESS_TEST.fit_sum), FITNESS_TEST);
        let p2 = findParent(Math.round(Math.random() * FITNESS_TEST.fit_sum), FITNESS_TEST);

        let son = p1.substring(0, WORD_SIZE / 2) + p2.substring(WORD_SIZE / 2);

        for (let i = 0; i < son.length; i++) {
            if (Math.random() < MUTATION_RATE) {
                son = son.replaceAt(i, getRandomChar());
            }
        }

        new_population.push(son);
    }

    return new_population;
}

function nextGeneration() {
    if (POPULATION_SIZE == null) setup();
    
    POPULATION = generatePopulation(FITNESS_TEST);
    FITNESS_TEST = getFitnessPopulation();
    GENERATION++;

    showPopulation();
    highlightSolved();

}

async function runGenerations(callback) {
    GENERATION++;
    while (!isFinished() && IS_RUNNING) {
        nextGeneration();
        // Time to draw on screen
        await sleep(10);
    }
    if(isFinished())
        callback();
}