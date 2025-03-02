// import { useState } from 'react';
// import { ethers } from 'ethers';
// import StakingABI from '@/services/contract/staking_abi.json'

// const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS

// export default function StakeInfo() {
//   const [poolId, setPoolId] = useState('');
//   const [stakeInfo, setStakeInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleGetStakeInfo = async () => {
//     try {
//       setLoading(true);
//       setError('');
      
//       if (!window.ethereum) {
//         throw new Error('请安装MetaMask钱包');
//       }

//       // 连接钱包
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();

//       // 初始化合约
//       const stakingContract = new ethers.Contract(
//         CONTRACT_ADDRESS,
//         StakingABI,
//         signer
//       );

//       // 调用合约方法
//       const info = await stakingContract.userStakeInfo(poolId);
      
//       // 解析返回的元组
//       const parsedInfo = {
//         pgcAmount: ethers.formatUnits(info[0], 18), // 假设18位小数
//         whahAmount: ethers.formatUnits(info[1], 18),
//         usd3Amount: ethers.formatUnits(info[2], 18),
//         timestamp: new Date(Number(info[3]) * 1000).toLocaleString(),
//         unstakeTimestamp: info[4] ? new Date(Number(info[4]) * 1000).toLocaleString() : 'N/A',
//         unstaked: info[5]
//       };

//       setStakeInfo(parsedInfo);
//     } catch (err) {
//       console.error(err);
//       setError(err.message || '查询失败');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>质押信息查询</h2>
      
//       <div>
//         <input
//           type="number"
//           value={poolId}
//           onChange={(e) => setPoolId(e.target.value)}
//           placeholder="输入Pool ID"
//           style={{ marginRight: 10, padding: 5 }}
//         />
//         <button 
//           onClick={handleGetStakeInfo}
//           disabled={loading}
//         >
//           {loading ? '查询中...' : '查询'}
//         </button>
//       </div>

//       {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

//       {stakeInfo && (
//         <div style={{ marginTop: 20 }}>
//           <h3>查询结果：</h3>
//           <pre>
//             {JSON.stringify(stakeInfo, null, 2)}
//           </pre>
          
//           {/* 更友好的展示方式 */}
//           <div>
//             <p>PGC数量: {stakeInfo.pgcAmount}</p>
//             <p>WHAH数量: {stakeInfo.whahAmount}</p>
//             <p>USD3数量: {stakeInfo.usd3Amount}</p>
//             <p>质押时间: {stakeInfo.timestamp}</p>
//             <p>状态: {stakeInfo.unstaked ? '已解押' : '质押中'}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import StakingABI from '@/services/contract/staking_abi.json'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS

export default function StakeInfoList() {
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 生成1-21的poolId数组
  const poolIds = Array.from({length: 21}, (_, i) => i + 1);

  const fetchAllStakes = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        StakingABI,
        signer
      );

      // 使用Promise.all并行获取所有pool数据
      const results = await Promise.all(
        poolIds.map(async (pid) => {
          const info = await stakingContract.userStakeInfo(pid);
          return {
            poolId: pid,
            pgcAmount: ethers.formatUnits(info[0], 18),
            whahAmount: ethers.formatUnits(info[1], 18),
            usd3Amount: ethers.formatUnits(info[2], 18),
            timestamp: new Date(Number(info[3]) * 1000).toLocaleString(),
            unstakeTimestamp: info[4] ? new Date(Number(info[4]) * 1000).toLocaleString() : 'N/A',
            unstaked: info[5]
          };
        })
      );

      setStakes(results);
    } catch (err) {
      console.error(err);
      setError(err.message || '数据获取失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 组件加载时自动获取数据（或根据需要添加按钮触发）
    fetchAllStakes();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>质押信息列表</h2>
      
      <button 
        onClick={fetchAllStakes}
        disabled={loading}
        style={{ marginBottom: 20 }}
      >
        {loading ? '刷新中...' : '刷新数据'}
      </button>

      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

      {stakes.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={tableHeaderStyle}>Pool ID</th>
                <th style={tableHeaderStyle}>PGC数量</th>
                <th style={tableHeaderStyle}>WHAH数量</th>
                <th style={tableHeaderStyle}>USD3数量</th>
                <th style={tableHeaderStyle}>质押时间</th>
                <th style={tableHeaderStyle}>解押时间</th>
                <th style={tableHeaderStyle}>状态</th>
              </tr>
            </thead>
            <tbody>
              {stakes.map((stake) => (
                <tr key={stake.poolId} style={tableRowStyle}>
                  <td style={tableCellStyle}>{stake.poolId}</td>
                  <td style={tableCellStyle}>{stake.pgcAmount}</td>
                  <td style={tableCellStyle}>{stake.whahAmount}</td>
                  <td style={tableCellStyle}>{stake.usd3Amount}</td>
                  <td style={tableCellStyle}>{stake.timestamp}</td>
                  <td style={tableCellStyle}>{stake.unstakeTimestamp}</td>
                  <td style={tableCellStyle}>
                    {stake.unstaked ? (
                      <span style={{ color: 'red' }}>已解押</span>
                    ) : (
                      <span style={{ color: 'green' }}>质押中</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div>暂无质押数据</div>
      )}
    </div>
  );
}

// 表格样式
const tableHeaderStyle = {
  padding: '12px',
  borderBottom: '2px solid #e0e0e0',
  textAlign: 'left'
};

const tableRowStyle = {
  borderBottom: '1px solid #e0e0e0',
  ':hover': {
    backgroundColor: '#fafafa'
  }
};

const tableCellStyle = {
  padding: '12px',
  minWidth: '120px'
};