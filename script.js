let adresser =
JSON.parse(localStorage.getItem("adresser")) || [];

let visaBaraKvar = false;

const map = L.map("map").setView(
    [58.3475, 12.4080],
    15
);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap"
    }
).addTo(map);

let markers = [];
let gpsMarker = null;

const gronIkon = new L.Icon({
    iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",

    shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize:[25,41],
    iconAnchor:[12,41],
    popupAnchor:[1,-34],
    shadowSize:[41,41]
});

const rodIkon = new L.Icon({
    iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

    shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize:[25,41],
    iconAnchor:[12,41],
    popupAnchor:[1,-34],
    shadowSize:[41,41]
});

function spara(){
    localStorage.setItem(
        "adresser",
        JSON.stringify(adresser)
    );
}

function rensaKartan(){

    markers.forEach(marker=>{
        map.removeLayer(marker);
    });

    markers = [];
}

function toggleKlar(index){

    adresser[index].klar =
    !adresser[index].klar;

    spara();
    visaAdresser();
}

function radera(index){

    if(!confirm("Radera adressen?")){
        return;
    }

    adresser.splice(index,1);

    spara();
    visaAdresser();
}

function visaAdresser(){

    rensaKartan();

    const lista =
    document.getElementById("adressLista");

    lista.innerHTML = "";

    const antalKlara =
    adresser.filter(a => a.klar).length;

    document.getElementById(
        "statistik"
    ).innerHTML =
    `✅ ${antalKlara} av ${adresser.length} klara`;

    adresser.forEach((adress,index)=>{

        if(!adress.lat || !adress.lng){
            return;
        }

        if(
            visaBaraKvar &&
            adress.klar
        ){
            return;
        }

        const marker = L.marker(
            [adress.lat, adress.lng],
            {
                icon:
                adress.klar
                ? gronIkon
                : rodIkon
            }
        ).addTo(map);

        marker.bindPopup(`
            <b>${adress.adress}</b><br>
            Portkod: ${adress.portkod}<br>
            ${adress.info}<br><br>

            <button
            onclick="toggleKlar(${index})">
            ${
                adress.klar
                ? '↩️ Ångra'
                : '✅ Markera klar'
            }
            </button>
        `);

        markers.push(marker);

        let div =
        document.createElement("div");

        div.className =
        adress.klar
        ? "adress klar"
        : "adress";

        div.innerHTML = `
            <h3>${adress.adress}</h3>

            <p>
            <b>Portkod:</b>
            ${adress.portkod}
            </p>

            <p>
            ${adress.info}
            </p>

            <button
            onclick="toggleKlar(${index})">
            ${
                adress.klar
                ? '↩️ Ångra'
                : '✅ Markera klar'
            }
            </button>

            <button
            class="radera"
            onclick="radera(${index})">
            🗑️ Radera
            </button>
        `;

        lista.appendChild(div);
    });
}

map.on("click", function(e){

    const adress =
    prompt("Adress:");

    if(!adress){
        return;
    }

    const portkod =
    prompt("Portkod:") || "";

    const info =
    prompt("Anteckning:") || "";

    adresser.push({
        adress,
        portkod,
        info,
        klar:false,
        lat:e.latlng.lat,
        lng:e.latlng.lng
    });

    spara();
    visaAdresser();
});

document
.getElementById("filterKnapp")
.addEventListener("click", ()=>{

    visaBaraKvar =
    !visaBaraKvar;

    document.getElementById(
        "filterKnapp"
    ).innerText =
    visaBaraKvar
    ? "Visa alla adresser"
    : "Visa bara kvarvarande";

    visaAdresser();
});

if(navigator.geolocation){

    navigator.geolocation.watchPosition(
        function(position){

            const lat =
            position.coords.latitude;

            const lng =
            position.coords.longitude;

            if(gpsMarker){

                gpsMarker.setLatLng(
                    [lat,lng]
                );

            } else {

                gpsMarker =
                L.circleMarker(
                    [lat,lng],
                    {
                        radius:10,
                        color:"blue",
                        fillColor:"blue",
                        fillOpacity:0.8
                    }
                ).addTo(map);

                gpsMarker.bindPopup(
                    "📍 Din position"
                );
            }

        }
    );
}

visaAdresser();