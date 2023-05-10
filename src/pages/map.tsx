import React, { useState, useEffect, ChangeEvent } from "react";
import YaMap from "../components/YaMap";
import Modal from "../components/modal/Modal";
import MapForm from "../components/MapForForm";
import { api } from "skatemap_new/utils/api";
import Link from 'next/link'
import { Placemarks } from "@prisma/client";
import { NextPage } from "next";

const Map: NextPage = () => {

  const [modalActive, setModalActive] = useState(false)
  
 
  // const points1 = [
  //   {
  //     id: 1,
  //     coordinates: [59.836172, 30.164347],
  //     title: "Скейт-парк у речки",
  //     description: "Скейтпарк от компании FK-Ramps. Год постройки: 2023",
  //     photo:
  //       "https://cdnstatic.rg.ru/uploads/images/2022/08/29/1_dji_0143_402.jpg",
  //   },
  //   {
  //     id: "2",
  //     coordinates: [55.831903, 37.411961],
  //     title: "Пристань Метеоров",
  //   },
  //   {
  //     id: "3",
  //     coordinates: [55.763338, 37.565466],
  //     title: "Парк Ваккасалми",
  //   },
  // ];

  // console.log(JSON.stringify(points1, undefined, 4))

  // const [points, setPoints] = useState([]);

  //  const [loading, setLoading] = useState(true)

// useEffect(() => {
//   const url = "http://localhost:3001/api/placemarks";

//   const fetchData = async () => {
//     try {
//       const response = await fetch(url, {method: "GET"});
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const json = await response.json();
//       if (Array.isArray(json)) {
//         const newPoints = json.map(point => {
//           const coords = point.coordinates.slice(1, -1).split(',').map(coord => parseFloat(coord.trim()));
//           const newId = point.id.toString();
//           return { ...point, coordinates: coords, id: newId };
//         });
//         setPoints(newPoints);
//       } else {
//         throw new Error(`Invalid JSON received from server.`);
//       }
//     } catch (error) {
//       console.error("An error occurred while fetching data:", error);
//       setPoints([]);
//     }
//   };
//   fetchData();
//   setLoading(false)
// }, []);

// console.log(JSON.stringify(points, undefined, 4))

// function sendPoints(url, data) {
//   // Default options are marked with *
//   console.log(data)
//   fetch(url, {
//     method: 'POST', // *GET, POST, PUT, DELETE, etc.
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(data) // body data type must match "Content-Type" header
//   })
// }

// console.table(points)

const {data: points, isLoading} = api.map.getAll.useQuery()
const {mutate} = api.map.sendPoints.useMutation()


  const formData = {
    mail: String,
    name: String,
    description: String,
    photo: File,
    coordinates: Array,
  }

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
    // formData.mail = email;
    // formData.name = name;
    // formData.description = description;
    // formData.photo = photo;
    // formData.coordinates = localStorage.getItem('coords');
    mutate({
      coordinates: "[" + localStorage.getItem('coords') + "]",
      title: name.toString(),
      description: description.toString(),
      photo: photo.toString(),
    })

    setEmail('');
    setName('');
    setDescription('');
    setPhoto('');
    // console.log(formData)
  }

return (
    <>
    {/* 
        <main>
          {points?.map(point => <>{point.coordinates}</>)}
        </main> */}
      <div className="flex flex-grow">
        <Link className="m-auto mt-[2%] text-5xl" href={`/`}>Skate Map</Link>
        <div className='absolute top-[2%] right-[2%] border-2 h-12 w-12 border-gray-800 rounded-full m-auto'></div>
      </div>
      <nav className="flex items-center m-[2%]">
          <Link className="a" href = {`/map`}>Карта спотов</Link>
          <Link className="a" href = {`/school`}>Школа трюков</Link>
          <a className="a">Блог</a>
          <a className="a">Правила скейтпарков</a>
      </nav>
      <div className="w-[96%] m-auto">
        <button className='addSpot' onClick={() => setModalActive(true)}>Добавить спот</button>
        {points && <YaMap points={points}/>}
      </div>
      <Modal active={modalActive} setActive={setModalActive}>
        <div className="flex flex-start items-center justify-center">
          <div className="w-1/2 m-[5%]">
            <MapForm/>
          </div>
          <div className="flex flex-col items-center w-1/2">
            <h1 className="text-3xl">Заполните форму</h1>
            <h2 className="text-xl mt-3">Введите вашу почту:</h2>
            <input id="email" value={email} onChange={(e) => emailHandler(e)} className="border-2 border-gray-800 rounded-md p-1 mt-3 w-2/3"></input>
            <h2 className="text-xl mt-3">Введите название спота:</h2>
            <input id="spotName" value={name} onChange={(e) => nameHandler(e)} className="border-2 border-gray-800 rounded-md p-1 mt-3 w-2/3"></input>
            <h2 className="text-xl mt-3">Введите описание спота:</h2>
            <textarea id="spotDesc" value={description} onChange={(e) => descriptionHandler(e)} className="border-2 border-gray-800 rounded-md p-1 mt-3 w-2/3 h-30 resize-none"></textarea>
            <h2 className="text-xl mt-3">Добавьте фото:</h2>
            <input type='file' value={photo} onChange={photoHandler} className="p-1 mt-[3%] w-2/3"></input>
            <button 
              className="border-2 border-gray-800 flex items-center justify-center rounded-md p-1 mt-[5%] w-1/3"
              onClick={() =>sendFunc()}>Отправить</button>
          </div>
        </div>
    </Modal>
  </>
);
}

export default Map