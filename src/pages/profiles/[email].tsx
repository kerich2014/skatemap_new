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


initFirebase();

const storage = getStorage();

const storageRef = ref(storage, new Date().toISOString());

type Image = {
  imageFile: Blob;
};

// export const getServerSideProps = requireAuth(async (ctx) => {
//   return { props: {} };
// });


const ProfilePage: NextPage<InferGetStaticPropsType <typeof getStaticProps>> = (id) => {

  const session = useSession()
  const {data: user, refetch} = api.user.getById.useQuery({email: session.data?.user!.email!})
  const router = useRouter()

  let [progress, setProgress] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [usEmail, setEmail] = useState("");
  const {mutate} = api.user.uploadData.useMutation()
  // const {mutate: uploadUSERmutate} = api.user.uploadData.useMutation()


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

      const nameHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
      }

      const emailHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
      }

      const uploadImage = async ({ imageFile }: Image) => {
        try {
          setLoading(true);
    
          const uploadTask = uploadBytesResumable(storageRef, imageFile);
    
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setProgress(progress);
            },
            (error) => {
              console.log(error.message);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                setImageUrl(downloadURL);
                setLoading(false);
                setSuccess(true);
              });
            }
          );
        } catch (e: any) {
          console.log(e.message);
          setLoading(false);
        }
      };
    
      const onDrop = useCallback((acceptedFiles: any[]) => {
        // Upload files to storage
        const file = acceptedFiles[0];
        uploadImage({ imageFile: file });
      }, []);
      
      const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        accept: {
          "image/png": [".png", ".jpg", ".jpeg"],
        },
        maxFiles: 1,
        noClick: true,
        noKeyboard: true,
        onDrop,
      });

      const uploadDataFunc = () => {       
          mutate({id: user?.id!, image: imageUrl, name: name})
          refetch()
          setInfocode(0)
      }

      const [infoCode, setInfocode] = useState(0)

      let infoUpdate = () => {
        if(infoCode == 0){
          setInfocode(infoCode+1)
        }
          
        else{
          setInfocode(infoCode-1)
          refetch()
        }
      }

      console.log(user?.email)
      
      
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

      <div className="flex flex-row m-auto w-[80%] items-center">
          <div>
            {user?.image == null || user.image == '' || infoCode == 1 ? (<>
              <div>
                {!success && (
                  <div
                    className={` ${
                      loading ? "hidden" : ""
                    } flex w-full justify-center`}
                  >
                    <div className="dropzone2">
                      <div {...getRootProps()} onClick={open} className="drag_drop_wrapper2">
                        <input hidden {...getInputProps()} />

                        {!isDragActive && (
                          <p>Добавьте фото</p>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {loading && <UploadProgress progress={progress} />}       
              {success && <UploadPreview imageUrl={imageUrl}/>}  
             </>) : <img className=" w-72 rounded-lg" src={user?.image || undefined}></img>}
          </div>
        <div className="m-[3%]">
          <h1 className=" text-xl font-bold">Имя пользователя:</h1>
          {infoCode == 0 && <h1 className="text-lg">{user?.name}</h1>}
          {infoCode == 1 && <input className="border-2 border-gray-800 rounded-md p-0.5 w-2/3" placeholder={user?.name!} onChange={(e) => nameHandler(e)}/>}
          <h1 className=" text-xl font-bold">Почта:</h1>
          {infoCode == 0 && <h1 className="text-lg">{user?.email}</h1>}
          {infoCode == 1 && <input className="border-2 border-gray-800 rounded-md p-0.5 w-2/3" placeholder={user?.email!} onChange={(e) => emailHandler(e)}/>}
          {infoCode == 1 ? <button className="mt-5 h-10 w-52 p-1 border-black rounded-lg hover:border-2 text-center" onClick={uploadDataFunc}>Сохранить</button>
          : 
          <button className="mt-5 h-10 w-52 p-1 border-black rounded-lg hover:border-2 text-center" onClick={infoUpdate}>Изменить</button>}
        </div> 
        <div className="flex flex-col h-44">
          <h1 className=" text-xl font-bold">Уровень:</h1>
          <h1 className="text-lg">{user?.lvl}</h1>
        </div>
      </div>
        </>
        
    );
};

export const getStaticPaths: GetStaticPaths = () => {
  return{
    paths: [],
    fallback: "blocking"
  }
}

export async function getStaticProps(context: GetStaticPropsContext<{email: string}>) {
  const email = context.params?.email
  if(email == null){
    return{
      redirect: {
        destination: "/"
      }
    }
  }
  const ssg = ssgHelper()
  await ssg.user.getById.prefetch({email})

  return{
    props: {
      trpcState: ssg.dehydrate(),
      email,
    }
  }
}




export default ProfilePage;