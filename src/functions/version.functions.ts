//! Importaciones
import chalk from "chalk"

const version = async() => {
    console.log(chalk.yellow(
        `
        ██████   █████  ███    ███ ███████ ███████ ███████ 
        ██   ██ ██   ██ ████  ████ ██      ██      ██      
        ██████  ███████ ██ ████ ██ ███████ █████   ███████ 
        ██   ██ ██   ██ ██  ██  ██      ██ ██           ██ 
        ██   ██ ██   ██ ██      ██ ███████ ███████ ███████ 
        `
    ));
    console.log('__________________________________________');
    console.log('');
    console.log('Ramses CLI: 1.1.0');
    console.log('Github CLI: https://github.com/NikoDuarte/ramses-cli');
    console.log('__________________________________________');
    console.log('Autor: NikoDuarte');
    console.log('Github: https://github.com/NikoDuarte');
    console.log('__________________________________________');
    console.log(chalk.cyan(
        `
    ███▄    █  ██ ▄█▀
    ██ ▀█   █  ██▄█▒ 
   ▓██  ▀█ ██▒▓███▄░ 
   ▓██▒  ▐▌██▒▓██ █▄ 
   ▒██░   ▓██░▒██▒ █▄
   ░ ▒░   ▒ ▒ ▒ ▒▒ ▓▒
   ░ ░░   ░ ▒░░ ░▒ ▒░
      ░   ░ ░ ░ ░░ ░ 
         ░ ░  ░   
    `
    ));
    
}

export {
    version
}