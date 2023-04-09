//! Importaciones
import mongoose from 'mongoose'
import chalk from 'chalk';
import { prompt } from 'enquirer'
import fs from 'fs'
import path from 'path'
import { _db_credentials } from '../interfaces/interfaces';
import { drop_files_to_folder } from '../services/drop_files.services';

const view_collections = async (uri: string) => {
    console.log(chalk.yellow('Intentando conectar con mongo...'));
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Error de conexión:'));
    db.once('open', async function () {
        console.log(chalk.green('Conectando a mongo'));
        const collections = await db.db.listCollections().toArray();
        const collectionNames = collections.map(collection => collection.name);
        collectionNames.forEach(elt => {
            console.log(chalk.cyan(elt));
        });
        console.log(`Total de colecciones encontradas: ${chalk.yellow(collectionNames.length)}`);
        mongoose.connection.close();
    });
}

const select_and_export_collections = async (uri: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        console.log(chalk.yellow('Intentando conectar con mongo...'));
        mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'Error de conexión:'));
        db.once('open', async function () {
            console.log(chalk.green('Conectando a mongo'));
            const collections = await db.db.listCollections().toArray();
            const collectionNames = collections.map(collection => collection.name);
            console.log(`Total de colecciones encontradas: ${chalk.yellow(collectionNames.length)}`);
            let collectionsToExport = [];
            const confirm_exports: any = await prompt({
                type: 'confirm',
                name: 'confirm_all',
                message: `¿Desea agregar todas las colecciones para exportar?`
            });
            if (confirm_exports.confirm_all === false) {
                for (let i = 0; i < collectionNames.length; i++) {
                    const answer: any = await prompt({
                        type: 'confirm',
                        name: 'collection_export',
                        message: `¿Desea agregar ${chalk.yellow(collectionNames[i])} para exportar?`
                    });
                    if (answer.collection_export === true) {
                        collectionsToExport.push(collectionNames[i]);
                    }
                }
            } else {
                collectionsToExport = collectionNames
            }
            resolve(collectionsToExport)
            mongoose.connection.close();
        });
    })
}

const export_collections = async (uri: string, collections: string[], db_name: string) => {
    return new Promise((resolve, reject) => {
        console.log(chalk.yellow('Intentando conectar con mongo...'));
        mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'Error de conexión:'));
        db.once('open', async function () {
            console.log(chalk.green('Conectando a mongo'));
            console.log(`Total de colecciones a exportar: ${chalk.yellow(collections.length)}`);
            if (!fs.existsSync(path.join(__dirname, '../temp'))) {
                console.log(chalk.magenta('Creando almacenamiento temporal...'));
                fs.mkdirSync(path.join(__dirname, '../temp'))
                console.log(chalk.green('Carpeta temporal creada'));
            }
            if (!fs.existsSync(path.join(__dirname, `../temp/${db_name}`))) {
                console.log(chalk.magenta(`Creando almacen de datos ${db_name}...`));
                fs.mkdirSync(path.join(__dirname, `../temp/${db_name}`))
                console.log(chalk.green('Almacen de datos creados'));
            }
            for (let i = 0; i < collections.length; i++) {
                console.log(chalk.yellow(`Copiando la coleccion ${collections[i]}...`));
                const collection = mongoose.connection.db.collection(collections[i]);
                const documents = await collection.find().toArray();
                const filename = path.join(__dirname, `../temp/${db_name}/${collections[i]}.json`);
                fs.writeFileSync(filename, JSON.stringify(documents));
                console.log(chalk.green(`${collections[i]} copiada`));
            }
            resolve(true)
            mongoose.connection.close();
        });
    })
}

const change_names_collections = async (db_export: string): Promise<{name: string, file: string}[]> => {
    if (!fs.existsSync(path.join(__dirname, `../temp`))) {
        console.log(chalk.red('No se encontraron colecciones para exportar'));
    }
    if (!fs.existsSync(path.join(__dirname, `../temp/${db_export}`))) {
        console.log(chalk.red('No se encontraron colecciones para exportar'));
    }
    return new Promise((resolve, reject) => {
        fs.readdir(path.join(__dirname, `../temp/${db_export}`), async (err, files) => {
            if (err) {
                console.log(chalk.yellow('Sin colecciones...'));
                reject(false)
            }
            console.log(chalk.green(`Total de colecciones: ${chalk.yellow(`${files.length}`)}`));
            const confirm_chane_name: any = await prompt({
                type: 'confirm',
                name: 'change_name',
                message: `¿Desea renombrar las colecciones?`
            });
            const names_collections = files.map(
                (elt) => {
                    const splice_name = elt.split('.')
                    return {
                        name: splice_name[0],
                        file: elt
                    }
                }
            )
            if (confirm_chane_name.change_name === false) {
                resolve(names_collections)
            } else {
                const new_names: {name: string, file: string}[] = []
                for (let i = 0; i < names_collections.length; i++) {
                    const resp_name: { name: string } = await prompt({
                        type: 'input',
                        name: 'name',
                        message: `Renombrar ${chalk.yellow(`${names_collections[i].name}`)} por ->`
                    });
                    if (resp_name) {
                        new_names.push({name: resp_name.name === '' ? names_collections[i].name : resp_name.name, file: names_collections[i].file})
                    }
                }
                resolve(new_names)
            }
        })
    })
}

const import_collections = async (uri: string, collecctions_export: {name: string, file: string}[], db_export: string): Promise<any> => {
    return new Promise(async(resolve, reject) => {
        console.log(chalk.yellow('Intentando conectar con mongo...'));
        mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'Error de conexión:'));
        db.once('open', async function () {
            console.log(chalk.green('Conectando a mongo'));
            console.log(`Total de colecciones a exportar: ${ chalk.yellow(`${collecctions_export.length}`) }`);
            for (let i = 0; i < collecctions_export.length; i++) {
                const path_file: string = path.join(__dirname, `../temp/${db_export}/${collecctions_export[i].file}`)
                const read_to_file: string | any = fs.readFileSync(path_file)
                const document = JSON.parse(read_to_file)
                console.log(`Modelando ${chalk.cyan(`${collecctions_export[i].name}`)}`);
                const new_model = mongoose.model(collecctions_export[i].name, new mongoose.Schema({}))
                console.log(`${chalk.yellow(`Intentando importar la coleccion ${collecctions_export[i].name}`)}...`);
                new_model.collection.insertMany(document, (error, docs) => {
                    console.log(`Intentando importar ${chalk.blue(`${collecctions_export[i].name}`)}...`);
                    if (error) {
                        console.log(error);
                        
                        console.log(chalk.red(`Fallo al importar el documento ${chalk.yellow(`${collecctions_export[i].name}`)}`));
                        resolve(false)
                    }
                    console.log(chalk.green(`Coleccion ${collecctions_export[i].name} importada.`));
                })
            }
        });
        setTimeout(() => {
            mongoose.disconnect();
        }, 60000)
    })
}

export {
    view_collections,
    select_and_export_collections,
    export_collections,
    import_collections,
    change_names_collections
}