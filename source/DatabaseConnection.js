const mongoose = require("mongoose");

class DatabaseConnection {

    setup(done) {
        console.log(`[DB] Connecting to ${process.env.DBSTRING}`);

        mongoose.connection.once('connected', () => {
            console.log("[DB] Connection Established");
            done();
        });
    
        mongoose.connection.on("reconnected", () => {
            console.log("[DB] Connection Reestablished");
        });
    
        mongoose.connection.on("disconnected", () => {
            console.log("[DB] Connection Disconnected");
        });
    
        mongoose.connection.on("close", () => {
            console.log("[DB] Connection Closed");
        });
    
        mongoose.connection.on("error", (err) => {
            console.log(`[DB] Error happened: ${err}`);
        });
    
        // Create DB connection
        mongoose.connect(process.env.DBSTRING, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    close(done) {
        mongoose.connection.close((err) => {
            done();
        });
    }
}

/**
 * @typedef DatabaseError
 * @property {string} reason.required - Textual representation of the error
 */

module.exports = DatabaseConnection;
