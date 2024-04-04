import { MongoClient } from 'mongodb';

// URL de conexión a la base de datos MongoDB
const url = 'mongodb://127.0.0.1:27017';

// Nombre de la base de datos que deseas eliminar
const dbName = 'ecommercetest';

export async function dropDatabase() {
  // Crear una instancia del cliente de MongoDB
  console.log("**** Drop a la BD ecommercetest *******")
  const client = new MongoClient(url);

  try {
    // Conectar al servidor de MongoDB
    await client.connect();

    // Seleccionar la base de datos
    const db = client.db(dbName);

    // Eliminar la base de datos
    await db.dropDatabase();

    console.log(
      `La base de datos '${dbName}' ha sido eliminada correctamente.`
    );
  } catch (error) {
    console.error('Error al eliminar la base de datos:', error);
  } finally {
    // Cerrar la conexión con el cliente de MongoDB
    await client.close();
  }
}

// Llamar a la función para eliminar la base de datos
//dropDatabase();
