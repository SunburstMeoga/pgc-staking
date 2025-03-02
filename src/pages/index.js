import MenuBar from '@/components/menuBar'
import React, { useState, useEffect } from 'react'
import ContractService from '@/services/contract/contractService';
import StakingABI from '@/services/contract/staking_abi.json'
import ERC20ABI from '@/services/contract/erc20_abi.json'
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import DialogComponent from '@/components/dialog';
import CountdownTimer from '@/components/countDownTimer';
import { ethers } from 'ethers';

function Home() {
  let statusTypeItems = [{ id: 1, title: '进行中' }, { id: 2, title: '已结束' }]
  let [nodeListItems, changeListItems] = useState([]) //节点列表
  let [statusType, changeStatusType] = useState(1) //不同状态节点列表
  let [switchState, changeSwitchState] = useState(false) //是否仅限已质押
  let [loadingUSD3Auth, setLoadingUSD3Auth] = useState(false)
  let [loadingWHAHAuth, setLoadingWHAHAuth] = useState(false)
  let [loadingStaking, setLoadingStaking] = useState(false)
  let [loadingUnStaking, setLoadingUnStaking] = useState(false)
  let [loadingWithdraw, setLoadingWithdraw] = useState(false)
  let tokenTypes = [{ title: 'USD3', id: 1 }, { title: 'WHAH', id: 2 }]
  let [isDialogVisible, setDialogVisible] = useState(false);
  let [dialogTitle, setDialogTitle] = useState('提示')
  let [dialogContent, setDialogContent] = useState('内容')
  let [isStaking, setIsStaking] = useState(false)
  let [stakingPoolId, setStakingPoolId] = useState(0)
  const openDialog = () => setDialogVisible(true);
  const handleDialogClose = () => {
    console.log('Dialog closed');

    // Perform other actions if needed
  };

  const handleClose = () => {
    if (isStaking) {
      staking(stakingPoolId)
      setStakingPoolId(0)
    }
    setDialogVisible(false);
  };
  let handleStatusType = ({ id }) => {
    changeStatusType(statusType = id)
  }
  let handleShowMore = ({ poolId }) => {
    changeListItems(nodeListItems =>
      nodeListItems.map(item =>
        item.poolId === poolId ? { ...item, showMore: !item.showMore } : item))
  }
  let handleSwitch = () => {
    changeSwitchState(switchState = !switchState)
  }
  let [stakingContractService, setStakingContractService] = useState(null); //质押合约
  let [WHAHContractService, setHAHContractService] = useState(null); //erc20
  let [USD3ContractService, setUSD3ContractService] = useState(null);//erc20
  let [USD3Allowance, setUSD3Allowance] = useState(false) //usd3对staking合约的授权状态
  let [WHAHAllowance, setWHAHAllowance] = useState(false) //whah对staking合约的授权状态
  let [web3, setWeb3] = useState(null)
  let [pgcRemaining, setPGCRemaining] = useState(null) //PGC 提取剩余时间（秒）。
  let [usd3Remaining, setUSD3Remaining] = useState(0) //WHAH/转换后的 USD3 提取剩余时间（秒）。
  let [selectToken, setSelectToken] = useState(1)
  let [pgcAmount, setPGCAmount] = useState(0)
  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          fetchNodeList(); // 初始化时直接获取数据
          getUSD3AuthStatus()
          getWHAHAuthStatus()
        } catch (error) {
          console.error('连接钱包失败:', error);
        }
      }
    };


    const getUSD3AuthStatus = async () => {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_USD3_CONTRACT_ADDRESS,
        ERC20ABI,
        await new ethers.BrowserProvider(window.ethereum).getSigner()
      );
      const result = await contract.allowance(
        localStorage.getItem('account'),
        process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS
      );
      setUSD3Allowance(result > 0);
    };
    const getWHAHAuthStatus = async () => { //获取whah对质押合约的授权状态
      try {
        // const result = await WHAHContractService.callMethod('allowance', localStorage.getItem('account'), process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS)
        // setWHAHAllowance(result == 0 ? WHAHAllowance = false : WHAHAllowance = true)

        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_WHAH_CONTRACT_ADDRESS,
          ERC20ABI,
          await new ethers.BrowserProvider(window.ethereum).getSigner()
        );
        const result = await contract.allowance(
          localStorage.getItem('account'),
          process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS
        );
        setWHAHAllowance(result > 0);
      } catch (err) {
        console.log(err)
      }
    }
    init();
    
  }, []);
  const handleTokenType = (item) => { //点击辅助token
    setSelectToken(selectToken = item.id)
    console.log(item.id, selectToken)

  }
  const fetchNodeList = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包');
      }
  
      // 使用ethers替换原有web3初始化逻辑
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const stakingContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS,
        StakingABI,
        signer
      );
  
      // 并行获取所有pool数据
      const results = await Promise.all(
        Array.from({length: 21}, (_, i) => i + 1).map(async (poolId) => {
          const info = await stakingContract.userStakeInfo(poolId);
          return {
            poolId,
            pgcAmount: ethers.formatUnits(info[0], 18),
            whahAmount: ethers.formatUnits(info[1], 18),
            usd3Amount: ethers.formatUnits(info[2], 18),
            timestamp: new Date(Number(info[3]) * 1000).toLocaleString(),
            unstakeTimestamp: info[4] ? new Date(Number(info[4]) * 1000).toLocaleString() : 'N/A',
            unstaked: info[5]
          };
        })
      );
  
      changeListItems(results);
    } catch (err) {
      console.error('fetch error', err);
      setDialogTitle('数据获取失败');
      setDialogContent(err.message || '无法获取质押数据');
      openDialog();
    }
  };
  let handleApproveUSD3 = () => { //点击usd3授权按钮
    if (loadingUSD3Auth) return
    console.log('object')
    setLoadingUSD3Auth(loadingUSD3Auth = true)
    approveUSD3()
  }
  let approveUSD3 = async () => { //usd3授权
    try {
      // let result = await USD3ContractService.sendMethod('approve', localStorage.getItem('account'), process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS, ethers.MaxUint256)
      const result = await stakingContractService.approveUSD3ToStaking(process.env.NEXT_PUBLIC_USD3_CONTRACT_ADDRESS, process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS, ethers.MaxUint256, localStorage.getItem('account'));
      setUSD3Allowance(USD3Allowance = true)
      setLoadingUSD3Auth(loadingUSD3Auth = false)
      setDialogTitle(dialogTitle = '成功')
      setDialogContent(dialogContent = '已成功授权。')
      openDialog()
      console.log(result)
    } catch (err) {
      console.log(err)
      setLoadingUSD3Auth(loadingUSD3Auth = false)
      setDialogTitle(dialogTitle = '失败')
      setDialogContent(dialogContent = '授权失败，请重试')
      openDialog()
    }
  }
  let handleApproveWHAH = () => { //点击whah授权按钮
    if (loadingWHAHAuth) return
    console.log('object')
    setLoadingWHAHAuth(loadingWHAHAuth = true)
    approveWHAH()
  }
  let approveWHAH = async () => { //whah授权
    try {
      // let result = await WHAHContractService.sendMethod('approve', localStorage.getItem('account'), process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS, ethers.MaxUint256)
      const result = await stakingContractService.approveUSD3ToStaking(process.env.NEXT_PUBLIC_WHAH_CONTRACT_ADDRESS, process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS, ethers.MaxUint256, localStorage.getItem('account'));
      setWHAHAllowance(WHAHAllowance = true)
      setLoadingWHAHAuth(loadingWHAHAuth = false)
      setDialogTitle(dialogTitle = '成功')
      setDialogContent(dialogContent = '已成功授权。')
      openDialog()
      console.log(result)
    } catch (err) {
      console.log(err)
      setLoadingWHAHAuth(loadingWHAHAuth = false)
      setDialogTitle(dialogTitle = '失败')
      setDialogContent(dialogContent = '授权失败，请重试')
      openDialog()
    }
  }
  let staking = async (poolId) => { //质押
    setIsStaking(false)
    try {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS,
        StakingABI,
        await new ethers.BrowserProvider(window.ethereum).getSigner()
      );
      
      const tx = await contract.stakeInPool(
        poolId,
        { value: ethers.parseUnits(pgcAmount, 18) }
      );
      await tx.wait();
      setLoadingStaking(loadingStaking = false)
      setDialogTitle(dialogTitle = '成功')
      setDialogContent(dialogContent = '已成功质押。')
      openDialog()
      fetchNodeList()
    } catch (err) {
      console.log(err)
      setLoadingStaking(loadingStaking = false)
      setDialogTitle(dialogTitle = '失败')
      setDialogContent(dialogContent = '质押失败，请重试。')
      openDialog()
    }
  }
  const handlePGCAmountChange = (e) => { //pgc输入框发生变化
    console.log(e.target.value)
    setPGCAmount(e.target.value)
  }
  let unstake = async () => { //用户取消质押
    try {
      const result = await stakingContractService.sendMethod('unstake', localStorage.getItem('account'), [1])
      setLoadingUnStaking(loadingUnStaking = false)
      setDialogTitle(dialogTitle = '成功')
      setDialogContent(dialogContent = '已成功收割。')
      openDialog()
      console.log(result)
    } catch (err) {
      console.log(err)
      setLoadingUnStaking(loadingUnStaking = false)
      setDialogTitle(dialogTitle = '失败')
      setDialogContent(dialogContent = '收割失败，您尚未质押PGC')
      openDialog()
    }
  }
  let handleStaking = async (item) => { //点击质押按钮
    console.log(item)
    if (pgcAmount % 1000 !== 0) {
      setDialogContent('质押数量必须为1000的整数倍')
      setDialogVisible(true)
      return
    }
    const result = await WHAHContractService.callMethod('balanceOf', localStorage.getItem('account'))
    console.log('hah余额', result)
    if (result < (pgcAmount / 1000)) {
      setStakingPoolId(item.poolId)
      setIsStaking(true)
      setDialogContent(`WHAH余额不足，是否使用${pgcAmount / 1000 * 2}个USD3购买${pgcAmount / 1000}个WHAH进行双币质押？`)
      setDialogVisible(true)
      return
    }
    setLoadingStaking(loadingStaking = true)
    staking(item.poolId)
  }
  let handleUnStaking = (item) => { //点击收割按钮
    setLoadingUnStaking(loadingUnStaking = true)
    unstake(item.poolId)
  }
  let handleWithdraw = () => { //点击提现按钮
    setLoadingWithdraw(loadingWithdraw = true)
    withdraw()
  }
  let withdraw = async () => {
    try {
      const result = await stakingContractService.sendMethod('withdraw', localStorage.getItem('account'), [1]) // 参数列表，只传递 poolId)
      console.log(result)
      setLoadingWithdraw(loadingWithdraw = false)
      setDialogTitle(dialogTitle = '成功')
      setDialogContent(dialogContent = '已经资产提现至您的钱包。')

      openDialog()
    } catch (err) {
      console.log(err)
      setLoadingWithdraw(loadingWithdraw = false)
      setDialogTitle(dialogTitle = '无法提现')
      setDialogContent(dialogContent = '尚未取消质押，无法提现。')

      openDialog()
    }
  }

  return (
    <div>
      <MenuBar></MenuBar>
      <DialogComponent
        isVisible={isDialogVisible}
        title={dialogTitle}
        content={<p>{dialogContent}</p>}
        onClose={handleClose}
        closeDialog={handleDialogClose}
      />
      <div className='flex flex-col justify-start items-center bg-gradientBubblegum'>
        <div className='w-23-8 xl:w-full xl:px-18-0 xl:flex xl:justify-between xl:items-start xl:py-2-0'>
          <div className=''>
            <div className='w-full py-0-5 text-red300 text-2-9  xl:text-4-0 ' >PGChain双币质押</div>
            <div className='text-red400 text-1-2 mb-1-5 xl:text-1-3 w-full '>
              <div className='-mt-0-5'>通过质押货币，轻松赚取收益。</div>
              <div className='-mt-0-5'>低风险，高年化收益率，您的最佳选择。</div>
            </div>
          </div>
          <div className='w-full rounded-3xl bg-white text-redPrimary px-1-6 py-0-5 mb-2-0 xl:w-18-5'>
            <div className='text-0-8'>PGChain双币质押计划</div>
            <div className='text-red400 text-1-3 border-b border-gray100 mb-0-4 pb-0-2'>年化收益率高达26.43%</div>
            <div className='text-0-7 mb-0-6 text-red400'>
              在双币质押中，我们为未持有 HAH 的用户提供特别机制：
              若用户地址没有持有 HAH，合约将按 2 USD3 = 1 HAH 的比例自动购买 HAH，每枚 HAH 可与 1000 枚 PGC 配对完成双币质押。质押成功后，用户可立即获得 HAH（数量有限，先到先得）。<br />
              若用户地址持有 HAH，则可以直接将 HAH 与 PGC 进行双币质押，享受快捷质押体验。
            </div>
            <div className='text-0-7 mb-0-6'>
              <h3 className='font-black text-1-4' >重要提示：</h3>
              质押完成后，所投入的 USD3 将不会退还，但用户将获得质押时购买的 HAH 和质押的 PGC。
              用户还将额外获得 以 PGC 结算的质押奖励。
            </div>
            <div className='text-0-7 mb-1-0 text-red400'>
              通过双币质押，用户还可解锁一系列独家权益，包括：
              投票激励：参与治理投票，获得更多收益机会。
              收益助推：提升质押收益，实现更高回报。
              IFO 参与权：优先参与创新型项目的首次发行机会。
            </div>
            <div className='text-0-7 mb-1-0'>
              立即参与，享受更多双币质押带来的丰厚奖励与专属权益！
            </div>
            <div className='w-full h-3-0 text-white bg-redPrimary flex justify-center items-center rounded-2xl mb-0-6 cursor-pointer' onClick={() => handleWithdraw()}>
              {loadingWithdraw ? <div className='icon iconfont icon-jiazailoading-A animate-spin'></div> : '提现'}
            </div>
            {/* <div className='w-full h-3-0 border-2  border-red200 text-red200 flex justify-center items-center rounded-2xl mb-0-6' onClick={() => handleWithdraw()}>
              {loadingWithdraw ? <div className='icon iconfont icon-jiazailoading-A animate-spin'></div> : '提现USD3'}
            </div> */}
          </div>
        </div>
        <div className='bg-white200 w-full flex flex-col justify-center items-center pt-1-8 pb-2-0'>
          <div className='flex flex-col justify-center items-center w-23-8 xl:w-full xl:px-18-0'>
            <div className='flex justify-between items-center w-full mb-1-4'>
              <div className='flex justify-start rounded-full bg-white300 border border-white400'>
                {/* {statusTypeItems.map((item, index) => {
                  return <div key={index} onClick={() => handleStatusType(item)} className={`px-1-4 py-0-3 text-1-0 ${statusType === item.id ? 'text-white bg-red200 rounded-full' : 'text-red200 bg-transparent'}`}>
                    {item.title}
                  </div>
                })} */}
              </div>
              <div className='flex justify-end items-center text-red400'>
                {/* <div onClick={() => handleSwitch()} className={`p-0-2 relative w-3-0 h-1-6 rounded-full mr-0-2 duration-500 transition ease-in-out ${switchState ? 'justify-end bg-red100' : 'justify-start bg-white300'}`}>
                  <div className={`w-1-2 h-1-2 rounded-full duration-750 transition ease-in-out bg-white absolute  ${switchState ? 'right-0-2' : 'left-0-2'}`}></div>
                </div>
                <div>仅限已质押</div> */}
              </div>
            </div>
            <div className='w-full'>
              {nodeListItems.map((item, index) => {
                return <div key={index} className=' text-red200 duration-500 transition ease-in-out  border border-gray100 rounded-3xl bg-white shadow-lg mb-1-0'>

                  <div className=' flex justify-between items-center px-1-0 py-1-5'>
                    <div className='font-bold text-1-0 text-red400'>{`节点${item.poolId}`}</div>
                    <div className='text-0-7'>
                      <div className='text-red400'>已质押的PGC</div>
                      <div> {item.pgcAmount || 0} PGC</div>
                    </div>
                    <div className='text-0-7'>
                      <div className='text-red400'>已质押的HAH</div>
                      <div> {item.whahAmount || 0} HAH</div>
                    </div>
                    <div className='text-0-7'>
                      <div className='text-red400'>已质押的USD3</div>
                      <div> {item.usd3Amount || 0} USD3</div>
                    </div>
                    <div className={`icon iconfont icon-down text-0-6 duration-500 transition ease-in-out ${item.showMore ? 'rotate-180' : ''}`} onClick={() => handleShowMore(item)}></div>
                  </div>
                  <div className={`bg-white500 w-full rounded-b-3xl duration-500 transition ease-in-out border border-red20 xl:flex xl:justify-between  ${item.showMore ? 'scale-y-100 h-fit p-1-0' : 'scale-y-0 h-0-1'}`}>
                    {/* <div className='p-1-0 border border-white300 rounded-2xl mb-1-2 xl:w-32-0'>
                      <div className='text-0-8 mb-0-6 font-bold'>已赚取PGC</div>
                      <div className='flex justify-between items-center'>
                        <div className='text-red400 font-bold text-2-0'>{item.currentRewards}</div>
                        <div className='bg-red100 text-white rounded-xl px-1-0 py-0-4 cursor-pointer' onClick={() => handleUnStaking(item)}>
                          {loadingUnStaking ? <div className='icon iconfont icon-jiazailoading-A animate-spin'></div> : '收割'}
                        </div>
                      </div>
                    </div> */}
                    {/* <div className='w-full flex justify-center items-center bg-red100 h-3-0 rounded-2xl text-white mb-1-2'>连接钱包</div> */}

                    {
                      !item.staked && <div className='p-1-0 border border-white300 rounded-2xl mb-1-2 xl:w-32-0'>
                        <div className='w-full px-1-0 flex justify-around items-center text-red100 h-3-0 rounded-2xl border-2 border-red100 mb-1-2'>
                          <div className=''>PGC</div>
                          <div className='flex-1 ml-0-2'> <input onChange={handlePGCAmountChange} className='bg-transparent placeholder-text-red100  w-full' placeholder='请输入' /> </div>
                          <div className='flex flex-col items-end'>
                            <div>: {(pgcAmount / 1000)} HAH</div>
                            <div className='text-0-6' >{(pgcAmount / 1000 * 2)} USD3</div>
                          </div>
                        </div>
                        {
                          USD3Allowance && WHAHAllowance && <div onClick={() => handleStaking(item)} className='w-full flex justify-center items-center text-red100 h-3-0 rounded-2xl border-2 border-red100 mb-1-2'>
                            {loadingStaking ? <div className='icon iconfont icon-jiazailoading-A animate-spin'></div> : '质押'}
                          </div>
                        }
                        {!USD3Allowance && <div onClick={() => handleApproveUSD3()} className='w-full flex justify-center items-center text-red100 h-3-0 rounded-2xl border-2 border-red100 mb-1-2 ' >
                          {loadingUSD3Auth ? <div className='icon iconfont icon-jiazailoading-A animate-spin' ></div> : 'USD3授权'}
                        </div>}
                        {!WHAHAllowance && <div onClick={() => handleApproveWHAH()} className='w-full flex justify-center items-center text-red100 h-3-0 rounded-2xl border-2 border-red100 mb-1-2'>
                          {loadingWHAHAuth ? <div className='icon iconfont icon-jiazailoading-A animate-spin'></div> : 'WHAH授权'}
                        </div>}
                      </div>

                    }

                    {/* <div className='w-full flex justify-between items-center text-0-8'>
                      <div className='text-red400'>APR:</div>
                      <div className='text-red200'>32.1%</div>
                    </div> */}
                    {/* <div className='w-full flex justify-between items-center text-0-8'>
                      <div className='text-red400'>我的质押:</div>
                      <div className='text-red200'>1,000,000</div>
                    </div> */}
                    {item.pgcAmount != 0 && <div className='w-full flex justify-between items-center text-0-8'>
                      <div className='text-red400'>结束倒计时:</div>
                      <div className='text-red200 flex justify-end items-center'>
                        <div className='mr-0-2'>
                          <CountdownTimer targetTimestamp={item.unstakeTimestamp} />
                        </div>
                        <div className='icon iconfont icon-daojishi'></div>
                      </div>
                    </div>}
                    {item.unstake && <div onClick={() => handleUnStaking(item)} className='w-full h-3-0 flex justify-center items-center bg-red200 text-white rounded-lg mt-1-0' >赎回</div>}
                    {/* <div className='flex justify-end items-center text-red100'>
                      <div className='mr-0-4 text-0-8 font-bold underline'>查看代币信息</div>
                      <div className='icon iconfont icon-fenxiang'></div>
                    </div>
                    <div className='flex justify-end items-center text-red100'>
                      <div className='mr-0-4 text-0-8 font-bold underline'>查看项目网站</div>
                      <div className='icon iconfont icon-fenxiang'></div>
                    </div>
                    <div className='flex justify-end items-center text-red100 mb-0-4'>
                      <div className='mr-0-4 text-0-8 font-bold underline'>查看合约</div>
                      <div className='icon iconfont icon-fenxiang '></div>
                    </div> */}
                    {/* <div className='flex justify-start items-center'>
                      <div className='border border-red200 rounded-full flex justify-start items-center px-0-6 text-red200'>
                        <div className='icon iconfont icon-shuaxin mr-0-8'></div>
                        <div className='text-0-8'>手动</div>
                      </div>
                    </div> */}
                  </div>
                </div>
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
