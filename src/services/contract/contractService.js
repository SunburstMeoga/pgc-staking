import Web3 from "web3";
import contractABI from '@/services/contract/staking_abi.json'

class ContractService {
    constructor(provider) {
        this.web3 = new Web3(provider);
        this.contract = new this.web3.eth.Contract(contractABI, process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS);
    }

    async getAccount() {
        const accounts = await this.web3.eth.getAccounts();
        return accounts[0];
    }

    async callMethod(methodName, ...args) {

        const method = this.contract.methods[methodName](...args);
        return await method.call();
    }

    async sendMethod(methodName, from, ...args) {
        console.log(methodName, from, ...args)
        const method = this.contract.methods[methodName](...args);
        const gasPrice = await this.web3.eth.getGasPrice();
        return await method.send({ from, gasPrice });
    }
}

export default ContractService