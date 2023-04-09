//! Importaciones
import mongoose from 'mongoose'
import chalk from 'chalk';
import { prompt } from 'enquirer'

const drop_data_base = async(uri: string, name_db: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        console.log(chalk.yellow('Intentando conectar con mongo...'));
        mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'Error de conexión:'));
        db.once('open', async function () {
            console.log(chalk.green('Conectando a mongo'));
            const confirm_drop: any = await prompt({
                type: 'confirm',
                name: 'drop',
                message: `¿Desea continuar con la eliminacion de ${name_db}?`
            });
            if (confirm_drop.drop === false) {
                console.log(chalk.yellow('Confirmacion de eliminacion negativa'));
                resolve(false)
            }
            console.log(`Intentando eliminar ${chalk.yellow(`${name_db}`)}`);
            await mongoose.connection.dropDatabase();
            console.log(chalk.green(`Eliminacion exitosa de ${name_db}`));
            // Cierra la conexión a la base de datos
            resolve(true)
            mongoose.disconnect();
        });
    })
}

export {
    drop_data_base
}