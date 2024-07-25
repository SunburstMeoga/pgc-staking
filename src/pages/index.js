import MenuBar from '@/components/menuBar'
import React, { useState, useEffect } from 'react'
import ContractService from '@/services/contract/contractService';
import StakingABI from '@/services/contract/staking_abi.json'
import ERC20ABI from '@/services/contract/erc20_abi.json'
import Web3 from 'web3';
import { ethers } from 'ethers';
function Home() {
  let statusTypeItems = [{ id: 1, title: '进行中' }, { id: 2, title: '已结束' }]
  let nodeList = [{ showMore: false, id: 1 }, { showMore: false, id: 2 }, { showMore: false, id: 3 }, { showMore: false, id: 4 },]
  let [nodeListItems, changeListItems] = useState(nodeList) //节点列表
  let [statusType, changeStatusType] = useState(1) //不同状态节点列表
  let [switchState, changeSwitchState] = useState(false) //是否仅限已质押
  let [loadingUSD3Auth, setLoadingUSD3Auth] = useState(false)
  let handleStatusType = ({ id }) => {
    changeStatusType(statusType = id)
  }
  let handleShowMore = ({ id }) => {
    changeListItems(nodeListItems =>
      nodeListItems.map(item =>
        item.id === id ? { ...item, showMore: !item.showMore } : item))
  }
  let handleSwitch = () => {
    changeSwitchState(switchState = !switchState)
  }
  let [stakingContractService, setStakingContractService] = useState(null); //质押合约
  let [WHAHContractService, setHAHContractService] = useState(null); //erc20
  let [USD3ContractService, setUSD3ContractService] = useState(null);//erc20
  let [USD3Allowance, setUSD3Allowance] = useState(false) //usd3对staking合约的授权状态
  let [WHAHAllowance, setWHAHAllowance] = useState(false) //whah对staking合约的授权状态
  // let [web3, setWeb3] = useState(null)
  useEffect(() => {
    const initWeb3 = async () => { //初始化web3
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        let web3 = new Web3(window.ethereum)
        // setWeb3(web3 = web3)
        setStakingContractService(stakingContractService = new ContractService(web3, StakingABI, process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS))
        setHAHContractService(WHAHContractService = new ContractService(web3, ERC20ABI, process.env.NEXT_PUBLIC_WHAH_CONTRACT_ADDRESS))
        setUSD3ContractService(USD3ContractService = new ContractService(web3, ERC20ABI, process.env.NEXT_PUBLIC_USD3_CONTRACT_ADDRESS))
        getWHAHAuthStatus()
        getUSD3AuthStatus()
      } else {
        console.log('没安装metamask')
      }
    }
    const getUSD3AuthStatus = async () => { //获取usd3对质押合约的授权状态
      try {
        const result = await USD3ContractService.callMethod('allowance', localStorage.getItem('account'), process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS)
        setUSD3Allowance(result == 0 ? USD3Allowance = false : USD3Allowance = true)
        console.log(USD3Allowance, result)
      } catch (err) {
        console.log(err)
      }
    }
    const getWHAHAuthStatus = async () => { //获取whah对质押合约的授权状态
      try {
        const result = await WHAHContractService.callMethod('allowance', localStorage.getItem('account'), process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS)
        setWHAHAllowance(result == 0 ? WHAHAllowance = false : WHAHAllowance = true)
        console.log(WHAHAllowance, result)
      } catch (err) {
        console.log(err)
      }
    }
    initWeb3();
  }, []);
  let handleApproveUSD3 = () => { //点击usd3授权按钮
    setLoadingUSD3Auth(loadingUSD3Auth = true)
    approveUSD3()
  }
  let approveUSD3 = async () => { //usd3授权
    try {
      let result = await USD3ContractService.sendMethod('approve', localStorage.getItem('account'), process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS, 0)
      // const result = await stakingContractService.sendMethod('stake', localStorage.getItem('account'), web3.utils.toWei("1", "ether"))
      setUSD3Allowance(USD3Allowance = true)
      setLoadingUSD3Auth(loadingUSD3Auth = false)
      console.log(result)
    } catch (err) {
      console.log(err)
      setLoadingUSD3Auth(loadingUSD3Auth = false)
    }
  }
  let handleApproveWHAH = () => { //点击whah授权按钮
    approveWHAH()
  }
  let approveWHAH = async () => { //usd3授权
    let result = await WHAHContractService.sendMethod('approve', localStorage.getItem('account'), process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS, 0)
    setWHAHAllowance(WHAHAllowance = true)
    console.log(result)
  }
  let staking = async () => { //质押
    try {
      const result = await stakingContractService.sendMethod('stake', localStorage.getItem('account'))
      console.log(result)
    } catch (err) {
      console.log(err)
    }
  }
  let handleStaking = (item) => {
    console.log(item)
    staking()
  }

  return (
    <div>
      <MenuBar></MenuBar>
      <div className='flex flex-col justify-start items-center bg-gradientBubblegum'>
        <div className='w-23-8'>
          <div className='w-full py-0-5 text-red300 text-3-0 text-center'>PGChain双币质押</div>
          <div className='text-red400 text-1-2 mb-1-5'>
            <div className=''>通过质押货币，轻松赚取收益。</div>
            <div className='-mt-0-5'>低风险，高年华收益率，您的最佳选择。</div>
          </div>
          <div className='w-full rounded-3xl bg-white text-red200 px-1-6 py-0-5 mb-2-0'>
            <div className='text-0-8'>PGChain双币质押计划</div>
            <div className='text-red400 text-1-3 border-b border-gray100 mb-0-4 pb-0-2'>年化收益率高达26.43%</div>
            <div className='text-0-7 mb-0-6'>
              PGChain为庆祝与Hash Ahead的合作，特别为用户申请了一定份额的 HAH，只需在进行双币质押时，支付一定数量的 USD3 即可购买HAH，并与PGC共同进行双币质押，质押完成后即可获得HAH（数量有限，先到先得）
            </div>
            <div className='text-0-7 mb-0-6'>
              请注意：质押完成后，USD3 将不会退还，您会得到质押时购买的HAH 和质押的 PGC。此外，您还会获得以 PGC 结算的质押奖励。
            </div>
            <div className='text-0-7 mb-1-0'>
              此外，解锁其他权益，例如投票激励、收益助推、IFO 等…
            </div>
            <div className='w-full h-3-0 text-white bg-red200 flex justify-center items-center rounded-2xl mb-0-6'>前往质押</div>
          </div>
        </div>
        <div className='bg-white200 w-full flex flex-col justify-center items-center pt-1-8 pb-2-0'>
          <div className='flex flex-col justify-center items-center w-23-8'>
            <div className='flex justify-between items-center w-full mb-2-4'>
              <div className='flex justify-start rounded-full bg-white300 border border-white400'>
                {statusTypeItems.map((item, index) => {
                  return <div key={index} onClick={() => handleStatusType(item)} className={`px-1-4 py-0-3 text-1-0 ${statusType === item.id ? 'text-white bg-red200 rounded-full' : 'text-red200 bg-transparent'}`}>
                    {item.title}
                  </div>
                })}
              </div>
              <div className='flex justify-end items-center text-red400'>
                <div onClick={() => handleSwitch()} className={`p-0-2 relative w-3-0 h-1-6 rounded-full mr-0-2 duration-500 transition ease-in-out ${switchState ? 'justify-end bg-red100' : 'justify-start bg-white300'}`}>
                  <div className={`w-1-2 h-1-2 rounded-full duration-750 transition ease-in-out bg-white absolute  ${switchState ? 'right-0-2' : 'left-0-2'}`}></div>
                </div>
                <div>仅限已质押</div>
              </div>
            </div>
            <div className='w-full border border-gray100 rounded-3xl bg-white shadow-lg'>
              {nodeListItems.map((item, index) => {
                return <div key={index} className='border-b-2 border-gray100 text-red200 duration-500 transition ease-in-out '>
                  <div className=' flex justify-between items-center px-1-0 py-1-5'>
                    <div className='font-bold text-1-0 text-red400'>{`节点${index + 1}`}</div>
                    <div className='text-0-7'>
                      <div className='text-red400'>已赚取的PGC</div>
                      <div> 0 PGC</div>
                    </div>
                    <div className='text-0-7'>
                      <div className='text-red400'>质押总计</div>
                      <div> 0 PGC</div>
                    </div>
                    <div className='text-0-7'>
                      <div className='text-red400'>质押剩余量</div>
                      <div>1,000,000</div>
                    </div>
                    <div className={`icon iconfont icon-down text-0-6 duration-500 transition ease-in-out ${item.showMore ? 'rotate-180' : ''}`} onClick={() => handleShowMore(item)}></div>
                  </div>
                  <div className={`bg-white500 w-full duration-500 transition ease-in-out border border-red20  ${item.showMore ? 'scale-y-100 h-fit p-1-0' : 'scale-y-0 h-0-1'}`}>
                    <div className='p-1-0 border border-white300 rounded-2xl mb-1-2'>
                      <div className='text-0-8 mb-0-6 font-bold'>已赚取PGC</div>
                      <div className='flex justify-between items-center'>
                        <div className='text-red400 font-bold text-2-0'>0</div>
                        <div className='bg-red100 text-white rounded-xl px-1-0 py-0-4'>收割</div>
                      </div>
                    </div>
                    <div className='w-full flex justify-center items-center bg-red100 h-3-0 rounded-2xl text-white mb-1-2'>连接钱包</div>

                    <div className='p-1-0 border border-white300 rounded-2xl mb-1-2'>
                      <div className='text-0-8 mb-1-0 font-bold'>启用双币质押</div>
                      {
                        USD3Allowance && WHAHAllowance && <div className='w-full flex justify-center items-center text-red100 h-3-0 rounded-2xl border-2 border-red100 mb-1-2' onClick={() => handleStaking(item)}>
                          质押
                        </div>
                      }
                      {!USD3Allowance && <div onClick={() => handleApproveUSD3()} className='w-full flex justify-center items-center text-red100 h-3-0 rounded-2xl border-2 border-red100 mb-1-2 ' >
                        {loadingUSD3Auth ? <svg className='animate-spin h-5 w-5 mr-3 viewBox="0 0 24 24"'></svg> : 'USD3授权'}
                      </div>}
                      {!WHAHAllowance && <div onClick={() => handleApproveWHAH()} className='w-full flex justify-center items-center text-red100 h-3-0 rounded-2xl border-2 border-red100 mb-1-2'>
                        WHAH授权
                      </div>}
                      {/* <div onClick={() => handleApproveUSD3()} className='w-full flex justify-center items-center text-red100 h-3-0 rounded-2xl border-2 border-red100 mb-1-2' >
                        USD3授权
                      </div>
                      <div onClick={() => handleApproveWHAH()} className='w-full flex justify-center items-center text-red100 h-3-0 rounded-2xl border-2 border-red100 mb-1-2'>
                        WHAH授权
                      </div> */}
                    </div>

                    <div className='w-full flex justify-between items-center text-0-8'>
                      <div className='text-red400'>APR:</div>
                      <div className='text-red200'>32.1%</div>
                    </div>
                    <div className='w-full flex justify-between items-center text-0-8'>
                      <div className='text-red400'>质押剩余量:</div>
                      <div className='text-red200'>1,000,000</div>
                    </div>
                    <div className='w-full flex justify-between items-center text-0-8'>
                      <div className='text-red400'>结束倒计时:</div>
                      <div className='text-red200 flex justify-end items-center'>
                        <div className='mr-0-2'>15天</div>
                        <div className='icon iconfont icon-daojishi'></div>
                      </div>
                    </div>
                    <div className='flex justify-end items-center text-red100'>
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
                    </div>
                    <div className='flex justify-start items-center'>
                      <div className='border border-red200 rounded-full flex justify-start items-center px-0-6 text-red200'>
                        <div className='icon iconfont icon-shuaxin mr-0-8'></div>
                        <div className='text-0-8'>手动</div>
                      </div>
                    </div>
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
