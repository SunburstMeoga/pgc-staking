import "@/styles/globals.css";
import "@/styles/iconfont.css"
import 'antd-mobile/es/global';
import React, { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  // useEffect(() => {
  //   const handleResize = () => {
  //     const e = document.documentElement.clientWidth;
  //     document.getElementsByTagName('html')[0].style['font-size'] = e > 1024 ? '0.8vw' : '16px';
  //   };

  //   // Call it once to set initial font-size
  //   handleResize();

  //   // Attach the event listener to handle window resize
  //   window.addEventListener('resize', handleResize);

  //   // Clean up the event listener on unmount
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  return <Component {...pageProps} />;
}
