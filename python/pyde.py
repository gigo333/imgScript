from fileinput import filename
from PIL import Image
import numpy as np
from struct import pack, unpack
    
def showScript(img):
    size=img.size
    a=np.array(img)
    r=a[:,:,0]%(2**3)
    g=a[:,:,1]%(2**2)
    b=a[:,:,2]%(2**3)
    a1=r*(2**5)+g*(2**3)+b

    a1=bytes(a1)
    l=unpack('<I', a1[:4])[0]
    a1=a1[4:4+l]
    return a1.decode('utf-8')
    
def hideScript(code, img):
    size=img.size
    l=img.size[0]*img.size[1]
    mode=img.mode

    buff=pack('<I', len(code))+code

    if(len(buff)>l):
        return None

    a=np.array(img)
    a1=np.frombuffer(buff, np.uint8)
    a1=np.concatenate((a1,np.zeros(l-len(buff), np.uint8)))
    a1=np.reshape(a1, (size[1],size[0]))
    r=a1//(2**5)
    g=(a1//(2**3))%(2**2)
    b=a1%(2**3)
    a[:,:,0]=(a[:,:,0]//(2**3))*(2**3)+r
    a[:,:,1]=(a[:,:,1]//(2**2))*(2**2)+g
    a[:,:,2]=(a[:,:,2]//(2**3))*(2**3)+b
    image=Image.fromarray(a,mode)
    return image

if __name__ == "__main__":
    filename = 'utils.js'
    with open(filename, "r") as f:
        code = f.read()
        
    code=code.encode('utf-8')
    img=Image.open("test.jpg")
    #img.show()
    image = hideScript(code, img)
    #image.show()
    image.save("result.png")
