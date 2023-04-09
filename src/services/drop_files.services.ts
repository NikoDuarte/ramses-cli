//! Importaciones
import fs from 'fs'
import path from 'path'

const drop_files_to_folder = async (path_folder: string) => {
    fs.readdir(path_folder, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(path_folder, file), (err) => {
                if (err) throw err;
            });
        }
    });
}

export {
    drop_files_to_folder
}