import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import YaMap from "../components/YaMap";
import Modal from "../components/modal/Modal";
import MapForm from "../components/MapForForm";
import { api } from "skatemap_new/utils/api";
import Link from 'next/link'
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage } from "next";
import initFirebase from "../lib/firebaseInit";
import { useDropzone } from "react-dropzone";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import UploadProgress from "skatemap_new/components/uploadProgress";
import UploadPreview from "skatemap_new/components/uploadPreview";
import { signIn, signOut, useSession } from "next-auth/react";
import { ssgHelper } from "skatemap_new/server/api/ssgHelper";
import { DefaultSession, Session } from "next-auth";

initFirebase();

const storage = getStorage();

const storageRef = ref(storage, new Date().toISOString());

type Image = {
  imageFile: Blob;
};

const Map: NextPage = () => {

  let [progress, setProgress] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [modalActive, setModalActive] = useState(false)


  const {data: points, isLoading, refetch} = api.map.getAll.useQuery()
  
  const {mutate} = api.map.sendPoints.useMutation()

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');

  const emailHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }
  const nameHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }
  const descriptionHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
  }
  const photoHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoto(e.target.value)
  }

  const sendFunc = () => {

    setModalActive(false);

    mutate({
      coordinatesX: localStorage.getItem('coords')?.split(",")?.at(0) as string ,
      coordinatesY: localStorage.getItem('coords')?.split(",")?.at(1) as string ,
      title: name.toString(),
      description: description.toString(),
      photo: imageUrl,
    })

    setEmail('');
    setName('');
    setDescription('');
    setPhoto('');

    refetch()
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
  const {data:session} = useSession()
  const user = api.user.getById.useQuery({id: session?.user.id as string})

  const AuthShowcase: React.FC = () => {
    const { data: sessionData } = useSession();
  
    const { data: secretMessage } = api.example.getSecretMessage.useQuery(
      undefined, // no input
      { enabled: sessionData?.user !== undefined },
    );
  
    return (
        <button
          className="absolute top-[4%] right-[7%] border-2 border-white rounded-full bg-white/10 px-10 py-3 no-underline transition hover:border-black"
          onClick={sessionData ? () => void signOut() : () => {void signIn()}}
        >
          {sessionData ? "Выйти" : "Войти"}
        </button>
    );
  }
return (
    <>
    {/* 
        <main>
          {points?.map(point => <>{point.coordinates}</>)}
        </main> */}
      <div className="flex flex-grow">
        <h1 className="m-auto mt-[2%] text-5xl cursor-default">Skate Map</h1>
        {session?.user && (<Link className="absolute top-[3%] right-[2%] border-2 h-12 w-12 border-gray-800 rounded-full m-auto" href={`/profiles/${session?.user.id}`}><img className="rounded-full h-11" src={session.user.image!}></img></Link>)}
        <AuthShowcase />
      </div>
      <nav className="flex items-center m-[2%]">
          <Link className="a" href = {`/`}>Карта спотов</Link>
          {session?.user && (<Link className="a" href = {`/school`}>Школа трюков</Link>)}
          {session?.user && (<a className="a">Блог</a>)}
          <a className="a">Правила скейтпарков</a>
      </nav>
      <div className="w-[96%] m-auto">
      {(user.data?.role == 'admin' || user.data?.role == 'expert') && (<button className='addSpot' onClick={() => setModalActive(true)}>Добавить спот</button>)}
      
        {/* <>{!isLoading && JSON.stringify(points)}</> */}
        {!isLoading && points ? <YaMap points={points} />: null}
      </div>
      <Modal active={modalActive} setActive={setModalActive}>
        <div className="flex flex-start items-center justify-center">
          <div className="w-1/2 m-[5%]">
            <MapForm/>
          </div>
          <div className="flex flex-col items-center w-1/2">
            <h2 className=" text-lg mt-3">Введите вашу почту:</h2>
            <input id="email" value={email} onChange={(e) => emailHandler(e)} className="border-2 border-gray-800 rounded-md p-0.5 mt-3 w-2/3"></input>
            <h2 className="text-lg mt-3">Введите название спота:</h2>
            <input id="spotName" value={name} onChange={(e) => nameHandler(e)} className="border-2 border-gray-800 rounded-md p-0.5 mt-3 w-2/3"></input>
            <h2 className="text-lg mt-3">Введите описание спота:</h2>
            <textarea id="spotDesc" value={description} onChange={(e) => descriptionHandler(e)} className="border-2 border-gray-800 rounded-md p-0.5 mt-3 w-2/3 h-30 resize-none"></textarea>
            <h2 className="text-lg mt-3">Добавьте фото:</h2>
            
            <>
              <div>
                {!success && (
                  <div
                    className={` ${
                      loading ? "hidden" : ""
                    } flex w-full justify-center`}
                  >
                    <div className="dropzone">
                      <div {...getRootProps()} className="drag_drop_wrapper">
                        <input hidden {...getInputProps()} />

                        {isDragActive ? (
                          <p>Перетащите фото сюда</p>
                        ) : (
                          <>
                            <p>Перетащите фото сюда</p>
                          </>
                        )}
                      </div>
                      <p className="mt-9 m-5">или</p>
                      <div className="flex p-1 w-28 justify-center mt-7 ">
                        <button className="border-2 border-black hover:border-gray-200 rounded-lg" onClick={open}>выберете файл</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {loading && <UploadProgress progress={progress} />}
              
              {success && <UploadPreview imageUrl={imageUrl} />}
              
              
            </>
            {!loading && <button 
              className="border-2 border-gray-800 hover:border-gray-200 flex items-center justify-center rounded-md p-1 mt-[5%] w-1/3"
              onClick={() =>sendFunc()}>Отправить</button> }
          </div>
        </div>
    </Modal>
  </>
);
}

export default Map