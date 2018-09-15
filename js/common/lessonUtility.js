import axios from 'axios';
import JSZip from 'jszip';
import './localCacheManager';
import * as Const from './constants';
import LocalCacheManager from './localCacheManager';

export default class LessonUtility {
    static customGetHeader(objects) {
        return { 'X-Get-Params': JSON.stringify(objects) };
    }

    static async fetchLesson(lessonID) {
        const url = Const.LESSON_API_URL.replace('{lessonID}', lessonID);
        const result = await axios.get(url);

        return result.data;
    }

    static async fetchGraphics() {
        const result = await axios.get(Const.GRAPHIC_API_URL);
        return result.data;
    }

    static async fetchAvatars() {
        const result = await axios.get(Const.AVATAR_API_URL);
        return result.data;
    }

    static async fetchLessonGraphicURLs(lessonGraphics) {
        if (lessonGraphics.length == 0) {
            return [];
        }

        const urlHeaders = lessonGraphics.map((graphic) => {
            return {
                id:        graphic.id,
                entity:    'Graphic',
                extension: graphic.fileType,
            };
        });

        const urls = await LessonUtility.fetchSignedURLs(urlHeaders);

        return lessonGraphics.map((graphic, i) => {
            return {
                id:       graphic.id,
                url:      urls[i],
                fileType: graphic.fileType,
            };
        });
    }

    static async fetchLessonZipBlob(lesson) {
        const cacheManager = new LocalCacheManager();
        return await cacheManager.isCachedLesson(lesson.id, lesson.version) ?
            await fetchFromCache() : await fetchFromServer();

        async function fetchFromCache() {
            console.log('found lesson cache!');
            return await cacheManager.cachedLessonZip(lesson.id);
        }

        async function fetchFromServer() {
            const headers = [{
                id:        lesson.id,
                entity:    'Lesson',
                extension: 'zip',
            }];
            const signedURLs = await LessonUtility.fetchSignedURLs(headers);
            const result = await axios.get(signedURLs, { responseType: 'blob' });

            const zip = result.data;
            await cacheManager.cacheLessonZip(lesson.id, zip, lesson.version);

            return zip;
        };
    }

    static async fetchAvatarObjectURL(avatar) {
        const cacheManager = new LocalCacheManager();
        return await cacheManager.isCachedAvatar(avatar.id, avatar.version) ?
            await fetchFromCache() : await fetchFromServer();

        async function fetchFromCache() {
            console.log('found avatar cache!');
            const zip = await cacheManager.cachedAvatarZip(avatar.id);
            return await avatarZipToObjectURL(zip);
        }

        async function fetchFromServer() {
            const headers = [{
                id:        avatar.id,
                entity:    'Avatar',
                extension: 'zip',
            }];
            const signedURLs = await LessonUtility.fetchSignedURLs(headers);
            const result = await axios.get(signedURLs[0], { responseType: 'blob' });
            const zip = result.data;
            await cacheManager.cacheAvatarZip(avatar.id, zip, avatar.version);

            return await avatarZipToObjectURL(zip);
        }

        async function avatarZipToObjectURL(zip) {
            const unzip = await JSZip.loadAsync(zip);
            const filePath = avatar.id + '.vrm'
            const blob = await unzip.file(filePath).async('blob');
            return window.URL.createObjectURL(blob);
        }
    }

    static async fetchSignedURLs(objects) {
        const header = LessonUtility.customGetHeader(objects);
        const zipParams = { headers: header };
        const zipResult = await axios.get(Const.STORAGE_OBJECT_API_URL, zipParams);

        return zipResult.data.signedURLs.map((obj) => { return obj.signedURL });
    }

    static async blobToZip(fileName, blob) {
        const zip = new JSZip();
        zip.file(fileName, blob);
        return await zip.generateAsync({
            type: 'blob',
            compression: "DEFLATE",
        });
    }

    static async createStorageObjects(files) {
        const request = { fileRequests: files };
        const result = await axios.post(Const.STORAGE_OBJECT_API_URL, request);
        return result.data;
    }

    static async uploadAvatar(avatarURL) {
        const fileType = 'application/zip';
        const file = {
            entity: 'avatar',
            extension: 'zip',
            contentType: fileType,
        };
        const result = await LessonUtility.createStorageObjects([file]);
        const avatar = result.signedURLs[0];

        const fileName = avatar.fileID + '.vrm';
        const avatarFile = await axios.get(avatarURL, { responseType: 'blob' });
        const zipBlob = await LessonUtility.blobToZip(fileName, avatarFile.data);

        const instance = axios.create({
            transformRequest: [(data, header) => {
                header.put['Content-Type'] = fileType;
                return data;
            }],
        });
        await instance.put(avatar.signedURL, zipBlob);

        window.URL.revokeObjectURL(avatarURL);

        return avatar.fileID;
    }
}