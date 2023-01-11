"use strict";
import fs from 'fs';
import path from 'path';
import SplitImage from './lib/SplitImage.mjs';
import ReadPam from './lib/ReadPam.mjs';
import CompileSymbols from './lib/CompileSymbols.mjs';
import CompileXfl from './lib/CompileXfl.mjs';
const control = {
    canSplitImage: false,
    canReadPam: false,
    canCompileSymbols: true,
    canCompileXfl: true,
};
const {dir, base: PamName, name} = path.parse(process.argv[2]);
const jsonPath = `${dir}/~${PamName}/`;
const xflPath = `${dir}/~${PamName}.XFL/`;
(async () => {
    console.log('Wlecome to Gekota!');
    !fs.existsSync(jsonPath) && fs.mkdirSync(jsonPath);  //创建json保存目录
    !fs.existsSync(xflPath) && fs.mkdirSync(xflPath);  //创建xfl工程目录
    fs.writeFileSync(xflPath + 'anim.xfl', 'PROXY-CS5')//创建xfl文件
    console.log('Finish Create Project!');
    control.canSplitImage && await SplitImage(`${dir}/${name}`, xflPath);
    console.log('Finish Split Image!');
    control.canReadPam && new ReadPam(`${dir}/${PamName}`).start(jsonPath);
    console.log('Finish Read PAM!');
    let xflConfig;
    control.canCompileSymbols && (xflConfig = CompileSymbols(jsonPath, xflPath));
    console.log('Finish Compile Symbols!');
    control.canCompileXfl && CompileXfl(jsonPath, xflPath, xflConfig);
    console.log('Finish Compile XFL!');
})();