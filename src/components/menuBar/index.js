import React from 'react'

const MenuBar = () => {
    return (
        <>
            <div className='p-1-0 flex justify-between items-center'>
                <div className='w-1/2'>
                    <img src='/images/logo.svg'></img>
                </div>
                <div className='flex justify-end items-center'>
                    <div className='icon iconfont icon-duoyuyan text-1-4 text-red200 mr-2-0'></div>
                    <div className='flex justify-start items-center pr-0-8 rounded-full bg-white100 shadow-lg'>
                        <div className='rounded-full flex justify-center items-center border-red100 text-red100 w-1-7 h-1-7 border-2 bg-white'>
                            <div className='icon iconfont icon-qianbao text-1-0'></div>
                        </div>
                        <div className='icon iconfont icon-down text-black100 text-0-6 ml-0-4'></div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MenuBar
