import mongoose from "mongoose";
import config from "./config.js";

export default class MongoSingleton {
    static #instance;


    constructor() {
        this.#connectMongoDB();
    }

    // Implementacon Singleton
    static getInstance() {
        if (this.#instance) {
           // console.log("Ya se ha abierto una conexion a MongoDB.");
        } else {
            this.#instance = new MongoSingleton();
        }
        return this.#instance;
    }

    #connectMongoDB = async () => {
        try {
            await mongoose.connect(config.urlMongo,
                {
                   /*  useNewUrlParser: true,
                    useUnifiedTopology: true,
                    // Cambiar el nivel de escritura a 1 (menos seguro pero más rápido)
                    w: 1, */
                });
           // console.log("Conectado con exito a MongoDB usando Moongose.");

        } catch (error) {
           // console.error("No se pudo conectar a la BD usando Moongose: " + error);
            process.exit();
        }
    }
};