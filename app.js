const express = require('express');
const request = require('request');
const {writeFile, readFile} = require('fs').promises;
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const names = require('./names.json')

// PUT IN FILE PATH HERE
const fPath = `/put/in/your/file/path/here.csv`




const app = express();


app.get("/search/:artist", (req, res) => {
    res.send(`Searching for data on: ${req.params.artist}`);
    const url = `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${req.params.artist}&api_key=88b75659b2fb798d05a477f86c374880&format=json`
    const csvWriter = createCsvWriter({
        path: fPath,
        header: [
            {id: 'name', title: 'NAME'},
            {id: 'listeners', title: 'LISTENERS'},
            {id: 'mbid', title: 'MBID'},
            {id: 'url', title: 'URL'},
            {id: 'image_small', title: 'IMAGE_SMALL'},
            {id: 'image', title: 'IMAGE'}
        ]
    });


    request({url: url}, (err, res) => {

        const test = (JSON.parse(res.body))
        const test2 = (test.results["opensearch:totalResults"])

        // case for invalid artist name
        if ( test2 == 0 ) {
            request({url:`http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${(names[Math.floor(Math.random() * 5)])}&api_key=88b75659b2fb798d05a477f86c374880&format=json`}, (err, res) => {
                try {
                    const data = JSON.parse(res.body)
                    const data1 = JSON.stringify(data, null, 2)
                    const artists = (data.results.artistmatches.artist)
                    delete artists.streamable;
                
                    let small = []
                    let img = []
                    for (const key in artists){
                        artists[key].image_small =  ((artists[key].image[0]["#text"]))
                        artists[key].image = ((artists[key].image[1]["#text"]))
                        delete artists[key].streamable
                        
                      }
                
                   //  console.log(artists)
                    csvWriter.writeRecords(artists)       // returns a promise
                    .then(() => {
                     console.log('...Done updating csv');
                    });
            
                    } catch (err){
                        console.error(err)
                }


            });
        
        } else {
        try {
        const data = JSON.parse(res.body)
        const data1 = JSON.stringify(data, null, 2)
        const artists = (data.results.artistmatches.artist)
        delete artists.streamable;
    
        let small = []
        let img = []
        for (const key in artists){
            artists[key].image_small =  ((artists[key].image[0]["#text"]))
            artists[key].image = ((artists[key].image[1]["#text"]))
            delete artists[key].streamable
            
          }
    
       //  console.log(artists)
        csvWriter.writeRecords(artists)       // returns a promise
        .then(() => {
         console.log('...Done updating csv');
        });

        } catch (err){
            console.error(err)
    }}
    });

});






app.all('*', (req, res) => {
    res.status(404).send('Resource not found')
  })


app.listen(3000, () => console.log("Search is running..."));




