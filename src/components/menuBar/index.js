import React, { useEffect, useState } from 'react';
import StakingABI from '@/services/contract/staking_abi.json';
import ContractService from '@/services/contract/contractService';
import { formateAddress } from '@/utils/formate';
import DialogComponent from '@/components/dialog';
// import { useRouter } from 'next/router';
import Web3 from 'web3';

const MenuBar = () => {
    // const router = useRouter();
    const [contractService, setContractService] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [hasAccount, setHasAccount] = useState(false);
    const [accountAddress, setAccountAddress] = useState('');
    let [isDialogVisible, setDialogVisible] = useState(false);
    let [dialogTitle, setDialogTitle] = useState('提示')
    let [dialogContent, setDialogContent] = useState('内容')
    const openDialog = () => setDialogVisible(true);
    const handleDialogClose = () => {
        console.log('Dialog closed');
        window.location.reload()
    };

    const handleClose = () => {
        setDialogVisible(false);
    };
    useEffect(() => {
        const initWeb3 = async () => {
            if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                const contractServiceInstance = new ContractService(web3Instance, StakingABI, process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS);
                setContractService(contractServiceInstance);
                getAccount(contractServiceInstance);
            } else {
                console.log('MetaMask is not installed');
            }
        };

        const getAccount = async (contractServiceInstance) => {
            try {
                const account = await contractServiceInstance.getAccount();
                if (account) {
                    localStorage.setItem('account', account);
                    setAccountAddress(formateAddress(account, 4));
                    setHasAccount(true);
                } else {
                    localStorage.setItem('account', null);
                    console.log('No account found');
                }
            } catch (err) {
                console.log(err);
            }
        };

        const handleAccountsChanged = (accounts) => {
            setDialogTitle(dialogTitle = '账户发生变化')
            setDialogContent(dialogContent = '当前账户发生变化，请重新获取数据')
            openDialog()
            console.log('openDialog')
            if (accounts.length > 0) {
                setHasAccount(true);
                localStorage.setItem('account', accounts[0]);
                setAccountAddress(formateAddress(accounts[0], 4));
            } else {
                setHasAccount(false);
                setContractService(null);
                localStorage.setItem('account', null);
                console.log('No accounts available');
            }
        };

        initWeb3();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const loginAccount = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setHasAccount(true);
            localStorage.setItem('account', accounts[0]);
            setAccountAddress(formateAddress(accounts[0], 4));
            console.log(accounts[0]);
        } catch (err) {
            console.log(err);
        }
    };

    const handleAccount = () => {
        // Handle account actions here
    };

    return (
        <div className='p-1-0 flex justify-between items-center'>
            <DialogComponent
                isVisible={isDialogVisible}
                title={dialogTitle}
                content={<p>{dialogContent}</p>}
                onClose={handleClose}
                closeDialog={handleDialogClose}
            />
            <div className='w-1/2 xl:w-2/12'>
                <img src='/images/logo.svg' alt="Logo" />
            </div>
            {hasAccount ? (
                <div onClick={handleAccount} className='flex justify-end items-center'>
                    <div className='flex justify-start items-center pr-0-8 rounded-full bg-white100 shadow-lg'>
                        <div className='rounded-full flex justify-center items-center border-red100 text-red100 w-1-7 h-1-7 border-2 bg-white xl:w-2-2 xl:h-2-2'>
                            <div className='icon iconfont icon-qianbao text-1-0'></div>
                        </div>
                        <div className='text-black100 text-0-6 ml-0-4 xl:text-1-2'>{accountAddress}</div>
                    </div>
                </div>
            ) : (
                <div onClick={loginAccount} className='px-0-8 py-0-2 bg-red100 rounded-full text-white text-0-8'>连接钱包</div>
            )}
        </div>
    );
};

export default MenuBar;
