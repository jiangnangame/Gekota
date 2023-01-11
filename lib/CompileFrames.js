import fs from 'fs';
export default function CompileFrames(framesJson, jsonPath) {
    const imageJson = JSON.parse(fs.readFileSync(jsonPath + 'SpritesList.json'));
    const symbolJson = JSON.parse(fs.readFileSync(jsonPath + 'SubAnimsList.json'));
    const AST = {};
    const Medias = new Set();
    const Labels = [];
    let lastFrameLayerConfigs = {};
    let lastFrameLayers = {};
    framesJson.forEach((frame, frameIndex) => {
        //检查并储存当前帧的label
        frame.label && Labels.push([frameIndex, frame.label]);
        //创建ast树与图层添加到当前帧
        frame.refAppend && frame.refAppend.forEach(layerRAE => {
            let layer = AST[layerRAE.ref_id];
            if(!layer) {
                layer = AST[layerRAE.ref_id] = {
                    'name': `Layer ${layerRAE.ref_id}`,
                    '__label__':  'DOMLayer',
                    '__config__': layerRAE,
                    '__child__': {
                        '__label__':  'frames',
                        '__children__': [],
                    },
                };
            }
            //添加新图层到当前帧
            layer.__child__.__children__[frameIndex] = {
                'index': frameIndex,
                '__label__': 'DOMFrame',
                '__child__': {
                    '__label__':  'elements',
                    '__children__': '',
                },
            };
            //填补新图层添加前面的空白帧
            for(let fi = 1; fi <= frameIndex; fi++) {
                if(!layer.__child__.__children__[fi-1]) {
                    layer.__child__.__children__[fi-1] = {
                        'index': fi,
                        '__label__': 'DOMFrame',
                        '__child__': {
                            '__label__':  'elements',
                            '__children__': '',
                        },
                    }; 
                }
            }
        });
        //恢复到上一帧的状态
        for(let i in lastFrameLayers) {
            AST[i].__child__.__children__[frameIndex] = {
                'index': frameIndex,
                '__label__': 'DOMFrame',
                '__child__': {
                    '__label__':  'elements',
                    '__children__': lastFrameLayers[i],
                },
            };
        }
        //删除帧
        frame.refErase && frame.refErase.forEach(layerERA => {
            AST[layerERA.ref_id] && (AST[layerERA.ref_id].__child__.__children__[frameIndex].__child__.__children__ = '');
        });
        //设置属性
        frame.element && frame.element.forEach(ele => {
            !AST[ele.idx] && console.log(frameIndex+1, ele.idx);
            let {ref_type, ref_index} = AST[ele.idx].__config__;
            let lastFrameLayer = lastFrameLayerConfigs[ele.idx];  //调出上一帧的缓存
            let frameLayerTemp = {};  //开辟储存本帧的空间
            let container = `<DOMSymbolInstance libraryItemName="${ref_type ? symbolJson[ref_index].name : imageJson[ref_index].imageID}"><matrix><Matrix `;
            //处理位移
            const pos = ele.Pos
            if(pos) {
                container += `tx='${pos.left}' ty='${pos.top}'`;
            }
            //处理矩阵变换
            const matrix = ele.Matrix;
            if(matrix) {
                const {a, b, c, d} = matrix;
                container += ` a="${a}" b="${b}" c="${c}" d="${d}"`;
            }
            //处理旋转角
            const angle = ele.RotationAngle;
            if(angle) {
                container += ` a="${Math.cos(angle)}" b="${Math.sin(angle)}" c="${-Math.sin(angle)}" d="${Math.cos(angle)}"`;
            }
            container += `/></matrix>`;
            //处理颜色变化
            const color = ele.ColorSpace;
            if(color) {
                const {red, green, blue, alpha} = color;
                container += (frameLayerTemp['color'] = `<color><Color redMultiplier="${red / 255}" blueMultiplier="${blue / 255}" greenMultiplier="${green / 255}" alphaMultiplier="${alpha / 255}"/></color>`);
            } else if(lastFrameLayer && lastFrameLayer['color']) {
                container += (frameLayerTemp['color'] = lastFrameLayer['color']);
            }
            container += `</DOMSymbolInstance>`;
            //储存缓存和编译结果
            lastFrameLayerConfigs[ele.idx] = frameLayerTemp;
            AST[ele.idx].__child__.__children__[frameIndex].__child__.__children__ = container;
        });
        //重新记录上一帧的状态
        for(let i in AST) {
            if(AST[i].__child__.__children__[frameIndex]) {
                lastFrameLayers[i] = AST[i].__child__.__children__[frameIndex].__child__.__children__;
            };
        }
    });
    //编译AST树为XML
    const deepSearch = (json, xml = '') => {
        //遍历当前层的所有属性
        let publicProp = {};
        let privateProp = {};
        for(let i in json) {
            if(i.includes('__')) {
                privateProp[i] = json[i];
            } else {
                publicProp[i] = json[i];
            }
        }
        if(privateProp['__label__']) {
            xml += `<${privateProp['__label__']} `;
            for(let i in publicProp) {
                xml += `${i}='${publicProp[i]}'`;
            }
            xml += '>';            
        }
        if(privateProp.__child__) {
            xml += deepSearch(privateProp.__child__);
        }
        if(privateProp.__children__ ) {
            typeof privateProp.__children__ === 'object' ? 
                privateProp.__children__.forEach(c => xml += deepSearch(c)) 
                : xml += privateProp.__children__;
        }
        privateProp['__label__'] && (xml += `</${privateProp['__label__']}>`);
        return xml;
    };
    let doms = [];
    for(let i in AST) {
        doms.push(deepSearch(AST[i]));
    }
    //编译label图层
    let labelLayer = '<DOMLayer name="Label Layer"><frames>';
    Labels.forEach(([frameIndex, labelName], index) => {
        labelLayer += `<DOMFrame index="${frameIndex}" name="${labelName}" duration="${Labels[index+1] ? Labels[index+1][0]-frameIndex : framesJson.length-frameIndex}"><elements/></DOMFrame>`;
    });
    doms.push(labelLayer += `</frames></DOMLayer>`);
    //翻转图层顺序并输出
    let FramesXml = `<layers>${doms.reverse().toString().replace(/,/g, '')}</layers>`;
    return {FramesXml, Medias};
}