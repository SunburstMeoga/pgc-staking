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
        console.log(methodName, ...args)
        const method = this.contract.methods[methodName](...args);
        return await method.call();
    }

    async sendMethod(methodName, from, args = [], options = {}) {
        const method = this.contract.methods[methodName](...args);

        // 估算 gas
        const gas = await method.estimateGas({ from, ...options });
        const gasPrice = await this.web3.eth.getGasPrice();

        // 合并默认选项与传入选项
        const sendOptions = {
            from,
            gas,
            gasPrice,
            ...options,
        };

        // 发送交易
        return await method.send(sendOptions);
    }
}

export default ContractService