import MenuBar from '@/components/menuBar'
import React from 'react'
function Home() {
  return (
    <div>
      <MenuBar></MenuBar>
      <div className='flex flex-col justify-start items-center'>
        <div className='w-23-8 h-2-0 border border-red100'></div>
      </div>
    </div>
  )
}

export default Home
