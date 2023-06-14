import React from "react";
import Link from "next/link";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { api } from "skatemap_new/utils/api";
import { date } from "zod";

 const School: NextPage = () => {
  const {data: session} = useSession()
  const {data: videos} = api.video.getAll.useQuery()
  

    return (
      <>
        <div className="flex flex-grow">
          <Link className="m-auto mt-[2%] text-5xl" href = {`/`}>Skate Map</Link>
          {session?.user && (<Link className="absolute top-[3%] right-[2%] border-2 h-12 w-12 border-gray-800 rounded-full m-auto" href={`/profiles/${session?.user.id}`}><img className="rounded-full h-11" src={session.user.image!}></img></Link>)}
        </div>
        <nav className="flex items-center m-[2%]">
            <Link className="a" href = {`/`}>Карта спотов</Link>
            <Link className="a" href = {`/school`}>Школа трюков</Link>
            <a className="a">Блог</a>
            <a className="a">Правила скейтпарков</a>
        </nav>
        <div>
            <h1></h1>
        </div>
      </>
    );
  }

  export default School