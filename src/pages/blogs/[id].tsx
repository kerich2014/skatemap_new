import type { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ssgHelper } from "skatemap_new/server/api/ssgHelper";
import { api } from "skatemap_new/utils/api";
import initFirebase from "../../lib/firebaseInit";
import { useDropzone } from "react-dropzone";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import UploadProgress from "skatemap_new/components/uploadProgress";
import UploadPreview from "skatemap_new/components/uploadPreview";
import { ChangeEvent, useCallback, useState } from "react";
import { useRouter } from "next/router";
import { info } from "console";
import { number, string, z } from "zod";


initFirebase();

const storage = getStorage();

const storageRef = ref(storage, new Date().toISOString());

type Image = {
  imageFile: Blob;
};

// export const getServerSideProps = requireAuth(async (ctx) => {
//   return { props: {} };
// });


const BlogPage: NextPage<InferGetStaticPropsType <typeof getStaticProps>> = ({id}) => {

  const {data: blog} = api.blog.getById.useQuery({id})

  
  const AuthShowcase: React.FC = () => {
        const { data: sessionData } = useSession();
        
      
        return (
            <button
              className="absolute top-[4%] right-[2%] border-2 border-white rounded-full bg-white/10 px-10 py-3 no-underline transition hover:border-black"
              onClick={sessionData ? () => void signOut() : () => {void signIn()}}
            >
              {sessionData ? "Sign out" : "Sign in"}
            </button>
        );
      }
     
    return(
       <>
      <div className="flex flex-grow">
        <h1 className="m-auto mt-[2%] text-5xl cursor-default">Skate Map</h1>
        {user == null && (<AuthShowcase/>)}
      </div>
      <nav className="flex items-center m-[2%]">
          <Link className="a" href = {`/`}>Карта спотов</Link>
          {user != null && (<Link className="a" href = {`/school`}>Школа трюков</Link>)}
          {user != null && (<a className="a">Блог</a>)}
          <a className="a">Правила скейтпарков</a>
      </nav>
       </>
    );
};

export const getStaticPaths: GetStaticPaths = () => {
  return{
    paths: [],
    fallback: "blocking"
  }
}

export async function getStaticProps(context: GetStaticPropsContext<{id: string}>) {
  const id = context.params?.id
  if(id == null){
    return{
      redirect: {
        destination: "/"
      }
    }
  }
  const ssg = ssgHelper()
  await ssg.blog.getById.prefetch({id})

  return{
    props: {
      trpcState: ssg.dehydrate(),
      id,
    }
  }
}




export default BlogPage;