const gps = require("./class/gps");
const { APP } = require("./config");

const options = {
    port: APP.PORT
}

gps.createServer(options, (device) => {
    device.on('connect', (ctx) => {
        console.log("connected", device.IPAddress);
    });

    device.on('message', (ctx) => {
        console.log("message", device.IPAddress);
    });

    device.on('disconnect', (ctx) => {
        console.log("disconnected", device.IPAddress);
    });

    device.on('reject', (ctx) => {
        console.log('reject', device.IPAddress);
    });

    device.on('error', (ctx) => {
        console.log(device.IPAddress, ctx.error.message);
    });
})

gps.on('start', (options) => {
    console.log(`Server started [${options.host}:${options.port}]`);
});