import Web3 from "web3";
class ContractService {
    constructor(provider, contractABI, contractAddress) {
        // console.log(provider, contractABI, contractAddress)
        this.web3 = new Web3(provider);
        this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
    }

    async getAccount() {
        const accounts = await this.web3.eth.getAccounts();
        return accounts[0];
    }

    async callMethod(methodName, ...args) {
        console.log("Calling method:", methodName);
        const method = this.contract.methods[methodName](...args);
        return await method.call();
    }

    async sendMethod(methodName, from, ...args) {
        console.log(methodName, from, ...args)
        const method = this.contract.methods[methodName](...args);
        const gas = await method.estimateGas({ from, value }); // 包含 value
        const gasPrice = await this.web3.eth.getGasPrice();
        return await method.send({
            from,
            value,    // 传递 `msg.value`，默认是 0
            gas,
            gasPrice
        });
    }

}

export default ContractService