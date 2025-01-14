import * as fs from "fs";
import { Cell, toNano } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import Counter from "../wrappers/Counter"; // this is the interface class from tutorial 2

describe("Counter tests", () => {
    let blockchain: Blockchain;
    let wallet1: SandboxContract<TreasuryContract>;
    let counterContract: SandboxContract<Counter>;

    beforeEach(async () => {
        // prepare Counter's initial code and data cells for deployment
        const counterCode = Cell.fromBoc(fs.readFileSync("build/counter.cell"))[0]; // compilation output from tutorial 2
        const initialCounterValue = 17; // no collisions possible since sandbox is a private local instance
        const counter = Counter.createForDeploy(counterCode, initialCounterValue);

        // initialize the blockchain sandbox
        blockchain = await Blockchain.create();
        wallet1 = await blockchain.treasury("user1");

        // deploy counter
        counterContract = blockchain.openContract(counter);
        await counterContract.sendDeploy(wallet1.getSender());
    });

    it("should get counter value", async () => {
        const value = await counterContract.getCounter();
        expect(value).toEqual(17n);
    });

    it("should increment the counter value", async () => {
        await counterContract.sendIncrement(wallet1.getSender());
        const counterValue = await counterContract.getCounter();
        expect(counterValue).toEqual(18n);
    });

    it("should send ton coin to the contract", async () => {
        console.log("sending 7.123 TON");
        await wallet1.send({
            to: counterContract.address,
            value: toNano("7.123")
        });
    });

    it("should increment the counter value", async () => {
        console.log("sending increment message");
        await counterContract.sendIncrement(wallet1.getSender());
    });
});
