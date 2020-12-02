const App = require("./App");

new App().run(() => {
    console.log(`[SERVER] Running at port ${process.env.PORT}`);
});
