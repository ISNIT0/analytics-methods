const csv = require('csv-parser');
const fs = require('fs');

function logLength(msg) {
    return function logLengthInner(data) {
        console.info(msg, data.length)
        return data;
    }
}

function extractLanguages(items) {
    return new Promise((resolve, reject) => {
        const allLanguages = items.map(a => a.language).sort().filter((item, index, arr) => item !== arr[index - 1]);
        const itemsWithLaguages = items.reduce((acc, item) => {
            return acc.concat(allLanguages.map(lang => Object.assign({}, item, { language: lang })));
        }, []);
        resolve(itemsWithLaguages);
    });
}

function extractLanguages(items) {
    return new Promise((resolve, reject) => {
        const allLanguages = items.map(a => a.language).sort().filter((item, index, arr) => item !== arr[index - 1]);
        const itemsWithLaguages = items.reduce((acc, item) => {
            return acc.concat(allLanguages.map(lang => Object.assign({}, item, { language: lang })));
        }, []);
        resolve(itemsWithLaguages);
    });
}

function mergeReviewsAndDevices(devicesPath = './android_devices.json', reviewsPath = 'kiwix_reviews.csv') {
    return new Promise((resolve, reject) => {
        const devices = require(devicesPath)
            .reduce((acc, device) => {
                acc[device.Device] = acc[device.Device] || [];
                acc[device.Device].push(device);
                return acc;
            }, {}); // { deviceCode: [Device, Device], ... }
        const reviews = [];
        fs.createReadStream(reviewsPath) //JSON is hard to stream
            .pipe(csv())
            .on('data', function (review) {
                //Device codes used in reviews do not map one to one with actual devices.

                const relatedDevices = (devices[review.Device] || []).slice(0);

                //Insert version of review for all possible source devices
                for (device of relatedDevices) {
                    reviews.push({
                        device: device.Model,
                        appVersion: review['App Version Code'],
                        language: review['Reviewer Language'],
                        androidVersion: 'unknown' // TODO: look at GSMArena
                    });
                }
            })
            .on('end', function () {
                resolve(reviews);
            })
            .on('error', function (err) {
                reject(err);
            });
    });
}

mergeReviewsAndDevices()
    .then(logLength(`Total possible devices: `))
    //.then(extractLanguages) //Urealistic
    //.then(logLength(`Total possible devices and languages: `))
    .then(extractAppVersions)
    .then(logLength(`Including possible App Versions`));