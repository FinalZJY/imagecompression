const fs = require('fs');
const os = require('os');
const path = require('path');

const filePath = 'C:/Users/Admin/Desktop/live.png';

const AncillaryBit = {
  critical: 0,
  ancillary: 1,
};
const PrivateBit = {
  public: 0,
  private: 1,
}
const ReservedBit = {
  reserved: 0,
}
const SafeToCopyBit = {
  unsafe: 0,
  safe: 1,
}

//https://www.w3.org/TR/PNG/#5DataRep
//https://es6.ruanyifeng.com/#docs/arraybuffer
fs.readFile(filePath, null, (err, content) => {
  if (err) {
    console.error(err);
    return;
  }

  const data = content;
  let pointer = 0;
  // not a png file
  if(Array.from(data.slice(pointer,8)).toString() !== [137,80,78,71,13,10,26,10].toString()){
    return;
  }
  pointer += 8;

  const dataView = new DataView(data.buffer,0);
  for(;pointer<data.byteLength;){
    // first 4 bytes of a chunk
    const chunkLength = dataView.getUint32(pointer);
    pointer+=4;

    // second 4 bytes of a chunk
    const chunkType = new TextDecoder().decode(data.buffer.slice(pointer,pointer+4));
    pointer+=4;
    if(isLowercase(chunkType.charAt(2)) !== ReservedBit.reserved){
      // If the reserved bit is 1, the datastream does not conform to this version of PNG.
      processError('Do not support this version of PNG. The reserved bit is 1.');
    }
    const chunkProperty = {
      ancillaryBit: isLowercase(chunkType.charAt(0)),
      privateBit: isLowercase(chunkType.charAt(1)),
      safeToCopyBit: isLowercase(chunkType.charAt(3)),
      chunkName: chunkType,
    };

    // the length of chunk data depends on the chunkLength field
    const chunkData = data.subarray(pointer,pointer+chunkLength)
    pointer+=chunkLength;

    // last 4 bytes of a chunk
    const CRC = dataView.getUint32(pointer);
    pointer+=4;
  }

  console.log(data);
});

function isLowercase(letter) {
  // the letter is uppercase (bit 5 is 0) or lowercase (bit 5 is 1).
  return (letter.charCodeAt(0) & 0b100000) >> 5;
}

function processError(err) {
  console.error(err);
  process.exitCode = 1;
}
