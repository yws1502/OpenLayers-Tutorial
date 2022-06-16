import * as dotenv from "dotenv";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import { Point } from "ol/geom";
import { Feature, Overlay } from "ol";
import { Style, Icon } from "ol/style";
import { toStringHDMS } from "ol/coordinate";
import { fromLonLat, toLonLat } from "ol/proj";
import { Vector as VectorSource, XYZ } from "ol/source";
import { Vector as VectorLayer, Tile as TileLayer } from "ol/layer";

dotenv.config();

const apiKey = process.env.apiKey;

// 지도 기본 뷰 설정
const olView = new View({
  center: fromLonLat([127.027583, 37.497928]),
  zoom: 15,
});

// 지도 기본 타일 설정
const olLayer = new TileLayer({
  source: new XYZ({
    url: `http://api.vworld.kr/req/wmts/2.0.0/${apiKey}/Base/{z}/{y}/{x}.png`,
  }),
});

// 팝업 옵션 설정
const olOverlay = new Overlay({
  element: document.querySelector("#popup"),
  autoPan: true,
  autoPanAnimation: {
    duration: 20,
  },
});

const olMap = new Map({
  layers: [olLayer],
  overlays: [olOverlay],
  target: "map", // html에 존재하는 div 영역 id 이름
  view: olView,
  moveTolerance: 5,
});

function addMarker(lon, lat) {
  // marker feature 설정
  const olFeature = new Feature({
    geometry: new Point([lon, lat]),
  });

  // marker style 설정
  const olStyle = new Style({
    image: new Icon({
      anchor: [0.5, 20],
      anchorXUnits: "fraction",
      anchorYUnits: "pixels",
      src: "http://map.vworld.kr/images/ol3/marker_blue.png",
    }),
  });

  // feature style 설정
  olFeature.setStyle(olStyle);

  // marker layer에 들어갈 source 생성
  const olVectorSource = new VectorSource({
    features: [olFeature],
  });

  // marker layer 생성
  const olVectorLayer = new VectorLayer({
    source: olVectorSource,
    name: "MARKER",
  });

  olVectorLayer.setZIndex(6);

  return olVectorLayer;
}

// click 이벤트
olMap.on("singleclick", (event) => {
  const coordinate = event.coordinate;
  const [lon, lat] = coordinate;

  const markerLayer = addMarker(lon, lat);

  if (olMap.hasFeatureAtPixel(event.pixel) === true) {
    const hdms = toStringHDMS(toLonLat(coordinate));
    const content = document.querySelector("#popup-content");
    content.innerHTML = `<p>You clicked here :</p>${hdms}</code>`;

    olOverlay.setPosition(coordinate);
  } else {
    olMap.addLayer(markerLayer);
  }
});

// 팝업창 닫기
const closer = document.querySelector("#popup-closer");
closer.onclick = () => {
  olOverlay.setPosition(undefined);
};

// marker 지우기
const clearBtn = document.querySelector("#markerRemover");
clearBtn.onclick = () => {
  while (olMap.getAllLayers().length > 1) {
    olMap.removeLayer(olMap.getAllLayers()[1]);
  }
};
