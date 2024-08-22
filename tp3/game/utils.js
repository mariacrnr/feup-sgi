export const getNumber = (str) => {
    return parseInt(str, 36);
}

export const getString = (number) => {
    return number.toString(36);
}

export const addNumberToString = (str, number) => {
    return (parseInt(str, 36) + number).toString(36);
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));