"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_rpc_lite_1 = require("node-rpc-lite");
var signale_1 = __importDefault(require("signale"));
var port = 9000;
var ip = "127.0.0.1";
var duration = 100;
var client = new node_rpc_lite_1.Client({
    duration: duration,
    ip: ip,
    port: port,
});
client.connnect();
signale_1.default.debug("connect success !!");
var message = {
    data: {
        arr: [],
    },
    identifier: "querywork",
    msg: "success",
    status: 200,
};
client.on("data", function (msg) {
    signale_1.default.debug("client recieve data:");
    signale_1.default.debug(msg);
    client.close();
});
client.push(message);
