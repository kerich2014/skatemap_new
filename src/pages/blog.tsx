import React, { ChangeEvent, useCallback, useState } from "react";
import Link from "next/link";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { api } from "skatemap_new/utils/api";
import { date } from "zod";
import Modal from "skatemap_new/components/modal/Modal";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { useDropzone } from "react-dropzone";
import initFirebase from "skatemap_new/lib/firebaseInit";
import UploadProgress from "skatemap_new/components/uploadProgress";
import UploadPreview from "skatemap_new/components/uploadPreview";

initFirebase();

const storage = getStorage();

const storageRef = ref(storage, new Date().toISOString());

type Image = {
  imageFile: Blob;
};

const Blog: NextPage = () => {
const {data: session} = useSession()
const blog = api.blog.getAll.useQuery()
const [modalActive, setModalActive] = useState(false)
const [name, setName] = useState('');
const [description, setDescription] = useState('');
let [progress, setProgress] = useState<number>(0);
const [imageUrl, setImageUrl] = useState<string>("");
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);
const {mutate} = api.blog.sendPost.useMutation()

const nameHandler = (e: ChangeEvent<HTMLInputElement>) => {
  setName(e.target.value)
}
const descriptionHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
  setDescription(e.target.value)
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

  const sendFunc = () => {
    if(name != '' && description != '' && imageUrl != ''){
      setModalActive(false);
      mutate({
        title: name.toString(),
        description: description.toString(),
        photo: imageUrl,
      })
  
      setName('');
      setDescription('');
    }
    else
    alert('Проверьте данные и повторите попытку')
  }
  

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
        <button className='addState' onClick={() => {setModalActive(true)}}>Создать статью</button>
        <Modal active={modalActive} setActive={setModalActive}>
            <div className="flex">
            <div className="flex flex-col m-3 items-center w-1/3">
                <h2 className="text-lg mt-3">Введите название статьи:</h2>
                <input id="spotName" value={name} onChange={(e) => nameHandler(e)} className="border-2 border-gray-800 rounded-md p-0.5 mt-3 w-full"></input>
                <h2 className="text-lg mt-[25%]">Добавьте фото:</h2>
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
                className="border-2 border-gray-800 hover:border-gray-200 flex items-center justify-center rounded-md p-1 mt-[30%] w-full"
                onClick={()=>sendFunc()}>Отправить</button> }
                </div>
                <div className="flex flex-col items-center w-2/3 m-3">
                    <h2 className="text-lg mt-3">Введите текст статьи:</h2>
                    <textarea value={description} onChange={(e) => descriptionHandler(e)} className="border-2 border-gray-800 rounded-md p-0.5 mt-3 w-full h-96 resize-none"></textarea>
                </div>
              </div>
        </Modal>
        <div className="m-auto flex flex-col items-center h-[500px] w-[80%] overflow-hidden overflow-y-scroll">
                {blog.data?.map((item) => (
                    <div className="flex flex-row items-center border-2 p-3 w-[80%] min-h-[350px] m-5 border-gray-800 rounded-3xl">
                    <img className="w-[40%] h-72 rounded-xl" src={item.photo}></img>
                    <div className="flex flex-col items-center h-72 w-[50%]">
                        <h1 className=" text-2xl font-bold">{item.title}</h1>
                        <div>{item.description}</div>
                    </div>
                    </div>
                ))}
        </div>
      </>
    );
  }

  export default Blog

function setLoading(arg0: boolean) {
    throw new Error("Function not implemented.");
}
function setSuccess(arg0: boolean) {
    throw new Error("Function not implemented.");
}

function setImageUrl(downloadURL: string) {
    throw new Error("Function not implemented.");
}

function mutate(arg0: { coordinatesX: string; coordinatesY: string; title: string; description: string; photo: string; }) {
    throw new Error("Function not implemented.");
}

