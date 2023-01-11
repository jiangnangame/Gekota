import fs from 'fs';
import gm from 'gm';
const converter = gm.subClass({imageMagick: true});
export default async function SplitImage(PamName, xflPath) {
    const config = JSON.parse(fs.readFileSync(PamName + '.ImageConfig.json'));
    const image = converter(PamName + '.png');
    const writeImage = (gmObj, outputName) => {
        return new Promise(resolve => gmObj.write(outputName, err => {
            if(err) throw err;
            console.log('OutPut Image Successfully: ' + outputName);
            resolve();
        }));
    }
    const imgPath = xflPath + 'LIBRARY/';
    !fs.existsSync(imgPath) && fs.mkdirSync(imgPath);
    for(let obj of config) {
        let {aw, ah, ax, ay} = obj;
        let fileName = obj.path[5];
        let {groups: {w, h}} = /(?<w>\d+)x(?<h>\d+)/.exec(fileName);
        await writeImage(image.crop(aw, ah, ax, ay).resize(w, h), imgPath + fileName + '.png');
        console.log('成功输出: ' + imgPath + fileName + '.png');
    }
}