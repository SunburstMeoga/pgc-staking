import React, { useEffect, useState } from 'react'
import StakingABI from '@/services/contract/staking_abi.json'
import ContractService from '@/services/contract/contractService'
import Web3 from 'web3'
const MenuBar = () => {
    let [contractService, setContractService] = useState(null)
    let [web3, setWeb3] = useState(null)
    let [hasAccount, setAccount] = useState(false)
    useEffect(() => {
        const initWeb3 = async () => { //初始化web3
            if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
                let web3 = new Web3(window.ethereum)
                setWeb3(web3 = web3)
                setContractService(contractService = new ContractService(web3, StakingABI, process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS))
                getAccount()
            } else {
                console.log('没安装metamask')
            }
        }
        const getAccount = async () => { //获取当前连接账户
            try {
                let account = await contractService.getAccount()
                if (account) {
                    localStorage.setItem('account', account)
                    setAccount(hasAccount = true)
                } else {
                    localStorage.setItem('account', null)
                }

                // console.log(account)
            } catch (err) {
                console.log(err)
            }
        }
        initWeb3()
        const handleAccountsChanged = (accounts) => { //连接的账户发生了变化
            console.log('用户发生变化', accounts)
            if (accounts.length > 0) {
                setAccount(hasAccount = true)
                localStorage.setItem('account', accounts[0])
            } else {
                setAccount(hasAccount = false)
                setContractService(null);
                localStorage.setItem('account', null)
            }
        };
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }
        // 清理函数
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, [])
    let loginAccount = async () => {
        try {
            let account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(hasAccount = true)
            localStorage.setItem('account', account[0])
            console.log(account)
        } catch (err) {
            console.log(err)
        }

    }
    let handleAccount = () => {

    }
    return (
        <>
            <div className='p-1-0 flex justify-between items-center'>
                <div className='w-1/2'>
                    <img src='/images/logo.svg'></img>
                </div>
                {hasAccount ? <div onClick={() => handleAccount()} className='flex justify-end items-center'>
                    <div className='icon iconfont icon-duoyuyan text-1-4 text-red200 mr-2-0'></div>
                    <div className='flex justify-start items-center pr-0-8 rounded-full bg-white100 shadow-lg'>
                        <div className='rounded-full flex justify-center items-center border-red100 text-red100 w-1-7 h-1-7 border-2 bg-white'>
                            <div className='icon iconfont icon-qianbao text-1-0'></div>
                        </div>
                        <div className='icon iconfont icon-down text-black100 text-0-6 ml-0-4'></div>
                    </div>
                </div> : <div onClick={() => { loginAccount() }} className='px-0-8 py-0-2 bg-red100 rounded-full text-white text-0-8'>连接钱包</div>}

            </div>
        </>
    )
}

export default MenuBar
