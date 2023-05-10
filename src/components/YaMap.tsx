import React from "react";
import { YMaps, Map, ObjectManager, SearchControl} from "@pbe/react-yandex-maps";
import { Placemarks } from "@prisma/client";

type pointsType = {
  points: Placemarks[]
}

export default function YaMap({points}: pointsType ) {
  
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
      };
    })
  };

  // console.log(JSON.stringify(collection, undefined, 4))

  return (
    <YMaps
      query={{ apikey: "1a15248c-004a-4364-8c06-4c1e617f3000", lang: "RU" }}
    >
      <div>
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
            defaultFeatures={collection}
            modules={[
              "objectManager.addon.objectsBalloon",
            ]}/>
            <SearchControl/>
        </Map>
      </div>
    </YMaps>
  );
};