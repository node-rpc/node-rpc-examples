import { Context, IServerConfig, NextFNType, Router, Server, V1Decode, V1Encode, Writer,  ZKClient } from "node-rpc-lite";
import signale from "signale";
import uuid from "uuid/v1";
import ZooKeeper from "zookeeper";

const config: IServerConfig = {
    duration: 500,
    ip: "127.0.0.1",
    port: 9001,
};

const namespacePath = "/node-rpc";

const decode: V1Decode = new V1Decode();
const encode: V1Encode = new V1Encode();
const writer: Writer = new Writer();
const zkClient = new ZKClient({
    connect: "127.0.0.1:2181",
    debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
    host_order_deterministic: false,
    timeout: 5000,
});

const log = async (ctx: Context, next: NextFNType) => {
    signale.debug("request is comming");

    if (next) {
        await next();
    }
};

const uid: string = uuid();

// 路由
const router: Router = new Router();
router.on("querywork", async (ctx: Context) => {

    await new Promise((resolve) => {
        setTimeout(() => {
            ctx.dataWillBeEncode = {
                send: "send data after waiting 1000 ms",
            };
            resolve();
        }, 1000);
    });

    signale.debug(`recive data ${JSON.stringify(ctx.receive)}, uuid: ${uid}`);
});

const server: Server = new Server(config);

server.use(decode.use);
server.use(router.route);
server.use(log);
server.use(encode.use);
server.use(writer.use);

const register =  async (conf: any) => {
    const path = `${namespacePath}/${conf.host}-${conf.port}`;
    await zkClient.connect();
    const isExit = await zkClient.exist(path, () => {
        //
    });
    if (!isExit) {
        await zkClient.mkdirp(path, () => {
            //
        });
    }
    signale.debug(`server start ${conf.host}: ${conf.port}, uuid: ${uid}`);
};


server.on("start", register);

server.start();




