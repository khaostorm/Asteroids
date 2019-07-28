import express from "express";
import { request } from "https";

let server = express();

let port = 3000;

server.use(express.json());

server.post("/asteroids", (req, res) => {
    let body = req.body;
    if (!("dateStart" in body)
        || !("dateEnd" in body)
        || !("within" in body)
        || !("value" in body.within)) {
        console.error("Missing Req param");
        res.status(400);
        res.send(JSON.stringify({
            "error": true
        }));
        return;
    }
    let asteroidReq: AsteroidRequest = { ...body };
    if (typeof asteroidReq.within.units === "undefined") {
        console.log("Units not defined Assuming miles");
        asteroidReq.within.units = "miles";
    }
    let myResp = {
        "asteroids": []
    };
    let url = "https://api.nasa.gov/neo/rest/v1/feed?";
    url += "start_date=" + asteroidReq.dateStart;
    url += "&end_date=" + asteroidReq.dateEnd;
    url += "&api_key=jgD5MSvu8ytIVR75REbPsRu3L83NF9OBqmLaXBj4";
    let sentReq = request(url, resp => {
        let data = "";
        resp.on("data", (chunk) => {
            data +=chunk;
        });
        resp.on("error", (err) => {
            console.log("error occured:");
            console.log(err);
            res.status(400);
            res.send(JSON.stringify({
                "error": true
            }));
        });
        resp.on("end", () => {
            res.status(200);
            let astr = JSON.parse(data);
            myResp["asteroids"] = parseNearEarthObjects(astr,asteroidReq);
            res.send(JSON.stringify(myResp));
        });
    });
    sentReq.end();
});

server.listen(port, () => {
    console.log("Server Running on Port: " + port);
});

function parseNearEarthObjects(obj:any, asteroidReq:AsteroidRequest):string[] {
    let retVal = [];
    Object.keys(obj.near_earth_objects).forEach((value)=>{
        obj.near_earth_objects[value].forEach((val)=>{
            for(let close of val.close_approach_data) {
                if(Number(close.miss_distance.miles) <= asteroidReq.within.value) {
                    retVal.push(val.name);
                    break;
                }
            }
        });
    });
    return retVal;
}