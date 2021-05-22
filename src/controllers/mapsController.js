const catchAsync = require("../utils/catchAsync");
const { getDistance, convertDistance, getSpeed, convertSpeed } = require('geolib');
const AppError = require("../utils/appError");
const axios = require("axios");
const favorite = require("../models/favoriteModel");



// tous les information de lapi direction selon modeTravelle[driving,bicycling,walking]
exports.TravelMode = catchAsync(async (req, res, next) => {
    var options = {
        method: 'GET',
        url: process.env.URL_GOOGLE_DIRECTION + req.body.lats + ',' + req.body.lngs
            + '&destination=' + req.body.latd + ',' + req.body.lngs + "&mode=" + req.body.travelMode +
            '&key=' + process.env.KEY_GOOGLE_DIRECTION
    }
    const data = await axios.request(options)
    if (!data) {
        return next(new AppError('verifer votre Key', 401))
    }
    if (data.data.status === 'ZERO_RESULTS') {
        res.status(200).send(data.data)
    } else {
        const respence = { distance: '', duration: '' }
        respence.distance = data.data.routes[0].legs[0].distance.text;
        respence.duration = data.data.routes[0].legs[0].duration.text;
        res.status(200).send({
            data: respence,
            typeTravel: req.body.travelMode
        })
    }

});
//get liste of place in my coord [restaurant,police,hospital],if(fixed reayon de cercle ){radius=1000}
exports.getlistePlace = catchAsync(async (req, res, next) => {
    var options = {
        method: 'GET',
        url: process.env.URL_GOOGLE_PLACE_SEARCH + req.body.lats + ',' + req.body.lngs +
            '&radius=20000' + '&type=' + req.body.type +
            '&keyword=cruise&key=' + process.env.KEY_GOOGLE_PLACE_SEARCHE
    }
    const data = await axios.request(options);
    if (!data) {
        return next(new AppError('verifer votre key', 401))
    }
    if (data.data.status === 'ZERO_RESULTS') {
        res.status(200).send(data.data)
    } else {
        var respence = await data.data.results.map((item) => {
            var location = {
                lat: req.body.lats,
                lng: req.body.lngs
            }
            var distance = getDistance(location, item.geometry.location, 0.01)
            return {
                name: item.name,
                location: {
                    lat: item.geometry.location.lat,
                    lng: item.geometry.location.lng
                },
                open: item.opening_hours,
                photos: item.photos,
                distance: convertDistance(distance, "km")

            }
        })
        res.status(200).send({
            data: [...respence],
            results: [...respence].length
        })

    }
})

//get liste favorie dans ma direction
exports.ListePlaceDirection = catchAsync(async (req, res, next) => {
    const parametre = "1000"
    // var data = [{ lat: 8.99, lng: 6.9554 }, { lat: 6.99, lng: 5.9554 }]
    var { data } = req.body;
    console.log(req.body.data)
    var tableux = [];
    var listFavorite = await favorite.find({ userId: req.user.id });
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < listFavorite.length; j++) {
            var distance = await getDistance(data[i], listFavorite[j].location, 0.01);
           // console.log(distance)
            var results = await convertDistance(distance, "km");
            if (results < parametre) {
                await tableux.push(listFavorite[j])
            }
        }
    }
    var uniqueArray = removeDuplicates(tableux, "_id");
    res.status(200).send({
        results: uniqueArray.length,
        data: uniqueArray
    })

})
//remove location redendance
function removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};
    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
    }
    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
}

// const calculeDistance = catchAsync(async (req, res, next) => {
//     const My_COORDS = {
//         lat: req.body.lat, lng: req.body.lng
//     }
//     const COORDS_distination = {
//         lat: req.body.lat2, lng: req.body.lng2
//     }
//     var distance = await getDistance(My_COORDS, COORDS_distination, 0.01)
//    // const distance_km = convertDistance(distance, 'km')
//     // if (distance_km < 1) {
//     //     results = {
//     //         data: convertDistance(distance, "m"),
//     //         "unité": "m"
//     //     }
//     // } else {
//         results = {
//             data: convertDistance(distance, "km"),
//             "unité": "km"
//         }
//     //}
//     // res.status(200).send({
//     //     data: results
//     // })
// })
