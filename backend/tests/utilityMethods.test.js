import {describe, expect, it} from '@jest/globals';
import {utils,  helperFunctions} from '../utils/utilityMethods'
import fs from 'fs'
import Jimp from 'jimp'
import sizeOf from 'buffer-image-size';

jest.mock('fs', () => ({
    writeFileSync: jest.fn(),
    readFileSync: jest.fn(),
    unlinkSync: jest.fn()
}));
jest.mock('buffer-image-size');
jest.mock('Jimp', () => ({
    read: jest.fn(),
}));
describe('helperFunctions: getNewImageDimensions', () => {
    it('maintains the aspect ratio', () => {
        const result = [256, 256]
        const [x , y] = [1200, 1200]
        expect(helperFunctions.getNewImageDimensions(x, y)).toEqual(result);
    });

    it("doesn't change the size if it isn't needed", () => {
        const result = [250, 150]
        const [x , y] = [250, 150]
        expect(helperFunctions.getNewImageDimensions(x, y)).toEqual(result);
    });

    it("scales to the bigger dimension", () => {
        const result = 256
        const [x , y] = [2000, 150]
        expect(helperFunctions.getNewImageDimensions(x, y)[0]).toEqual(result);
    });
});

describe('helperFunctions: stringNum', () => {
    it('it assds a prefixing 0 to single digits', () => {
        let result = '01'
        expect(helperFunctions.stringNum(1)).toEqual(result);

    });

    it('it returns the number as a string if two digit number', () => {
        let result = '10'
        expect(helperFunctions.stringNum(10)).toEqual(result);
    });
});

describe('helperFunctions: dayOfTheWeek', () => {
    it('returns the day of the week ', () => {
        let date = '1996-05-18'
        let result = 'saturday'
        expect(helperFunctions.dayOfTheWeek(date)).toBe(result);
    });

    it('accounts for leap year', () => {
        let date = '2016-02-29'
        let result = 'monday'
        expect(helperFunctions.dayOfTheWeek(date)).toBe(result);
    });
});

describe('helperFunctions: parseEpochTime', () => {
    it('accounts for leap years', () => {
        let time = 1582977600 // february 29th 2020 at 12 PM GMT time
        let result = '2020-02-29 07:00:00-05:00'
        expect(helperFunctions.parseEpochTime(time)).toBe(result);
    });

    it('rolls over to the previous year month and or day if needed', () => {
        let time = 1640995200 // january 1st 2022 at 12:00 AM GMT time 
        let result = '2021-12-31 19:00:00-05:00'
        expect(helperFunctions.parseEpochTime(time)).toBe(result);
    });

    it('prefixes the RFC 3339 time zone to EST', () => {
        let time = 1640995200 // january 1st 2022 at 12:00 AM GMT time 
        let date = helperFunctions.parseEpochTime(time).split('-')
        let result = '05:00' 
        expect(date[date.length-1]).toBe(result);
    });
});

describe('utils: resizeImage', () => {

    beforeEach(() => {
        fs.writeFileSync.mockReturnValue(false);
        fs.readFileSync.mockReturnValue(false);
        sizeOf.mockReturnValue({dimensions: {height: 100, width: 30}})
        Jimp.read.mockReturnValue(
            {
                resize: jest.fn(() => {
                    return {
                        writeAsync: jest.fn()
                    }
                })
            })
      });

    let imageName = 'myNewImage'
    let imageMock = {data: '123'}

    it('writes the image to a new file', () => {      
        utils.resizeImage(imageMock, imageName)
        expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('gets the current dimensions of the image', () => {      
        utils.resizeImage(imageMock, imageName)
        expect(sizeOf).toHaveBeenCalled();
    });

    it('gets the resized image dimensions', () => {
        const result = [123, 456]
        const spy = jest.spyOn(helperFunctions, 'getNewImageDimensions');
        spy.mockReturnValue(result)
        utils.resizeImage(imageMock, imageName)
        expect(helperFunctions.getNewImageDimensions()).toEqual(result);
        spy.mockRestore();
    });
    
    it('resizes the image', async () => {      
        await utils.resizeImage(imageMock, imageName)
        expect(Jimp.read().resize).toHaveBeenCalled();
    });

    it('returns the newly resized and reformatted image', async () => {      
        await utils.resizeImage(imageMock, imageName)
        expect(fs.writeFileSync).toHaveBeenCalled();
    });
});

describe('utils: fileCleanUp', () => {

    beforeEach(() => {
        fs.unlinkSync.mockReturnValue(false);
    })
    it('cleans up the temp files that were created when resizing an image', () => {      
        utils.fileCleanUp('new_image')
        expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
    });
});

describe('utils: parseUserData', () => {

    let user = {}
    let input = [user, user]
    beforeEach(() => {
        const spy1 = jest.spyOn(helperFunctions, 'dayOfTheWeek');
        const spy2 = jest.spyOn(helperFunctions, 'parseEpochTime');
        spy1.mockReturnValue(true)
        spy2.mockReturnValue(true)
    })

    it('gets the day of the week each user was born',() => {      
        utils.parseUserData(input)
        expect(helperFunctions.dayOfTheWeek).toHaveBeenCalledTimes(2);

    });

    it('parses the epoch time for each user',() => {      
        expect(helperFunctions.parseEpochTime).toHaveBeenCalledTimes(2);

    });

    it('updates the data on the user objects',() => {
        let updatedUser = { date_of_birth: true, created_on: true}
        let result = [updatedUser, updatedUser]
        expect(utils.parseUserData(input)).toEqual(result)
    });

});

