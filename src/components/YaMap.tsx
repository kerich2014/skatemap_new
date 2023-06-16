import React, { use, useState } from "react";
import { YMaps, Map, ObjectManager, SearchControl, Placemark, Button} from "@pbe/react-yandex-maps";
import { Placemarks } from "@prisma/client";
import { any, array } from "zod";
import { api } from "skatemap_new/utils/api";
import { useSession } from "next-auth/react";

type pointsType = {
  points: Placemarks[]
}

export default function YaMap({points}: pointsType ) {

  const [selectedPoint, setSelectedPoint] = useState(points[-1])
  const {mutate: deleteMutation} = api.map.deletePoint.useMutation()
  
  const mapStyle = {
    position: "relative",
    left: 0,
    top: 0,
    width: "100%",
    height: "70vh",
    overflow: "hidden",
  };

  const collection = {
    type: "FeatureCollection",
    features: points.map((point, id) => {
      return {
        type: "Feature",
        id: point.id,
        geometry: {
          type: "Point",
          coordinates: [point.coordinatesX  , point.coordinatesY]
        },
        properties: {
          balloonContentHeader:
           `<h2>${point.title}</h2>`,
          balloonContentBody:
            `<p>${point.description}</p> <img src= '${point.photo}'> `,
        },
        options: {
          preset: 'islands#icon',
          iconColor: 'red',
        },
          cick: () => {setSelectedPoint(point), console.log(selectedPoint)},
      };
    })
  };
  const deletePointFunc = () => {
    if(selectedPoint == points[-1]){
      alert('Выберите метку и повторите попытку')
    }
    else{
      deleteMutation(selectedPoint!.id)
      alert('Метка успешно удалена')
    }
  }
  // console.log(JSON.stringify(collection, undefined, 4))
  const session = useSession()
  const user = api.user.getById.useQuery({email: session.data?.user.email as string})
  return (
    <YMaps
      query={{ apikey: "1a15248c-004a-4364-8c06-4c1e617f3000", lang: "ru_RU" }}
    >
      <div>
        {/* <button className='addSpot' onClick={() => {deleteMutation(selectedPoint?.id ?? 0)}}>Удалить спот</button> */}
        <Map
          style={{position: "relative",
          left: 0,
          top: 0,
          width: "100%",
          height: "70vh",
          overflow: "hidden",}}
          defaultState={{ center: [59.939098, 30.315868], zoom: 10 }}
        >
          <ObjectManager 
            options={{
              clusterize: true,
              gridSize: 32,
            }}
            // defaultFeatures={collection}
            modules={[
              "objectManager.addon.objectsBalloon",
            ]}
            />
            {points.map((point, index) => (
              <Placemark 
                key={index} 
                geometry={[point.coordinatesX, point.coordinatesY]} 
                onClick={() => {setSelectedPoint(point), console.log(selectedPoint)}}
                properties={
                  {
                    balloonContentHeader:
                    `<h2>${point.title}</h2>`,
                    balloonContentBody:
                    `<p>${point.description}</p> <img src= '${point.photo}'>`
                  }
                }
                options={
                  {
                      preset: 'islands#icon',
                      iconColor: 'red',
                  }
                }
              />
            ))}
            
            {user.data?.role == 'admin' && (<Button
              data={{
                title: 'Удалить',
                content: 'Удалить спот'
              }}
              options={{
                selectOnClick: false,
                maxWidth: 200,
              }}
              onClick={() => {deletePointFunc()}}
            />)}
            <SearchControl/>  
        </Map>
      </div>
    </YMaps>
  );
};