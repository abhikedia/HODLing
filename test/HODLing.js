const HODLingTest = artifacts.require('HODLing');
const { assert } = require('console');
const truffleAssert = require('truffle-assertions');
const json = require('../build/contracts/HODLing.json');
const interface = json['abi'];
const bytecode = json['bytecode'];
const BigNumber = require('bignumber.js');
const jsonrpc = '2.0'

const id = 0
const send = (method, params = []) =>
    web3.currentProvider.send({ id, jsonrpc, method, params })

const timeTravel = async seconds => {
    await send('evm_increaseTime', [seconds])
    await send('evm_mine')
}

contract('HODLing', async () => {

    let hodlingtest;
    let accounts;
    let owner;
    before(async () => {
        accounts = await web3.eth.getAccounts();
        owner = accounts[0];
        hodlingtest = await new web3.eth.Contract(interface).deploy({ data: bytecode }).send({ from: owner, gas: 1000000 });
    });

    it('Contract Deployed', async () => {
        assert(hodlingtest._address != '');
    });

    it('Value of contract balance should be 0 before any transaction', async () => {
        let amount = await hodlingtest.methods.getBalance().call({ from: accounts[0] });
        assert(amount.toString() === '0');
    });

    it('Lock Asset(With value greater than 0)', async () => {
        await hodlingtest.methods.Lock(5).send({ from: accounts[2], value: web3.utils.toWei('1', 'ether'), gas: 1000000 });
        let id = await hodlingtest.methods.getLastId().call({ from: accounts[2] });
        id = new BigNumber(id);
        let z=new BigNumber(1);
        assert(id.toString() === z.toString(),'id is not 1');
    });

    it('Lock Asset(With value 0) should revert', async () => {
        await truffleAssert.reverts(hodlingtest.methods.Lock(4).send({ from: accounts[2], value: 0 }));
    });

    it('There cant be same id for more than one holding by the same address', async () => {
        await hodlingtest.methods.Lock(5).send({ from: accounts[2], value: web3.utils.toWei('1', 'ether'), gas: 1000000 });
        let id = await hodlingtest.methods.getLastId().call({ from: accounts[2] });
        assert(id != 1);
    });

    it('Contract Balance check by anone except owner should revert', async () => {
        await truffleAssert.reverts(hodlingtest.methods.getBalance().call({ from: accounts[2] }));
    });

    it('Penalties balance check by anone except owner should revert', async () => {
        await truffleAssert.reverts(hodlingtest.methods.getPenalties().call({ from: accounts[2] }));
    });

    it('Value of penalties should be 0 before any penalty is put', async () => {
        let amount = await hodlingtest.methods.getPenalties().call({ from: accounts[0] });
        assert(amount.toString() === '0');
    });

    it('Value of contract balance should not be 0 after transaction', async () => {
        let amount = await hodlingtest.methods.getBalance().call({ from: accounts[0] });
        assert(amount != 0);
    });

    it('Withdrawing balance earlier than maturity period', async () => {
        await hodlingtest.methods.Withdraw(1).send({ from: accounts[2] });
    });

    it('Value of penalties should not be empty after penalty', async () => {
        let amount = await hodlingtest.methods.getPenalties().call({ from: accounts[0] });
        assert(amount != 0);
    });

    it('Withdrawing more than once from same address and id should revert', async () => {
        await truffleAssert.reverts(hodlingtest.methods.Withdraw(1).send({ from: accounts[2] }));
    });

    // it('Withdrawing balance after maturity period', async () => {
    //     console.log(await timeTravel(10*24*60*60));
    // });
});