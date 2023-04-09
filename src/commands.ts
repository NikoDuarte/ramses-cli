#!/usr/bin/env node

import { Command } from "commander";
import { prompt } from 'enquirer'
import chalk from 'chalk'
import { LocalStorage } from 'node-localstorage';
import path from 'path'
import { _db_credentials, _user_credentials } from "./interfaces/interfaces";
import { change_names_collections, export_collections, import_collections, select_and_export_collections, view_collections } from "./functions/collections.functions";
import { drop_data_base } from "./functions/db.functions";
import { version } from "./functions/version.functions";
import { drop_files_to_folder } from "./services/drop_files.services";

const program: Command = new Command()

const localStorage = new LocalStorage('./storage');

program
    .command('credentials')
    .option('-u [name]', 'Añadir un usuario')
    .option('-p [pass]', 'Añadir una contraseña')
    .action(
        async(option) => {
            const { u, p } = option
            const user_credentials: _user_credentials = { user: u, pass: p }
            localStorage.setItem('user_credentials', JSON.stringify(user_credentials));
            console.log(chalk.green(`Set credentials user: ${chalk.yellow(`${u}`)} and password: ${chalk.yellow(`${p}`)}`));
        }
    )

program
    .command('db')
    .option('-e, --export', 'Conexion a una uri de mongodb para exportar')
    .option('-i, --import', 'Conexion a una uri de mongodb para importar')
    .option('-g, --global', 'Conexion a una uri de mongodb global')
    .option('-d, --drop', 'Eliminara una base de datos')
    .action(
        async(option) => {
            let uri: string
            const user: _user_credentials = JSON.parse(localStorage.getItem('user_credentials') || '')
            if (user === undefined) {
                console.log(chalk.bgRed(`Sin credenciales de usuario, inserta unas con ${ chalk.yellow('ramses credentials -u <username> -p <password>') }`));
            }
            if (option.export) {
                const response_data_prompt: any = await prompt([
                    {
                        type: 'input',
                        name: 'net',
                        message: 'Ingrese el mongo.net de conexion para la exportacion (Ej: @example.nb5f.mongodb.net).'
                    },
                    {
                        type: 'input',
                        name: 'db',
                        message: 'Ingrese el nombre de la base de datos para la conexion de exportacion.'
                    }
                ])
                const new_credentials_db: _db_credentials = { net: response_data_prompt.net, db: response_data_prompt.db }
                localStorage.setItem('db_credentials_export', JSON.stringify(new_credentials_db))
            }
            if (option.import) {
                const response_data_prompt: any = await prompt([
                    {
                        type: 'input',
                        name: 'net',
                        message: 'Ingrese el mongo.net de conexion para la importacion (Ej: @example.nb5f.mongodb.net).'
                    },
                    {
                        type: 'input',
                        name: 'db',
                        message: 'Ingrese el nombre de la base de datos para la conexion de importacion.'
                    }
                ])
                const new_credentials_db: _db_credentials = { net: response_data_prompt.net, db: response_data_prompt.db }
                localStorage.setItem('db_credentials_import', JSON.stringify(new_credentials_db))
            }
            if (option.global) {
                const response_data_prompt: any = await prompt([
                    {
                        type: 'input',
                        name: 'net',
                        message: 'Ingrese el mongo.net de conexion global (Ej: @example.nb5f.mongodb.net).'
                    },
                    {
                        type: 'input',
                        name: 'db',
                        message: 'Ingrese el nombre de la base de datos para la conexion global.'
                    }
                ])
                const new_credentials_db: _db_credentials = { net: response_data_prompt.net, db: response_data_prompt.db }
                localStorage.setItem('db_credentials_global', JSON.stringify(new_credentials_db))
            }
            if (option.drop) {
                let uri!: string;
                let name_db!: string;
                if (option.export) {
                    const db: _db_credentials = JSON.parse(localStorage.getItem('db_credentials_export') || '')
                    if (db === undefined) {
                        console.log(chalk.bgRed(`Sin credenciales de db exportacion, inserta unas con ${ chalk.yellow('ramses db -e') }`));
                    }
                    uri = `mongodb+srv://${user.user}:${user.pass}@${db.net}/${db.db}`
                    name_db = db.db
                }
                if (option.import) {
                    const db: _db_credentials = JSON.parse(localStorage.getItem('db_credentials_import') || '')
                    if (db === undefined) {
                        console.log(chalk.bgRed(`Sin credenciales de db importacion, inserta unas con ${ chalk.yellow('ramses db -i') }`));
                    }
                    uri = `mongodb+srv://${user.user}:${user.pass}@${db.net}/${db.db}`
                    name_db = db.db
                }
                await drop_data_base(uri, name_db)
            }
        }
    )

program
    .command('collections')
    .option('-e, --export', 'Conexion a la cadena de exportacion')
    .option('-i, --import', 'Conexion a la cadena de importacion')
    .option('-l, --list', 'Listara las colecciones')
    .option('-s, --select', 'Conexion a la cadena de exportacion y seleccion de exportacion')
    .option('-m, --migrate', 'Conexion a la cadena de exportacion y de importacion ')
    .action(
        async(option) => {
            let uri: string
            const user: _user_credentials = JSON.parse(localStorage.getItem('user_credentials') || '')
            if (user === undefined) {
                console.log(chalk.bgRed(`Sin credenciales de usuario, inserta unas con ${ chalk.yellow('ramses credentials -u <username> -p <password>') }`));
            }
            if (option.list) {
                if (option.export) {
                    const db: _db_credentials = JSON.parse(localStorage.getItem('db_credentials_export') || '')
                    if (db === undefined) {
                        console.log(chalk.bgRed(`Sin credenciales de db exportacion, inserta unas con ${ chalk.yellow('ramses db -e') }`));
                    }
                    uri = `mongodb+srv://${user.user}:${user.pass}@${db.net}/${db.db}`
                    await view_collections(uri)
                }
                if (option.import) {
                    const db: _db_credentials = JSON.parse(localStorage.getItem('db_credentials_import') || '')
                    if (db === undefined) {
                        console.log(chalk.bgRed(`Sin credenciales de db importacion, inserta unas con ${ chalk.yellow('ramses db -i') }`));
                    }
                    uri = `mongodb+srv://${user.user}:${user.pass}@${db.net}/${db.db}`
                    await view_collections(uri)
                }
            }
            if (option.select) {
                if (option.export) {
                    const db: _db_credentials = JSON.parse(localStorage.getItem('db_credentials_export') || '')
                    if (db === undefined) {
                        console.log(chalk.bgRed(`Sin credenciales de db exportacion, inserta unas con ${ chalk.yellow('ramses db -e') }`));
                    }
                    uri = `mongodb+srv://${user.user}:${user.pass}@${db.net}/${db.db}`
                    const select_export = await select_and_export_collections(uri)
                    await export_collections(uri, select_export, db.db)
                }
            }
            if (option.migrate) {
                const db_export: _db_credentials = JSON.parse(localStorage.getItem('db_credentials_export') || '')
                const db_import: _db_credentials = JSON.parse(localStorage.getItem('db_credentials_import') || '')
                if (db_export === undefined) {
                    console.log(chalk.bgRed(`Sin credenciales de db exportacion, inserta unas con ${ chalk.yellow('ramses db -e') }`));
                }
                if (db_import === undefined) {
                    console.log(chalk.bgRed(`Sin credenciales de db exportacion, inserta unas con ${ chalk.yellow('ramses db -e') }`));
                }
                const uri_improt = `mongodb+srv://${user.user}:${user.pass}@${db_import.net}/${db_import.db}`
                if (option.import) {
                    const names_collections: {name: string, file: string}[] = await change_names_collections(db_export.db)
                    await import_collections(uri_improt, names_collections, db_export.db)
                    console.log(chalk.bgGreen('Operacion finalizada'));
                }
            }
        }
    )

program
    .command('version')
    .action(
        () => {
            version()
        }
    )

program.parse(process.argv)