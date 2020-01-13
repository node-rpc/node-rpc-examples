import { Client } from "node-rpc-lite";
import signale from "signale";

const port: number = 9000;
const ip: string = "127.0.0.1";
const duration: number = 100;

const client: Client = new Client({
    duration,
    ip,
    port,
});

client.connnect();
signale.debug("connect success !!");

const message = {
    data: {
        arr: [],
    },
    identifier: "querywork",
    msg: "success",
    status: 200,
};

client.on("data", (msg) => {
    signale.debug("client recieve data:");
    signale.debug(msg);
});

client.push(message);
