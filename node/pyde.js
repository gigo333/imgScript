var canvas=require('canvas');

const hideScript =function(imgBuff, scriptBuff, socket){
    var img=new canvas.Image();
        img.onload=function(){
            var ctx=new canvas.Canvas(img.width,img.height).getContext('2d');
            ctx.drawImage(img,0,0);
            var rgba=ctx.getImageData(0,0,img.width,img.height).data;
            var buff=Buffer.allocUnsafe(4);
            buff.writeUInt32LE(scriptBuff.length,0);
            buff=Buffer.concat([buff,scriptBuff]);
            for(var i=0;i<buff.length*4;i+=4){
                j=Math.floor(i/4);
                r=Math.floor(buff[j]/(2**5));
                g=(Math.floor(buff[j]/(2**3)))%(2**2);
                b=buff[j]%(2**3);
                rgba[i]=(Math.floor(rgba[i]/(2**3)))*(2**3)+r;
                rgba[i+1]=(Math.floor(rgba[i+1]/(2**2)))*(2**2)+g;
                rgba[i+2]=(Math.floor(rgba[i+2]/(2**3)))*(2**3)+b;
            }
            var pngCanvas=new canvas.Canvas(img.width,img.height, 'png');
            pngCanvas.getContext('2d').putImageData(new canvas.ImageData(rgba,img.width,img.height),0,0);
            var png=pngCanvas.toBuffer();
            socket.emit('image',png);
        }
    img.src=imgBuff;
}
  
const showScript = function(imgBuff, socket){
var img=new canvas.Image();
    img.onload=function(){
        var ctx=new canvas.Canvas(img.width,img.height).getContext('2d');
        ctx.drawImage(img,0,0);
        var rgba=ctx.getImageData(0,0,img.width,img.height).data;
        var buff=[];
        for(var i=0;i<16;i+=4){
            var r=rgba[i]%(2**3)
            var g=rgba[i+1]%(2**2)
            var b=rgba[i+2]%(2**3)
            buff.push(r*(2**5)+g*(2**3)+b);
        }
        buff=Buffer.from(buff);
        var len=buff.readUInt32LE(0);
        buff=[];
        for (var i=16;i<16+len*4;i+=4){
            var r=rgba[i]%(2**3)
            var g=rgba[i+1]%(2**2)
            var b=rgba[i+2]%(2**3)
            buff.push(r*(2**5)+g*(2**3)+b);
        }
        buff=Buffer.from(buff);
        var s=new String(buff);
        socket.emit('jsCode',s);
    }
    img.src=imgBuff;
}

exports.hideScript=hideScript;
exports.showScript=showScript;