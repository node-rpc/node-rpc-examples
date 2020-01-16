import Router from "@koa/router";
import Koa from "koa";
import { Client, ISelectElement, IStrategy, StrategyFactory, ZKClient } from "node-rpc-lite";
import signale from "signale";
import ZooKeeper from "zookeeper";

const namespacePath = "/node-rpc";


const zkClient = new ZKClient({
    connect: "127.0.0.1:2181",
    debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
    host_order_deterministic: false,
    timeout: 5000,
});
const app = new Koa();
const router = new Router();

router.get("/rpc/get", async (ctx, next) => {

    const message = {
        data: {
            arr: [],
        },
        identifier: "querywork",
        msg: "success",
        status: 200,
    };

    const list: string[] = zkClient.getNodeMap().get(namespacePath);
    const els: ISelectElement[] = list.map((value: string) => {
        const pairs = value.split("-");
        return {
            ip: pairs[0],
            port: pairs[1] as unknown as number,
        };
    });

    // consistent hash
    const factory: StrategyFactory<ISelectElement> = new StrategyFactory();
    const consistentStrategy: IStrategy<ISelectElement> = factory.build(els, "c");
    const testContent: string = `127.0.0.1_${Math.random()}`;
    const node: ISelectElement = consistentStrategy.select(testContent);

    const client: Client = new Client({
        duration: 500,
        ip: node.ip,
        port: node.port,
    });

    client.connect();
    const work = new Promise((resolve) => {
        client.on("data", (msg) => {
            ctx.response.body = msg;
            resolve();
        });
    });
    client.push(message);

    await work;

});


app
  .use(router.routes())
  .use(router.allowedMethods());

(async () => {
    await zkClient.connect();
    zkClient.listen(namespacePath);
    app.listen(3000, () => {
        signale.debug("app start at port 3000!");
    });
})();
