import React from "react";
import Link from "next/link";
import { NextPage } from "next";

 const School: NextPage = () => {
    return (
      <>
        <div className="flex flex-grow">
          <Link className="m-auto mt-[2%] text-5xl" href = {`/`}>Skate Map</Link>
          <div className='absolute top-[2%] right-[2%] border-2 h-12 w-12 border-gray-800 rounded-full m-auto'></div>
        </div>
        <nav className="flex items-center m-[2%]">
            <Link className="a" href = {`/map`}>Карта спотов</Link>
            <Link className="a" href = {`/school`}>Школа трюков</Link>
            <a className="a">Блог</a>
            <a className="a">Правила скейтпарков</a>
        </nav>
        <div>
            
        </div>
      </>
    );
  }

  export default School