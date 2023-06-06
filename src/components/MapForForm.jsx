import React from "react";
import { YMaps, Map, SearchControl} from "@pbe/react-yandex-maps";

const mapState = {center: [59.939098, 30.315868], zoom: 10};
const mapStyle = {
    top: 0,
    left: 0,
    height: "50vh",
    width: "30vw",
    overflow: "hidden",
    cursor: "pointer"
  };

export default function MapForm() {
  const [ymaps, setYmaps] = React.useState(null);
  const placemarkRef = React.useRef(null);
  const mapRef = React.useRef(null);
  // @ts-ignore
  const [address, setAddress] = React.useState("");

  const createPlacemark = (/** @type {any} */ coords) => {
    // @ts-ignore
    return new ymaps.Placemark(
      coords,
      {
        iconCaption: "loading.."
      },
      {
        preset: "islands#violetDotIconWithCaption",
        draggable: true
      }
    );
  };

  const getAddress = (/** @type {any} */ coords) => {
    // @ts-ignore
    placemarkRef.current.properties.set("iconCaption", "loading..");
    // @ts-ignore
    ymaps.geocode(coords).then((/** @type {{ geoObjects: { get: (arg0: number) => any; }; }} */ res) => {
      const firstGeoObject = res.geoObjects.get(0);
  
      const localities = firstGeoObject.getLocalities();
      const administrativeAreas = firstGeoObject.getAdministrativeAreas();
  
      const newAddress = [
        localities && localities.length
          ? localities
          : administrativeAreas,
        firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
      ]
        .filter(Boolean)
        .join(", ");
  
      setAddress(newAddress);
  
      // @ts-ignore
      placemarkRef.current.properties.set({
        iconCaption: newAddress,
        balloonContent: firstGeoObject.getAddressLine()
      });
    }).catch((/** @type {any} */ error) => {
      console.log(error);
    });
  };

  const onMapClick = (/** @type {{ get: (arg0: string) => any; }} */ e) => {
    const coords = e.get("coords");
    if (placemarkRef.current) {
      // @ts-ignore
      placemarkRef.current.geometry.setCoordinates(coords);
    } else {
      placemarkRef.current = createPlacemark(coords);
      // @ts-ignore
      mapRef.current.geoObjects.add(placemarkRef.current);
      // @ts-ignore
      placemarkRef.current.events.add("dragend", function () {
        // @ts-ignore
        getAddress(placemarkRef.current.geometry.getCoordinates());
      });
    }
    getAddress(coords);
    console.log(coords);
    localStorage.setItem('coords', coords)
  };


  return (
    <div className="">
      <YMaps query={{ apikey: "1a15248c-004a-4364-8c06-4c1e617f3000" }}>
        <Map
          modules={["Placemark", "geocode", "geoObject.addon.balloon"]}
          // @ts-ignore
          instanceRef={mapRef}
          // @ts-ignore
          onLoad={(instance) => setYmaps(instance)}
          onClick={onMapClick}
          state={mapState}
          style={mapStyle}
        >
          <SearchControl/>
        </Map>
        
      </YMaps>
     {/* <h1 className="border-2 border-black">Coords: {localStorage.getItem('coords')}</h1> */}
    </div>
  );
}