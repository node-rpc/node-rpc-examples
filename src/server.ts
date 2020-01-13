import { Context, IServerConfig, NextFNType, Router, Server, V1Decode, V1Encode, Writer } from "node-rpc-lite";
import signale from "signale";

const config: IServerConfig = {
    duration: 500,
    ip: "127.0.0.1",
    port: 9000,
};

const decode: V1Decode = new V1Decode();
const encode: V1Encode = new V1Encode();
const writer: Writer = new Writer();

const log = async (ctx: Context, next: NextFNType) => {
    signale.debug("request is comming");

    if (next) {
        await next();
    }
};

// 路由
const router: Router = new Router();
router.on("querywork", async (ctx: Context) => {
    ctx.dataWillBeEncode = {
        send: "send data",
    };

    signale.debug(`recive data ${JSON.stringify(ctx.receive)}`);
});

const server: Server = new Server(config);

server.use(log);
server.use(decode.use);
server.use(router.route);
server.use(encode.use);
server.use(writer.use);

server.start();

signale.debug(`server start ${config.ip}: ${config.port}`);
