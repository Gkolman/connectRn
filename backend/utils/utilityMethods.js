const Jimp = require("jimp");
const fs = require('fs')
const {months, daysInMonth, days} = require('./utilityData')
const sizeOf = require('buffer-image-size');

let helperFunctions = {
    /*
        Takes an images height and width and returns and array
        containing resized height and width values.
    */
    getNewImageDimensions: (x, y) => {
        if (x <= 256 && y <= 256) { return [x, y]};
        let ratio =  Math.max(x, y) / 256;
        return [x / ratio, y / ratio];
    },
    /*
        Takes a number and stringifies it, adds prefixing 0 if number is under 9
    */
    stringNum: (num) => { 
        return num < 10 ? `0${num}` : `${num}` ;
    },
    /*
        Takes a date and returns the day of the week of the date
    */
    dayOfTheWeek: (date) => {
        let [y, m, d] = date.split('-').map((cv) => { return parseInt(cv) });
        const t = [ 0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4 ];
        y -= (m < 3) ? 1 : 0;
        let day = Math.floor(( y + y/4 - y/100 + y/400 + t[m-1] + d) % 7);
        return days[day];
    }, 
    /*
        Takes an epoch formatted time and converts it to a RFC 3339 string
    */
    parseEpochTime: (epochTime) => {
        let timeZone = 5;
        let [dayOfWeek, day, month, year, time] = new Date(epochTime*1000).toGMTString().split(' ');
        if (year % 4 === 0) { daysInMonth[2] = 29};
        const [hour, minute, second] = time.split(':');
        month = months[month];
        let [finalHour, finalDay, finalMonth, finalYear] = [hour, day, month, year];
        let hourDifference = parseInt(hour) - timeZone;
        if (hourDifference < 0) {
            finalHour = (24 - Math.abs(hourDifference));
            let dayDifference = parseInt(day) - 1;
            if (dayDifference < 1) {
                let monthDifference = month - 1;
                if (monthDifference < 1) {
                    finalYear = year - 1;
                    finalMonth = 12;
                    finalDay = 31;
                } else {
                    finalMonth = monthDifference;
                    finalDay = daysInMonth[finalMonth];
                }
            } else {finalDay = dayDifference}
        } else {finalHour = hourDifference}
        const y = helperFunctions.stringNum(finalYear);
        const m = helperFunctions.stringNum(finalMonth);
        const d = helperFunctions.stringNum(finalDay);
        const h = helperFunctions.stringNum(finalHour);
        return `${y}-${m}-${d} ${h}:${minute}:${second}-0${timeZone}:00`;
    },
}


let utils = {
    /*
        Takes an image and an image name, then saves the image and gets the image
        dimensions. After, creates a new image in a png format with the new resized
        and returns the newly created and reformatted image.
    */
    resizeImage: async (image, imageName) => {
        try {    
            const tempJpegLocation = `./backend/tempImages/${imageName}.jpg`;
            const tempPngLocation = `./backend/tempImages/${imageName}.png`;
            fs.writeFileSync(tempJpegLocation, image.data);
            const dimensions = sizeOf(image.data);
            const savedImage = await Jimp.read(tempJpegLocation);
            const [newX, newY] = helperFunctions.getNewImageDimensions(dimensions.width, dimensions.height );
            let newImage = savedImage.resize(newX, newY, function(err){ if (err) throw err });
            await newImage.writeAsync(tempPngLocation);
            return fs.readFileSync(tempPngLocation);
        } catch(error) {throw error}
    },
    /*
        deletes local images that were created when reformatting an image.
    */
    fileCleanUp: (fileName) => {
        let imagePath = `./backend/tempImages/${fileName}`;
        fs.unlinkSync(imagePath + '.png');
        fs.unlinkSync(imagePath + '.jpg');
    },
    /*
        Takes an array of users, then returns an array of the same users with the
        modified "date_of_birth" and "created_on" fields.
    */
    parseUserData: (users) => {
        for (var user of users) {
            user['date_of_birth'] = helperFunctions.dayOfTheWeek(user['date_of_birth']);
            user['created_on'] = helperFunctions.parseEpochTime(user['created_on']);
        }
        return users;
    }
}

module.exports = {
    utils: utils,
    helperFunctions: helperFunctions
}